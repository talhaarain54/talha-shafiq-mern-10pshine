import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/renderWithProviders';
import ConfirmModal from '../ConfirmModal';

const defaultProps = {
  isOpen: true,
  title: 'Delete Note?',
  message: 'This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  confirmColor: 'red',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('ConfirmModal component', () => {
  it('should render when isOpen is true', () => {
    renderWithProviders(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText('Delete Note?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('should NOT render when isOpen is false', () => {
    renderWithProviders(<ConfirmModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Delete Note?')).not.toBeInTheDocument();
  });

  it('should display the correct confirm and cancel button text', () => {
    renderWithProviders(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    renderWithProviders(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    renderWithProviders(<ConfirmModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should render confirm button with red class when confirmColor is red', () => {
    renderWithProviders(<ConfirmModal {...defaultProps} confirmColor="red" />);
    const confirmBtn = screen.getByText('Delete');
    expect(confirmBtn.className).toMatch(/red/);
  });

  it('should render confirm button with blue class when confirmColor is blue', () => {
    renderWithProviders(<ConfirmModal {...defaultProps} confirmColor="blue" confirmText="Save" />);
    const confirmBtn = screen.getByText('Save');
    expect(confirmBtn.className).toMatch(/blue/);
  });
});