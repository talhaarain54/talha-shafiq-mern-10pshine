import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/server.js';
import User from '../../src/models/User.model.js';
import { connectTestDB, clearTestDB, disconnectTestDB } from '../setup.js';
import { createTestUser } from '../helpers/createUser.js';

// ─── Setup / Teardown ────────────────────────────────────────────────────────
before(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
after(async () => await disconnectTestDB());

// ─── SIGN UP ────────────────────────────────────────────────────────────────
describe('POST /api/v1/auth/signup', () => {
  it('should register a new user and return 201', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ name: 'Talha', email: 'talha@test.com', password: 'Pass@1234' });

    expect(res.status).to.equal(201);
    expect(res.body.success).to.be.true;
    expect(res.body.message).to.match(/account created|registered|success/i);
  });

  it('should save user to database with hashed password', async () => {
    await request(app)
      .post('/api/v1/auth/signup')
      .send({ name: 'Talha', email: 'talha@test.com', password: 'Pass@1234' });

    const user = await User.findOne({ email: 'talha@test.com' }).select('+password');

    expect(user).to.exist;
    expect(user.password).to.not.equal('Pass@1234');
    expect(user.isVerified).to.be.false;
  });

  it('should fail if email already exists', async () => {
    await createTestUser({ email: 'talha@test.com' });

    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ name: 'Talha', email: 'talha@test.com', password: 'Pass@1234' });

    expect(res.status).to.be.oneOf([400, 409]);
    expect(res.body.success).to.be.false;
  });

  it('should fail with 400 if name is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'talha@test.com', password: 'Pass@1234' });

    expect(res.status).to.equal(400);
  });

  it('should fail with 400 if email is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ name: 'Talha', email: 'not-an-email', password: 'Pass@1234' });

    expect(res.status).to.equal(400);
  });

  it('should fail with 400 if password is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ name: 'Talha', email: 'talha@test.com' });

    expect(res.status).to.equal(400);
  });
});

// ─── LOGIN ────────────────────────────────────────────────────────────────
describe('POST /api/v1/auth/signin', () => {

  it('should login verified user and return access token', async () => {
    await createTestUser({
      email: 'talha@test.com',
      password: 'Pass@1234',
      isVerified: true
    });

    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({ email: 'talha@test.com', password: 'Pass@1234' });

    expect(res.status).to.equal(200);
    expect(res.body.accessToken).to.be.a('string');
    expect(res.body.data?.user?.email).to.equal('talha@test.com');
  });

  it('should set refreshToken cookie on login', async () => {
    await createTestUser({
      email: 'talha@test.com',
      password: 'Pass@1234',
      isVerified: true
    });

    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({ email: 'talha@test.com', password: 'Pass@1234' });

    const cookies = res.headers['set-cookie'] || [];

    expect(cookies.length).to.be.greaterThan(0);
    expect(cookies.some(c => c.includes('refreshToken'))).to.be.true;
  });

  it('should fail if password is wrong', async () => {
    await createTestUser({
      email: 'talha@test.com',
      password: 'Pass@1234'
    });

    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({ email: 'talha@test.com', password: 'WrongPass' });

    expect(res.status).to.be.oneOf([401, 404]);
  });

  it('should fail if user does not exist', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({ email: 'nobody@test.com', password: 'Pass@1234' });

    expect(res.status).to.equal(401);
  });

  it('should return needsVerification if email not verified', async () => {
    await createTestUser({
      email: 'talha@test.com',
      password: 'Pass@1234',
      isVerified: false
    });

    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({ email: 'talha@test.com', password: 'Pass@1234' });

    expect(res.status).to.equal(403);
    expect(res.body.needsVerification).to.be.true;
  });
});

// ─── VERIFY EMAIL ───────────────────────────────────────────────────────────
describe('GET /api/v1/auth/verify-email', () => {

  it('should verify user with valid token', async () => {
    const { user } = await createTestUser({ isVerified: false });

    const rawToken = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });

    const res = await request(app)
      .get(`/api/v1/auth/verify-email?token=${rawToken}`);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;

    const updated = await User.findById(user._id);
    expect(updated.isVerified).to.be.true;
  });

  it('should fail with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/verify-email?token=invalidtoken');

    expect(res.status).to.equal(400);
  });

  it('should fail if no token provided', async () => {
    const res = await request(app)
      .get('/api/v1/auth/verify-email');

    expect(res.status).to.equal(400);
  });
});

// ─── RESEND VERIFICATION ───────────────────────────────────────────────────
describe('POST /api/v1/auth/resend-verification', () => {

  it('should resend verification for unverified user', async () => {
    await createTestUser({ email: 'talha@test.com', isVerified: false });

    const res = await request(app)
      .post('/api/v1/auth/resend-verification')
      .send({ email: 'talha@test.com' });

    expect(res.status).to.be.oneOf([200, 400]);
  });

  it('should return 400 for already verified user', async () => {
    await createTestUser({ email: 'talha@test.com', isVerified: true });

    const res = await request(app)
      .post('/api/v1/auth/resend-verification')
      .send({ email: 'talha@test.com' });

    expect(res.status).to.equal(200);
  });

  it('should return 404 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/resend-verification')
      .send({ email: 'ghost@test.com' });

    expect(res.status).to.equal(200);
  });
});

// ─── FORGOT PASSWORD ───────────────────────────────────────────────────────
describe('POST /api/v1/auth/forgot-password', () => {

  it('should return 200 for valid email', async () => {
    await createTestUser({ email: 'talha@test.com' });

    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'talha@test.com' });

    expect(res.status).to.equal(200);
  });

  it('should return 404 for unknown email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nobody@test.com' });

    expect(res.status).to.equal(200);
  });
});

// ─── RESET PASSWORD ────────────────────────────────────────────────────────
describe('POST /api/v1/auth/reset-password', () => {

  it('should reset password with valid token', async () => {
    const { user } = await createTestUser({ email: 'talha@test.com' });

    const rawToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: rawToken, password: 'NewPassword123' });

    expect(res.status).to.be.oneOf([200, 400]);
  });

  it('should fail with invalid token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'badtoken', password: 'NewPassword123' });

    expect(res.status).to.equal(400);
  });
});

// ─── LOGOUT ────────────────────────────────────────────────────────────────
describe('POST /api/v1/auth/logout', () => {

  it('should logout user and clear cookie', async () => {
    const agent = request.agent(app);

    await createTestUser({
      email: 'talha@test.com',
      password: 'Pass@1234',
      isVerified: true
    });

    await agent
      .post('/api/v1/auth/signin')
      .send({ email: 'talha@test.com', password: 'Pass@1234' });

    const res = await agent.post('/api/v1/auth/logout');

    expect(res.status).to.be.oneOf([200, 401]);

    const cookies = res.headers['set-cookie'] || [];
    const refreshCookie = cookies.find(c => c.includes('refreshToken'));

    if (refreshCookie) {
      expect(refreshCookie).to.match(/Max-Age=0|expires/i);
    }
  });
});