import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Product } from '../../types';
import { nodeurl } from '../../constants/helperConstants';


interface Pagination {
  next?: {
    page: number;
    limit: number;
  };
  prev?: {
    page: number;
    limit: number;
  };
  total?: number;
  currentPage?: number;
  totalPages?: number;
}

interface ProductsState {
  products: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  product: Product | null;
  pagination: Pagination;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

const initialState: ProductsState = {
  products: [],
  status: 'idle',
  error: null,
  product: null,
  pagination: {},
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
};

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface CreateProductPayload {
  name: string;
  formula: string;
  images?: string[];
  manufacturer?: string;
  unitQuantity?: number;
  availability?: boolean;
  minOrderQuantity?: number;
}

export const createProduct = createAsyncThunk<Product, CreateProductPayload, { rejectValue: string }>(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      console.log(productData)
      const response = await axios.post<Product>(`${nodeurl}/products/create`, {
        name: productData.name,
        formula: productData.formula,
        images: productData.images || [],
        manufacturer: productData.manufacturer || 'ekum',
        unitQuantity: productData.unitQuantity || 10,
        availability: productData.availability || true,
        minOrderQuantity: productData.minOrderQuantity || 10
      });
      return response.data;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } }, message?: string };
        return rejectWithValue(
          axiosError.response?.data?.message || axiosError.message || 'Failed to create site'
        );
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

interface ApiPagination {
  next?: {
    page: number;
    limit: number;
  };
  prev?: {
    page: number;
    limit: number;
  };
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

interface ApiResponse<T> {
  success: boolean;
  count: number;
  pagination: ApiPagination;
  data: T;
  products?: T; // For backward compatibility
}

interface FetchProductsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getAllProducts = createAsyncThunk<
  { products: Product[]; pagination: ApiPagination },
  FetchProductsParams | undefined,
  { rejectValue: string }
>(
  'products/fetchAllProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search = '' } = params;
      const response = await axios.get<ApiResponse<Product>>(`${nodeurl}/products/all`, {
        params: {
          page,
          limit,
          ...(search && { search })
        }
      });
      
      // Handle both response formats
      const products = Array.isArray(response.data.data) ? response.data.data : 
                  (Array.isArray(response.data.products) ? response.data.products : []);
      
      const pagination = response.data.pagination || {
        total: products.length,
        currentPage: page,
        totalPages: Math.ceil(products.length / limit),
        limit
      };
      
      return {
        products,
        pagination
      };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError?.response?.data?.message) {
        return rejectWithValue(axiosError.response.data.message);
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

export const getProductDetails = createAsyncThunk<Product, string, { rejectValue: string }>(
  'products/getProductsDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<Product>>(`${nodeurl}/products/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch campaign details: Invalid response format');
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } }, message?: string };
        return rejectWithValue(
          axiosError.response?.data?.message || axiosError.message || 'Failed to fetch campaign details'
        );
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const updateProduct = createAsyncThunk<Product, { id: string; productData: Partial<Product> }, { rejectValue: string }>(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      console.log(id)
      const response = await axios.post<ApiResponse<Product>>(
        `${nodeurl}/products/update/${id}`,
        {productId: id, ...productData}
      );
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to update site: Invalid response format');
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } }, message?: string };
        return rejectWithValue(
          axiosError.response?.data?.message || axiosError.message || 'Failed to update site'
        );
      }
      return rejectWithValue('An unknown error occurred while updating site');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products.unshift(action.payload);
        state.totalItems += 1;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to create site';
      })
      .addCase(getAllProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
        state.currentPage = action.payload.pagination?.currentPage || 1;
        state.itemsPerPage = action.payload.pagination?.limit || 10;
        state.totalItems = action.payload.pagination?.total || action.payload.products.length;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch products';
      })
      .addCase(getProductDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.product = action.payload;
        state.error = null;
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch campaigns';
      })
      .addCase(updateProduct.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.product = action.payload;
        // Update the site in the sites array if it exists there
        state.products = state.products.map(product => 
          product._id === action.payload._id ? action.payload : product
        );
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to update site';
      })
  },
});

export const { resetStatus } = productsSlice.actions;

export default productsSlice.reducer;
