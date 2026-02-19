/**
 * BusinessProcessFlowViewer
 *
 * Virtual PCF Control with optimized Dataverse calls
 *
 * @author Allan De Castro
 */

import * as React from 'react';
import { IInputs, IOutputs } from './generated/ManifestTypes';
import { BPFViewer } from './components/BPFViewer';
import { BPFService } from './services/BPFService';
import type { Theme } from '@fluentui/react-components';
import {
  IBPFConfiguration,
  IControlSettings,
  IDatasetRecord,
  IRecordBPFData,
  IStageColors,
  DesignStyle,
  DisplayMode,
  RecordNameSize,
} from './types';
import {
  resolveColors,
  getCustomColors,
} from './utils/themeUtils';
import { getErrorMessage, BPFError, ErrorCodes } from './utils/errorMessages';
import { validateBPFConfiguration } from './utils/configValidation';
import { isValidEntityName, isValidGuid, isValidHexColor } from './utils/sanitize';
import { logger } from './utils/logger';
import { createPerfTracker } from './utils/perfTracker';

export class BusinessProcessFlowViewer implements ComponentFramework.ReactControl<IInputs, IOutputs> {
  private context: ComponentFramework.Context<IInputs>;
  private notifyOutputChanged: () => void;
  private bpfService: BPFService | null = null;

  // State
  private records: IRecordBPFData[] = [];
  private isLoading: boolean = true;
  private error: string | null = null;
  private bpfConfig: IBPFConfiguration | null = null;

  // Cache to prevent redundant fetches
  private fetchedRecordIds: Set<string> = new Set();
  private lastDatasetVersion: string = '';
  private entityDisplayNameCache: Map<string, string> = new Map();

  // Request cancellation support
  private abortController: AbortController | null = null;
  private requestGeneration: number = 0;

  // Bound handlers (created once in init to preserve reference identity for React.memo)
  private boundNavigate: (entityName: string, recordId: string) => void = () => {};
  private boundRefresh: () => void = () => {};

  // Cached settings/colors to avoid creating new objects every render
  private cachedSettings: IControlSettings | null = null;
  private cachedColors: IStageColors | null = null;
  private lastSettingsVersion: string = '';

  /**
   * Initialize the control
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void
  ): void {
    this.context = context;
    this.notifyOutputChanged = notifyOutputChanged;

    // Bind handlers once for stable references (preserves React.memo optimization)
    this.boundNavigate = this.handleNavigate.bind(this);
    this.boundRefresh = this.handleRefresh.bind(this);

    // Initialize BPF Service with client URL for RetrieveActivePath function calls
    const clientUrl = (globalThis as any).Xrm?.Utility?.getGlobalContext?.()?.getClientUrl?.() || '';
    this.bpfService = new BPFService(context.webAPI, clientUrl);

    // Parse BPF configuration
    this.parseBPFConfiguration();

    // Track resize for responsive behavior
    context.mode.trackContainerResize(true);
  }

  /**
   * Parse BPF configuration from manifest property
   */
  private parseBPFConfiguration(): void {
    try {
      const configJson = this.context.parameters.parametersBPF?.raw;
      if (configJson) {
        const parsedConfig = JSON.parse(configJson);

        // Validate configuration structure and content
        const validationResult = validateBPFConfiguration(parsedConfig);

        if (!validationResult.isValid) {
          const errorDetails = validationResult.errors
            .map(e => `${e.field}: ${e.message}`)
            .join(', ');
          throw new BPFError(
            `Configuration validation failed: ${errorDetails}`,
            ErrorCodes.INVALID_CONFIG
          );
        }

        this.bpfConfig = validationResult.config!;
      }
    } catch (e) {
      logger.error('Failed to parse BPF configuration:', e);
      const bpfError = e instanceof BPFError ? e : new BPFError(
        'Invalid BPF configuration JSON',
        ErrorCodes.INVALID_CONFIG,
        e
      );
      this.error = getErrorMessage(bpfError);
    }
  }

  /**
   * Get control settings from manifest properties
   */
  private getSettings(): IControlSettings {
    const params = this.context.parameters;
    return {
      designStyle: (params.designStyle?.raw as DesignStyle) || 'chevron',
      displayMode: (params.displayMode?.raw as DisplayMode) || 'stage',
      recordNameSize: (params.recordNameSize?.raw as RecordNameSize) || 'medium',
      showEntityName: params.showEntityName?.raw === 'yes',
      enableNavigation: params.enableNavigation?.raw === 'yes',
      showPulseAnimation: params.showPulseAnimation?.raw === 'yes',
      usePlatformTheme: params.usePlatformTheme?.raw === 'yes',
    };
  }

