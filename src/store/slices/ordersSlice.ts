import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Order, Product } from '../../types';
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

interface OrdersState {
  orders: Order[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  order: Order | null;
  pagination: Pagination;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

const initialState: OrdersState = {
  orders: [],
  status: 'idle',
  error: null,
  order: null,
  pagination: {},
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
};

interface CreateOrderPayload {
  userId: string;
  username: string;
  products: Array<Partial<Product>>;
  totalAmount: number;
  paymentMethod: string;
  deliveryAddress: object;
  notes?: string;
  retailerId: string;
  retailerName: string;
  retailerEmail: string;
}

export const createOrder = createAsyncThunk<Order, CreateOrderPayload, { rejectValue: string }>(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post<{ success: boolean; data: Order }>(
        `${nodeurl}/orders/create`,
        orderData
      );
      return response.data.data;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } }, message?: string };
        return rejectWithValue(
          axiosError.response?.data?.message || axiosError.message || 'Failed to create order'
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

interface FetchOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export const getAllOrders = createAsyncThunk<
  { orders: Order[]; pagination: ApiPagination },
  FetchOrdersParams | undefined,
  { rejectValue: string }
>(
  'orders/fetchAllOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status = '',
        startDate = '',
        endDate = ''
      } = params;
      
      const response = await axios.get<{
        success: boolean;
        count: number;
        pagination: ApiPagination;
        data: Order[];
        orders?: Order[];
      }>(`${nodeurl}/orders/all`, {
        params: {
          page,
          limit,
          ...(search && { search }),
          ...(status && { status }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate })
        }
      });
      
      const orders = Array.isArray(response.data.data) ? response.data.data : 
                    (Array.isArray(response.data.orders) ? response.data.orders : []);
      
      const pagination = response.data.pagination || {
        total: orders.length,
        currentPage: page,
        totalPages: Math.ceil(orders.length / limit),
        limit
      };
      
      return {
        orders,
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

export const getMyOrders = createAsyncThunk<
  { orders: Order[]; pagination: ApiPagination },
  FetchOrdersParams | undefined,
  { rejectValue: string }
>(
  'orders/fetchMyOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status = '',
        startDate = '',
        endDate = '',
        userId,
      } = params;
      
      const response = await axios.get<{
        success: boolean;
        count: number;
        pagination: ApiPagination;
        data: Order[];
        orders?: Order[];
      }>(`${nodeurl}/orders/my`, {
        params: {
          page,
          limit,
          ...(search && { search }),
          ...(status && { status }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
          ...(userId && { userId })
        }
      });
      
      const orders = Array.isArray(response.data.data) ? response.data.data : 
                    (Array.isArray(response.data.orders) ? response.data.orders : []);
      
      const pagination = response.data.pagination || {
        total: orders.length,
        currentPage: page,
        totalPages: Math.ceil(orders.length / limit),
        limit
      };
      
      return {
        orders,
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

export const getOrderDetails = createAsyncThunk<Order, string, { rejectValue: string }>(
  'orders/getOrderDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ success: boolean; data: Order }>(`${nodeurl}/orders/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch order details: Invalid response format');
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } }, message?: string };
        return rejectWithValue(
          axiosError.response?.data?.message || axiosError.message || 'Failed to fetch order details'
        );
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);


export const updateOrder = createAsyncThunk<Order, { id: string; orderData: Partial<Order> }, { rejectValue: string }>(
  'orders/updateOrder',
  async ({ id, orderData }, { rejectWithValue }) => {
    try {
      const response = await axios.post<{ success: boolean; data: Order }>(
        `${nodeurl}/orders/update/${id}`,
        { orderId: id, ...orderData }
      );
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to update order: Invalid response format');
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } }, message?: string };
        return rejectWithValue(
          axiosError.response?.data?.message || axiosError.message || 'Failed to update order'
        );
      }
      return rejectWithValue('An unknown error occurred while updating retailer');
    }
  }
);


export const updateOrderStatus = createAsyncThunk<Order, { id: string; status: string }, { rejectValue: string }>(
  'orders/updateOrderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch<{ success: boolean; data: Order }>(
        `${nodeurl}/orders/${id}/status`,
        { status }
      );
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to update order status: Invalid response format');
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } }, message?: string };
        return rejectWithValue(
          axiosError.response?.data?.message || axiosError.message || 'Failed to update order status'
        );
      }
      return rejectWithValue('An unknown error occurred while updating order status');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create Order
    builder.addCase(createOrder.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(createOrder.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.orders.unshift(action.payload);
      state.totalItems += 1;
    });
    builder.addCase(createOrder.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Failed to create order';
    });

    // Get All Orders
    builder.addCase(getAllOrders.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(getAllOrders.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.orders = action.payload.orders;
      state.pagination = action.payload.pagination;
      state.totalItems = action.payload.pagination.total;
    });
    builder.addCase(getAllOrders.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Failed to fetch orders';
    });

    // Get My Orders
    builder.addCase(getMyOrders.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(getMyOrders.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.orders = action.payload.orders;
      state.pagination = action.payload.pagination;
      state.totalItems = action.payload.pagination.total;
    });
    builder.addCase(getMyOrders.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Failed to fetch orders';
    });

    // Get Order Details
    builder.addCase(getOrderDetails.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(getOrderDetails.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.order = action.payload;
    });
    builder.addCase(getOrderDetails.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Failed to fetch order details';
    });

    // update order
    builder.addCase(updateOrder.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(updateOrder.fulfilled, (state, action) => {
      state.status = 'succeeded';
      const index = state.orders.findIndex(order => order._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      if (state.order?._id === action.payload._id) {
        state.order = action.payload;
      }
    });
    builder.addCase(updateOrder.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Failed to update order';
    });
    
    // Update Order Status
    builder.addCase(updateOrderStatus.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(updateOrderStatus.fulfilled, (state, action) => {
      state.status = 'succeeded';
      const index = state.orders.findIndex(order => order._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      if (state.order?._id === action.payload._id) {
        state.order = action.payload;
      }
    });
    builder.addCase(updateOrderStatus.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Failed to update order status';
    });
  },
});

export const { resetStatus, setCurrentPage } = ordersSlice.actions;

export default ordersSlice.reducer;