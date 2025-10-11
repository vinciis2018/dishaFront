import { configureStore } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import authReducer, { logout } from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import distributorsReducer from './slices/distributorsSlice';
import retailersReducer from './slices/retailersSlice';
import ordersReducer from './slices/ordersSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    distributors: distributorsReducer,
    retailers: retailersReducer,
    orders: ordersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const userInfoFromLocalStorage = () => {
  const userToken = localStorage.getItem('token');
  const tokenExpiresAt = localStorage.getItem('expires_at');
  if (!userToken || (tokenExpiresAt && parseInt(tokenExpiresAt) < new Date().getTime())) {
    localStorage.removeItem('token');
    localStorage.removeItem('expires_at');
    // localStorage.clear();
    store.dispatch(logout());
    // window.location.reload();

  }
}


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
