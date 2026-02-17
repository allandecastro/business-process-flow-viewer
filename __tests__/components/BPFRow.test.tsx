import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  renderWithProviders,
  createMockRecordBPFData,
  createMockBPFInstance,
  createMockBPFStage,
  createMockStageColors,
} from '../setup/testUtils';
import { BPFRow } from '../../components/BPFRow';
import type { IControlSettings } from '../../types';

const mockSettings: IControlSettings = {
  designStyle: 'chevron',
  displayMode: 'stage',
  recordNameSize: 'medium',
  showEntityName: true,
  enableNavigation: false,
  showPulseAnimation: true,
  usePlatformTheme: false,
};

const navSettings = { ...mockSettings, enableNavigation: true as const };

const mockColors = createMockStageColors();

describe('BPFRow', () => {
  it('should render record name', () => {
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

    const record = createMockRecordBPFData(
      'record-001',
      'Contoso Ltd',
      'opportunity',
      'Opportunity',
      mockBPFInstance
    );

    renderWithProviders(
      <BPFRow record={record} settings={mockSettings} colors={mockColors} isMobile={false} />
    );

    expect(screen.getByText('Contoso Ltd')).toBeInTheDocument();
  });

  it('should render entity badge when showEntityName is true', () => {
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

    const record = createMockRecordBPFData(
      'record-001',
      'Test Record',
      'opportunity',
      'Opportunity',
      mockBPFInstance
    );

    renderWithProviders(
      <BPFRow record={record} settings={mockSettings} colors={mockColors} isMobile={false} />
    );

    expect(screen.getByText('Opportunity')).toBeInTheDocument();
  });

  it('should not render entity badge when showEntityName is false', () => {
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

    const record = createMockRecordBPFData(
      'record-001',
      'Test Record',
      'opportunity',
      'Opportunity',
      mockBPFInstance
    );

    renderWithProviders(
      <BPFRow
        record={record}
        settings={{ ...mockSettings, showEntityName: false }}
        colors={mockColors}
        isMobile={false}
      />
    );

    expect(screen.queryByText('Opportunity')).not.toBeInTheDocument();
  });

  it('should render process name', () => {
    const mockStages = [
      createMockBPFStage('stage1', 'Qualify', 'Qualify', 0, 0, false, true),
    ];

    const mockBPFInstance = createMockBPFInstance(
      'process-001',
      'Opportunity Sales Process',
      'opportunitysalesprocess',
      mockStages,
      'stage1',
      1
    );

    const record = createMockRecordBPFData(
      'record-001',
      'Test Record',
      'opportunity',
      'Opportunity',
      mockBPFInstance
    );

    renderWithProviders(
      <BPFRow record={record} settings={mockSettings} colors={mockColors} isMobile={false} />
    );

    expect(screen.getByText('Opportunity Sales Process')).toBeInTheDocument();
  });

  it('should call onNavigate when clicked and navigation is enabled', async () => {
    const user = userEvent.setup();
    const mockOnNavigate = jest.fn();
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

    const record = createMockRecordBPFData(
      'record-001',
      'Test Record',
      'opportunity',
      'Opportunity',
      mockBPFInstance
    );

    renderWithProviders(
      <BPFRow
        record={record}
        settings={navSettings}
        colors={mockColors}
        isMobile={false}
        onNavigate={mockOnNavigate}
      />
    );

    const recordHeader = screen.getByRole('button');
    await user.click(recordHeader);

    expect(mockOnNavigate).toHaveBeenCalledWith('opportunity', 'record-001');
  });

  it('should support keyboard navigation with Enter key', async () => {
    const user = userEvent.setup();
    const mockOnNavigate = jest.fn();
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

    const record = createMockRecordBPFData(
      'record-001',
      'Test Record',
      'opportunity',
      'Opportunity',
      mockBPFInstance
    );

    renderWithProviders(
      <BPFRow
        record={record}
        settings={navSettings}
        colors={mockColors}
        isMobile={false}
        onNavigate={mockOnNavigate}
      />
    );

    const recordHeader = screen.getByRole('button');
    recordHeader.focus();
    await user.keyboard('{Enter}');

    expect(mockOnNavigate).toHaveBeenCalledWith('opportunity', 'record-001');
  });

  it('should support keyboard navigation with Space key', async () => {
    const user = userEvent.setup();
    const mockOnNavigate = jest.fn();
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

    const record = createMockRecordBPFData(
      'record-001',
      'Test Record',
      'opportunity',
      'Opportunity',
      mockBPFInstance
    );

    renderWithProviders(
      <BPFRow
        record={record}
        settings={navSettings}
        colors={mockColors}
        isMobile={false}
        onNavigate={mockOnNavigate}
      />
    );

    const recordHeader = screen.getByRole('button');
    recordHeader.focus();
    await user.keyboard(' ');

    expect(mockOnNavigate).toHaveBeenCalledWith('opportunity', 'record-001');
  });

  it('should render as article when navigation is disabled', () => {
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

    const record = createMockRecordBPFData(
      'record-001',
      'Test Record',
      'opportunity',
      'Opportunity',
      mockBPFInstance
    );

    renderWithProviders(
      <BPFRow
        record={record}
        settings={{ ...mockSettings, enableNavigation: false }}
        colors={mockColors}
        isMobile={false}
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    const record = createMockRecordBPFData(
      'record-001',
      'Test Record',
      'opportunity',
      'Opportunity',
      null,
      true
    );

    renderWithProviders(
      <BPFRow record={record} settings={mockSettings} colors={mockColors} isMobile={false} />
    );

    expect(screen.getByText('Test Record')).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render error state', () => {
    const record = createMockRecordBPFData(
      'record-001',
      'Test Record',
      'opportunity',
      'Opportunity',
      null,
      false,
      'Failed to load BPF data'
    );

    renderWithProviders(
      <BPFRow record={record} settings={mockSettings} colors={mockColors} isMobile={false} />
    );

    expect(screen.getByText(/failed to load bpf data/i)).toBeInTheDocument();
  });

  it('should render "no BPF" message when bpfInstance is null and not loading', () => {
    const record = createMockRecordBPFData(
      'record-001',
      'Test Record',
      'opportunity',
      'Opportunity',
      null,
      false,
      null
    );

    renderWithProviders(
      <BPFRow record={record} settings={mockSettings} colors={mockColors} isMobile={false} />
    );

    expect(screen.getByText(/no active business process flow/i)).toBeInTheDocument();
  });

  it('should apply different name sizes correctly', () => {
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

    const record = createMockRecordBPFData(
      'record-001',
      'Large Name Test',
      'opportunity',
      'Opportunity',
      mockBPFInstance
    );

    const { rerender } = renderWithProviders(
      <BPFRow
        record={record}
        settings={{ ...mockSettings, recordNameSize: 'large' }}
        colors={mockColors}
        isMobile={false}
      />
    );

    expect(screen.getByText('Large Name Test')).toBeInTheDocument();

    // Rerender with different size
    rerender(
      <BPFRow
        record={record}
        settings={{ ...mockSettings, recordNameSize: 'small' }}
        colors={mockColors}
        isMobile={false}
      />
    );

    expect(screen.getByText('Large Name Test')).toBeInTheDocument();
  });
});
