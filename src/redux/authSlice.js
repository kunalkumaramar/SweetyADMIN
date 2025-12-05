import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const baseURL = import.meta.env.VITE_API_BASE_URL;

// Helper for fetch responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

// ✅ Restore saved user and token from localStorage
const storedUser = JSON.parse(localStorage.getItem('user'));
const storedToken = localStorage.getItem('token');

// --- Thunks ---
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

export const getAdminProfile = createAsyncThunk(
  'auth/getAdminProfile',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) {
        throw { message: 'No authentication token found' };
      }
      const response = await fetch(`${baseURL}/admin/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// --- Slice ---
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser || null,  // ✅ Restore user immediately
    accessToken: storedToken || null,
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
      localStorage.removeItem('token');
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
        localStorage.setItem('token', action.payload.data.accessToken);
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
        localStorage.setItem('token', action.payload.data.accessToken);
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
        localStorage.setItem('user', JSON.stringify(action.payload.data)); // ✅ Save user
        state.error = null;
      })
      .addCase(getAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        
        // Auto logout if session expired
        if (action.payload?.message?.includes('Session expired') || 
            action.payload?.message?.includes('jwt expired')) {
          state.user = null;
          state.accessToken = null;
          localStorage.removeItem('token');
          localStorage.removeItem('isAuthenticated');
        }
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
