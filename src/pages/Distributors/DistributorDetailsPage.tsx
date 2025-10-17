import { useParams, useNavigate } from 'react-router-dom';
import { FullLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { useEffect, useState } from 'react';
import { getDistributorDetails, updateDistributor } from '../../store/slices/distributorsSlice';
import type { DistributorFormData } from '../../types';
import { toast } from 'react-toastify';
import { DistributorForm } from '../../components/forms/DistributorForm';

export function DistributorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { distributor, status } = useAppSelector((state) => state.distributors);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getDistributorDetails(id));
    }
  }, [dispatch, id]);

  const handleUpdateSite = async (formData: DistributorFormData) => {
    if (id) {
      console.log(id)
      try {
        setIsSubmitting(true);
        const resultAction = await dispatch(updateDistributor({ id, distributorData: formData }));
        if (updateDistributor.fulfilled.match(resultAction)) {
          toast.success('Distributor updated successfully');
          setIsEditMode(false);
          // Refresh product details
          dispatch(getDistributorDetails(id));
        } else {
          const error = resultAction.payload || 'Failed to update product';
          throw new Error(typeof error === 'string' ? error : 'Failed to update product');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        toast.error(`Failed to update product: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isEditMode && distributor) {
    return (
      <FullLayout>
        <div className="p-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Distributor</h2>
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
          
          <DistributorForm
            isOpen={isEditMode}
            onClose={() => setIsEditMode(false)}
            onSubmit={handleUpdateSite}
            isLoading={isSubmitting}
            initialData={{
              ...distributor,
              // Map the distributor data to match the DistributorFormData type
              zipCode: distributor.zipCode || '',
              gst: distributor.gst || '',
              pan: distributor.pan || '',
              images: distributor.images || [],
              products: distributor.products || [],
              ordersRecieved: distributor.ordersRecieved || [],
              ownerId: distributor.ownerId || '',
              ownerName: distributor.ownerName || '',
              ownerEmail: distributor.ownerEmail || '',
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

  if (!distributor) {
    return (
      <FullLayout>
        <div className="text-center py-12">
          <i className="fi fi-sr-store mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No distributor found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">The requested distributor could not be found.</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fi fi-rr-arrow-left -ml-1 mr-2 h-4 w-4" />
              Back to Distributors
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
              type="button"
              onClick={() => navigate("/distributors")}
              className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <span className="rounded-full bg-gray-100 p-2 mr-1">
                <i className="fi fi-rr-arrow-left flex items-center" />
              </span>
              <span className="text-lg font-semibold">
                Distributor Details
              </span>
            </button>
            
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setIsEditMode(true)}
                className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition-colors"
                title="Edit distributor"
                aria-label="Edit distributor"
              >
                <i className="fi fi-sr-edit text-gray-500 flex items-center" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="h-screen overflow-y-auto py-2">
          {/* Main Content */}
          <div className="bg-white">
            <div className="p-4">
              <div className="">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {distributor.name}
                </h1>
                <div className="py-1 flex items-center gap-2">
                  <i className="fi fi-rr-marker text-violet flex items-center" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {[distributor.address, distributor.city, distributor.state, distributor.country, distributor.zipCode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
              <div className="py-1">
                <p className="col-span-1 text-xs text-violet">Email: {distributor.email}</p>
                <p className="col-span-1 text-xs text-violet">Phone: {distributor.phone}</p>
              </div>
            </div>

            {distributor?.images && distributor?.images.length > 0 && (
              <div className="w-full">
                <img 
                  src={distributor.images[0]} 
                  alt="distributor" 
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            
            <div className="p-4">
              <div className="py-1">
                <p className="text-md font-semibold text-gray-500">Business Information</p>
                {distributor.ownerName && (
                  <p className="text-sm text-gray-500">Owner: {distributor.ownerName}</p>
                )}
              </div>
              
              <div className="py-1 space-y-1">
                {distributor.gst && (
                  <p className="text-xs text-gray-800">GST: {distributor.gst}</p>
                )}
                {distributor.pan && (
                  <p className="text-xs text-gray-500">PAN: {distributor.pan}</p>
                )}
              </div>
              
              <div className="py-4 space-y-2">
                <p className="text-sm font-medium text-gray-500">Location</p>
                <div className="text-xs space-y-1">
                  <p>{distributor.address}</p>
                  <p>
                    {[distributor.city, distributor.state, distributor.country, distributor.zipCode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {(distributor.latitude || distributor.longitude) && (
                    <p className="text-gray-500 mt-2">
                      Coordinates: {distributor.latitude}, {distributor.longitude}
                    </p>
                  )}
                </div>
              </div>
              
              {distributor.products && distributor.products.length > 0 && (
                <div className="py-2">
                  <p className="text-sm font-medium text-gray-500 mb-2">Products</p>
                  <div className="flex flex-wrap gap-2">
                    {distributor.products.map((product, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                        {product.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </FullLayout>
  );
}
