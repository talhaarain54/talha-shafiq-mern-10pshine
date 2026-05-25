import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/renderWithProviders';
import VerifyEmail from '../VerifyEmail';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}));

vi.mock('../../services/auth.service', () => ({
  verifyEmailService: vi.fn(),
  resendVerificationService: vi.fn(),
}));

import { verifyEmailService, resendVerificationService } from '../../services/auth.service';

beforeEach(() => vi.clearAllMocks());

describe('VerifyEmail page', () => {
  it('shows loading state immediately on mount', () => {
    verifyEmailService.mockImplementation(() => new Promise(() => {})); // never resolves

    renderWithProviders(<VerifyEmail />, { route: '/verify-email?token=abc123' });
    expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();
  });

  it('shows success state after valid token verification', async () => {
    verifyEmailService.mockResolvedValue({ message: 'Email verified successfully!' });

    renderWithProviders(<VerifyEmail />, { route: '/verify-email?token=validtoken' });

    expect(await screen.findByText('Email Verified!')).toBeInTheDocument();
    expect(screen.getByText('Email verified successfully!')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to login/i })).toBeInTheDocument();
  });

  it('shows error state for invalid or expired token', async () => {
    verifyEmailService.mockRejectedValue({
      response: { data: { message: 'Link is invalid or has expired.' } },
    });

    renderWithProviders(<VerifyEmail />, { route: '/verify-email?token=badtoken' });

    expect(await screen.findByText('Verification Failed')).toBeInTheDocument();
    expect(screen.getByText('Link is invalid or has expired.')).toBeInTheDocument();
  });

  it('shows error state when no token is in the URL', async () => {
    renderWithProviders(<VerifyEmail />, { route: '/verify-email' });

    expect(await screen.findByText('Verification Failed')).toBeInTheDocument();
    expect(screen.getByText(/no token found/i)).toBeInTheDocument();
  });

  it('shows resend form on error and calls resendVerificationService', async () => {
    verifyEmailService.mockRejectedValue({
      response: { data: { message: 'Expired.' } },
    });
    resendVerificationService.mockResolvedValue({ success: true });

    renderWithProviders(<VerifyEmail />, { route: '/verify-email?token=expired' });

    await screen.findByText('Verification Failed');

    const emailInput = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(emailInput, { target: { value: 'talha@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /resend verification email/i }));

    await waitFor(() =>
      expect(resendVerificationService).toHaveBeenCalledWith('talha@test.com')
    );
  });

  it('calls verifyEmailService with the token from URL', async () => {
    verifyEmailService.mockResolvedValue({ message: 'Verified!' });

    renderWithProviders(<VerifyEmail />, { route: '/verify-email?token=mytoken123' });

    await waitFor(() =>
      expect(verifyEmailService).toHaveBeenCalledWith('mytoken123')
    );
  });
});