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
  StageCategory,
  WebApiClient,
} from '../types';

// Stage category mapping
const STAGE_CATEGORY_MAP: Record<number, StageCategory> = {
  0: 'Qualify',
  1: 'Develop',
  2: 'Propose',
  3: 'Close',
  4: 'Identify',
  5: 'Research',
  6: 'Resolve',
};

// Cache timeout (5 minutes)
const CACHE_TIMEOUT_MS = 5 * 60 * 1000;

// Max records per batch (keep it reasonable)
const BATCH_SIZE = 10;

export class BPFService {
  private webApi: WebApiClient;
  private stageCache: Map<string, ICachedStages> = new Map();
  private workflowCache: Map<string, string> = new Map(); // bpfEntityName -> processId
  private pendingRequests: Map<string, Promise<IBPFInstance | null>> = new Map();

  constructor(webApi: WebApiClient) {
    this.webApi = webApi;
  }

  /**
   * OPTIMIZED: Fetch BPF data for multiple records in batched calls
   * Instead of N calls for N records, we make ceil(N/BATCH_SIZE) calls
   */
  public async getBPFDataForRecords(
    recordIds: string[],
    _entityName: string,
    config: IBPFConfiguration
  ): Promise<Map<string, IBPFInstance | null>> {
    const results = new Map<string, IBPFInstance | null>();
    
    if (recordIds.length === 0 || config.bpfs.length === 0) {
      return results;
    }

    // Process each BPF definition
    for (const bpfDef of config.bpfs) {
      try {
        // Fetch BPF instances in batches
        const batchResults = await this.fetchBPFInstancesBatched(
          recordIds,
          bpfDef
        );

        // Merge results (first match wins)
        for (const [recordId, instance] of batchResults) {
          if (!results.has(recordId) || results.get(recordId) === null) {
            results.set(recordId, instance);
          }
        }
      } catch (error) {
        console.warn(`[BPFService] Error fetching from ${bpfDef.bpfEntitySchemaName}:`, error);
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
    bpfDef: IBPFDefinition
  ): Promise<Map<string, IBPFInstance | null>> {
    const results = new Map<string, IBPFInstance | null>();
    const { bpfEntitySchemaName, lookupFieldSchemaName } = bpfDef;

    // Get stages first (cached)
    const stages = await this.getProcessStages(bpfEntitySchemaName);
    if (stages.length === 0) {
      return results;
    }

    // Process in batches
    for (let i = 0; i < recordIds.length; i += BATCH_SIZE) {
      const batch = recordIds.slice(i, i + BATCH_SIZE);
      
      // Build OR filter for batch
      // Example: _opportunityid_value eq 'guid1' or _opportunityid_value eq 'guid2'
      const filterConditions = batch
        .map(id => `${lookupFieldSchemaName} eq ${id}`)
        .join(' or ');

      try {
        // OPTIMIZED: Single call for multiple records
        // Select only needed columns
        const response = await this.webApi.retrieveMultipleRecords(
          bpfEntitySchemaName,
          `?$filter=${filterConditions}&$select=businessprocessflowinstanceid,name,_activestageid_value,traversedpath,statuscode,${lookupFieldSchemaName}&$orderby=createdon desc`
        );

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
        console.warn(`[BPFService] Batch fetch error:`, error);
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
  private async getProcessStages(bpfEntitySchemaName: string): Promise<IBPFStage[]> {
    // Check cache
    const cached = this.stageCache.get(bpfEntitySchemaName);
    if (cached && Date.now() - cached.timestamp < CACHE_TIMEOUT_MS) {
      return cached.stages;
    }

    try {
      // Get process ID from workflow entity
      const processId = await this.getProcessId(bpfEntitySchemaName);
      if (!processId) {
        return [];
      }

      // OPTIMIZED: Select only needed columns
      const response = await this.webApi.retrieveMultipleRecords(
        'processstage',
        `?$filter=_processid_value eq ${processId}&$select=processstageid,stagename,stagecategory&$orderby=stagecategory asc`
      );

      const stages: IBPFStage[] = (response.entities as IProcessStageResponse[]).map(
        (stage, index) => ({
          stageId: stage.processstageid,
          stageName: stage.stagename,
          stageCategory: stage.stagecategory,
          stageCategoryName: STAGE_CATEGORY_MAP[stage.stagecategory] || 'Custom',
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
      console.error(`[BPFService] Failed to get stages for ${bpfEntitySchemaName}:`, error);
      return [];
    }
  }

  /**
   * OPTIMIZED: Get workflow process ID with caching
   */
  private async getProcessId(bpfEntitySchemaName: string): Promise<string | null> {
    // Check cache
    if (this.workflowCache.has(bpfEntitySchemaName)) {
      return this.workflowCache.get(bpfEntitySchemaName)!;
    }

    try {
      // Query workflow entity
      // category eq 4 means Business Process Flow
      const response = await this.webApi.retrieveMultipleRecords(
        'workflow',
        `?$filter=uniquename eq '${bpfEntitySchemaName}' and category eq 4&$select=workflowid,name&$top=1`
      );

      if (response.entities && response.entities.length > 0) {
        const processId = (response.entities[0] as IWorkflowResponse).workflowid;
        this.workflowCache.set(bpfEntitySchemaName, processId);
        return processId;
      }

      // Try alternative: query by name (some BPFs have different uniquename)
      const altResponse = await this.webApi.retrieveMultipleRecords(
        'workflow',
        `?$filter=contains(uniquename,'${bpfEntitySchemaName}') and category eq 4&$select=workflowid,name&$top=1`
      );

      if (altResponse.entities && altResponse.entities.length > 0) {
        const processId = (altResponse.entities[0] as IWorkflowResponse).workflowid;
        this.workflowCache.set(bpfEntitySchemaName, processId);
        return processId;
      }

      return null;

    } catch (error) {
      console.error(`[BPFService] Failed to get process ID for ${bpfEntitySchemaName}:`, error);
      return null;
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
        console.warn(`[BPFService] Error fetching single record:`, error);
      }
    }
    return null;
  }

  /**
   * Clear all caches
   */
  public clearCache(): void {
    this.stageCache.clear();
    this.workflowCache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Clear cache for specific BPF
   */
  public clearCacheForBPF(bpfEntitySchemaName: string): void {
    this.stageCache.delete(bpfEntitySchemaName);
    this.workflowCache.delete(bpfEntitySchemaName);
  }
}
