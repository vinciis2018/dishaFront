import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Distributor, Order, Product } from '../../types';
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

interface DistributorsState {
  distributors: Distributor[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  distributor: Distributor | null;
  pagination: Pagination;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

const initialState: DistributorsState = {
  distributors: [],
  status: 'idle',
  error: null,
  distributor: null,
  pagination: {},
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
};

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface CreateDistributorPayload {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  images?: string[];
  products?: Product[];
  ordersRecieved?: Order[];
}


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
  distributors?: T; // For backward compatibility
}

interface FetchDistributorParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const createDistributor = createAsyncThunk<Distributor, CreateDistributorPayload, { rejectValue: string }>(
  'distributors/createDistributor',
  async (distributorData, { rejectWithValue }) => {
    try {
      console.log(distributorData)
      const response = await axios.post<Distributor>(`${nodeurl}/distributors/create`, {
        name: distributorData.name,
        address: distributorData.address,
        latitude: distributorData.latitude,
        longitude: distributorData.longitude,
        city: distributorData.city,
        state: distributorData.state,
        country: distributorData.country,
        zipCode: distributorData.zipCode,
        images: distributorData.images || [],
        products: distributorData.products || [],
        ordersRecieved: distributorData.ordersRecieved || []
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


export const getAllDistributors = createAsyncThunk<
  { distributors: Distributor[]; pagination: ApiPagination },
  FetchDistributorParams | undefined,
  { rejectValue: string }
>(
  'distributors/fetchAllDistributors',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search = '' } = params;
      const response = await axios.get<ApiResponse<Distributor>>(`${nodeurl}/distributors/all`, {
        params: {
          page,
          limit,
          ...(search && { search })
        }
      });
      
      // Handle both response formats
      const distributors = Array.isArray(response.data.data) ? response.data.data : 
                  (Array.isArray(response.data.distributors) ? response.data.distributors : []);
      
      const pagination = response.data.pagination || {
        total: distributors.length,
        currentPage: page,
        totalPages: Math.ceil(distributors.length / limit),
        limit
      };
      
      return {
        distributors,
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

export const getDistributorDetails = createAsyncThunk<Distributor, string, { rejectValue: string }>(
  'distributors/getDistributorsDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<Distributor>>(`${nodeurl}/distributors/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch campaign details: Invalid response format');
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } }, message?: string };
        return rejectWithValue(
          axiosError.response?.data?.message || axiosError.message || 'Failed to fetch distributors details'
        );
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const updateDistributor = createAsyncThunk<Distributor, { id: string; distributorData: Partial<Distributor> }, { rejectValue: string }>(
  'distributors/updateDistributors',
  async ({ id, distributorData }, { rejectWithValue }) => {
    try {
      console.log(id)
      const response = await axios.post<ApiResponse<Distributor>>(
        `${nodeurl}/distributors/update/${id}`,
        {distributorId: id, ...distributorData}
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

const distributorsSlice = createSlice({
  name: 'distributors',
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDistributor.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createDistributor.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.distributors.unshift(action.payload);
        state.totalItems += 1;
      })
      .addCase(createDistributor.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to create site';
      })
      .addCase(getAllDistributors.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getAllDistributors.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.distributors = action.payload.distributors;
        state.pagination = action.payload.pagination;
        state.currentPage = action.payload.pagination?.currentPage || 1;
        state.itemsPerPage = action.payload.pagination?.limit || 10;
        state.totalItems = action.payload.pagination?.total || action.payload.distributors.length;
      })
      .addCase(getAllDistributors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch distributors';
      })
      .addCase(getDistributorDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getDistributorDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.distributor = action.payload;
        state.error = null;
      })
      .addCase(getDistributorDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch campaigns';
      })
      .addCase(updateDistributor.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateDistributor.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.distributor = action.payload;
        // Update the site in the sites array if it exists there
        state.distributors = state.distributors.map(distributor => 
          distributor._id === action.payload._id ? action.payload : distributor
        );
        state.error = null;
      })
      .addCase(updateDistributor.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to update site';
      })
  },
});

export const { resetStatus } = distributorsSlice.actions;

export default distributorsSlice.reducer;
