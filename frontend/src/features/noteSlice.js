import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notes: [],         
  trashedNotes: [],  
  loading: false,
  error: null,
};

const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    setNotes: (state, action) => {
      state.notes = action.payload;
    },
    setTrashedNotes: (state, action) => {
      state.trashedNotes = action.payload;
    },
    addNote: (state, action) => {
      state.notes.unshift(action.payload); 
    },
    updateNoteState: (state, action) => {
      const index = state.notes.findIndex((n) => n._id === action.payload._id);
      if (index !== -1) {
        state.notes[index] = action.payload;
      }
    },
    removeNote: (state, action) => {
      state.notes = state.notes.filter((n) => n._id !== action.payload);
    },
    restoreNoteState: (state, action) => {
      state.trashedNotes = state.trashedNotes.filter((n) => n._id !== action.payload._id);
      state.notes.unshift(action.payload);
    },
    deletePermanentState: (state, action) => {
      state.trashedNotes = state.trashedNotes.filter((n) => n._id !== action.payload);
    },
    setNoteLoading: (state, action) => {
      state.loading = action.payload;
    },
    setNoteError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setNotes,
  setTrashedNotes,
  addNote,
  updateNoteState,
  removeNote,
  restoreNoteState,
  deletePermanentState,
  setNoteLoading,
  setNoteError,
} = noteSlice.actions;

export default noteSlice.reducer;