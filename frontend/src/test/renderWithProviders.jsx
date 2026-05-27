import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import authReducer from '../features/authSlice';
import noteReducer from '../features/noteSlice';
import themeReducer from '../features/themeSlice';

export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      notes: noteReducer,
      theme: themeReducer,
    },
    preloadedState,
  });
};

export const renderWithProviders = (ui, { preloadedState = {}, route = '/' } = {}) => {
  const store = createTestStore(preloadedState);

  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        {children}
      </MemoryRouter>
    </Provider>
  );

  return { ...render(ui, { wrapper: Wrapper }), store };
};