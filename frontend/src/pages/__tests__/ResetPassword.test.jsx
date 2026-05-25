import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/renderWithProviders';
import ResetPassword from '../ResetPassword';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}));

vi.mock('../../services/auth.service', () => ({
  resetPasswordService: vi.fn(),
}));

import { resetPasswordService } from '../../services/auth.service';

beforeEach(() => vi.clearAllMocks());

describe('ResetPassword page', () => {
  it('shows invalid token message when no token in URL', () => {
    renderWithProviders(<ResetPassword />, { route: '/reset-password' });
    expect(screen.getByText(/invalid or missing reset token/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /request a new reset link/i })).toBeInTheDocument();
  });

  it('renders new password and confirm password inputs when token is present', () => {
    renderWithProviders(<ResetPassword />, { route: '/reset-password?token=validtoken123' });
    expect(screen.getByText('Reset your password')).toBeInTheDocument();
    const inputs = screen.getAllByPlaceholderText('••••••••');
    expect(inputs).toHaveLength(2);
  });

  it('shows error when passwords do not match', async () => {
    renderWithProviders(<ResetPassword />, { route: '/reset-password?token=validtoken123' });
    const [newPass, confirmPass] = screen.getAllByPlaceholderText('••••••••');

    await userEvent.type(newPass, 'Pass@1234');
    await userEvent.type(confirmPass, 'Different@1234');
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });

  it('calls resetPasswordService with token and new password on submit', async () => {
    resetPasswordService.mockResolvedValue({ success: true });

    renderWithProviders(<ResetPassword />, { route: '/reset-password?token=validtoken123' });
    const [newPass, confirmPass] = screen.getAllByPlaceholderText('••••••••');

    await userEvent.type(newPass, 'NewPass@1234');
    await userEvent.type(confirmPass, 'NewPass@1234');
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() =>
      expect(resetPasswordService).toHaveBeenCalledWith('validtoken123', 'NewPass@1234')
    );
  });

  it('shows success screen after password reset', async () => {
    resetPasswordService.mockResolvedValue({ success: true });

    renderWithProviders(<ResetPassword />, { route: '/reset-password?token=validtoken123' });
    const [newPass, confirmPass] = screen.getAllByPlaceholderText('••••••••');

    await userEvent.type(newPass, 'NewPass@1234');
    await userEvent.type(confirmPass, 'NewPass@1234');
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText('Password Reset!')).toBeInTheDocument();
    expect(screen.getByText(/redirecting to login/i)).toBeInTheDocument();
  });

  it('shows validation error for weak password', async () => {
    renderWithProviders(<ResetPassword />, { route: '/reset-password?token=tok123' });
    const [newPass] = screen.getAllByPlaceholderText('••••••••');

    await userEvent.type(newPass, 'weakpass');
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText(/must include upper, lower, number, special char/i)).toBeInTheDocument();
  });
});