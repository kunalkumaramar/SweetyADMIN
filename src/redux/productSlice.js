import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const baseURL = 'https://sweety-server.onrender.com';

// Helper to handle fetch responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

// Create Product
export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (formData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      const response = await fetch(`${baseURL}/product/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // FormData for file uploads
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Update Product
export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, formData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      const response = await fetch(`${baseURL}/product/update/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // FormData for file uploads
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Delete Product
export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      const response = await fetch(`${baseURL}/product/delete/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Get all Products (paginated)
export const getProducts = createAsyncThunk(
  'product/getProducts',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      const params = new URLSearchParams({ page, limit });
      const response = await fetch(`${baseURL}/product/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Get product by ID
export const getProductById = createAsyncThunk(
  'product/getProductById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      const response = await fetch(`${baseURL}/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Get sizes for specific color of a product
export const getProductColorSizes = createAsyncThunk(
  'product/getProductColorSizes',
  async ({ productId, colorName }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      const response = await fetch(
        `${baseURL}/product/${productId}/colors/${encodeURIComponent(colorName)}/sizes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Get products by category
export const getProductsByCategory = createAsyncThunk(
  'product/getProductsByCategory',
  async (categoryId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      const response = await fetch(`${baseURL}/product/category/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Get products by subcategory with pagination and active filter
export const getProductsBySubcategory = createAsyncThunk(
  'product/getProductsBySubcategory',
  async ({ subcategoryId, page = 1, limit = 5, isActive = true }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      const params = new URLSearchParams({ page, limit, isActive });
      const response = await fetch(
        `${baseURL}/product/subcategory/${subcategoryId}?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Upload a new color image (file)
export const uploadColorImage = createAsyncThunk(
  'product/uploadColorImage',
  async (formData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.accessToken || localStorage.getItem('token');
      if (!token) throw { message: 'Unauthorized' };
      const response = await fetch(`${baseURL}/product/upload-color-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData, // FormData containing image file
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    pagination: {},
    currentProduct: null,
    productColorSizes: [],
    loading: false,
    error: null,
    success: false,
    createdProduct: null,
    updatedProduct: null,
    deletedProductId: null,
    uploadedImages: [],
  },
  reducers: {
    clearSuccess: (state) => {
      state.success = false;
      state.createdProduct = null;
      state.updatedProduct = null;
      state.deletedProductId = null;
      state.uploadedImages = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.productColorSizes = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createdProduct = action.payload.data;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.updatedProduct = action.payload.data;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.deletedProductId = action.meta.arg;
        state.products = state.products.filter(p => p._id !== action.meta.arg);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get Products (paginated)
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data.products;
        state.pagination = action.payload.data.pagination || {
          total: action.payload.data.total,
          page: action.payload.data.page,
          pages: action.payload.data.pages,
        };
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get Product By ID
      .addCase(getProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.data;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get Product Color Sizes
      .addCase(getProductColorSizes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductColorSizes.fulfilled, (state, action) => {
        state.loading = false;
        state.productColorSizes = action.payload.data;
      })
      .addCase(getProductColorSizes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get by Category
      .addCase(getProductsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data.products;
      })
      .addCase(getProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get by Subcategory
      .addCase(getProductsBySubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductsBySubcategory.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data.products;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getProductsBySubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Upload Color Image
      .addCase(uploadColorImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadColorImage.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadedImages = action.payload.data;
      })
      .addCase(uploadColorImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearSuccess, clearError, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
