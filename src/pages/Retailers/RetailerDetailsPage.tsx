import { useParams, useNavigate } from 'react-router-dom';
import { FullLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { ArrowLeftIcon, PencilIcon, BuildingStorefrontIcon, EnvelopeIcon, MapPinIcon, DocumentTextIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { getRetailerDetails, updateRetailer } from '../../store/slices/retailersSlice';
import type { RetailerFormData } from '../../types';
import { toast } from 'react-toastify';

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
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const retailerData: RetailerFormData = {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                address: formData.get('address') as string,
                city: formData.get('city') as string,
                state: formData.get('state') as string,
                country: formData.get('country') as string,
                zipCode: formData.get('zipCode') as string,
                gst: formData.get('gstNumber') as string || undefined,
                pan: formData.get('panNumber') as string || undefined,
              };
              handleUpdateRetailer(retailerData);
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Retailer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  defaultValue={retailer.name}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  defaultValue={retailer.email}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  defaultValue={retailer.phone}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  GST Number
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  id="gstNumber"
                  defaultValue={retailer.gst || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  defaultValue={retailer.address}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  defaultValue={retailer.city}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  id="state"
                  defaultValue={retailer.state}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  id="pincode"
                  defaultValue={retailer.zipCode}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  id="country"
                  defaultValue={retailer.country || 'India'}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  PAN Number
                </label>
                <input
                  type="text"
                  name="panNumber"
                  id="panNumber"
                  defaultValue={retailer.pan || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
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
          <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No retailer found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">The requested retailer could not be found.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-4 w-4" />
              Back to Retailers
            </button>
          </div>
        </div>
      </FullLayout>
    );
  }

  const { 
    name, 
    email, 
    phone, 
    address, 
    city, 
    state, 
    country, 
    zipCode, 
    gst, 
    pan,
    createdAt,
    updatedAt
  } = retailer;
  
  const fullAddress = [address, city, state, country, zipCode].filter(Boolean).join(', ');

  return (
    <FullLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Retailers
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              onClick={() => setIsEditMode(true)}
              type="button"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Retailer
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          {/* Header */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <BuildingStorefrontIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {name}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {[city, state].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Contact Information */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-3 flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Phone</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{phone}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-3 flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  Address
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {fullAddress}
                  </p>
                </div>
              </div>

              {/* Business Information */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-3 flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                  Business Information
                </h3>
                <div className="space-y-2">
                  {gst && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">GST Number</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{gst}</p>
                    </div>
                  )}
                  {pan && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">PAN Number</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{pan}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-3 flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Additional Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Created At</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(createdAt || new Date()).toLocaleDateString()}
                    </p>
                  </div>
                  {updatedAt && updatedAt !== createdAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Last Updated</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FullLayout>
  );
}
