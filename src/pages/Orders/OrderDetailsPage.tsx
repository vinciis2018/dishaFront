import { useParams, useNavigate } from 'react-router-dom';
import { FullLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { getOrderDetails, updateOrderStatus } from '../../store/slices/ordersSlice';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { order, status } = useAppSelector((state) => state.orders);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getOrderDetails(id));
    }
  }, [dispatch, id]);

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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </FullLayout>
    );
  }

  if (!order) {
    return (
      <FullLayout>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Order not found</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">The requested order could not be found.</p>
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

  const statusOptions = [
    { value: 'processing', label: 'Mark as Processing' },
    { value: 'shipped', label: 'Mark as Shipped' },
    { value: 'delivered', label: 'Mark as Delivered' },
    { value: 'cancelled', label: 'Cancel Order' },
  ];

  return (
    <FullLayout>
      <div className="p-4 bg-[var(--background-alt)]">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Orders
          </button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Order #{order._id?.substring(0, 8).toUpperCase()}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {/* Placed on {format(new Date(order.createdAt || ''), 'MMMM d, yyyy')} */}
              </p>
            </div>
            <div className="flex items-center">
              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Customer</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {order.userId}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Delivery Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {typeof order?.deliveryAddress === 'object' && order?.deliveryAddress !== null ? (
                    <div>
                      <p>{order.deliveryAddress?.address}</p>
                      <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state}</p>
                      <p>{order.deliveryAddress?.pincode}</p>
                    </div>
                  ) : (
                    <p>No delivery address provided</p>
                  )}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Payment method</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {order.paymentMethod ? order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1) : 'N/A'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Order notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {order.notes || 'No notes provided'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Order Items</h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="bg-white overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {order.products?.map((product, index) => (
                  <li key={index} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="min-w-0 flex-1 flex items-center">
                        <div className="flex-shrink-0">
                          {product.images?.[0] ? (
                            <img
                              className="h-16 w-16 rounded-md object-cover"
                              src={product.images[0]}
                              alt={product.name}
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 px-4">
                          <div>
                            <h4 className="text-sm font-medium text-indigo-600 truncate">{product.name}</h4>
                            <p className="mt-1 text-sm text-gray-500">{product.formula}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:px-6">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Total</p>
              <p>${order.totalAmount?.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Update Order Status</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="space-y-4">
                {statusOptions.map((option) => {
                  if (option.value === order.status) return null;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleStatusUpdate(option.value)}
                      disabled={isUpdating}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        option.value === 'cancelled'
                          ? 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                          : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      }`}
                    >
                      {isUpdating ? (
                        <span>Updating...</span>
                      ) : (
                        <>
                          {option.value === 'delivered' ? (
                            <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                          ) : option.value === 'cancelled' ? (
                            <XCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                          ) : null}
                          {option.label}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </FullLayout>
  );
}