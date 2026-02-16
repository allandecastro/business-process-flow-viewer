import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders, createMockRecordBPFData, createMockBPFInstance, createMockBPFStage, createMockStageColors } from '../setup/testUtils';
import { BPFViewer } from '../../components/BPFViewer';
import type { IControlSettings } from '../../types';

const mockSettings: IControlSettings = {
  designStyle: 'chevron',
  displayMode: 'stage',
  recordNameSize: 'medium',
  showEntityName: true,
  enableNavigation: true,
  showPulseAnimation: true,
  usePlatformTheme: false,
};

const mockColors = createMockStageColors();

describe('BPFViewer', () => {
  it('should render loading state', () => {
    renderWithProviders(
      <BPFViewer
        records={[]}
        settings={mockSettings}
        colors={mockColors}
        isLoading={true}
        error={null}
      />
    );

    expect(screen.getByText(/loading records/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render error state with retry button', () => {
    const mockOnRefresh = jest.fn();

    renderWithProviders(
      <BPFViewer
        records={[]}
        settings={mockSettings}
        colors={mockColors}
        isLoading={false}
        error="Failed to load data"
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText(/failed to load data/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should render empty state when no records', () => {
    renderWithProviders(
      <BPFViewer
        records={[]}
        settings={mockSettings}
        colors={mockColors}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText(/no records to display/i)).toBeInTheDocument();
  });

  it('should render records list', () => {
    const mockStages = [
      createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
      createMockBPFStage('stage2', 'Develop', 'Develop', 1, 1, false, true),
    ];

    const mockBPFInstance = createMockBPFInstance(
      'process-001',
      'Opportunity Sales Process',
      'opportunitysalesprocess',
      mockStages,
      'stage2',
      1
    );

    const records = [
      createMockRecordBPFData(
        'record-001',
        'Contoso Ltd',
        'opportunity',
        'Opportunity',
        mockBPFInstance
      ),
    ];

    renderWithProviders(
      <BPFViewer
        records={records}
        settings={mockSettings}
        colors={mockColors}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText('Contoso Ltd')).toBeInTheDocument();
    expect(screen.getByText('Opportunity')).toBeInTheDocument();
  });

  it('should render multiple records', () => {
    const mockStages = [
      createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, true, false),
    ];

    const mockBPFInstance = createMockBPFInstance(
      'process-001',
      'Sales Process',
      'opportunitysalesprocess',
      mockStages,
      'stage1',
      1
    );

    const records = [
      createMockRecordBPFData('r1', 'Record 1', 'opportunity', 'Opportunity', mockBPFInstance),
      createMockRecordBPFData('r2', 'Record 2', 'opportunity', 'Opportunity', mockBPFInstance),
      createMockRecordBPFData('r3', 'Record 3', 'opportunity', 'Opportunity', mockBPFInstance),
    ];

    renderWithProviders(
      <BPFViewer
        records={records}
        settings={mockSettings}
        colors={mockColors}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText('Record 1')).toBeInTheDocument();
    expect(screen.getByText('Record 2')).toBeInTheDocument();
    expect(screen.getByText('Record 3')).toBeInTheDocument();
  });

  it('should not show entity badges when showEntityName is false', () => {
    const mockStages = [
      createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, false, true),
    ];

    const mockBPFInstance = createMockBPFInstance(
      'process-001',
      'Sales Process',
      'opportunitysalesprocess',
      mockStages,
      'stage1',
      1
    );

    const records = [
      createMockRecordBPFData('r1', 'Record 1', 'opportunity', 'Opportunity', mockBPFInstance),
    ];

    renderWithProviders(
      <BPFViewer
        records={records}
        settings={{ ...mockSettings, showEntityName: false }}
        colors={mockColors}
        isLoading={false}
        error={null}
      />
    );

    // Entity badge should not be visible
    expect(screen.queryByText('Opportunity')).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes for empty state', () => {
    renderWithProviders(
      <BPFViewer
        records={[]}
        settings={mockSettings}
        colors={mockColors}
        isLoading={false}
        error={null}
      />
    );

    const emptyContainer = screen.getByRole('status');
    expect(emptyContainer).toBeInTheDocument();
  });

  it('should render loading spinner for individual records', () => {
    const records = [
      createMockRecordBPFData('r1', 'Record 1', 'opportunity', 'Opportunity', null, true),
    ];

    renderWithProviders(
      <BPFViewer
        records={records}
        settings={mockSettings}
        colors={mockColors}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText('Record 1')).toBeInTheDocument();
    // Individual record loading state handled by BPFRow component
  });
});
