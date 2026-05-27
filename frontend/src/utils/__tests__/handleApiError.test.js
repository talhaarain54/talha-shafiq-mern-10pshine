import { describe, it, expect, vi, beforeEach } from 'vitest';
import toast from 'react-hot-toast';
import { handleApiError } from '../handleApiError';

// toast is already mocked in setup.js via vi.mock('react-hot-toast')
beforeEach(() => vi.clearAllMocks());

const makeError = (status, data = {}) => ({
  response: { status, data },
  config: {},
});

describe('handleApiError utility', () => {
  it('shows network error toast when there is no response', () => {
    const error = { config: {} }; // no .response
    handleApiError(error);
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringMatching(/network error/i)
    );
  });

  it('shows each Zod validation error as a separate toast', () => {
    const error = makeError(400, {
      errors: [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password is too weak' },
      ],
    });
    handleApiError(error);
    expect(toast.error).toHaveBeenCalledTimes(2);
    expect(toast.error).toHaveBeenCalledWith('Email is required');
    expect(toast.error).toHaveBeenCalledWith('Password is too weak');
  });

  it('shows session expired message for 401', () => {
    handleApiError(makeError(401, { message: 'Session expired. Please log in again.' }));
    expect(toast.error).toHaveBeenCalledWith('Session expired. Please log in again.');
  });

  it('shows permission denied message for 403', () => {
    handleApiError(makeError(403, {}));
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringMatching(/permission/i)
    );
  });

  it('shows not found message for 404', () => {
    handleApiError(makeError(404, {}));
    expect(toast.error).toHaveBeenCalledWith('Requested resource not found.');
  });

  it('shows rate limit message for 429', () => {
    handleApiError(makeError(429, {}));
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringMatching(/too many requests/i)
    );
  });

  it('shows server error toast for 500', () => {
    handleApiError(makeError(500, {}));
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringMatching(/internal server error/i)
    );
  });

  it('shows the response message for other 4xx errors', () => {
    handleApiError(makeError(409, { message: 'Email already taken' }));
    expect(toast.error).toHaveBeenCalledWith('Email already taken');
  });

  it('returns the error message string', () => {
    const result = handleApiError(makeError(409, { message: 'Conflict' }));
    expect(result).toBe('Conflict');
  });

  it('returns the first Zod error message string', () => {
    const result = handleApiError(makeError(400, {
      errors: [{ message: 'First error' }, { message: 'Second error' }],
    }));
    expect(result).toBe('First error');
  });
});