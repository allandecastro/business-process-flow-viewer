/**
 * Mock Data & Services for Local Testing
 * 
 * Use with `npm start` to test the control locally
 */

import {
  IBPFConfiguration,
  IBPFInstance,
  IBPFStage,
  IRecordBPFData,
} from '../types';

// ============================================
// MOCK STAGE DEFINITIONS
// ============================================

export const MOCK_OPPORTUNITY_STAGES: IBPFStage[] = [
  { stageId: 'stage-1', stageName: 'Qualify Lead', stageCategory: 0, stageCategoryName: 'Qualify', stageOrder: 0, isActive: false, isCompleted: false },
  { stageId: 'stage-2', stageName: 'Develop Proposal', stageCategory: 1, stageCategoryName: 'Develop', stageOrder: 1, isActive: false, isCompleted: false },
  { stageId: 'stage-3', stageName: 'Send Proposal', stageCategory: 2, stageCategoryName: 'Propose', stageOrder: 2, isActive: false, isCompleted: false },
  { stageId: 'stage-4', stageName: 'Close Deal', stageCategory: 3, stageCategoryName: 'Close', stageOrder: 3, isActive: false, isCompleted: false },
];

export const MOCK_LEAD_STAGES: IBPFStage[] = [
  { stageId: 'lead-stage-1', stageName: 'Initial Contact', stageCategory: 0, stageCategoryName: 'Qualify', stageOrder: 0, isActive: false, isCompleted: false },
  { stageId: 'lead-stage-2', stageName: 'Research Needs', stageCategory: 5, stageCategoryName: 'Research', stageOrder: 1, isActive: false, isCompleted: false },
  { stageId: 'lead-stage-3', stageName: 'Convert Lead', stageCategory: 6, stageCategoryName: 'Resolve', stageOrder: 2, isActive: false, isCompleted: false },
];

export const MOCK_CASE_STAGES: IBPFStage[] = [
  { stageId: 'case-stage-1', stageName: 'Log Issue', stageCategory: 4, stageCategoryName: 'Identify', stageOrder: 0, isActive: false, isCompleted: false },
  { stageId: 'case-stage-2', stageName: 'Investigate', stageCategory: 5, stageCategoryName: 'Research', stageOrder: 1, isActive: false, isCompleted: false },
  { stageId: 'case-stage-3', stageName: 'Provide Solution', stageCategory: 6, stageCategoryName: 'Resolve', stageOrder: 2, isActive: false, isCompleted: false },
];

// ============================================
// MOCK BPF INSTANCES
// ============================================

function createBPFInstance(
  baseStages: IBPFStage[],
  activeIndex: number,
  processName: string,
  bpfEntityName: string
): IBPFInstance {
  const stages = baseStages.map((stage, index) => ({
    ...stage,
    isCompleted: index < activeIndex,
    isActive: index === activeIndex,
  }));

  const traversedPath = stages
    .filter(s => s.isCompleted)
    .map(s => s.stageId)
    .join(',');

  return {
    processId: `process-${Math.random().toString(36).substr(2, 9)}`,
    processName,
    bpfEntityName,
    activeStageId: stages[activeIndex]?.stageId || null,
    traversedPath,
    statusCode: 1,
    stages,
  };
}

// ============================================
// MOCK RECORDS
// ============================================

export const MOCK_RECORDS: IRecordBPFData[] = [
  {
    recordId: 'opp-001',
    recordName: 'Contoso Ltd - Enterprise License Agreement 2024',
    entityName: 'opportunity',
    entityDisplayName: 'Opportunity',
    bpfInstance: createBPFInstance(MOCK_OPPORTUNITY_STAGES, 2, 'Opportunity Sales Process', 'opportunitysalesprocess'),
    isLoading: false,
    error: null,
  },
  {
    recordId: 'opp-002',
    recordName: 'Fabrikam Inc - Cloud Migration Project',
    entityName: 'opportunity',
    entityDisplayName: 'Opportunity',
    bpfInstance: createBPFInstance(MOCK_OPPORTUNITY_STAGES, 1, 'Opportunity Sales Process', 'opportunitysalesprocess'),
    isLoading: false,
    error: null,
  },
  {
    recordId: 'opp-003',
    recordName: 'Adventure Works - Annual Support',
    entityName: 'opportunity',
    entityDisplayName: 'Opportunity',
    bpfInstance: createBPFInstance(MOCK_OPPORTUNITY_STAGES, 3, 'Opportunity Sales Process', 'opportunitysalesprocess'),
    isLoading: false,
    error: null,
  },
  {
    recordId: 'lead-001',
    recordName: 'Northwind Traders - Web Inquiry',
    entityName: 'lead',
    entityDisplayName: 'Lead',
    bpfInstance: createBPFInstance(MOCK_LEAD_STAGES, 1, 'Lead to Opportunity Process', 'leadtoopportunitysalesprocess'),
    isLoading: false,
    error: null,
  },
  {
    recordId: 'case-001',
    recordName: 'CASE-2024-00142 - Login Issue Resolved',
    entityName: 'incident',
    entityDisplayName: 'Case',
    bpfInstance: createBPFInstance(MOCK_CASE_STAGES, 2, 'Phone to Case Process', 'phonetocaseprocess'),
    isLoading: false,
    error: null,
  },
  {
    recordId: 'opp-004',
    recordName: 'TailSpin Toys - New Opportunity',
    entityName: 'opportunity',
    entityDisplayName: 'Opportunity',
    bpfInstance: createBPFInstance(MOCK_OPPORTUNITY_STAGES, 0, 'Opportunity Sales Process', 'opportunitysalesprocess'),
    isLoading: false,
    error: null,
  },
  {
    recordId: 'opp-005',
    recordName: 'Wingtip Toys - No BPF Example',
    entityName: 'opportunity',
    entityDisplayName: 'Opportunity',
    bpfInstance: null,
    isLoading: false,
    error: null,
  },
  {
    recordId: 'opp-006',
    recordName: 'Loading Example',
    entityName: 'opportunity',
    entityDisplayName: 'Opportunity',
    bpfInstance: null,
    isLoading: true,
    error: null,
  },
];

