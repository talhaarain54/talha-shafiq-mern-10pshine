import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/renderWithProviders';
import Signup from '../Signup';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
}));

vi.mock('../../services/auth.service', () => ({
  signupService: vi.fn(),
  resendVerificationService: vi.fn(),
}));

import { signupService, resendVerificationService } from '../../services/auth.service';

beforeEach(() => vi.clearAllMocks());

describe('Signup page', () => {
  it('renders name, email, and password fields', () => {
    renderWithProviders(<Signup />);
    expect(screen.getByPlaceholderText('Talha Arain')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('renders Sign Up button and link to login', () => {
    renderWithProviders(<Signup />);
    expect(screen.getByRole('button', { name: /^sign up$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
  });

  it('shows validation error when name is missing', async () => {
    renderWithProviders(<Signup />);
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
    expect(await screen.findByText('Name is required')).toBeInTheDocument();
  });

  it('shows validation error when password is too short', async () => {
    renderWithProviders(<Signup />);
    await userEvent.type(screen.getByPlaceholderText('Talha Arain'), 'Talha');
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'talha@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'short');
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
    expect(await screen.findByText('Min 8 characters')).toBeInTheDocument();
  });

  it('calls signupService with form data on submit', async () => {
    signupService.mockResolvedValue({ success: true });

    renderWithProviders(<Signup />);
    await userEvent.type(screen.getByPlaceholderText('Talha Arain'), 'Talha');
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'talha@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Pass@1234');
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    await waitFor(() =>
      expect(signupService).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Talha', email: 'talha@test.com', password: 'Pass@1234' })
      )
    );
  });

  it('shows email verification screen after successful signup', async () => {
    signupService.mockResolvedValue({ success: true });

    renderWithProviders(<Signup />);
    await userEvent.type(screen.getByPlaceholderText('Talha Arain'), 'Talha');
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'talha@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Pass@1234');
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    expect(await screen.findByText('Check your email')).toBeInTheDocument();
    expect(screen.getByText('talha@test.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument();
  });

  it('calls resendVerificationService when Resend button is clicked', async () => {
    signupService.mockResolvedValue({ success: true });
    resendVerificationService.mockResolvedValue({ success: true });

    renderWithProviders(<Signup />);
    await userEvent.type(screen.getByPlaceholderText('Talha Arain'), 'Talha');
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'talha@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Pass@1234');
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    await screen.findByText('Check your email');
    fireEvent.click(screen.getByRole('button', { name: /resend verification email/i }));

    await waitFor(() =>
      expect(resendVerificationService).toHaveBeenCalledWith('talha@test.com')
    );
  });

  it('toggles password visibility', async () => {
    renderWithProviders(<Signup />);
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = passwordInput.parentElement.querySelector('button[type="button"]');
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});