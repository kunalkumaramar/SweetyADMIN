import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const baseURL = 'https://sweety-server.onrender.com';

// Helper to handle fetch responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

// Create category
export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (categoryData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      const response = await fetch(`${baseURL}/category/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Update category by id
export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ id, updateData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      const response = await fetch(`${baseURL}/category/${id}`, {
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

// Delete category by id
export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      const response = await fetch(`${baseURL}/category/${id}`, {
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

// Get all categories (without pagination)
export const getCategories = createAsyncThunk(
  'category/getCategories',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      const response = await fetch(`${baseURL}/category`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Get categories with pagination
export const getCategoriesWithPagination = createAsyncThunk(
  'category/getCategoriesWithPagination',
  async ({ page = 1, limit = 10 }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`${baseURL}/category?${params}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Get category by id
export const getCategoryById = createAsyncThunk(
  'category/getCategoryById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      const response = await fetch(`${baseURL}/category/${id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    categories: [],
    selectedCategory: null, // for single category by ID
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    },
    loading: false,
    error: null,
    success: false,
    createdCategory: null,
    updatedCategory: null,
    deletedCategoryId: null,
  },
  reducers: {
    clearSuccess: (state) => {
      state.success = false;
      state.createdCategory = null;
      state.updatedCategory = null;
      state.deletedCategoryId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createdCategory = action.payload.data;
        state.categories.push(action.payload.data);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.updatedCategory = action.payload.data;
        const idx = state.categories.findIndex(cat => cat._id === action.payload.data._id);
        if (idx !== -1) {
          state.categories[idx] = action.payload.data;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.deletedCategoryId = action.meta.arg;
        state.categories = state.categories.filter(cat => cat._id !== action.meta.arg)
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get categories (without pagination)
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get categories with pagination
      .addCase(getCategoriesWithPagination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategoriesWithPagination.fulfilled, (state, action) => {
        state.loading = false;
        // Assuming API returns paginated response structure
        if (action.payload.data.categories) {
          state.categories = action.payload.data.categories;
          state.pagination = {
            page: action.payload.data.page || 1,
            limit: action.payload.data.limit || 10,
            total: action.payload.data.total || 0,
            pages: action.payload.data.pages || 0
          };
        } else {
          // If API returns simple array
          state.categories = action.payload.data;
        }
      })
      .addCase(getCategoriesWithPagination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get category by ID
      .addCase(getCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload.data;
      })
      .addCase(getCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearSuccess, clearError, clearSelectedCategory } = categorySlice.actions;
export default categorySlice.reducer;