// ============================================
// MOCK BPF CONFIGURATION
// ============================================

export const MOCK_BPF_CONFIG: IBPFConfiguration = {
  bpfs: [
    {
      bpfEntitySchemaName: 'opportunitysalesprocess',
      lookupFieldSchemaName: '_opportunityid_value',
    },
    {
      bpfEntitySchemaName: 'leadtoopportunitysalesprocess',
      lookupFieldSchemaName: '_leadid_value',
    },
    {
      bpfEntitySchemaName: 'phonetocaseprocess',
      lookupFieldSchemaName: '_incidentid_value',
    },
  ],
};

// ============================================
// MOCK WEBAPI
// ============================================

export class MockWebAPI {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async retrieveMultipleRecords(
    entityName: string,
    options?: string
  ): Promise<{ entities: unknown[] }> {
    await this.delay(200 + Math.random() * 300);

    // Mock processstage query
    if (entityName === 'processstage') {
      if (options?.includes('opportunitysalesprocess')) {
        return {
          entities: MOCK_OPPORTUNITY_STAGES.map(s => ({
            processstageid: s.stageId,
            stagename: s.stageName,
            stagecategory: s.stageCategory,
            _processid_value: 'workflow-opp-001',
          })),
        };
      }
      if (options?.includes('leadtoopportunitysalesprocess')) {
        return {
          entities: MOCK_LEAD_STAGES.map(s => ({
            processstageid: s.stageId,
            stagename: s.stageName,
            stagecategory: s.stageCategory,
            _processid_value: 'workflow-lead-001',
          })),
        };
      }
      if (options?.includes('phonetocaseprocess')) {
        return {
          entities: MOCK_CASE_STAGES.map(s => ({
            processstageid: s.stageId,
            stagename: s.stageName,
            stagecategory: s.stageCategory,
            _processid_value: 'workflow-case-001',
          })),
        };
      }
    }

    // Mock workflow query
    if (entityName === 'workflow') {
      return {
        entities: [
          { workflowid: 'workflow-opp-001', name: 'Opportunity Sales Process', uniquename: 'opportunitysalesprocess' },
        ],
      };
    }

    // Mock BPF instance query
    if (entityName === 'opportunitysalesprocess') {
      return {
        entities: MOCK_RECORDS
          .filter(r => r.entityName === 'opportunity' && r.bpfInstance)
          .map(r => ({
            businessprocessflowinstanceid: r.bpfInstance!.processId,
            name: r.bpfInstance!.processName,
            _activestageid_value: r.bpfInstance!.activeStageId,
            traversedpath: r.bpfInstance!.traversedPath,
            statuscode: 1,
            _opportunityid_value: r.recordId,
          })),
      };
    }

    return { entities: [] };
  }

  async retrieveRecord(
    entityName: string,
    id: string,
    _options?: string
  ): Promise<unknown> {
    await this.delay(100);
    return { id, entityName };
  }
}

// ============================================
// MOCK NAVIGATION
// ============================================

export class MockNavigation {
  openForm(options: {
    entityName: string;
    entityId: string;
    openInNewWindow?: boolean;
  }): Promise<void> {
    console.log('[MockNavigation] Opening form:', options);
    alert(`Opening record:\n\nEntity: ${options.entityName}\nID: ${options.entityId}`);
    return Promise.resolve();
  }
}

// ============================================
// MOCK DATASET
// ============================================

export class MockDataset {
  sortedRecordIds = MOCK_RECORDS.map(r => r.recordId);
  loading = false;
  
  columns = [
    { name: 'name', displayName: 'Name', isPrimary: true },
  ];

  records: Record<string, {
    getRecordId: () => string;
    getFormattedValue: (col: string) => string;
    getValue: (col: string) => unknown;
    getNamedReference: () => { entityType: string };
  }> = {};

  constructor() {
    for (const record of MOCK_RECORDS) {
      this.records[record.recordId] = {
        getRecordId: () => record.recordId,
        getFormattedValue: (col: string) => col === 'name' ? record.recordName : '',
        getValue: (col: string) => col === 'name' ? record.recordName : null,
        getNamedReference: () => ({ entityType: record.entityName }),
      };
    }
  }

  refresh(): void {
    console.log('[MockDataset] Refreshing...');
  }
}