  /**
   * Get colors based on settings, validating hex inputs
   */
  private getColors(): IStageColors {
    const params = this.context.parameters;
    const settings = this.getSettings();

    const validHex = (raw: string | null | undefined): string | undefined => {
      if (!raw) return undefined;
      return isValidHexColor(raw) ? raw : undefined;
    };

    const customColors = getCustomColors(
      validHex(params.completedColor?.raw),
      validHex(params.completedTextColor?.raw),
      validHex(params.activeColor?.raw),
      validHex(params.activeTextColor?.raw),
      validHex(params.inactiveColor?.raw),
      validHex(params.inactiveTextColor?.raw)
    );

    return resolveColors(
      settings.usePlatformTheme,
      this.context.fluentDesignLanguage,
      customColors
    );
  }

  /**
   * Update view - returns React element (Virtual PCF)
   */
  public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
    this.context = context;
    const dataset = context.parameters.records;

    // Check if dataset has changed (include first few record IDs to detect view changes)
    const recordIds = dataset.sortedRecordIds || [];
    const idSample = recordIds.slice(0, 5).join(',');
    const datasetVersion = `${recordIds.length}_${idSample}_${dataset.loading}`;
    const datasetChanged = datasetVersion !== this.lastDatasetVersion;
    this.lastDatasetVersion = datasetVersion;

    // Process dataset if changed and not loading
    if (datasetChanged && !dataset.loading && recordIds.length >= 0) {
      this.processDataset(dataset).catch(e => {
        logger.error('Unhandled error in processDataset:', e);
        this.error = getErrorMessage(e);
        this.isLoading = false;
        this.notifyOutputChanged();
      });
    }

    // Cache settings/colors to preserve reference identity for React.memo
    const settingsVersion = `${context.parameters.designStyle?.raw}_${context.parameters.displayMode?.raw}_${context.parameters.recordNameSize?.raw}_${context.parameters.showEntityName?.raw}_${context.parameters.enableNavigation?.raw}_${context.parameters.showPulseAnimation?.raw}_${context.parameters.usePlatformTheme?.raw}`;
    if (settingsVersion !== this.lastSettingsVersion) {
      this.lastSettingsVersion = settingsVersion;
      this.cachedSettings = this.getSettings();
      this.cachedColors = this.getColors();
    }

    // Get platform theme if available (PCF provides Fluent v9 Theme via fluentDesignLanguage)
    const platformTheme = context.fluentDesignLanguage?.tokenTheme as Theme | undefined;

