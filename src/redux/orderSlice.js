import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const baseURL = import.meta.env.VITE_API_BASE_URL;;

// Helper to handle fetch responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

// Fetch admin orders with optional filters
export const fetchAdminOrders = createAsyncThunk(
  'order/fetchAdminOrders',
  async ({ page = 1, limit = 10, status, startDate, endDate, search } = {}, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (search) params.append('search', search);
      const response = await fetch(`${baseURL}/order/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Fetch a single admin order by ID
export const fetchAdminOrderById = createAsyncThunk(
  'order/fetchAdminOrderById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      const response = await fetch(`${baseURL}/order/admin/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ id, status }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      const response = await fetch(`${baseURL}/order/admin/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Update payment status
export const updateOrderPaymentStatus = createAsyncThunk(
  'order/updateOrderPaymentStatus',
  async ({ id, paymentStatus }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      const response = await fetch(`${baseURL}/order/admin/${id}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentStatus }),
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Update tracking number
export const updateOrderTracking = createAsyncThunk(
  'order/updateOrderTracking',
  async ({ id, trackingNumber }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      const response = await fetch(`${baseURL}/order/admin/${id}/tracking`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trackingNumber }),
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Fetch color sales analytics
export const fetchColorSalesAnalytics = createAsyncThunk(
  'order/fetchColorSalesAnalytics',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      const response = await fetch(`${baseURL}/order/admin/analytics/color-sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Fetch top colors
export const fetchTopColors = createAsyncThunk(
  'order/fetchTopColors',
  async ({ limit = 5, startDate, endDate } = {}, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      const params = new URLSearchParams({ limit });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const response = await fetch(`${baseURL}/order/admin/analytics/top-colors?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Fetch orders by product with filters
export const fetchOrdersByProduct = createAsyncThunk(
  'order/fetchOrdersByProduct',
  async ({ productId, colorName, size, page = 1, limit = 20 } = {}, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      const params = new URLSearchParams({ colorName, size, page, limit });
      const response = await fetch(`${baseURL}/order/admin/by-product/${productId}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    pagination: {},
    currentOrder: null,
    colorSalesAnalytics: [],
    topColors: [],
    productOrders: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearSuccess: (state) => {
      state.success = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch admin orders
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data.orders;
        state.pagination = {
          total: action.payload.data.total,
          totalPages: action.payload.data.totalPages,
          currentPage: action.payload.data.currentPage,
          limit: action.payload.data.limit,
        };
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch single order
      .addCase(fetchAdminOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data;
      })
      .addCase(fetchAdminOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Update status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentOrder = action.payload.data;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Update paymentStatus
      .addCase(updateOrderPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateOrderPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentOrder = action.payload.data;
      })
      .addCase(updateOrderPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Update tracking
      .addCase(updateOrderTracking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateOrderTracking.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentOrder = action.payload.data;
      })
      .addCase(updateOrderTracking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch color sales analytics
      .addCase(fetchColorSalesAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchColorSalesAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.colorSalesAnalytics = action.payload.data;
      })
      .addCase(fetchColorSalesAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch top colors
      .addCase(fetchTopColors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopColors.fulfilled, (state, action) => {
        state.loading = false;
        state.topColors = action.payload.data;
      })
      .addCase(fetchTopColors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch orders by product
      .addCase(fetchOrdersByProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.productOrders = action.payload.data.orders || action.payload.data;
        state.pagination = action.payload.data.pagination || {};
      })
      .addCase(fetchOrdersByProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearSuccess, clearError, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
