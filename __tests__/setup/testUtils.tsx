import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import type { IInputs } from '../../generated/ManifestTypes';
import type { IBPFStage, IBPFInstance, IRecordBPFData, IStageColors } from '../../types';

/**
 * Custom render function that wraps components with FluentProvider
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <FluentProvider theme={webLightTheme}>{children}</FluentProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Mock PCF Context Factory
 */
export function createMockContext(overrides?: Partial<ComponentFramework.Context<IInputs>>): ComponentFramework.Context<IInputs> {
  const mockContext = {
    parameters: {
      records: {
        sortedRecordIds: [],
        records: {},
        loading: false,
        error: false,
        errorMessage: '',
        paging: {
          totalResultCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        filtering: {},
        sorting: [],
        linking: {},
        columns: [],
        ...overrides?.parameters?.records,
      },
      parametersBPF: {
        raw: '{"bpfs":[{"bpfEntitySchemaName":"opportunitysalesprocess","lookupFieldSchemaName":"_opportunityid_value"}]}',
        ...overrides?.parameters?.parametersBPF,
      },
      designStyle: {
        raw: 'chevron',
        ...overrides?.parameters?.designStyle,
      },
      displayMode: {
        raw: 'stage',
        ...overrides?.parameters?.displayMode,
      },
      recordNameSize: {
        raw: 'medium',
        ...overrides?.parameters?.recordNameSize,
      },
      showEntityName: {
        raw: 'true',
        ...overrides?.parameters?.showEntityName,
      },
      enableNavigation: {
        raw: 'true',
        ...overrides?.parameters?.enableNavigation,
      },
      showPulseAnimation: {
        raw: 'true',
        ...overrides?.parameters?.showPulseAnimation,
      },
      usePlatformTheme: {
        raw: 'true',
        ...overrides?.parameters?.usePlatformTheme,
      },
    },
    mode: {
      allocatedHeight: 500,
      allocatedWidth: 800,
      isControlDisabled: false,
      isVisible: true,
      label: 'BPF Viewer',
    },
    navigation: {
      openForm: jest.fn(),
      openUrl: jest.fn(),
    },
    webAPI: {
      retrieveMultipleRecords: jest.fn().mockResolvedValue({
        entities: [],
        nextLink: null,
      }),
      retrieveRecord: jest.fn(),
      createRecord: jest.fn(),
      updateRecord: jest.fn(),
      deleteRecord: jest.fn(),
    },
    utils: {
      getEntityMetadata: jest.fn(),
      hasEntityPrivilege: jest.fn().mockReturnValue(true),
      lookupObjects: jest.fn(),
    },
    factory: {
      requestRender: jest.fn(),
      getPopupService: jest.fn(),
    },
    formatting: {
      formatCurrency: jest.fn(),
      formatDateAsFilterStringInUTC: jest.fn(),
      formatDateLong: jest.fn(),
      formatDateShort: jest.fn(),
      formatDecimal: jest.fn(),
      formatInteger: jest.fn(),
      formatLanguage: jest.fn(),
      formatTime: jest.fn(),
      formatUserInput: jest.fn(),
      getWeekOfYear: jest.fn(),
    },
    resources: {
      getString: jest.fn((key: string) => key),
      getResource: jest.fn(),
    },
    ...overrides,
  } as ComponentFramework.Context<IInputs>;

  return mockContext;
}

/**
 * Mock Dataset Record type
 */
export interface MockDatasetRecord {
  getRecordId: () => string;
  getValue: jest.Mock<unknown, [string]>;
  getFormattedValue: jest.Mock<string, [string]>;
  getNamedReference: jest.Mock<{ id: string; name: string; entityType: string }, []>;
}

/**
 * Mock Dataset Record Factory
 */
export function createMockDatasetRecord(
  recordId: string,
  entityName: string,
  recordName: string
): MockDatasetRecord {
  return {
    getRecordId: () => recordId,
    getValue: jest.fn((columnName: string) => {
      if (columnName === 'name') return recordName;
      return null;
    }),
    getFormattedValue: jest.fn((columnName: string) => {
      if (columnName === 'name') return recordName;
      return '';
    }),
    getNamedReference: jest.fn(() => ({
      id: recordId,
      name: recordName,
      entityType: entityName,
    })),
  };
}

/**
 * Mock BPF Stage Factory
 */
export function createMockBPFStage(
  stageId: string,
  stageName: string,
  stageCategoryName: string,
  stageOrder: number,
  stageCategory: number = 0,
  isCompleted: boolean = false,
  isActive: boolean = false
): IBPFStage {
  return {
    stageId,
    stageName,
    stageCategory,
    stageCategoryName,
    stageOrder,
    isCompleted,
    isActive,
  };
}

/**
 * Mock BPF Instance Factory
 */
export function createMockBPFInstance(
  processId: string,
  processName: string,
  bpfEntityName: string,
  stages: IBPFStage[],
  activeStageId: string | null,
  statusCode: number = 1
): IBPFInstance {
  return {
    processId,
    processName,
    bpfEntityName,
    stages,
    activeStageId,
    statusCode,
    traversedPath: stages
      .filter(s => s.isCompleted)
      .map(s => s.stageId)
      .join(','),
  };
}

/**
 * Mock Record BPF Data Factory
 */
export function createMockRecordBPFData(
  recordId: string,
  recordName: string,
  entityName: string,
  entityDisplayName: string,
  bpfInstance: IBPFInstance | null = null,
  isLoading: boolean = false,
  error: string | null = null
): IRecordBPFData {
  return {
    recordId,
    recordName,
    entityName,
    entityDisplayName,
    bpfInstance,
    isLoading,
    error,
  };
}

/**
 * Mock Stage Colors Factory
 */
export function createMockStageColors(overrides?: Partial<IStageColors>): IStageColors {
  return {
    completed: '#10b981',
    completedText: '#ffffff',
    active: '#0078d4',
    activeText: '#ffffff',
    inactive: '#e5e5e5',
    inactiveText: '#6b6b6b',
    track: '#d1d1d1',
    ...overrides,
  };
}

/**
 * Mock WebAPI for BPFService tests
 */
export function createMockWebAPI() {
  return {
    retrieveMultipleRecords: jest.fn().mockImplementation((_entityName, _query) => {
      // Default empty response
      return Promise.resolve({
        entities: [],
        nextLink: null,
      });
    }),
    retrieveRecord: jest.fn(),
    createRecord: jest.fn(),
    updateRecord: jest.fn(),
    deleteRecord: jest.fn(),
  };
}

/**
 * Wait for async updates in tests
 */
export function waitForAsync() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
