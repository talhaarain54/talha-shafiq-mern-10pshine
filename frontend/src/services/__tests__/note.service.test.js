import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  getNotesService,
  createNoteService,
  updateNoteService,
  trashNoteService,
  restoreNoteService,
  deletePermanentService,
} from '../../services/note.service';

beforeEach(() => vi.clearAllMocks());

describe('note.service', () => {
  describe('getNotesService', () => {
    it('should GET /v1/notes with no params', async () => {
      API.get.mockResolvedValue({ data: { data: [] } });
      await getNotesService();
      expect(API.get).toHaveBeenCalledWith('/v1/notes?sort=updatedAt');
    });

    it('should include search param when provided', async () => {
      API.get.mockResolvedValue({ data: { data: [] } });
      await getNotesService('react');
      expect(API.get).toHaveBeenCalledWith('/v1/notes?search=react&sort=updatedAt');
    });

    it('should include tag and sort params when provided', async () => {
      API.get.mockResolvedValue({ data: { data: [] } });
      await getNotesService('', 'work', 'title');
      expect(API.get).toHaveBeenCalledWith('/v1/notes?tag=work&sort=title');
    });
  });

  describe('createNoteService', () => {
    it('should POST to /v1/notes with note data', async () => {
      const note = { title: 'New Note', content: 'Content', tags: [] };
      API.post.mockResolvedValue({ data: { data: note } });
      await createNoteService(note);
      expect(API.post).toHaveBeenCalledWith('/v1/notes', note);
    });
  });

  describe('updateNoteService', () => {
    it('should PUT to /v1/notes/:id with updated data', async () => {
      const update = { title: 'Updated' };
      API.put.mockResolvedValue({ data: { data: update } });
      await updateNoteService('abc123', update);
      expect(API.put).toHaveBeenCalledWith('/v1/notes/abc123', update);
    });
  });

  describe('trashNoteService', () => {
    it('should DELETE to /v1/notes/:id', async () => {
      API.delete.mockResolvedValue({ data: { success: true } });
      await trashNoteService('abc123');
      expect(API.delete).toHaveBeenCalledWith('/v1/notes/abc123');
    });
  });

  describe('restoreNoteService', () => {
    it('should PUT to /v1/notes/restore/:id', async () => {
      API.put.mockResolvedValue({ data: { success: true } });
      await restoreNoteService('abc123');
      expect(API.put).toHaveBeenCalledWith('/v1/notes/restore/abc123');
    });
  });

  describe('deletePermanentService', () => {
    it('should DELETE to /v1/notes/permanent/:id', async () => {
      API.delete.mockResolvedValue({ data: { success: true } });
      await deletePermanentService('abc123');
      expect(API.delete).toHaveBeenCalledWith('/v1/notes/permanent/abc123');
    });
  });


});