/**
 * Optimized BPF Service
 * 
 * Optimizations:
 * 1. Batch requests - fetch multiple BPF instances in single call using $filter with OR
 * 2. Cache stage definitions - stages don't change, cache for 5 minutes
 * 3. Parallel fetching - use Promise.all for concurrent requests
 * 4. Select only needed columns - reduce payload size
 * 5. Retry logic - handle transient failures
 */

import {
  IBPFConfiguration,
  IBPFDefinition,
  IBPFInstance,
  IBPFStage,
  IProcessStageResponse,
  IBPFInstanceResponse,
  IWorkflowResponse,
  ICachedStages,
  WebApiClient,
} from '../types';
import { BPFError, ErrorCodes } from '../utils/errorMessages';
import { isValidEntityName, isValidGuid, escapeODataValue } from '../utils/sanitize';
import { createLogger } from '../utils/logger';
import type { PerfTracker } from '../utils/perfTracker';

const log = createLogger('[BPFService]');

// Request timeout (30 seconds)
const REQUEST_TIMEOUT_MS = 30 * 1000;

// Cache timeout (5 minutes)
const CACHE_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Option set metadata response from Dataverse
 */
interface OptionMetadata {
  Value: number;
  Label: {
    LocalizedLabels: Array<{
      Label: string;
      LanguageCode: number;
    }>;
    UserLocalizedLabel: {
      Label: string;
    };
  };
}

interface AttributeMetadataResponse {
  OptionSet: {
    Options: OptionMetadata[];
  };
}

// Max records per batch (keep it reasonable)
const BATCH_SIZE = 10;

export class BPFService {
  private webApi: WebApiClient;
  private stageCache: Map<string, ICachedStages> = new Map();
  private workflowCache: Map<string, string> = new Map(); // bpfEntityName -> processId
  private pendingRequests: Map<string, Promise<IBPFInstance | null>> = new Map();
  private categoryLabelsCache: Map<number, string> | null = null;
  private categoryLabelsCacheTime = 0;

  constructor(webApi: WebApiClient) {
    this.webApi = webApi;
  }

  /**
   * OPTIMIZED: Fetch BPF data for multiple records in batched calls
   * Instead of N calls for N records, we make ceil(N/BATCH_SIZE) calls
   *
   * @param recordIds - Array of record IDs to fetch BPF data for
   * @param config - BPF configuration
   * @param signal - Optional AbortSignal for request cancellation
   */
  public async getBPFDataForRecords(
    recordIds: string[],
    config: IBPFConfiguration,
    signal?: AbortSignal,
    perf?: PerfTracker
  ): Promise<Map<string, IBPFInstance | null>> {
    const results = new Map<string, IBPFInstance | null>();

    if (recordIds.length === 0 || config.bpfs.length === 0) {
      return results;
    }

    // Process each BPF definition
    for (const bpfDef of config.bpfs) {
      // Check if cancelled
      if (signal?.aborted) {
        throw new Error('Request cancelled');
      }

      try {
        // Fetch BPF instances in batches
        const label = `fetchBPF:${bpfDef.bpfEntitySchemaName}`;
        perf?.mark(label);
        const batchResults = await this.fetchBPFInstancesBatched(
          recordIds,
          bpfDef,
          signal,
          perf
        );
        perf?.measure(label);

        // Merge results (first match wins)
        for (const [recordId, instance] of batchResults) {
          if (!results.has(recordId) || results.get(recordId) === null) {
            results.set(recordId, instance);
          }
        }
      } catch (error) {
        log.warn(`Error fetching from ${bpfDef.bpfEntitySchemaName}:`, error);
      }
    }

    // Set null for records without BPF
    for (const recordId of recordIds) {
      if (!results.has(recordId)) {
        results.set(recordId, null);
      }
    }

    return results;
  }

