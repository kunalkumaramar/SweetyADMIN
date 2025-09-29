import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const baseURL = import.meta.env.VITE_API_BASE_URL;;

// Helper to handle fetch responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

// Create discount
export const createDiscount = createAsyncThunk(
  'discount/createDiscount',
  async (discountData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      const response = await fetch(`${baseURL}/discount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(discountData),
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Update discount by id
export const updateDiscount = createAsyncThunk(
  'discount/updateDiscount',
  async ({ id, updateData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      const response = await fetch(`${baseURL}/discount/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Get all discounts
export const getAllDiscounts = createAsyncThunk(
  'discount/getAllDiscounts',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      const response = await fetch(`${baseURL}/discount/all`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Delete discount by id
export const deleteDiscount = createAsyncThunk(
  'discount/deleteDiscount',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      const response = await fetch(`${baseURL}/discount/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Get expired discounts
export const getExpiredDiscounts = createAsyncThunk(
  'discount/getExpiredDiscounts',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      const response = await fetch(`${baseURL}/discount/expired`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const discountSlice = createSlice({
  name: 'discount',
  initialState: {
    discounts: [],
    expiredDiscounts: [],
    loading: false,
    error: null,
    success: false,
    createdDiscount: null,
    updatedDiscount: null,
    deletedDiscountId: null,
  },
  reducers: {
    clearSuccess: (state) => {
      state.success = false;
      state.createdDiscount = null;
      state.updatedDiscount = null;
      state.deletedDiscountId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create discount
      .addCase(createDiscount.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createDiscount.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createdDiscount = action.payload.data;
        state.discounts.push(action.payload.data);
      })
      .addCase(createDiscount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Update discount
      .addCase(updateDiscount.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateDiscount.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.updatedDiscount = action.payload.data;
        const idx = state.discounts.findIndex(d => d._id === action.payload.data._id);
        if (idx !== -1) {
          state.discounts[idx] = action.payload.data;
        }
      })
      .addCase(updateDiscount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get all discounts
      .addCase(getAllDiscounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllDiscounts.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = action.payload.data.discounts || [];
      })
      .addCase(getAllDiscounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Delete discount
      .addCase(deleteDiscount.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.deletedDiscountId = action.meta.arg;
        state.discounts = state.discounts.filter(d => d._id !== action.meta.arg);
      })
      .addCase(deleteDiscount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get expired discounts
      .addCase(getExpiredDiscounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpiredDiscounts.fulfilled, (state, action) => {
        state.loading = false;
        state.expiredDiscounts = action.payload.data;
      })
      .addCase(getExpiredDiscounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearSuccess, clearError } = discountSlice.actions;
export default discountSlice.reducer;
