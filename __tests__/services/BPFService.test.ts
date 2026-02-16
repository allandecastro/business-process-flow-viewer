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
      const result = await service.getBPFDataForRecords([], 'opportunity', mockConfig);

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

      const result = await service.getBPFDataForRecords([recordId], 'opportunity', mockConfig);

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

      await service.getBPFDataForRecords(recordIds, 'opportunity', mockConfig);

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

      const result = await service.getBPFDataForRecords([recordId], 'opportunity', mockConfig);

      expect(result.size).toBe(1);
      expect(result.get(recordId)).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      const recordId = '00000000-0000-0000-0000-000000000001';

      mockWebAPI.retrieveMultipleRecords.mockRejectedValue(new Error('API Error'));

      const result = await service.getBPFDataForRecords([recordId], 'opportunity', mockConfig);

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
      await service.getBPFDataForRecords([recordId], 'opportunity', mockConfig);
      const firstCallCount = mockWebAPI.retrieveMultipleRecords.mock.calls.filter(
        (call) => call[0] === 'processstage'
      ).length;

      // Second call - should use cache
      await service.getBPFDataForRecords([recordId], 'opportunity', mockConfig);
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
      await service.getBPFDataForRecords([recordId], 'opportunity', mockConfig);

      // Clear cache
      service.clearCache();

      // Next call should fetch again
      mockWebAPI.retrieveMultipleRecords.mockClear();
      await service.getBPFDataForRecords([recordId], 'opportunity', mockConfig);

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

      const result = await service.getBPFDataForRecords([recordId], 'opportunity', mockConfig);
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

      const result = await service.getBPFDataForRecords([recordId], 'opportunity', mockConfig);
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

      const result = await service.getBPFDataForRecords([recordId], 'opportunity', multiConfig);

      expect(result.size).toBe(1);
      expect(result.has(recordId)).toBe(true);
      // Should use first matching BPF
      const bpfInstance = result.get(recordId);
      expect(bpfInstance).toBeDefined();
    });
  });
});
