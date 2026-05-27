import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/server.js';
import Note from '../../src/models/Note.model.js';
import { connectTestDB, clearTestDB, disconnectTestDB } from '../setup.js';
import { createTestUser } from '../helpers/createUser.js';

before(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
after(async () => await disconnectTestDB());

// ─── Helper: create a note directly in DB ────────────────────────────────────
const seedNote = async (userId, overrides = {}) => {
  return Note.create({
    title: overrides.title || 'Test Note',
    content: overrides.content || '<p>Test content</p>',
    tags: overrides.tags || ['work'],
    user: userId,
    is_deleted: overrides.is_deleted || false,
    deletedAt: overrides.deletedAt || null,
  });
};

// ─── GET /notes ───────────────────────────────────────────────────────────────
describe('GET /api/v1/notes', () => {
  it('should return only the authenticated user\'s notes', async () => {
    const { user, token } = await createTestUser();
    const { user: other } = await createTestUser({ email: 'other@test.com' });

    await seedNote(user._id, { title: 'My Note' });
    await seedNote(other._id, { title: 'Other Note' });

    const res = await request(app)
      .get('/api/v1/notes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body.data).to.have.length(1);
    expect(res.body.data[0].title).to.equal('My Note');
  });

  it('should filter notes by search query', async () => {
    const { user, token } = await createTestUser();
    await seedNote(user._id, { title: 'JavaScript Tips' });
    await seedNote(user._id, { title: 'React Hooks' });

    const res = await request(app)
      .get('/api/v1/notes?search=JavaScript')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body.data).to.have.length(1);
    expect(res.body.data[0].title).to.equal('JavaScript Tips');
  });

  it('should filter notes by tag', async () => {
    const { user, token } = await createTestUser();
    await seedNote(user._id, { title: 'Work Note', tags: ['work'] });
    await seedNote(user._id, { title: 'Personal Note', tags: ['personal'] });

    const res = await request(app)
      .get('/api/v1/notes?tag=work')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body.data).to.have.length(1);
    expect(res.body.data[0].title).to.equal('Work Note');
  });

  it('should not include trashed notes', async () => {
    const { user, token } = await createTestUser();
    await seedNote(user._id, { title: 'Active Note' });
    await seedNote(user._id, { title: 'Trashed Note', is_deleted: true });

    const res = await request(app)
      .get('/api/v1/notes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body.data).to.have.length(1);
    expect(res.body.data[0].title).to.equal('Active Note');
  });

  it('should return 401 if no token provided', async () => {
    const res = await request(app).get('/api/v1/notes');
    expect(res.status).to.equal(401);
  });
});

// ─── POST /notes ──────────────────────────────────────────────────────────────
describe('POST /api/v1/notes', () => {
  it('should create a new note successfully', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Note', content: '<p>Hello</p>', tags: ['test'] });

    expect(res.status).to.equal(201);
    expect(res.body.success).to.be.true;
    expect(res.body.data.title).to.equal('New Note');
    expect(res.body.data.tags).to.include('test');
  });

  it('should fail with 400 if title is missing', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '<p>No title</p>' });

    expect(res.status).to.equal(400);
  });

  it('should fail with 401 if not authenticated', async () => {
    const res = await request(app)
      .post('/api/v1/notes')
      .send({ title: 'Test', content: 'Content' });

    expect(res.status).to.equal(401);
  });
});

// ─── PUT /notes/:id ───────────────────────────────────────────────────────────
describe('PUT /api/v1/notes/:id', () => {
  it('should update own note successfully', async () => {
    const { user, token } = await createTestUser();
    const note = await seedNote(user._id);

    const res = await request(app)
      .put(`/api/v1/notes/${note._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title' });

    expect(res.status).to.equal(200);
    expect(res.body.data.title).to.equal('Updated Title');
  });

  it('should not update another user\'s note', async () => {
    const { user } = await createTestUser({ email: 'owner@test.com' });
    const { token: attackerToken } = await createTestUser({ email: 'attacker@test.com' });
    const note = await seedNote(user._id);

    const res = await request(app)
      .put(`/api/v1/notes/${note._id}`)
      .set('Authorization', `Bearer ${attackerToken}`)
      .send({ title: 'Hacked' });

    expect(res.status).to.equal(404);
  });

  it('should return 404 for non-existent note', async () => {
    const { token } = await createTestUser();
    const fakeId = '64f1234567890abcdef12345';

    const res = await request(app)
      .put(`/api/v1/notes/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Ghost Note' });

    expect(res.status).to.equal(404);
  });
});

// ─── DELETE /notes/:id (Trash) ────────────────────────────────────────────────
describe('DELETE /api/v1/notes/:id (trash)', () => {
  it('should move note to trash', async () => {
    const { user, token } = await createTestUser();
    const note = await seedNote(user._id);

    const res = await request(app)
      .delete(`/api/v1/notes/${note._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);

    const updated = await Note.findById(note._id);
    expect(updated.is_deleted).to.be.true;
    expect(updated.deletedAt).to.exist;
  });

  it('should not trash another user\'s note', async () => {
    const { user } = await createTestUser({ email: 'owner@test.com' });
    const { token } = await createTestUser({ email: 'other@test.com' });
    const note = await seedNote(user._id);

    const res = await request(app)
      .delete(`/api/v1/notes/${note._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(404);
  });
});

// ─── GET /notes/trash ─────────────────────────────────────────────────────────
describe('GET /api/v1/notes/trash', () => {
  it('should return only trashed notes for the user', async () => {
    const { user, token } = await createTestUser();
    await seedNote(user._id, { title: 'Active' });
    await seedNote(user._id, { title: 'Trashed', is_deleted: true, deletedAt: new Date() });

    const res = await request(app)
      .get('/api/v1/notes/trash')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body.data).to.have.length(1);
    expect(res.body.data[0].title).to.equal('Trashed');
  });
});

// ─── PUT /notes/restore/:id ───────────────────────────────────────────────────
describe('PUT /api/v1/notes/restore/:id', () => {
  it('should restore a trashed note', async () => {
    const { user, token } = await createTestUser();
    const note = await seedNote(user._id, { is_deleted: true, deletedAt: new Date() });

    const res = await request(app)
      .put(`/api/v1/notes/restore/${note._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);

    const updated = await Note.findById(note._id);
    expect(updated.is_deleted).to.be.false;
    expect(updated.deletedAt).to.be.null;
  });
});

// ─── DELETE /notes/permanent/:id ──────────────────────────────────────────────
describe('DELETE /api/v1/notes/permanent/:id', () => {
  it('should permanently delete a note', async () => {
    const { user, token } = await createTestUser();
    const note = await seedNote(user._id, { is_deleted: true });

    const res = await request(app)
      .delete(`/api/v1/notes/permanent/${note._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);

    const deleted = await Note.findById(note._id);
    expect(deleted).to.be.null;
  });
});
