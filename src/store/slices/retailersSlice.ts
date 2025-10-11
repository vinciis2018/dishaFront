import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Retailer } from '../../types';
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

interface RetailersState {
  retailers: Retailer[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  retailer: Retailer | null;
  pagination: Pagination;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

const initialState: RetailersState = {
  retailers: [],
  status: 'idle',
  error: null,
  retailer: null,
  pagination: {},
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
};

interface CreateRetailerPayload {
  name: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  gst?: string;
  pan?: string;
}

export const createRetailer = createAsyncThunk<Retailer, CreateRetailerPayload, { rejectValue: string }>(
  'retailers/createRetailer',
  async (retailerData, { rejectWithValue }) => {
    try {
      const response = await axios.post<{ success: boolean; data: Retailer }>(
        `${nodeurl}/retailers/create`,
        retailerData
      );
      return response.data.data;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } }, message?: string };
        return rejectWithValue(
          axiosError.response?.data?.message || axiosError.message || 'Failed to create retailer'
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

interface FetchRetailersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getAllRetailers = createAsyncThunk<
  { retailers: Retailer[]; pagination: ApiPagination },
  FetchRetailersParams | undefined,
  { rejectValue: string }
>(
  'retailers/fetchAllRetailers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search = '' } = params;
      const response = await axios.get<{
        success: boolean;
        count: number;
        pagination: ApiPagination;
        data: Retailer[];
        retailers?: Retailer[];
      }>(`${nodeurl}/retailers/all`, {
        params: {
          page,
          limit,
          ...(search && { search })
        }
      });
      
      const retailers = Array.isArray(response.data.data) ? response.data.data : 
                      (Array.isArray(response.data.retailers) ? response.data.retailers : []);
      
      const pagination = response.data.pagination || {
        total: retailers.length,
        currentPage: page,
        totalPages: Math.ceil(retailers.length / limit),
        limit
      };
      
      return {
        retailers,
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

export const getRetailerDetails = createAsyncThunk<Retailer, string, { rejectValue: string }>(
  'retailers/getRetailerDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ success: boolean; data: Retailer }>(`${nodeurl}/retailers/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch retailer details: Invalid response format');
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } }, message?: string };
        return rejectWithValue(
          axiosError.response?.data?.message || axiosError.message || 'Failed to fetch retailer details'
        );
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const updateRetailer = createAsyncThunk<Retailer, { id: string; retailerData: Partial<Retailer> }, { rejectValue: string }>(
  'retailers/updateRetailer',
  async ({ id, retailerData }, { rejectWithValue }) => {
    try {
      const response = await axios.post<{ success: boolean; data: Retailer }>(
        `${nodeurl}/retailers/update/${id}`,
        { retailerId: id, ...retailerData }
      );
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to update retailer: Invalid response format');
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } }, message?: string };
        return rejectWithValue(
          axiosError.response?.data?.message || axiosError.message || 'Failed to update retailer'
        );
      }
      return rejectWithValue('An unknown error occurred while updating retailer');
    }
  }
);

const retailersSlice = createSlice({
  name: 'retailers',
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Retailer
    builder.addCase(createRetailer.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(createRetailer.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.retailers.push(action.payload);
    });
    builder.addCase(createRetailer.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Failed to create retailer';
    });

    // Get All Retailers
    builder.addCase(getAllRetailers.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(getAllRetailers.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.retailers = action.payload.retailers;
      state.pagination = action.payload.pagination;
      state.totalItems = action.payload.pagination.total;
      state.currentPage = action.payload.pagination.currentPage;
    });
    builder.addCase(getAllRetailers.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Failed to fetch retailers';
    });

    // Get Retailer Details
    builder.addCase(getRetailerDetails.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(getRetailerDetails.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.retailer = action.payload;
    });
    builder.addCase(getRetailerDetails.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Failed to fetch retailer details';
    });

    // Update Retailer
    builder.addCase(updateRetailer.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(updateRetailer.fulfilled, (state, action) => {
      state.status = 'succeeded';
      const index = state.retailers.findIndex(r => r._id === action.payload._id);
      if (index !== -1) {
        state.retailers[index] = action.payload;
      }
      if (state.retailer?._id === action.payload._id) {
        state.retailer = action.payload;
      }
    });
    builder.addCase(updateRetailer.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Failed to update retailer';
    });
  },
});

export const { resetStatus } = retailersSlice.actions;

export default retailersSlice.reducer;
