import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const baseURL = import.meta.env.VITE_API_BASE_URL;

// Helper to handle fetch responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

// Create Banner
export const createBanner = createAsyncThunk(
  'banner/createBanner',
  async (bannerData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      
      const response = await fetch(`${baseURL}/banner`, {
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
export const getBanners = createAsyncThunk(
  'banner/getBanners',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      
      const response = await fetch(`${baseURL}/banner`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Update Banner
export const updateBanner = createAsyncThunk(
  'banner/updateBanner',
  async ({ id, bannerData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      
      const response = await fetch(`${baseURL}/banner`, {
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
export const deleteBanner = createAsyncThunk(
  'banner/deleteBanner',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      
      const response = await fetch(`${baseURL}/banner/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const bannerSlice = createSlice({
  name: 'banner',
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
      .addCase(createBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createdBanner = action.payload.data;
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get Banners
      .addCase(getBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload.data;
      })
      .addCase(getBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Update Banner
      .addCase(updateBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.updatedBanner = action.payload.data;
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Delete Banner
      .addCase(deleteBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.deletedBannerId = action.meta.arg;
        state.banners = state.banners.filter(b => b._id !== action.meta.arg);
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearSuccess, clearError } = bannerSlice.actions;
export default bannerSlice.reducer;
