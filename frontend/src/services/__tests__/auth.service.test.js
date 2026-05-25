import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the axios instance BEFORE importing services
vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import API from '../../api/axios';
import {
  loginService,
  signupService,
  logoutService,
  resendVerificationService,
  forgotPasswordService,
} from '../../services/auth.service';

beforeEach(() => vi.clearAllMocks());

describe('auth.service', () => {
  describe('loginService', () => {
    it('should POST to /v1/auth/login with credentials', async () => {
      API.post.mockResolvedValue({ data: { accessToken: 'token', data: { user: {} } } });

      await loginService({ email: 'test@test.com', password: 'Pass123' });

      expect(API.post).toHaveBeenCalledWith('/v1/auth/signin', {
        email: 'test@test.com',
        password: 'Pass123',
      });
    });

    it('should return the response data', async () => {
      const mockResponse = { data: { accessToken: 'abc', data: { user: { name: 'Talha' } } } };
      API.post.mockResolvedValue(mockResponse);

      const result = await loginService({ email: 'test@test.com', password: 'Pass123' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('signupService', () => {
    it('should POST to /v1/auth/signup with user data', async () => {
      API.post.mockResolvedValue({ data: { success: true } });

      await signupService({ name: 'Talha', email: 'test@test.com', password: 'Pass123' });

      expect(API.post).toHaveBeenCalledWith('/v1/auth/signup', {
        name: 'Talha',
        email: 'test@test.com',
        password: 'Pass123',
      });
    });
  });

  describe('logoutService', () => {
    it('should POST to /v1/auth/logout', async () => {
      API.post.mockResolvedValue({ data: { success: true } });

      await logoutService();

      expect(API.post).toHaveBeenCalledWith('/v1/auth/logout');
    });
  });

  describe('resendVerificationService', () => {
    it('should POST to resend-verification with email', async () => {
      API.post.mockResolvedValue({ data: { success: true } });

      await resendVerificationService('test@test.com');

      expect(API.post).toHaveBeenCalledWith(
        '/v1/auth/resend-verification',
        { email: 'test@test.com' }
      );
    });
  });

  describe('forgotPasswordService', () => {
    it('should POST to forgot-password with email', async () => {
      API.post.mockResolvedValue({ data: { success: true } });

      await forgotPasswordService('test@test.com');

      expect(API.post).toHaveBeenCalledWith(
        '/v1/auth/forgot-password',
        { email: 'test@test.com' }
      );
    });
  });
});