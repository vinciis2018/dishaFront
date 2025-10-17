import { useParams, useNavigate } from 'react-router-dom';
import { FullLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { useEffect, useState } from 'react';
import { getRetailerDetails, updateRetailer } from '../../store/slices/retailersSlice';
import type { RetailerFormData } from '../../types';
import { toast } from 'react-toastify';
import { RetailerForm } from '../../components/forms/RetailerForm';

export function RetailerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { retailer, status } = useAppSelector((state) => state.retailers);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getRetailerDetails(id));
    }
  }, [dispatch, id]);

  const handleUpdateRetailer = async (formData: RetailerFormData) => {
    if (id) {
      try {
        setIsSubmitting(true);
        const resultAction = await dispatch(updateRetailer({ id, retailerData: formData }));
        if (updateRetailer.fulfilled.match(resultAction)) {
          toast.success('Retailer updated successfully');
          setIsEditMode(false);
          // Refresh retailer details
          dispatch(getRetailerDetails(id));
        } else {
          const error = resultAction.payload || 'Failed to update retailer';
          throw new Error(typeof error === 'string' ? error : 'Failed to update retailer');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        toast.error(`Failed to update retailer: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isEditMode && retailer) {
    return (
      <FullLayout>
        <div className="p-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Retailer</h2>
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Cancel editing"
              aria-label="Cancel editing"
            >
              <span className="sr-only">Cancel</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <RetailerForm
            isOpen={isEditMode}
            onClose={() => setIsEditMode(false)}
            onSubmit={handleUpdateRetailer}
            isLoading={isSubmitting}
            initialData={{
              ...retailer,
              // Map the retailer data to match the RetailerFormData type
              zipCode: retailer.zipCode || '',
              gst: retailer.gst || '',
              pan: retailer.pan || '',
              images: retailer.images || [],
              ownerId: retailer.ownerId || '',
              ownerName: retailer.ownerName || '',
              ownerEmail: retailer.ownerEmail || '',
              createdBy: retailer.createdBy || ''
            }}
          />
        </div>
      </FullLayout>
    );
  }

  if (status === 'loading') {
    return (
      <FullLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </FullLayout>
    );
  }

  if (!retailer) {
    return (
      <FullLayout>
        <div className="text-center py-12">
          <i className="fi fi-sr-store mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No retailer found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">The requested retailer could not be found.</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fi fi-rr-arrow-left -ml-1 mr-2 h-4 w-4" />
              Back to Retailers
            </button>
          </div>
        </div>
      </FullLayout>
    );
  }

  return (
    <FullLayout>
      <div className="max-w-7xl mx-auto">
      <div className="px-4 py-2 bg-white">
          <div className="flex flex-row items-center justify-between gap-4">
            <button
              onClick={() => navigate("/retailers")}
              className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <span className="rounded-full bg-gray-100 p-2 mr-1">
                <i className="fi fi-rr-arrow-left flex items-center" />
              </span>
              <span className="text-lg font-semibold">
                Retailer Details
              </span>
            </button>
            
            <div className="flex gap-2 items-center">
              {/* {user?.role === "admin" && (
                <span className="rounded-full bg-gray-100 p-2 cursor-pointer" onClick={() => setIsEditMode(true)}>
                  <i className="fi fi-sr-edit text-gray-500 flex items-center" />
                  </span>
              )} */}
            </div>
          </div>
        </div>
        <div className="h-screen overflow-y-auto py-2">
          {/* Main Content */}
          <div className="bg-white">
            <div className="p-4">
              <div className="">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {retailer.name}
                </h1>
                <div className="py-1 flex items-center gap-2">
                  <i className="fi fi-rr-marker text-violet flex items-center" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">{retailer?.address}, {retailer?.city}, {retailer?.state}, {retailer?.country}, {retailer?.zipCode}</p>
                </div>
              </div>
              <div className="py-1">
                <p className="col-span-1 text-xs text-violet">Email: {retailer.email}</p>
                <p className="col-span-1 text-xs text-violet">Phone: {retailer.phone}</p>
              </div>
            </div>
            

            {retailer?.images && retailer?.images.length > 0 && (
              <div className="">
                <img src={retailer.images[0]} alt="retailer" />
              </div>
            )}
            <div className="p-4">
              
              <div className="py-1">
                <p className="text-md font-semibold text-gray-500">About Shop</p>
                <p className="text-sm text-gray-500">Owner: {retailer.ownerName}</p>
              </div>
              <div className="py-1 space-y-1">
                <p className="text-xs text-gray-800">GST: {retailer.gst}</p>
                <p className="text-xs text-gray-500 ">Pan: {retailer.pan}</p>
              </div>
              
              <div className="py-1 space-y-1">
                <p className="text-xs text-gray-800">Products</p>

              </div>
              
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          

        </div>
      </div>
    </FullLayout>
  );
}