    return React.createElement(BPFViewer, {
      records: this.records,
      settings: this.cachedSettings || this.getSettings(),
      colors: this.cachedColors || this.getColors(),
      isLoading: this.isLoading || dataset.loading,
      error: this.error,
      platformTheme,
      allocatedWidth: context.mode.allocatedWidth,
      allocatedHeight: context.mode.allocatedHeight,
      onNavigate: this.boundNavigate,
      onRefresh: this.boundRefresh,
    });
  }

  /**
   * OPTIMIZED: Process dataset and fetch BPF data in batches
   */
  private async processDataset(
    dataset: ComponentFramework.PropertyTypes.DataSet
  ): Promise<void> {
    if (!this.bpfService || !this.bpfConfig) {
      return;
    }

    // Cancel any pending requests
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    const currentGeneration = ++this.requestGeneration;

    const recordIds = dataset.sortedRecordIds || [];
    if (recordIds.length === 0) {
      this.records = [];
      this.isLoading = false;
      this.notifyOutputChanged();
      return;
    }

    const perf = createPerfTracker(`processDataset (${recordIds.length} records)`);

    // Get entity name from first record (cast to IDatasetRecord for getNamedReference support)
    const firstRecord = dataset.records[recordIds[0]] as unknown as IDatasetRecord;
    const entityName = firstRecord.getNamedReference?.()?.entityType ||
                       this.getEntityNameFromConfig();

    // Build initial records and identify which need fetching
    const newRecordIds: string[] = [];
    const primaryColumn = dataset.columns.find((c: ComponentFramework.PropertyHelper.DataSetApi.Column) => c.isPrimary);
    const existingRecordMap = new Map(this.records.map(r => [r.recordId, r]));

    for (const recordId of recordIds) {
      const existingRecord = existingRecordMap.get(recordId);
      if (!existingRecord || !this.fetchedRecordIds.has(recordId)) {
        newRecordIds.push(recordId);
      }
    }

    // OPTIMIZED: Start BPF fetch and entity display name resolution in parallel
    // Both are independent async operations that hit Dataverse
    perf.mark('getBPFDataForRecords');
    const bpfDataPromise = newRecordIds.length > 0
      ? this.bpfService.getBPFDataForRecords(
          newRecordIds,
          this.bpfConfig,
          this.abortController.signal,
          perf
        )
      : Promise.resolve(new Map<string, import('./types').IBPFInstance | null>());

    perf.mark('getEntityDisplayName', this.entityDisplayNameCache.has(entityName));
    const entityDisplayName = await this.getEntityDisplayName(entityName);
    perf.measure('getEntityDisplayName');

    // Now build the initial records with display name
    const updatedRecords: IRecordBPFData[] = [];

    for (const recordId of recordIds) {
      const record = dataset.records[recordId];
      const recordName = primaryColumn
        ? record.getFormattedValue(primaryColumn.name) || recordId
        : recordId;

      const existingRecord = existingRecordMap.get(recordId);

      if (existingRecord && this.fetchedRecordIds.has(recordId)) {
        updatedRecords.push(existingRecord);
      } else {
        updatedRecords.push({
          recordId,
          recordName,
          entityName,
          entityDisplayName,
          bpfInstance: null,
          isLoading: true,
          error: null,
        });
      }
    }

    this.records = updatedRecords;
    this.isLoading = newRecordIds.length > 0;

    // Await the BPF data (already in-flight since earlier)
    if (newRecordIds.length > 0) {
      const newRecordIdSet = new Set(newRecordIds);

      try {
        const bpfData = await bpfDataPromise;
        perf.measure('getBPFDataForRecords');

        // Discard stale results if a newer request has started
        if (currentGeneration !== this.requestGeneration) {
          return;
        }

        // Update records with fetched data
        this.records = this.records.map(record => {
          if (newRecordIdSet.has(record.recordId)) {
            this.fetchedRecordIds.add(record.recordId);
            return {
              ...record,
              bpfInstance: bpfData.get(record.recordId) || null,
              isLoading: false,
            };
          }
          return record;
        });

      } catch (e) {
        perf.measure('getBPFDataForRecords');

        // Discard stale errors if a newer request has started
        if (currentGeneration !== this.requestGeneration) {
          return;
        }

        logger.error('Failed to fetch BPF data:', e);

        // Get user-friendly error message
        const errorMessage = getErrorMessage(e);

        // Mark records as errored
        this.records = this.records.map(record => {
          if (newRecordIdSet.has(record.recordId)) {
            return {
              ...record,
              isLoading: false,
              error: errorMessage,
            };
          }
          return record;
        });
      }
    }

    this.isLoading = false;
    perf.summary();

    // Trigger framework to call updateView with updated records
    this.notifyOutputChanged();
  }

  /**
   * Get entity name from BPF configuration
   */
  private getEntityNameFromConfig(): string {
    if (!this.bpfConfig || this.bpfConfig.bpfs.length === 0) {
      return 'unknown';
    }
    
    // Extract entity name from lookup field (e.g., _opportunityid_value -> opportunity)
    const lookupField = this.bpfConfig.bpfs[0].lookupFieldSchemaName;
    const match = lookupField.match(/_(.+)id_value/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Get entity display name from Dataverse metadata (async with cache).
   * Falls back to a camelCase splitter if metadata is unavailable.
   */
  private async getEntityDisplayName(entityName: string): Promise<string> {
    // Check cache first
    const cached = this.entityDisplayNameCache.get(entityName);
    if (cached) {
      return cached;
    }

    // Try Dataverse metadata API
    try {
      if (this.context.utils?.getEntityMetadata) {
        const metadata = await this.context.utils.getEntityMetadata(entityName);
        const displayName = metadata?.DisplayName;
        if (displayName) {
          this.entityDisplayNameCache.set(entityName, displayName);
          return displayName;
        }
      }
    } catch {
      // Metadata unavailable (e.g., offline, permissions) — fall through to fallback
    }

    // Fallback: split camelCase/underscores and capitalize each word
    const fallback = entityName
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(/[-_ ]/)
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    this.entityDisplayNameCache.set(entityName, fallback);
    return fallback;
  }

  /**
   * Handle navigation to record
   */
  private handleNavigate(entityName: string, recordId: string): void {
    if (!entityName || !recordId || !this.context.navigation) {
      return;
    }

    if (!isValidEntityName(entityName) || !isValidGuid(recordId)) {
      logger.warn('Invalid entity name or record ID format');
      return;
    }

    this.context.navigation.openForm({
      entityName,
      entityId: recordId,
      openInNewWindow: true,
    });
  }

  /**
   * Handle refresh request
   */
  private handleRefresh(): void {
    // Clear cache and refetch
    this.fetchedRecordIds.clear();
    this.bpfService?.clearCache();
    this.error = null;
    this.isLoading = true;
    this.lastDatasetVersion = ''; // Force reprocess
    
    // Trigger dataset refresh
    if (this.context.parameters.records.refresh) {
      this.context.parameters.records.refresh();
    }
  }

  /**
   * Get outputs - not used in this control
   */
  public getOutputs(): IOutputs {
    return {};
  }

  /**
   * Destroy - cleanup
   */
  public destroy(): void {
    // Cancel any pending requests
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    this.bpfService?.clearCache();
    this.fetchedRecordIds.clear();
  }
}
