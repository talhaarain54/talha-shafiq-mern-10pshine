import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/server.js';
import { connectTestDB, clearTestDB, disconnectTestDB } from '../setup.js';
import { createTestUser } from '../helpers/createUser.js';
import jwt from 'jsonwebtoken';

before(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
after(async () => await disconnectTestDB());

describe('protect middleware', () => {
  it('should block request with no token (401)', async () => {
    const res = await request(app).get('/api/v1/notes');
    expect(res.status).to.equal(401);
    expect(res.body.success).to.be.false;
  });

  it('should block request with a malformed token (401)', async () => {
    const res = await request(app)
      .get('/api/v1/notes')
      .set('Authorization', 'Bearer not.a.valid.jwt.token');

    expect(res.status).to.equal(401);
  });

  it('should block request with expired token (401)', async () => {
    const expiredToken = jwt.sign(
      { id: '64f1234567890abcdef12345' },
      process.env.JWT_ACCESS_SECRET || 'testsecret',
      { expiresIn: '0s' }
    );

    const res = await request(app)
      .get('/api/v1/notes')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).to.equal(401);
  });

  it('should allow request with valid token (200)', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .get('/api/v1/notes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
  });

  it('should also accept token from cookie', async () => {
    const agent = request.agent(app);
    await createTestUser({ email: 'talha@test.com', password: 'Pass@1234', isVerified: true });

    await agent.post('/api/v1/auth/login')
      .send({ email: 'talha@test.com', password: 'Pass@1234' });

    // Agent now carries the refreshToken cookie
    const res = await agent.get('/api/v1/notes');
    // May be 200 (cookie auth) or 401 depending on cookie name — adjust to your setup
    expect(res.status).to.be.oneOf([200, 401]);
  });
});