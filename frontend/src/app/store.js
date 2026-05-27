import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/authSlice';
import notesReducer from "../features/noteSlice";
import themeReducer from "../features/themeSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer, 
        notes: notesReducer,
        theme: themeReducer,    
    }
})