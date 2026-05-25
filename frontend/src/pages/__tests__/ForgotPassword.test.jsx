import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/renderWithProviders';
import ForgotPassword from '../ForgotPassword';

vi.mock('../../services/auth.service', () => ({
  forgotPasswordService: vi.fn(),
}));

import { forgotPasswordService } from '../../services/auth.service';

beforeEach(() => vi.clearAllMocks());

describe('ForgotPassword page', () => {
  it('renders the email input and submit button', () => {
    renderWithProviders(<ForgotPassword />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('renders a back to login link', () => {
    renderWithProviders(<ForgotPassword />);
    expect(screen.getByRole('link', { name: /back to login/i })).toBeInTheDocument();
  });

  it('shows validation error when email is empty on submit', async () => {
    renderWithProviders(<ForgotPassword />);
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
  });

  it('calls forgotPasswordService with the entered email', async () => {
    forgotPasswordService.mockResolvedValue({ success: true });

    renderWithProviders(<ForgotPassword />);
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'talha@test.com');
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() =>
      expect(forgotPasswordService).toHaveBeenCalledWith('talha@test.com')
    );
  });

  it('shows success screen with email after form submit', async () => {
    forgotPasswordService.mockResolvedValue({ success: true });

    renderWithProviders(<ForgotPassword />);
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'talha@test.com');
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByText('Check your email')).toBeInTheDocument();
    expect(screen.getByText(/talha@test\.com/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to login/i })).toBeInTheDocument();
  });

  it('disables submit button while loading', async () => {
    forgotPasswordService.mockImplementation(() => new Promise(() => {})); // never resolves

    renderWithProviders(<ForgotPassword />);
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'talha@test.com');
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled()
    );
  });
});