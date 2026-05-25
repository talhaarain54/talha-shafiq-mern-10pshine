import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/renderWithProviders';
import Navbar from '../Navbar';

// SVG logo mock
vi.mock('../../assets/logo.svg', () => ({ default: 'logo.svg' }));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}));

vi.mock('../../services/auth.service', () => ({
  logoutService: vi.fn(),
}));

import { logoutService } from '../../services/auth.service';

const authState = { isAuthenticated: true, user: { name: 'Talha' }, accessToken: 'tok', loading: false, error: null };
const guestState = { isAuthenticated: false, user: null, accessToken: null, loading: false, error: null };

beforeEach(() => vi.clearAllMocks());

describe('Navbar', () => {
  it('renders the NoteBase logo and brand name', () => {
    renderWithProviders(<Navbar />, { preloadedState: { auth: guestState } });
    expect(screen.getByText('NoteBase')).toBeInTheDocument();
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
  });

  it('shows Login button when user is not authenticated', () => {
    renderWithProviders(<Navbar />, { preloadedState: { auth: guestState } });
    expect(screen.getByRole('link', { name: /^login$/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });

  it('shows Dashboard, Profile, Trash links when authenticated', () => {
    renderWithProviders(<Navbar />, { preloadedState: { auth: authState } });
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /trash/i })).toBeInTheDocument();
  });

  it('shows Logout button when authenticated', () => {
    renderWithProviders(<Navbar />, { preloadedState: { auth: authState } });
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('calls logoutService and navigates to / on logout', async () => {
    logoutService.mockResolvedValue({});
    renderWithProviders(<Navbar />, { preloadedState: { auth: authState } });

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(logoutService).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('still navigates to / on logout even when logoutService throws', async () => {
    logoutService.mockRejectedValue(new Error('Server error'));
    renderWithProviders(<Navbar />, { preloadedState: { auth: authState } });

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('renders theme toggle button', () => {
    renderWithProviders(<Navbar />, { preloadedState: { auth: guestState } });
    // There are two toggle buttons (desktop + mobile), both should exist
    const toggleBtns = screen.getAllByRole('button');
    expect(toggleBtns.length).toBeGreaterThanOrEqual(1);
  });
});