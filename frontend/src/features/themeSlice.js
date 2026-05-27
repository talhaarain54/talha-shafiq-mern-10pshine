import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
  const saved = localStorage.getItem("notebase-theme");
  if (saved === "dark" || saved === "light") return saved;
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: getInitialTheme() },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("notebase-theme", state.mode);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem("notebase-theme", action.payload);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;