import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { Provider } from 'react-redux';
import { createTestStore } from '../../test/renderWithProviders';
import PublicRoute from '../PublicRoute';

const authState = { isAuthenticated: true, user: { name: 'Talha' }, accessToken: 'tok', loading: false, error: null };
const guestState = { isAuthenticated: false, user: null, accessToken: null, loading: false, error: null };

const renderPublicRoute = (authPreloadedState, route = '/login') => {
  const store = createTestStore({ auth: authPreloadedState });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<div>Login Page</div>} />
          </Route>
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('PublicRoute', () => {
  it('renders the public page when not authenticated', () => {
    renderPublicRoute(guestState);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to /dashboard when already authenticated', () => {
    renderPublicRoute(authState);
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('shows loading indicator while auth state is loading', () => {
    renderPublicRoute({ ...guestState, loading: true });
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
});