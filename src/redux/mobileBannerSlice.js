import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const baseURL = import.meta.env.VITE_API_BASE_URL;

// Helper to handle fetch responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

// Create Banner
export const createMobileBanner = createAsyncThunk(
  'banner/createBanner',
  async (bannerData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      
      const response = await fetch(`${baseURL}/mobile-banner`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Get All Banners
export const getMobileBanners = createAsyncThunk(
  'banner/getBanners',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      
      const response = await fetch(`${baseURL}/mobile-banner`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Update Banner
export const updateMobileBanner = createAsyncThunk(
  'banner/updateBanner',
  async ({ id, bannerData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      
      const response = await fetch(`${baseURL}/mobile-banner`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: id, ...bannerData }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Delete Banner
export const deleteMobileBanner = createAsyncThunk(
  'banner/deleteBanner',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      
      const response = await fetch(`${baseURL}/mobile-banner/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const mobilebannerSlice = createSlice({
  name: 'mobilebanner',
  initialState: {
    banners: [],
    loading: false,
    error: null,
    success: false,
    createdBanner: null,
    updatedBanner: null,
    deletedBannerId: null,
  },
  reducers: {
    clearSuccess: (state) => {
      state.success = false;
      state.createdBanner = null;
      state.updatedBanner = null;
      state.deletedBannerId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Banner
      .addCase(createMobileBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createMobileBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createdBanner = action.payload.data;
      })
      .addCase(createMobileBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get Banners
      .addCase(getMobileBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMobileBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload.data;
      })
      .addCase(getMobileBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Update Banner
      .addCase(updateMobileBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateMobileBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.updatedBanner = action.payload.data;
      })
      .addCase(updateMobileBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Delete Banner
      .addCase(deleteMobileBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteMobileBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.deletedBannerId = action.meta.arg;
        state.banners = state.banners.filter(b => b._id !== action.meta.arg);
      })
      .addCase(deleteMobileBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearSuccess, clearError } = mobilebannerSlice.actions;
export default mobilebannerSlice.reducer;
