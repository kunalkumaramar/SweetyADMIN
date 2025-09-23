import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const baseURL = 'https://sweety-server.onrender.com';

// Helper to handle fetch responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

// Create sub-category
export const createSubCategory = createAsyncThunk(
  'subCategory/createSubCategory',
  async (subCategoryData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      const response = await fetch(`${baseURL}/sub-category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subCategoryData),
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Update sub-category by id
export const updateSubCategory = createAsyncThunk(
  'subCategory/updateSubCategory',
  async ({ id, updateData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      const response = await fetch(`${baseURL}/sub-category/${id}`, {
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

// Delete sub-category by id
export const deleteSubCategory = createAsyncThunk(
  'subCategory/deleteSubCategory',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      const response = await fetch(`${baseURL}/sub-category/${id}`, {
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

// Get all sub-categories
export const getSubCategories = createAsyncThunk(
  'subCategory/getSubCategories',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      const response = await fetch(`${baseURL}/sub-category`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Get sub-categories with pagination
export const getSubCategoriesPaginated = createAsyncThunk(
  'subCategory/getSubCategoriesPaginated',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`${baseURL}/sub-category/paginated?${params}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Get sub-category by id
export const getSubCategoryById = createAsyncThunk(
  'subCategory/getSubCategoryById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      const response = await fetch(`${baseURL}/sub-category/${id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Get sub-categories by category id
export const getSubCategoriesByCategory = createAsyncThunk(
  'subCategory/getSubCategoriesByCategory',
  async (categoryId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };

      const response = await fetch(`${baseURL}/sub-category/category/${categoryId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const subCategorySlice = createSlice({
  name: 'subCategory',
  initialState: {
    subCategories: [],
    selectedSubCategory: null, // for single subcategory by ID
    pagination: {
      total: 0,
      totalPages: 0,
      currentPage: 1,
    },
    loading: false,
    error: null,
    success: false,
    createdSubCategory: null,
    updatedSubCategory: null,
    deletedSubCategoryId: null,
  },
  reducers: {
    clearSuccess: (state) => {
      state.success = false;
      state.createdSubCategory = null;
      state.updatedSubCategory = null;
      state.deletedSubCategoryId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedSubCategory: (state) => {
      state.selectedSubCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createdSubCategory = action.payload.data;
        state.subCategories.push(action.payload.data);
      })
      .addCase(createSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Update
      .addCase(updateSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.updatedSubCategory = action.payload.data;
        const idx = state.subCategories.findIndex(sub => sub._id === action.payload.data._id);
        if (idx !== -1) {
          state.subCategories[idx] = action.payload.data;
        }
      })
      .addCase(updateSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Delete
      .addCase(deleteSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.deletedSubCategoryId = action.meta.arg;
        state.subCategories = state.subCategories.filter(sub => sub._id !== action.meta.arg);
      })
      .addCase(deleteSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get all
      .addCase(getSubCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subCategories = action.payload.data;
      })
      .addCase(getSubCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get paginated
      .addCase(getSubCategoriesPaginated.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubCategoriesPaginated.fulfilled, (state, action) => {
        state.loading = false;
        state.subCategories = action.payload.data.subcategories;
        state.pagination = {
          total: action.payload.data.total,
          totalPages: action.payload.data.totalPages,
          currentPage: action.payload.data.currentPage,
        };
      })
      .addCase(getSubCategoriesPaginated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get by ID
      .addCase(getSubCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSubCategory = action.payload.data;
      })
      .addCase(getSubCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get by category
      .addCase(getSubCategoriesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubCategoriesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.subCategories = action.payload.data;
      })
      .addCase(getSubCategoriesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearSuccess, clearError, clearSelectedSubCategory } = subCategorySlice.actions;
export default subCategorySlice.reducer;
