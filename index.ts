/**
 * BusinessProcessFlowViewer v2
 * 
 * Virtual PCF Control with optimized Dataverse calls
 * 
 * @author Allan De Castro
 * @version 2.0.0
 */

import * as React from 'react';
import { IInputs, IOutputs } from './generated/ManifestTypes';
import { BPFViewer } from './components/BPFViewer';
import { BPFService } from './services/BPFService';
import {
  IBPFConfiguration,
  IControlSettings,
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

export class BusinessProcessFlowViewer implements ComponentFramework.ReactControl<IInputs, IOutputs> {
  private context: ComponentFramework.Context<IInputs>;
  private bpfService: BPFService | null = null;

  // State
  private records: IRecordBPFData[] = [];
  private isLoading: boolean = true;
  private error: string | null = null;
  private bpfConfig: IBPFConfiguration | null = null;

  // Cache to prevent redundant fetches
  private fetchedRecordIds: Set<string> = new Set();
  private lastDatasetVersion: string = '';

  // Request cancellation support
  private abortController: AbortController | null = null;

  /**
   * Initialize the control
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    _notifyOutputChanged: () => void
  ): void {
    this.context = context;

    // Initialize BPF Service
    this.bpfService = new BPFService(context.webAPI);

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
      console.error('[BPFViewer] Failed to parse BPF configuration:', e);
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
   * Get colors based on settings
   */
  private getColors(): IStageColors {
    const params = this.context.parameters;
    const settings = this.getSettings();

    const customColors = getCustomColors(
      params.completedColor?.raw || undefined,
      params.completedTextColor?.raw || undefined,
      params.activeColor?.raw || undefined,
      params.activeTextColor?.raw || undefined,
      params.inactiveColor?.raw || undefined,
      params.inactiveTextColor?.raw || undefined
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

    // Check if dataset has changed
    const datasetVersion = `${dataset.sortedRecordIds?.length || 0}_${dataset.loading}`;
    const datasetChanged = datasetVersion !== this.lastDatasetVersion;
    this.lastDatasetVersion = datasetVersion;

    // Process dataset if changed and not loading
    if (datasetChanged && !dataset.loading && dataset.sortedRecordIds) {
      this.processDataset(dataset);
    }

    // Get platform theme if available
    const platformTheme = context.fluentDesignLanguage?.tokenTheme;

    return React.createElement(BPFViewer, {
      records: this.records,
      settings: this.getSettings(),
      colors: this.getColors(),
      isLoading: this.isLoading || dataset.loading,
      error: this.error,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      platformTheme: platformTheme as any,
      onNavigate: this.handleNavigate.bind(this),
      onRefresh: this.handleRefresh.bind(this),
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

    const recordIds = dataset.sortedRecordIds || [];
    if (recordIds.length === 0) {
      this.records = [];
      this.isLoading = false;
      return;
    }

    // Get entity name from first record
    const firstRecord = dataset.records[recordIds[0]];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entityName = (firstRecord as any).getNamedReference?.()?.entityType ||
                       this.getEntityNameFromConfig();

    // Build initial records with loading state
    const newRecordIds: string[] = [];
    const updatedRecords: IRecordBPFData[] = [];

    for (const recordId of recordIds) {
      const record = dataset.records[recordId];
      const primaryColumn = dataset.columns.find((c: ComponentFramework.PropertyHelper.DataSetApi.Column) => c.isPrimary);
      const recordName = primaryColumn 
        ? record.getFormattedValue(primaryColumn.name) || recordId
        : recordId;

      // Check if already fetched
      const existingRecord = this.records.find(r => r.recordId === recordId);
      
      if (existingRecord && this.fetchedRecordIds.has(recordId)) {
        // Reuse existing data
        updatedRecords.push(existingRecord);
      } else {
        // Need to fetch
        newRecordIds.push(recordId);
        updatedRecords.push({
          recordId,
          recordName,
          entityName,
          entityDisplayName: this.getEntityDisplayName(entityName),
          bpfInstance: null,
          isLoading: true,
          error: null,
        });
      }
    }

    this.records = updatedRecords;
    this.isLoading = newRecordIds.length > 0;

    // OPTIMIZED: Batch fetch new records
    if (newRecordIds.length > 0) {
      try {
        const bpfData = await this.bpfService.getBPFDataForRecords(
          newRecordIds,
          entityName,
          this.bpfConfig,
          this.abortController.signal
        );

        // Update records with fetched data
        this.records = this.records.map(record => {
          if (newRecordIds.includes(record.recordId)) {
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
        console.error('[BPFViewer] Failed to fetch BPF data:', e);

        // Get user-friendly error message
        const errorMessage = getErrorMessage(e);

        // Mark records as errored
        this.records = this.records.map(record => {
          if (newRecordIds.includes(record.recordId)) {
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
   * Get entity display name (would normally use Utility.getEntityMetadata)
   */
  private getEntityDisplayName(entityName: string): string {
    // Capitalize first letter as fallback
    // In production, use context.utils.getEntityMetadata
    const displayNames: Record<string, string> = {
      opportunity: 'Opportunity',
      lead: 'Lead',
      incident: 'Case',
      account: 'Account',
      contact: 'Contact',
      quote: 'Quote',
      salesorder: 'Order',
      invoice: 'Invoice',
    };
    return displayNames[entityName.toLowerCase()] || 
           entityName.charAt(0).toUpperCase() + entityName.slice(1);
  }

  /**
   * Handle navigation to record
   */
  private handleNavigate(entityName: string, recordId: string): void {
    if (this.context.navigation) {
      this.context.navigation.openForm({
        entityName,
        entityId: recordId,
        openInNewWindow: false,
      });
    }
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
