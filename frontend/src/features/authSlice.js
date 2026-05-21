import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    login: (state, action) => {
      state.user = action.payload.user; 
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
      state.loading = false;
    },

    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  login,
  logout,
  setAccessToken,
  setUser,
  setLoading,
  setError,
} = authSlice.actions;

export default authSlice.reducer;