  /**
   * OPTIMIZED: Batch fetch BPF instances using $filter with OR conditions
   */
  private async fetchBPFInstancesBatched(
    recordIds: string[],
    bpfDef: IBPFDefinition,
    signal?: AbortSignal,
    perf?: PerfTracker
  ): Promise<Map<string, IBPFInstance | null>> {
    const results = new Map<string, IBPFInstance | null>();
    const { bpfEntitySchemaName, lookupFieldSchemaName } = bpfDef;

    // Validate entity name
    if (!isValidEntityName(bpfEntitySchemaName)) {
      throw new BPFError(
        `Invalid BPF entity name: ${bpfEntitySchemaName}`,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // Check if cancelled
    if (signal?.aborted) {
      throw new Error('Request cancelled');
    }

    // Validate all record IDs upfront
    const validRecordIds = recordIds.filter(id => {
      if (!isValidGuid(id)) {
        log.warn(`Skipping invalid GUID: ${id}`);
        return false;
      }
      return true;
    });

    if (validRecordIds.length === 0) {
      return results;
    }

    // Build all batch queries
    const batchPromises: Promise<{ entities: ComponentFramework.WebApi.Entity[] }>[] = [];
    for (let i = 0; i < validRecordIds.length; i += BATCH_SIZE) {
      const batch = validRecordIds.slice(i, i + BATCH_SIZE);
      const filterConditions = batch
        .map(id => `${lookupFieldSchemaName} eq ${id}`)
        .join(' or ');

      batchPromises.push(
        this.fetchWithTimeout(
          this.webApi.retrieveMultipleRecords(
            bpfEntitySchemaName,
            `?$filter=${filterConditions}&$select=businessprocessflowinstanceid,name,_activestageid_value,traversedpath,statuscode,${lookupFieldSchemaName}&$orderby=createdon desc&$top=5000`
          ),
          REQUEST_TIMEOUT_MS,
          signal
        )
      );
    }

    // OPTIMIZED: Fetch stages and BPF instances in parallel
    // Stages are only needed for mapping, not for the instances query itself
    perf?.mark('parallel:stages+instances');
    const [stages, ...batchResponses] = await Promise.all([
      this.getProcessStages(bpfEntitySchemaName, signal, perf),
      ...batchPromises,
    ]);
    perf?.measure('parallel:stages+instances');

    if (stages.length === 0) {
      return results;
    }

    // Process all batch responses
    for (const response of batchResponses) {
      try {
        // Group by record ID (take first/latest for each)
        const instancesByRecord = new Map<string, IBPFInstanceResponse>();

        for (const entity of response.entities) {
          const recordId = entity[lookupFieldSchemaName] as string;
          if (recordId && !instancesByRecord.has(recordId)) {
            instancesByRecord.set(recordId, entity as IBPFInstanceResponse);
          }
        }

        // Map to BPF instances
        for (const [recordId, bpfRecord] of instancesByRecord) {
          const instance = this.mapToBPFInstance(bpfRecord, bpfEntitySchemaName, stages);
          results.set(recordId, instance);
        }
      } catch (error) {
        log.warn(`Batch processing error:`, error);
        // Don't throw - allow partial results
      }
    }

    return results;
  }

  /**
   * Map raw response to IBPFInstance
   */
  private mapToBPFInstance(
    bpfRecord: IBPFInstanceResponse,
    bpfEntityName: string,
    stageDefinitions: IBPFStage[]
  ): IBPFInstance {
    const traversedPath = (bpfRecord.traversedpath as string) || '';
    const traversedStageIds = traversedPath.split(',').filter(Boolean);
    const activeStageId = bpfRecord._activestageid_value as string || null;

    // Map stages with completion status
    const stages = stageDefinitions.map((stage, index) => {
      const isActive = stage.stageId === activeStageId;
      const isCompleted = traversedStageIds.includes(stage.stageId) && !isActive;
      
      return {
        ...stage,
        isActive,
        isCompleted,
        stageOrder: index,
      };
    });

    return {
      processId: bpfRecord.businessprocessflowinstanceid as string || '',
      processName: bpfRecord.name as string || bpfEntityName,
      bpfEntityName,
      activeStageId,
      traversedPath,
      statusCode: bpfRecord.statuscode as number || 0,
      stages,
    };
  }

  /**
   * OPTIMIZED: Get process stages with caching
   * Stage definitions rarely change, so we cache them for 5 minutes
   */
  private async getProcessStages(bpfEntitySchemaName: string, signal?: AbortSignal, perf?: PerfTracker): Promise<IBPFStage[]> {
    // Check cache
    const cached = this.stageCache.get(bpfEntitySchemaName);
    if (cached && Date.now() - cached.timestamp < CACHE_TIMEOUT_MS) {
      perf?.mark('getProcessStages', true);
      perf?.measure('getProcessStages');
      return cached.stages;
    }

    // Check if cancelled
    if (signal?.aborted) {
      throw new Error('Request cancelled');
    }

    try {
      // OPTIMIZED: Fetch processId and category labels in parallel (both are independent)
      perf?.mark('parallel:processId+categoryLabels');
      const [processId, categoryLabels] = await Promise.all([
        this.getProcessId(bpfEntitySchemaName, signal),
        this.getStageCategoryLabels(signal),
      ]);
      perf?.measure('parallel:processId+categoryLabels');

      if (!processId) {
        return [];
      }

      // Fetch stages (depends on processId)
      perf?.mark('query:processstage');
      const response = await this.fetchWithTimeout(
        this.webApi.retrieveMultipleRecords(
          'processstage',
          `?$filter=_processid_value eq ${processId}&$select=processstageid,stagename,stagecategory&$orderby=stagecategory asc&$top=100`
        ),
        REQUEST_TIMEOUT_MS,
        signal
      );
      perf?.measure('query:processstage');

      const stages: IBPFStage[] = (response.entities as IProcessStageResponse[]).map(
        (stage, index) => ({
          stageId: stage.processstageid,
          stageName: stage.stagename,
          stageCategory: stage.stagecategory,
          stageCategoryName: categoryLabels.get(stage.stagecategory) || stage.stagename,
          stageOrder: index,
          isActive: false,
          isCompleted: false,
        })
      );

      // Cache the results
      this.stageCache.set(bpfEntitySchemaName, {
        stages,
        timestamp: Date.now(),
        processId,
      });

      return stages;

    } catch (error) {
      log.error(`Failed to get stages for ${bpfEntitySchemaName}:`, error);
      throw new BPFError(
        `Failed to load process flow stages for ${bpfEntitySchemaName}`,
        ErrorCodes.STAGE_NOT_FOUND,
        error
      );
    }
  }

  /**
   * OPTIMIZED: Get workflow process ID with caching
   */
  private async getProcessId(bpfEntitySchemaName: string, signal?: AbortSignal): Promise<string | null> {
    // Validate entity name
    if (!isValidEntityName(bpfEntitySchemaName)) {
      throw new BPFError(
        `Invalid BPF entity name: ${bpfEntitySchemaName}`,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // Check cache
    if (this.workflowCache.has(bpfEntitySchemaName)) {
      return this.workflowCache.get(bpfEntitySchemaName)!;
    }

    // Check if cancelled
    if (signal?.aborted) {
      throw new Error('Request cancelled');
    }

    try {
      // Single query: exact match OR contains (covers BPFs with different uniquename)
      // category eq 4 means Business Process Flow
      const escapedName = escapeODataValue(bpfEntitySchemaName);
      const response = await this.fetchWithTimeout(
        this.webApi.retrieveMultipleRecords(
          'workflow',
          `?$filter=(uniquename eq '${escapedName}' or contains(uniquename,'${escapedName}')) and category eq 4&$select=workflowid,name,uniquename&$top=5`
        ),
        REQUEST_TIMEOUT_MS,
        signal
      );

      if (response.entities && response.entities.length > 0) {
        // Prefer exact match over contains match
        const workflows = response.entities as (IWorkflowResponse & { uniquename?: string })[];
        const exactMatch = workflows.find(w => w.uniquename === bpfEntitySchemaName);
        const processId = (exactMatch || workflows[0]).workflowid;
        this.workflowCache.set(bpfEntitySchemaName, processId);
        return processId;
      }

      return null;

    } catch (error) {
      log.error(`Failed to get process ID for ${bpfEntitySchemaName}:`, error);
      throw new BPFError(
        `Failed to fetch workflow definition for ${bpfEntitySchemaName}`,
        ErrorCodes.FETCH_FAILED,
        error
      );
    }
  }

  /**
   * OPTIMIZED: Fetch stage category labels from Dataverse metadata with caching
   *
   * Retrieves localized labels for the processstage.stagecategory option set.
   * This supports multi-language environments and custom category names.
   *
   * @param signal - Optional AbortSignal for request cancellation
   * @returns Map of category number to localized label
   */
  private async getStageCategoryLabels(signal?: AbortSignal): Promise<Map<number, string>> {
    // Check cache (metadata rarely changes, cache for 5 minutes)
    if (this.categoryLabelsCache && Date.now() - this.categoryLabelsCacheTime < CACHE_TIMEOUT_MS) {
      return this.categoryLabelsCache;
    }

    // Check if cancelled
    if (signal?.aborted) {
      throw new Error('Request cancelled');
    }

    try {
      // Fetch attribute metadata for stagecategory field
      // Using Web API: GET [Organization URI]/api/data/v9.2/EntityDefinitions(LogicalName='processstage')/Attributes(LogicalName='stagecategory')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet
      const response = await this.fetchWithTimeout(
        this.webApi.retrieveRecord(
          'EntityDefinitions(LogicalName=\'processstage\')/Attributes(LogicalName=\'stagecategory\')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata',
          '',
          '?$select=LogicalName&$expand=OptionSet'
        ),
        REQUEST_TIMEOUT_MS,
        signal
      ) as AttributeMetadataResponse;

      const categoryMap = new Map<number, string>();

      // Extract localized labels from option set
      if (response.OptionSet?.Options) {
        for (const option of response.OptionSet.Options) {
          const label = option.Label?.UserLocalizedLabel?.Label ||
                       option.Label?.LocalizedLabels?.[0]?.Label ||
                       'Custom';
          categoryMap.set(option.Value, label);
        }
      }

      // Cache the results
      this.categoryLabelsCache = categoryMap;
      this.categoryLabelsCacheTime = Date.now();

      return categoryMap;

    } catch (error) {
      log.warn('Failed to fetch category labels from metadata, using stage names as fallback:', error);

      // Return empty map - fallback to stage name will be used
      if (!this.categoryLabelsCache) {
        this.categoryLabelsCache = new Map<number, string>();
        this.categoryLabelsCacheTime = Date.now();
      }

      return this.categoryLabelsCache;
    }
  }

  /**
   * Get BPF data for a single record (with deduplication)
   * Used for lazy loading individual records
   */
  public async getBPFDataForRecord(
    recordId: string,
    entityName: string,
    config: IBPFConfiguration
  ): Promise<IBPFInstance | null> {
    // Check if already fetching this record
    const pendingKey = `${entityName}_${recordId}`;
    if (this.pendingRequests.has(pendingKey)) {
      return this.pendingRequests.get(pendingKey)!;
    }

    // Create the request
    const request = this.fetchSingleRecord(recordId, config);
    this.pendingRequests.set(pendingKey, request);

    try {
      const result = await request;
      return result;
    } finally {
      this.pendingRequests.delete(pendingKey);
    }
  }

  /**
   * Fetch single record (internal)
   */
  private async fetchSingleRecord(
    recordId: string,
    config: IBPFConfiguration
  ): Promise<IBPFInstance | null> {
    for (const bpfDef of config.bpfs) {
      try {
        const results = await this.fetchBPFInstancesBatched([recordId], bpfDef);
        const instance = results.get(recordId);
        if (instance) {
          return instance;
        }
      } catch (error) {
        log.warn(`Error fetching single record:`, error);
      }
    }
    return null;
  }

  /**
   * Wrap a promise with a timeout and optional abort signal to prevent indefinite hangs.
   * When the timeout fires or the signal is aborted, the race rejects immediately
   * so callers don't have to wait for the underlying (non-cancellable) WebAPI call.
   */
  private fetchWithTimeout<T>(promise: Promise<T>, timeoutMs: number = REQUEST_TIMEOUT_MS, signal?: AbortSignal): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<T>((_resolve, reject) => {
      timeoutId = setTimeout(
        () => reject(new BPFError('Request timed out', ErrorCodes.TIMEOUT)),
        timeoutMs
      );

      if (signal) {
        if (signal.aborted) {
          reject(new Error('Request cancelled'));
          return;
        }
        signal.addEventListener('abort', () => {
          reject(new Error('Request cancelled'));
        }, { once: true });
      }
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
      clearTimeout(timeoutId);
    });
  }

  /**
   * Clear all caches
   */
  public clearCache(): void {
    this.stageCache.clear();
    this.workflowCache.clear();
    this.pendingRequests.clear();
    this.categoryLabelsCache = null;
    this.categoryLabelsCacheTime = 0;
  }

  /**
   * Clear cache for specific BPF
   */
  public clearCacheForBPF(bpfEntitySchemaName: string): void {
    this.stageCache.delete(bpfEntitySchemaName);
    this.workflowCache.delete(bpfEntitySchemaName);
  }
}
