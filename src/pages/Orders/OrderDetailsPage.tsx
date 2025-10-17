import { useParams, useNavigate } from 'react-router-dom';
import { FullLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { getOrderDetails, updateOrder, updateOrderStatus } from '../../store/slices/ordersSlice';
import { getAllDistributors } from '../../store/slices/distributorsSlice';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { order, status } = useAppSelector((state) => state.orders);
  const { distributors } = useAppSelector((state) => state.distributors);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(getOrderDetails(id));
    }
    dispatch(getAllDistributors({}));
  }, [dispatch, id]);

  useEffect(() => {
    if (order?.distributorId) {
      setSelectedDistributor(order.distributorId);
    }
  }, [order]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (id && order) {
      try {
        setIsUpdating(true);
        await dispatch(updateOrderStatus({ id, status: newStatus })).unwrap();
        toast.success(`Order marked as ${newStatus}`);
        // Refresh order details
        dispatch(getOrderDetails(id));
      } catch (error) {
        toast.error(`Failed to update order status: ${error}`);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  if (status === 'loading') {
    return (
      <FullLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet"></div>
        </div>
      </FullLayout>
    );
  }

  if (!order) {
    return (
      <FullLayout>
        <div className="text-center py-12">
          <i className="fi fi-sr-document-text mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No order found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">The requested order could not be found.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-violet hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fi fi-sr-arrow-left -ml-1 mr-2 h-4 w-4" />
              Back to Orders
            </button>
          </div>
        </div>
      </FullLayout>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const handleAssignDistributor = async () => {
    if (!selectedDistributor || !id) return;
    
    try {
      setIsUpdating(true);
      // Here you would typically call an API to update the order with the selected distributor
      dispatch(updateOrder({ id, orderData: {
        distributorId: selectedDistributor,
        distributorName: distributors.find(d => d._id === selectedDistributor)?.name || 'N/A',
        distributorEmail: distributors.find(d => d._id === selectedDistributor)?.email || 'N/A',
      } }));
      // For now, we'll just update the local state
      alert('Distributor assigned successfully');
    } catch (error) {
      console.log("error", error);
      alert('Failed to assign distributor');
    } finally {
      setIsUpdating(false);
    }
  };

  const statusOptions = [
    { value: 'processing', label: 'Mark as Processing' },
    { value: 'shipped', label: 'Mark as Shipped' },
    { value: 'delivered', label: 'Mark as Delivered' },
    { value: 'cancelled', label: 'Cancel Order' },
  ];

  console.log(distributors)
  return (
    <FullLayout>

      <div className="max-w-7xl mx-auto">
        <div className="px-4 py-2 bg-white">
          <div className="flex flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <span className="rounded-full bg-gray-100 p-2 mr-1">
                <i className="fi fi-rr-arrow-left flex items-center" />
              </span>
              <span className="text-lg font-semibold">
                Order Details
              </span>
            </button>
            
            <div className="flex gap-2 items-center">
              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="h-screen overflow-y-auto py-2">
          <div className="bg-white p-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              #Order {order._id?.toUpperCase()}
            </h1>
            
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Customer</p>
                <p className="text-sm text-gray-900">{order.retailerName}</p>
              </div>

              {user?.role === "admin" && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Assign Distributor</p>
                  <div className="flex gap-2">
                    <select
                      aria-label="Assign Distributor"
                      value={selectedDistributor}
                      onChange={(e) => setSelectedDistributor(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      disabled={isUpdating}
                    >
                      <option value="">Select a distributor</option>
                      {distributors.map((distributor) => (
                        <option key={distributor._id} value={distributor._id}>
                          {distributor.name} ({distributor.city})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAssignDistributor}
                      disabled={!selectedDistributor || isUpdating}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-violet hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                  {order?.distributorId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Currently assigned to: {distributors.find(d => d._id === order.distributorId)?.name || 'N/A'}
                    </p>
                  )}
                </div>
              )}

              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Delivery Address</p>
                {typeof order?.deliveryAddress === 'object' && order?.deliveryAddress !== null ? (
                  <div className="text-sm text-gray-900">
                    <p>{order.deliveryAddress?.address}</p>
                    <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state}</p>
                    <p>{order.deliveryAddress?.zipCode}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No delivery address provided</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="text-sm text-gray-900">
                    {order.paymentMethod ? order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1) : 'N/A'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Order Notes</p>
                  <p className="text-sm text-gray-900">
                    {order.notes || 'No notes provided'}
                  </p>
                </div>
              </div>
            </div>

            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.products?.map((product, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="ml-4 flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-500">{product.formula}</p>
                      <p className="text-sm font-medium text-violet mt-1">
                        ₹{product.ptr?.toFixed(2)} × {product.orderQuantity || 1}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ₹{((product.ptr || 0) * (product.orderQuantity || 1))?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Total</p>
                  <p>₹{
                    Number(order.products.reduce((total, productId) => total + ((productId.orderQuantity || 0) * (productId.ptr || 0)), 0).toFixed(2))
                    + Number(order.products.reduce((total, productId) => total + ((productId.orderQuantity || 0) * (productId.ptr || 0) * 0.05), 0).toFixed(2))
                    + Number(50)
                    }</p>
                </div>
              </div>
            </div>

            {user?.role == "distributor" && order.status !== 'cancelled' && order.status !== 'delivered' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Update Order Status</h3>
                <div className="flex flex-wrap gap-3">
                  {statusOptions.map((option) => {
                    if (option.value === order.status) return null;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleStatusUpdate(option.value)}
                        disabled={isUpdating}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white ${
                          option.value === 'cancelled'
                            ? 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                            : 'bg-violet hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                      >
                        {isUpdating ? (
                          <span>Updating...</span>
                        ) : (
                          <>
                            <i className={`fi ${
                              option.value === 'processing' ? 'fi-sr-gear' :
                              option.value === 'shipped' ? 'fi-sr-truck' :
                              option.value === 'delivered' ? 'fi-sr-check' :
                              'fi-sr-cross-circle'
                            } mr-2`}></i>
                            {option.label}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FullLayout>
  );
}