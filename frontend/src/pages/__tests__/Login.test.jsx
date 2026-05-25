import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/renderWithProviders';
import Login from '../Login';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}));

vi.mock('../../services/auth.service', () => ({
  loginService: vi.fn(),
}));

import { loginService } from '../../services/auth.service';

beforeEach(() => vi.clearAllMocks());

describe('Login page', () => {
  it('renders email and password inputs', () => {
    renderWithProviders(<Login />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('renders Login button, sign up link, and forgot password link', () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
  });

  it('shows validation error when email is empty on submit', async () => {
    renderWithProviders(<Login />);
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
  });

  it('shows validation error when password is empty on submit', async () => {
    renderWithProviders(<Login />);
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  it('calls loginService with email and password on submit', async () => {
    loginService.mockResolvedValue({
      data: { user: { _id: '1', name: 'Talha', email: 'talha@test.com' } },
      accessToken: 'tok123',
    });

    renderWithProviders(<Login />);
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'talha@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Pass@1234');
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() =>
      expect(loginService).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'talha@test.com', password: 'Pass@1234' })
      )
    );
  });

  it('navigates to /dashboard on successful login', async () => {
    loginService.mockResolvedValue({
      data: { user: { _id: '1', name: 'Talha', email: 'talha@test.com' } },
      accessToken: 'tok123',
    });

    renderWithProviders(<Login />);
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'talha@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Pass@1234');
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
  });

  it('navigates to /email-not-verified when needsVerification is true', async () => {
    loginService.mockRejectedValue({
      response: { data: { needsVerification: true } },
    });

    renderWithProviders(<Login />);
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'unverified@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Pass@1234');
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        '/email-not-verified',
        expect.objectContaining({ state: { email: 'unverified@test.com' } })
      )
    );
  });

  it('toggles password visibility when eye icon is clicked', async () => {
    renderWithProviders(<Login />);
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = passwordInput.parentElement.querySelector('button[type="button"]');
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('disables submit button while loading', () => {
    renderWithProviders(<Login />, {
      preloadedState: {
        auth: { loading: true, isAuthenticated: false, user: null, accessToken: null, error: null },
      },
    });
    expect(screen.getByRole('button', { name: /authenticating/i })).toBeDisabled();
  });
});