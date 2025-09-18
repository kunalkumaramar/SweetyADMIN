import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const baseURL = 'https://sweety-server.onrender.com';

// Helper function to handle fetch responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw data;
  }
  return data;
};

// Async thunk for admin signup
export const adminSignup = createAsyncThunk(
  'auth/adminSignup',
  async (signupData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseURL}/admin/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Async thunk for admin login
export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseURL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Async thunk to get admin profile
export const getAdminProfile = createAsyncThunk(
  'auth/getAdminProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseURL}/admin/profile`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(adminSignup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminSignup.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.accessToken = action.payload.data.accessToken;
        state.error = null;
      })
      .addCase(adminSignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Login
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.accessToken = action.payload.data.accessToken;
        state.error = null;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get Profile
      .addCase(getAdminProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.error = null;
      })
      .addCase(getAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
