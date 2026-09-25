import { createSlice } from "@reduxjs/toolkit";

import type { PayloadAction } from '@reduxjs/toolkit'; 
import type { User } from "../../types";

interface authState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState : authState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      console.log('REDUX PAYLOAD:', action.payload);
      
      if (action.payload) {
        state.user = action.payload;
        state.isAuthenticated = true;
      } else {
        state.user = null;
        state.isAuthenticated = false;
      }
      
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    }
  }
});

export const { setUser, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;