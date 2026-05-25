import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { createTestStore } from '../../test/renderWithProviders';
import Home from '../Home';

const guestAuth = { isAuthenticated: false, user: null, accessToken: null, loading: false, error: null };
const authedAuth = { isAuthenticated: true, user: { name: 'Talha' }, accessToken: 'tok', loading: false, error: null };

const renderHome = (authState = guestAuth) => {
  const store = createTestStore({ auth: authState });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </Provider>
  );
};

describe('Home page', () => {
  it('shows Get Started and Create Account links when not authenticated', () => {
    renderHome(guestAuth);
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows Go to Dashboard link when authenticated', () => {
    renderHome(authedAuth);
    expect(screen.getByRole('link', { name: /go to dashboard/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /get started/i })).not.toBeInTheDocument();
  });

  it('renders the hero headline', () => {
    renderHome();
    expect(screen.getByText(/minimum clutter/i)).toBeInTheDocument();
    expect(screen.getByText(/maximum focus/i)).toBeInTheDocument();
  });

  it('renders all three feature cards', () => {
    renderHome();
    expect(screen.getByText('Clean Slate Architecture')).toBeInTheDocument();
    expect(screen.getByText('Dynamic Grid System')).toBeInTheDocument();
    expect(screen.getByText('Engineered for Clarity')).toBeInTheDocument();
  });
});