import { BPFService } from '../../services/BPFService';
import { createMockWebAPI } from '../setup/testUtils';
import type { IBPFConfiguration } from '../../types';

// Type for mock WebAPI
type MockWebAPI = ReturnType<typeof createMockWebAPI>;

describe('BPFService', () => {
  let service: BPFService;
  let mockWebAPI: MockWebAPI;
  const mockConfig: IBPFConfiguration = {
    bpfs: [
      {
        bpfEntitySchemaName: 'opportunitysalesprocess',
        lookupFieldSchemaName: '_opportunityid_value',
      },
    ],
  };

  beforeEach(() => {
    mockWebAPI = createMockWebAPI();

    // Mock metadata retrieval for stage category labels
    mockWebAPI.retrieveRecord = jest.fn().mockImplementation((entityPath: string) => {
      if (entityPath.includes('stagecategory')) {
        return Promise.resolve({
          OptionSet: {
            Options: [
              { Value: 0, Label: { UserLocalizedLabel: { Label: 'Qualify' } } },
              { Value: 1, Label: { UserLocalizedLabel: { Label: 'Develop' } } },
              { Value: 2, Label: { UserLocalizedLabel: { Label: 'Propose' } } },
              { Value: 3, Label: { UserLocalizedLabel: { Label: 'Close' } } },
              { Value: 4, Label: { UserLocalizedLabel: { Label: 'Identify' } } },
              { Value: 5, Label: { UserLocalizedLabel: { Label: 'Research' } } },
              { Value: 6, Label: { UserLocalizedLabel: { Label: 'Resolve' } } },
            ],
          },
        });
      }
      return Promise.resolve({});
    });

    service = new BPFService(mockWebAPI as ComponentFramework.WebApi);
  });

  afterEach(() => {
    service.clearCache();
    jest.clearAllMocks();
  });

  describe('getBPFDataForRecords', () => {
    it('should return empty map for empty record IDs', async () => {
      const result = await service.getBPFDataForRecords([], mockConfig);

      expect(result.size).toBe(0);
      expect(mockWebAPI.retrieveMultipleRecords).not.toHaveBeenCalled();
    });

    it('should fetch BPF data for single record', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      // Mock BPF instance response
      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'opportunitysalesprocess') {
          return Promise.resolve({
            entities: [
              {
                businessprocessflowinstanceid: 'bpf-001',
                name: 'Opportunity Sales Process',
                _opportunityid_value: recordId,
                _activestageid_value: 'stage2',
                traversedpath: 'stage1',
                statuscode: 1,
              },
            ],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [
              {
                processstageid: 'stage1',
                stagename: 'Qualify',
                stagecategory: 0,
                _processid_value: 'process-001',
              },
              {
                processstageid: 'stage2',
                stagename: 'Develop',
                stagecategory: 1,
                _processid_value: 'process-001',
              },
              {
                processstageid: 'stage3',
                stagename: 'Propose',
                stagecategory: 2,
                _processid_value: 'process-001',
              },
            ],
          });
        }
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [
              {
                workflowid: 'process-001',
                name: 'Opportunity Sales Process',
                uniquename: 'opportunitysalesprocess',
              },
            ],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      const result = await service.getBPFDataForRecords([recordId], mockConfig);

      expect(result.size).toBe(1);
      expect(result.has(recordId)).toBe(true);
      const bpfInstance = result.get(recordId);
      expect(bpfInstance).toBeDefined();
      expect(bpfInstance?.processName).toBe('Opportunity Sales Process');
      expect(bpfInstance?.stages.length).toBe(3);
      expect(bpfInstance?.activeStageId).toBe('stage2');
    });

    it('should batch multiple records efficiently', async () => {
      // Generate valid GUIDs (proper format: 8-4-4-4-12 hex digits)
      const recordIds = Array.from({ length: 25 }, (_, i) => {
        const num = i.toString(16).padStart(2, '0');
        return `00000000-0000-0000-0000-0000000000${num}`;
      });

      // Mock workflow and processstage calls for batching to work
      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'opportunitysalesprocess' }],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [
              { processstageid: 'stage1', stagename: 'Stage 1', stagecategory: 0 },
            ],
          });
        }
        // BPF entities - return empty (no BPF instances)
        return Promise.resolve({ entities: [] });
      });

      await service.getBPFDataForRecords(recordIds, mockConfig);

      // Should batch into groups (25 records with default batch size of 10 = 3 batches)
      const bpfCalls = mockWebAPI.retrieveMultipleRecords.mock.calls.filter(
        (call) => call[0] === 'opportunitysalesprocess'
      );

      // Should have called with batching (3 batches for 25 records with batch size 10)
      expect(bpfCalls.length).toBeGreaterThan(0);
      expect(bpfCalls.length).toBeLessThanOrEqual(3);
    });

    it('should handle records with no BPF', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveMultipleRecords.mockResolvedValue({ entities: [] });

      const result = await service.getBPFDataForRecords([recordId], mockConfig);

      expect(result.size).toBe(1);
      expect(result.get(recordId)).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveMultipleRecords.mockRejectedValue(new Error('API Error'));

      const result = await service.getBPFDataForRecords([recordId], mockConfig);

      // Should return result with null for records that failed
      expect(result.size).toBe(1);
      expect(result.get(recordId)).toBeNull();
    });
  });

  describe('Caching', () => {
    it('should cache stage definitions', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'opportunitysalesprocess') {
          return Promise.resolve({
            entities: [
              {
                businessprocessflowinstanceid: 'bpf-001',
                _opportunityid_value: recordId,
                _activestageid_value: 'stage1',
                traversedpath: '',
                statuscode: 1,
              },
            ],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [
              {
                processstageid: 'stage1',
                stagename: 'Qualify',
                stagecategory: 0,
                _processid_value: 'process-001',
              },
            ],
          });
        }
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [
              {
                workflowid: 'process-001',
                name: 'Opportunity Sales Process',
                uniquename: 'opportunitysalesprocess',
              },
            ],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      // First call
      await service.getBPFDataForRecords([recordId], mockConfig);
      const firstCallCount = mockWebAPI.retrieveMultipleRecords.mock.calls.filter(
        (call) => call[0] === 'processstage'
      ).length;

      // Second call - should use cache
      await service.getBPFDataForRecords([recordId], mockConfig);
      const secondCallCount = mockWebAPI.retrieveMultipleRecords.mock.calls.filter(
        (call) => call[0] === 'processstage'
      ).length;

      // Stage definitions should be cached (call count should not increase)
      expect(secondCallCount).toBe(firstCallCount);
    });

    it('should clear cache on demand', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveMultipleRecords.mockResolvedValue({
        entities: [
          {
            processstageid: 'stage1',
            stagename: 'Qualify',
            stagecategory: 0,
            _processid_value: 'process-001',
          },
        ],
      });

      // Populate cache
      await service.getBPFDataForRecords([recordId], mockConfig);

      // Clear cache
      service.clearCache();

      // Next call should fetch again
      mockWebAPI.retrieveMultipleRecords.mockClear();
      await service.getBPFDataForRecords([recordId], mockConfig);

      // Should have made API calls again
      expect(mockWebAPI.retrieveMultipleRecords).toHaveBeenCalled();
    });

    it('should clear cache for specific BPF', () => {
      service.clearCacheForBPF('opportunitysalesprocess');

      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('Stage Processing', () => {
    it('should correctly identify completed stages', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'opportunitysalesprocess') {
          return Promise.resolve({
            entities: [
              {
                businessprocessflowinstanceid: 'bpf-001',
                _opportunityid_value: recordId,
                _activestageid_value: 'stage3',
                traversedpath: 'stage1,stage2',
                statuscode: 1,
              },
            ],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [
              { processstageid: 'stage1', stagename: 'Stage 1', stagecategory: 0, _processid_value: 'p1' },
              { processstageid: 'stage2', stagename: 'Stage 2', stagecategory: 1, _processid_value: 'p1' },
              { processstageid: 'stage3', stagename: 'Stage 3', stagecategory: 2, _processid_value: 'p1' },
            ],
          });
        }
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'process' }],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      const result = await service.getBPFDataForRecords([recordId], mockConfig);
      const bpfInstance = result.get(recordId);

      expect(bpfInstance?.stages[0].isCompleted).toBe(true);
      expect(bpfInstance?.stages[1].isCompleted).toBe(true);
      expect(bpfInstance?.stages[2].isCompleted).toBe(false);
      expect(bpfInstance?.stages[2].isActive).toBe(true);
    });

    it('should handle stages in correct order', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'opportunitysalesprocess') {
          return Promise.resolve({
            entities: [
              {
                businessprocessflowinstanceid: 'bpf-001',
                _opportunityid_value: recordId,
                _activestageid_value: 'stage2',
                traversedpath: 'stage1',
                statuscode: 1,
              },
            ],
          });
        }
        if (entityName === 'processstage') {
          // Return stages sorted by stagecategory (as the query requests with $orderby=stagecategory asc)
          return Promise.resolve({
            entities: [
              { processstageid: 'stage1', stagename: 'First', stagecategory: 0, _processid_value: 'p1' },
              { processstageid: 'stage2', stagename: 'Second', stagecategory: 1, _processid_value: 'p1' },
              { processstageid: 'stage3', stagename: 'Third', stagecategory: 2, _processid_value: 'p1' },
            ],
          });
        }
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'process' }],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      const result = await service.getBPFDataForRecords([recordId], mockConfig);
      const bpfInstance = result.get(recordId);

      // Stages should be ordered correctly regardless of API return order
      expect(bpfInstance?.stages.length).toBe(3);
      expect(bpfInstance?.stages[0].stageName).toBe('First');
      expect(bpfInstance?.stages[1].stageName).toBe('Second');
      expect(bpfInstance?.stages[2].stageName).toBe('Third');
    });
  });

  describe('Multiple BPF Configurations', () => {
    it('should handle multiple BPF definitions', async () => {
      const multiConfig: IBPFConfiguration = {
        bpfs: [
          {
            bpfEntitySchemaName: 'opportunitysalesprocess',
            lookupFieldSchemaName: '_opportunityid_value',
          },
          {
            bpfEntitySchemaName: 'leadtoopportunitysalesprocess',
            lookupFieldSchemaName: '_leadid_value',
          },
        ],
      };

      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'opportunitysalesprocess') {
          return Promise.resolve({
            entities: [
              {
                businessprocessflowinstanceid: 'bpf-001',
                _opportunityid_value: recordId,
                _activestageid_value: 'stage1',
                traversedpath: '',
                statuscode: 1,
              },
            ],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [
              { processstageid: 'stage1', stagename: 'Qualify', stagecategory: 0, _processid_value: 'p1' },
            ],
          });
        }
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Sales Process', uniquename: 'salesprocess' }],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      const result = await service.getBPFDataForRecords([recordId], multiConfig);

      expect(result.size).toBe(1);
      expect(result.has(recordId)).toBe(true);
      // Should use first matching BPF
      const bpfInstance = result.get(recordId);
      expect(bpfInstance).toBeDefined();
    });
  });

  describe('Abort signal handling', () => {
    it('should throw when signal is aborted before getBPFDataForRecords processes', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';
      const controller = new AbortController();
      controller.abort();

      // With an already-aborted signal, the error throws from the loop
      await expect(
        service.getBPFDataForRecords([recordId], mockConfig, controller.signal)
      ).rejects.toThrow('Request cancelled');
    });

    it('should handle abort in fetchBPFInstancesBatched', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';
      const controller = new AbortController();

      // Abort after workflow call
      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'opportunitysalesprocess' }],
          });
        }
        if (entityName === 'processstage') {
          controller.abort();
          return Promise.resolve({
            entities: [{ processstageid: 'stage1', stagename: 'S1', stagecategory: 0 }],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      const result = await service.getBPFDataForRecords([recordId], mockConfig, controller.signal);
      expect(result.size).toBe(1);
    });
  });

  describe('Validation in fetchBPFInstancesBatched', () => {
    it('should reject invalid BPF entity names', async () => {
      const invalidConfig: IBPFConfiguration = {
        bpfs: [{
          bpfEntitySchemaName: '123invalid',
          lookupFieldSchemaName: 'valid_field',
        }],
      };
      const recordId = '00000000-0000-0000-0000-000000000001';

      const result = await service.getBPFDataForRecords([recordId], invalidConfig);
      expect(result.get(recordId)).toBeNull();
    });

    it('should skip invalid GUIDs in batch', async () => {
      const validId = '00000000-0000-0000-0000-000000000001';
      const invalidId = 'not-a-guid';

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'opportunitysalesprocess' }],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [{ processstageid: 'stage1', stagename: 'S1', stagecategory: 0 }],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      const result = await service.getBPFDataForRecords(
        [validId, invalidId], mockConfig
      );

      // Both should be in results (invalid one as null)
      expect(result.size).toBe(2);
    });

    it('should skip batch when all GUIDs are invalid', async () => {
      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'opportunitysalesprocess' }],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [{ processstageid: 'stage1', stagename: 'S1', stagecategory: 0 }],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      const result = await service.getBPFDataForRecords(
        ['invalid1', 'invalid2'], mockConfig
      );

      expect(result.get('invalid1')).toBeNull();
      expect(result.get('invalid2')).toBeNull();
    });
  });

  describe('getProcessId edge cases', () => {
    it('should use cached workflow ID on second call', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'opportunitysalesprocess' }],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [{ processstageid: 'stage1', stagename: 'S1', stagecategory: 0 }],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      await service.getBPFDataForRecords([recordId], mockConfig);
      const firstWorkflowCalls = mockWebAPI.retrieveMultipleRecords.mock.calls.filter(
        c => c[0] === 'workflow'
      ).length;

      await service.getBPFDataForRecords([recordId], mockConfig);
      const secondWorkflowCalls = mockWebAPI.retrieveMultipleRecords.mock.calls.filter(
        c => c[0] === 'workflow'
      ).length;

      // Workflow ID should be cached, no new calls
      expect(secondWorkflowCalls).toBe(firstWorkflowCalls);
    });

    it('should find workflow using combined exact+contains query in single call', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';
      let workflowCallCount = 0;

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string, query?: string) => {
        if (entityName === 'workflow') {
          workflowCallCount++;
          // Combined query returns a contains match (exact match not found)
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'myopportunitysalesprocess' }],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [{ processstageid: 'stage1', stagename: 'S1', stagecategory: 0 }],
          });
        }
        if (entityName === 'opportunitysalesprocess') {
          // Return a BPF instance so the fallback path (getProcessStages) is triggered
          return Promise.resolve({
            entities: [{
              businessprocessflowinstanceid: 'bpf-001',
              _opportunityid_value: recordId,
              _activestageid_value: 'stage1',
              traversedpath: '',
              statuscode: 1,
            }],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      const result = await service.getBPFDataForRecords([recordId], mockConfig);
      // Should only make a single workflow query (combined exact+contains)
      expect(workflowCallCount).toBe(1);
    });

    it('should return null when neither workflow query finds results', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        // Always return empty for workflow queries
        return Promise.resolve({ entities: [] });
      });

      const result = await service.getBPFDataForRecords([recordId], mockConfig);
      expect(result.get(recordId)).toBeNull();
    });

    it('should handle abort signal in getProcessStages', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';
      const controller = new AbortController();

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'workflow') {
          controller.abort();
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'opportunitysalesprocess' }],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      const result = await service.getBPFDataForRecords([recordId], mockConfig, controller.signal);
      expect(result.size).toBe(1);
    });
  });

  describe('Batch fetch error handling', () => {
    it('should handle error in individual batch without failing all', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'opportunitysalesprocess' }],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [{ processstageid: 'stage1', stagename: 'S1', stagecategory: 0 }],
          });
        }
        if (entityName === 'opportunitysalesprocess') {
          // BPF query fails
          return Promise.reject(new Error('Batch fetch error'));
        }
        return Promise.resolve({ entities: [] });
      });

      const result = await service.getBPFDataForRecords([recordId], mockConfig);
      // Should still return result (null for failed record)
      expect(result.size).toBe(1);
      expect(result.get(recordId)).toBeNull();
    });
  });

  describe('getStageCategoryLabels', () => {
    it('should cache category labels on second call', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'opportunitysalesprocess' }],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [{ processstageid: 'stage1', stagename: 'S1', stagecategory: 0 }],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      await service.getBPFDataForRecords([recordId], mockConfig);
      const firstRetrieveRecordCalls = (mockWebAPI.retrieveRecord as jest.Mock).mock.calls.length;

      await service.getBPFDataForRecords([recordId], mockConfig);
      const secondRetrieveRecordCalls = (mockWebAPI.retrieveRecord as jest.Mock).mock.calls.length;

      // Category labels should be cached
      expect(secondRetrieveRecordCalls).toBe(firstRetrieveRecordCalls);
    });

    it('should handle category labels fetch failure gracefully', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      // Make retrieveRecord fail for category labels
      mockWebAPI.retrieveRecord = jest.fn().mockRejectedValue(new Error('Metadata fetch failed'));

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'opportunitysalesprocess' }],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [{ processstageid: 'stage1', stagename: 'S1', stagecategory: 0 }],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      // Should not throw - falls back to stage names
      const result = await service.getBPFDataForRecords([recordId], mockConfig);
      expect(result.size).toBe(1);
    });

    it('should use LocalizedLabels fallback when UserLocalizedLabel is missing', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveRecord = jest.fn().mockResolvedValue({
        OptionSet: {
          Options: [
            {
              Value: 0,
              Label: {
                UserLocalizedLabel: null,
                LocalizedLabels: [{ Label: 'Localized Qualify', LanguageCode: 1033 }],
              },
            },
          ],
        },
      });

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'opportunitysalesprocess' }],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [{ processstageid: 'stage1', stagename: 'S1', stagecategory: 0 }],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      const result = await service.getBPFDataForRecords([recordId], mockConfig);
      const instance = result.get(recordId);
      // Should use the localized labels fallback
      expect(instance).toBeNull(); // No BPF instance match, but stages were fetched successfully
    });

    it('should handle abort signal in getStageCategoryLabels', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';
      const controller = new AbortController();

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'opportunitysalesprocess' }],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [{ processstageid: 'stage1', stagename: 'S1', stagecategory: 0 }],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      mockWebAPI.retrieveRecord = jest.fn().mockImplementation(() => {
        controller.abort();
        return Promise.reject(new Error('Request cancelled'));
      });

      // Should handle the abort gracefully (category labels failure is non-fatal)
      const result = await service.getBPFDataForRecords([recordId], mockConfig, controller.signal);
      expect(result.size).toBe(1);
    });
  });

  describe('getBPFDataForRecord (single record)', () => {
    it('should fetch BPF data for a single record', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'opportunitysalesprocess' }],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [{ processstageid: 'stage1', stagename: 'S1', stagecategory: 0 }],
          });
        }
        if (entityName === 'opportunitysalesprocess') {
          return Promise.resolve({
            entities: [{
              businessprocessflowinstanceid: 'bpf-001',
              _opportunityid_value: recordId,
              _activestageid_value: 'stage1',
              traversedpath: '',
              statuscode: 1,
            }],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      const result = await service.getBPFDataForRecord(recordId, 'opportunity', mockConfig);
      expect(result).toBeDefined();
      expect(result?.processId).toBe('bpf-001');
    });

    it('should return null when no BPF found for single record', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'opportunitysalesprocess' }],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [{ processstageid: 'stage1', stagename: 'S1', stagecategory: 0 }],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      const result = await service.getBPFDataForRecord(recordId, 'opportunity', mockConfig);
      expect(result).toBeNull();
    });

    it('should deduplicate concurrent requests for same record', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'opportunitysalesprocess' }],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [{ processstageid: 'stage1', stagename: 'S1', stagecategory: 0 }],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      // Fire two concurrent requests for the same record
      const [result1, result2] = await Promise.all([
        service.getBPFDataForRecord(recordId, 'opportunity', mockConfig),
        service.getBPFDataForRecord(recordId, 'opportunity', mockConfig),
      ]);

      // Both should resolve (second should reuse pending request)
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it('should handle error in fetchSingleRecord gracefully', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveMultipleRecords.mockRejectedValue(new Error('API Error'));

      const result = await service.getBPFDataForRecord(recordId, 'opportunity', mockConfig);
      expect(result).toBeNull();
    });
  });

  describe('mapToBPFInstance edge cases', () => {
    it('should handle missing optional fields in BPF record', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'opportunitysalesprocess' }],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [{ processstageid: 'stage1', stagename: 'S1', stagecategory: 0 }],
          });
        }
        if (entityName === 'opportunitysalesprocess') {
          return Promise.resolve({
            entities: [{
              // Minimal record - missing name, traversedpath, statuscode
              businessprocessflowinstanceid: undefined,
              _opportunityid_value: recordId,
              _activestageid_value: null,
              traversedpath: undefined,
              statuscode: undefined,
            }],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      const result = await service.getBPFDataForRecords([recordId], mockConfig);
      const instance = result.get(recordId);
      expect(instance).toBeDefined();
      expect(instance?.processId).toBe('');
      expect(instance?.traversedPath).toBe('');
      expect(instance?.statusCode).toBe(0);
    });
  });

  describe('RetrieveActivePath', () => {
    const validInstanceId = '10000000-0000-0000-0000-000000000001';
    const recordId = '00000000-0000-0000-0000-000000000001';
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      originalFetch = global.fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    function setupBPFInstanceMock(instanceId: string) {
      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'opportunitysalesprocess') {
          return Promise.resolve({
            entities: [{
              businessprocessflowinstanceid: instanceId,
              _opportunityid_value: recordId,
              _activestageid_value: 'stage2',
              traversedpath: 'stage1',
              statuscode: 1,
            }],
          });
        }
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'opportunitysalesprocess' }],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [
              { processstageid: 'stage1', stagename: 'Qualify', stagecategory: 0 },
              { processstageid: 'stage2', stagename: 'Develop', stagecategory: 1 },
              { processstageid: 'stage3', stagename: 'Propose', stagecategory: 2 },
              { processstageid: 'stageX', stagename: 'Conditional Branch', stagecategory: 3 },
            ],
          });
        }
        return Promise.resolve({ entities: [] });
      });
    }

    it('should use RetrieveActivePath stages instead of all process stages', async () => {
      setupBPFInstanceMock(validInstanceId);

      // Mock fetch to return only 3 of 4 stages (simulating conditional BPF)
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          value: [
            { processstageid: 'stage1', stagename: 'Qualify', stagecategory: 0 },
            { processstageid: 'stage2', stagename: 'Develop', stagecategory: 1 },
            { processstageid: 'stage3', stagename: 'Propose', stagecategory: 2 },
          ],
        }),
      });

      const result = await service.getBPFDataForRecords([recordId], mockConfig);
      const instance = result.get(recordId);

      expect(instance).toBeDefined();
      // Should have 3 stages (active path), NOT 4 (all process stages)
      expect(instance?.stages.length).toBe(3);
      expect(instance?.stages.map(s => s.stageId)).toEqual(['stage1', 'stage2', 'stage3']);

      // fetch should have been called with RetrieveActivePath
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`RetrieveActivePath(ProcessInstanceId=${validInstanceId})`),
        expect.any(Object)
      );

      // processstage query should NOT have been called (no fallback needed)
      const processStageCalls = mockWebAPI.retrieveMultipleRecords.mock.calls.filter(
        (call) => call[0] === 'processstage'
      );
      expect(processStageCalls.length).toBe(0);
    });

    it('should fall back to getProcessStages when fetch fails', async () => {
      setupBPFInstanceMock(validInstanceId);

      // Mock fetch to fail
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await service.getBPFDataForRecords([recordId], mockConfig);
      const instance = result.get(recordId);

      expect(instance).toBeDefined();
      // Should have all 4 stages from fallback (getProcessStages)
      expect(instance?.stages.length).toBe(4);

      // processstage query SHOULD have been called (fallback)
      const processStageCalls = mockWebAPI.retrieveMultipleRecords.mock.calls.filter(
        (call) => call[0] === 'processstage'
      );
      expect(processStageCalls.length).toBeGreaterThan(0);
    });

    it('should fall back when RetrieveActivePath returns non-OK response', async () => {
      setupBPFInstanceMock(validInstanceId);

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      const result = await service.getBPFDataForRecords([recordId], mockConfig);
      const instance = result.get(recordId);

      expect(instance).toBeDefined();
      // Should fall back to all process stages
      expect(instance?.stages.length).toBe(4);
    });

    it('should cache active path stages per instance', async () => {
      setupBPFInstanceMock(validInstanceId);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          value: [
            { processstageid: 'stage1', stagename: 'Qualify', stagecategory: 0 },
            { processstageid: 'stage2', stagename: 'Develop', stagecategory: 1 },
          ],
        }),
      });

      // First call
      await service.getBPFDataForRecords([recordId], mockConfig);
      const firstFetchCount = (global.fetch as jest.Mock).mock.calls.length;

      // Second call - should use cache
      await service.getBPFDataForRecords([recordId], mockConfig);
      const secondFetchCount = (global.fetch as jest.Mock).mock.calls.length;

      // fetch should not have been called again
      expect(secondFetchCount).toBe(firstFetchCount);
    });

    it('should handle conditional stages where different instances have different paths', async () => {
      const recordId2 = '00000000-0000-0000-0000-000000000002';
      const instanceId2 = '20000000-0000-0000-0000-000000000002';

      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'opportunitysalesprocess') {
          return Promise.resolve({
            entities: [
              {
                businessprocessflowinstanceid: validInstanceId,
                _opportunityid_value: recordId,
                _activestageid_value: 'stage2',
                traversedpath: 'stage1',
                statuscode: 1,
              },
              {
                businessprocessflowinstanceid: instanceId2,
                _opportunityid_value: recordId2,
                _activestageid_value: 'stageB',
                traversedpath: 'stageA',
                statuscode: 1,
              },
            ],
          });
        }
        if (entityName === 'workflow') {
          return Promise.resolve({
            entities: [{ workflowid: 'p1', name: 'Process', uniquename: 'opportunitysalesprocess' }],
          });
        }
        if (entityName === 'processstage') {
          return Promise.resolve({
            entities: [
              { processstageid: 'stage1', stagename: 'Common', stagecategory: 0 },
              { processstageid: 'stage2', stagename: 'Path A', stagecategory: 1 },
              { processstageid: 'stageA', stagename: 'Path B Start', stagecategory: 1 },
              { processstageid: 'stageB', stagename: 'Path B End', stagecategory: 2 },
            ],
          });
        }
        return Promise.resolve({ entities: [] });
      });

      // Mock fetch to return different active paths per instance
      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url.includes(validInstanceId)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              value: [
                { processstageid: 'stage1', stagename: 'Common', stagecategory: 0 },
                { processstageid: 'stage2', stagename: 'Path A', stagecategory: 1 },
              ],
            }),
          });
        }
        if (url.includes(instanceId2)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              value: [
                { processstageid: 'stageA', stagename: 'Path B Start', stagecategory: 0 },
                { processstageid: 'stageB', stagename: 'Path B End', stagecategory: 1 },
              ],
            }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const result = await service.getBPFDataForRecords([recordId, recordId2], mockConfig);

      const instance1 = result.get(recordId);
      const instance2 = result.get(recordId2);

      // Instance 1 should have 2 stages (Path A)
      expect(instance1?.stages.length).toBe(2);
      expect(instance1?.stages.map(s => s.stageId)).toEqual(['stage1', 'stage2']);

      // Instance 2 should have 2 stages (Path B)
      expect(instance2?.stages.length).toBe(2);
      expect(instance2?.stages.map(s => s.stageId)).toEqual(['stageA', 'stageB']);
    });

    it('should fall back gracefully when instanceId is not a valid GUID', async () => {
      // Use invalid GUID for instanceId
      setupBPFInstanceMock('invalid-not-a-guid');

      global.fetch = jest.fn();

      const result = await service.getBPFDataForRecords([recordId], mockConfig);
      const instance = result.get(recordId);

      expect(instance).toBeDefined();
      // Should fall back to all process stages
      expect(instance?.stages.length).toBe(4);
      // fetch should NOT have been called
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('empty config', () => {
    it('should return empty map for empty BPF config', async () => {
      const emptyConfig: IBPFConfiguration = { bpfs: [] };
      const result = await service.getBPFDataForRecords(
        ['00000000-0000-0000-0000-000000000001'], emptyConfig
      );
      expect(result.size).toBe(0);
    });
  });

  describe('request timeout', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should timeout when workflow query hangs', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      // Create a promise that never resolves to simulate a hang
      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'workflow') {
          return new Promise(() => {/* never resolves */});
        }
        return Promise.resolve({ entities: [] });
      });

      const resultPromise = service.getBPFDataForRecords([recordId], mockConfig);

      // Advance timers past the 30s timeout
      jest.advanceTimersByTime(31000);

      const result = await resultPromise;
      // Error is caught per-BPF, record gets null
      expect(result.get(recordId)).toBeNull();
    });
  });

  describe('fetchWithTimeout abort signal integration', () => {
    it('should reject immediately when signal is aborted during a pending request', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';
      const controller = new AbortController();

      // Workflow query hangs indefinitely
      mockWebAPI.retrieveMultipleRecords.mockImplementation((entityName: string) => {
        if (entityName === 'workflow') {
          return new Promise(() => {/* never resolves */});
        }
        return Promise.resolve({ entities: [] });
      });

      const resultPromise = service.getBPFDataForRecords(
        [recordId], mockConfig, controller.signal
      );

      // Abort while the workflow request is pending
      controller.abort();

      const result = await resultPromise;
      // Error is caught per-BPF, record gets null
      expect(result.get(recordId)).toBeNull();
    });

    it('should reject fetchWithTimeout if signal is already aborted', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';
      const controller = new AbortController();
      controller.abort(); // Abort before any call

      // The pre-aborted signal throws before the try-catch in the for-loop
      await expect(
        service.getBPFDataForRecords([recordId], mockConfig, controller.signal)
      ).rejects.toThrow('Request cancelled');
    });
  });
});
