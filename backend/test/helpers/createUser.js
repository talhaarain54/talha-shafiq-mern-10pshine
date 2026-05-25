import User from '../../src/models/User.model.js';
import { generateAccessToken } from '../../src/utils/tokens.js';

export const createTestUser = async (overrides = {}) => {
  const user = await User.create({
    name: overrides.name || 'Test User',
    email: overrides.email || 'test@example.com',
    password: overrides.password || 'Password123',
    isVerified: overrides.isVerified !== undefined ? overrides.isVerified : true,
  });
  const token = generateAccessToken(user._id);
  return { user, token };
};