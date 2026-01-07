/**
 * BusinessProcessFlowViewer v2 - Type Definitions
 */

// ============================================
// Configuration Types
// ============================================

export interface IBPFConfiguration {
  bpfs: IBPFDefinition[];
}

export interface IBPFDefinition {
  bpfEntitySchemaName: string;
  lookupFieldSchemaName: string;
}

// ============================================
// Design & Display Types
// ============================================

export type DesignStyle = 'chevron' | 'circles' | 'pills' | 'segmented' | 'timeline' | 'stepper';
export type DisplayMode = 'stage' | 'category';
export type RecordNameSize = 'small' | 'medium' | 'large';

// ============================================
// Color Types
// ============================================

export interface IStageColors {
  completed: string;
  completedText: string;
  active: string;
  activeText: string;
  inactive: string;
  inactiveText: string;
  track: string;
}

// ============================================
// BPF Data Types
// ============================================

export type StageCategory = 
  | 'Qualify'
  | 'Develop'
  | 'Propose'
  | 'Close'
  | 'Identify'
  | 'Research'
  | 'Resolve'
  | 'Custom';

export interface IBPFStage {
  stageId: string;
  stageName: string;
  stageCategory: number;
  stageCategoryName: StageCategory;
  stageOrder: number;
  isActive: boolean;
  isCompleted: boolean;
}

export interface IBPFInstance {
  processId: string;
  processName: string;
  bpfEntityName: string;
  activeStageId: string | null;
  traversedPath: string;
  statusCode: number;
  stages: IBPFStage[];
}

// ============================================
// Record Types
// ============================================

export interface IRecordBPFData {
  recordId: string;
  recordName: string;
  entityName: string;
  entityDisplayName: string;
  bpfInstance: IBPFInstance | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Component Props
// ============================================

export interface IControlSettings {
  designStyle: DesignStyle;
  displayMode: DisplayMode;
  recordNameSize: RecordNameSize;
  showEntityName: boolean;
  enableNavigation: boolean;
  showPulseAnimation: boolean;
  usePlatformTheme: boolean;
}

export interface IBPFViewerProps {
  records: IRecordBPFData[];
  settings: IControlSettings;
  colors: IStageColors;
  isLoading: boolean;
  error: string | null;
  onNavigate?: (entityName: string, recordId: string) => void;
  onRefresh?: () => void;
}

export interface IBPFRowProps {
  record: IRecordBPFData;
  settings: IControlSettings;
  colors: IStageColors;
  isMobile: boolean;
  onNavigate?: (entityName: string, recordId: string) => void;
}

export interface IBPFDesignProps {
  stages: IBPFStage[];
  displayMode: DisplayMode;
  colors: IStageColors;
  showPulse: boolean;
  isMobile: boolean;
}

// ============================================
// Service Types
// ============================================

export interface IBPFServiceConfig {
  webApi: ComponentFramework.WebApi;
  cacheTimeout?: number; // ms, default 5 minutes
}

export interface IBatchRequest {
  recordId: string;
  bpfDef: IBPFDefinition;
}

export interface ICachedStages {
  stages: IBPFStage[];
  timestamp: number;
  processId: string;
}

// ============================================
// WebAPI Response Types
// ============================================

export interface IProcessStageResponse {
  processstageid: string;
  stagename: string;
  stagecategory: number;
  _processid_value: string;
}

export interface IBPFInstanceResponse {
  [key: string]: unknown;
  businessprocessflowinstanceid?: string;
  name?: string;
  _activestageid_value?: string;
  traversedpath?: string;
  statuscode?: number;
}

export interface IWorkflowResponse {
  workflowid: string;
  name: string;
  uniquename: string;
}

// ============================================
// Utility Types
// ============================================

export type WebApiClient = ComponentFramework.WebApi;

export interface IDatasetRecord {
  getRecordId(): string;
  getFormattedValue(columnName: string): string;
  getValue(columnName: string): unknown;
}
