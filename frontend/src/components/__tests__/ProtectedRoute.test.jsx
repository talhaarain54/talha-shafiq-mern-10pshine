import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { Provider } from 'react-redux';
import { createTestStore } from '../../test/renderWithProviders';
import ProtectedRoute from '../ProtectedRoute';

const authState = { isAuthenticated: true, user: { name: 'Talha' }, accessToken: 'tok', loading: false, error: null };
const guestState = { isAuthenticated: false, user: null, accessToken: null, loading: false, error: null };

const renderProtectedRoute = (authPreloadedState, route = '/dashboard') => {
  const store = createTestStore({ auth: authPreloadedState });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('ProtectedRoute', () => {
  it('renders the protected page when authenticated', () => {
    renderProtectedRoute(authState);
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    renderProtectedRoute(guestState);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('shows loading indicator while auth state is loading', () => {
    renderProtectedRoute({ ...guestState, loading: true });
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
});