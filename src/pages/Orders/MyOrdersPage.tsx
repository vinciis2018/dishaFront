import { useEffect, useState } from 'react';
import { FullLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { getAllOrders, getMyOrders } from '../../store/slices/ordersSlice';
import { useNavigate } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';

// const statusColors = {
//   pending: 'bg-yellow-100 text-yellow-800',
//   processing: 'bg-blue-100 text-blue-800',
//   shipped: 'bg-indigo-100 text-indigo-800',
//   delivered: 'bg-green-100 text-green-800',
//   cancelled: 'bg-red-100 text-red-800',
// };

export function MyOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { 
    orders, 
    status, 
    error, 
    pagination,
    totalItems
  } = useAppSelector((state) => state.orders);

  const { user } = useAppSelector((state) => state.auth);

  // Debounced search
  const debouncedSearch = useDebouncedCallback(
    (search: string) => {
      setCurrentPage(1);
      dispatch(getMyOrders({ 
        page: 1, 
        limit: itemsPerPage, 
        search 
      }));
    },
    300 // 300ms delay
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    dispatch(getMyOrders({ 
      page, 
      limit: itemsPerPage, 
      search: searchTerm 
    }));
  };

  // Initial data load
  useEffect(() => {
    if (user?.role == "admin") {
      dispatch(getAllOrders({
        page: currentPage, 
        limit: itemsPerPage,
        search: searchTerm,
      }));
    } else {
      dispatch(getMyOrders({ 
        page: currentPage, 
        limit: itemsPerPage,
        search: searchTerm,
        userId: user?._id,
      }));
    }
    
  }, [dispatch, currentPage, itemsPerPage, searchTerm, user]);

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const Footer = () => {
    return null;
  }
  return (
    <FullLayout footer={<Footer />}>
      <div className="h-auto">
        <div className="bg-white px-4 py-2">
          <div className="">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-sm font-medium hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <span className="rounded-full bg-gray-100 p-2 mr-1">
                  <i className="fi fi-rr-arrow-left flex items-center" />
                </span>
                <span className="text-lg font-semibold">
                  Orders
                </span>
              </button>
              
              <div className="flex gap-2 items-center">
                <span className="relative rounded-full bg-gray-100 p-2 cursor-pointer" onClick={() => {}}>
                  <i className="fi fi-br-interrogation text-gray-500 flex items-center" />
                </span>
              </div>
            </div>
          </div>

          {/* Search and filter */}
          <div className="my-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fi fi-rr-search h-4 w-4 flex items-center text-[var(--text-secondary)]" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-10 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent sm:text-sm"
                />
                {searchTerm && (
                  <button
                    title="Clear search"
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                      // dispatch(getAllProducts({ page: 1, limit: itemsPerPage }));
                    }}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <i className="fi fi-rr-xmark h-4 w-4 flex items-center text-[var(--text-secondary)]" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {}}
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 bg-transparent px-2 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
            >
              All
              <i className="fi fi-rr-angle-small-down h-4 w-4 flex items-center" />
            </button>
            <button
              type="button"
              onClick={() => {}}
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 bg-transparent px-2 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
            >
              Category
              <i className="fi fi-rr-angle-small-down h-4 w-4 flex items-center" />
            </button>
          </div>
        </div>

        {/* Orders list */}
        {status === 'loading' ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : status === 'failed' ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error || 'Failed to load orders. Please try again.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 overflow-y-auto h-screen">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-2xl border bg-white p-2 my-1"
                >
                  <div className="flex items-center justify-between p-2 border-b border-dotted">
                    <h1 className="text-xs text-gray-500 w-3/4">#Order Id {order._id?.toUpperCase()} </h1>
                    <p className="text-xs font-semibold text-gray-500 cursor-pointer" onClick={() => handleViewOrder(order._id || '')}>View Details</p>
                  </div>
                  <div className="flex items-center justify-between -mx-4 -my-2">
                    <div className="h-4 w-4 rounded-full bg-gray-100"></div>
                    <div className="h-4 w-4 rounded-full bg-gray-100"></div>
                  </div>
                  <div className="p-2 border-b border-dotted">
                    <div className="flex items-center justify-between py-1">
                      <p className="text-xs text-gray-500">Order Date</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <p className="text-xs text-gray-500">Retailer Name</p>
                      <p className="text-xs text-gray-500">{order.retailerName || "RetailerName"}</p>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <p className="text-xs text-gray-500">Order Value ({order.products.length} Products)</p>
                      <p className="text-xs font-semibold text-gray-500">₹ {order.products.reduce((total, product) => total + (product.ptr || 0) * (product?.orderQuantity || 0), 0).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <p className="text-xs text-gray-500">Payment Mode</p>
                      <p className="text-xs text-gray-500">{order.paymentMethod || "CreditPayment"}</p>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <p className="text-xs text-gray-500">Order Status</p>
                      <p className="text-xs text-gray-500">{order.status || "OrderStatus"}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <button
                      type="button"
                      className="w-full flex justify-center items-center border border-violet text-violet text-sm font-semibold rounded-full p-2"
                      onClick={() => handleViewOrder(order._id || '')}
                    >
                      View Receipt
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500">
                No orders found
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination?.totalPages && pagination.totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center bg-white px-4 py-3 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(pagination?.totalPages || 1, currentPage + 1))}
                disabled={currentPage === pagination?.totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === pagination?.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{' '}
                  of <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </FullLayout>
  );
}