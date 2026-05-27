import { describe, it, expect } from 'vitest';
import noteReducer, {
  setNotes, addNote, updateNoteState, removeNote,
  setTrashedNotes, restoreNoteState, deletePermanentState,
  setNoteLoading, setNoteError,
} from '../../features/noteSlice';

const initialState = {
  notes: [],
  trashedNotes: [],
  loading: false,
  error: null,
};

const mockNote = { _id: '1', title: 'Test Note', content: 'Hello', tags: [] };
const mockNote2 = { _id: '2', title: 'Another Note', content: 'World', tags: [] };

describe('noteSlice', () => {
  it('should return correct initial state', () => {
    expect(noteReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('setNotes should replace notes array', () => {
    const state = noteReducer(initialState, setNotes([mockNote, mockNote2]));
    expect(state.notes).toHaveLength(2);
    expect(state.notes[0].title).toBe('Test Note');
  });

  it('addNote should prepend a note to the array', () => {
    const withNotes = { ...initialState, notes: [mockNote2] };
    const state = noteReducer(withNotes, addNote(mockNote));
    expect(state.notes[0]._id).toBe('1'); // prepended
    expect(state.notes).toHaveLength(2);
  });

  it('updateNoteState should update an existing note by _id', () => {
    const withNote = { ...initialState, notes: [mockNote] };
    const updated = { ...mockNote, title: 'Updated Title' };
    const state = noteReducer(withNote, updateNoteState(updated));
    expect(state.notes[0].title).toBe('Updated Title');
  });

  it('removeNote should remove note by _id', () => {
    const withNotes = { ...initialState, notes: [mockNote, mockNote2] };
    const state = noteReducer(withNotes, removeNote('1'));
    expect(state.notes).toHaveLength(1);
    expect(state.notes[0]._id).toBe('2');
  });

  it('setTrashedNotes should set trashedNotes array', () => {
    const state = noteReducer(initialState, setTrashedNotes([mockNote]));
    expect(state.trashedNotes).toHaveLength(1);
  });

  it('restoreNoteState should move note from trash to active', () => {
    const withTrash = { ...initialState, trashedNotes: [mockNote] };
    const state = noteReducer(withTrash, restoreNoteState(mockNote));
    expect(state.trashedNotes).toHaveLength(0);
    expect(state.notes[0]._id).toBe('1');
  });

  it('deletePermanentState should remove note from trashedNotes', () => {
    const withTrash = { ...initialState, trashedNotes: [mockNote, mockNote2] };
    const state = noteReducer(withTrash, deletePermanentState('1'));
    expect(state.trashedNotes).toHaveLength(1);
    expect(state.trashedNotes[0]._id).toBe('2');
  });

  it('setNoteLoading should toggle loading', () => {
    const state = noteReducer(initialState, setNoteLoading(true));
    expect(state.loading).toBe(true);
  });

  it('setNoteError should set error message', () => {
    const state = noteReducer(initialState, setNoteError('fetch failed'));
    expect(state.error).toBe('fetch failed');
  });
});