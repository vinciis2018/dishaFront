import { useEffect, useState } from 'react';
import { FullLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { createRetailer, getAllRetailers } from '../../store/slices/retailersSlice';
import type { RetailerFormData } from '../../types';
import type { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';

export function RetailersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { 
    retailers, 
    status, 
    error, 
    pagination 
  } = useAppSelector((state: RootState) => state.retailers);

  // Debounced search
  const debouncedSearch = useDebouncedCallback(
    (search: string) => {
      setCurrentPage(1);
      dispatch(getAllRetailers({ page: 1, limit: itemsPerPage, search }));
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
    dispatch(getAllRetailers({ 
      page, 
      limit: itemsPerPage, 
      search: searchTerm 
    }));
  };

  // Handle create retailer
  const handleCreateRetailer = async (retailerData: RetailerFormData) => {
    try {
      await dispatch(createRetailer(retailerData)).unwrap();
      
      // Close the form and refresh the retailers list
      setIsFormOpen(false);
      dispatch(getAllRetailers({ page: currentPage, limit: itemsPerPage, search: searchTerm }));
    } catch (err) {
      console.error('Failed to create retailer:', err);
    }
  };

  // Calculate pagination values
  const totalPages = pagination?.totalPages || 1;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, pagination?.total || retailers.length);

  // Initial data load
  useEffect(() => {
    dispatch(getAllRetailers({ page: currentPage, limit: itemsPerPage, search: searchTerm }));
  }, [dispatch, currentPage, itemsPerPage, searchTerm]);

  return (
    <FullLayout>
      <div className="p-4 bg-[var(--background-alt)]">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Retailers</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              A list of all the retailers in your system including their contact information and location.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-violet px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
            >
              <i className="fi fi-rr-plus h-4 w-4 flex items-center" />
              Add Retailer
            </button>
          </div>
        </div>

        {/* Search and filter */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fi fi-rr-search h-4 w-4 flex items-center text-[var(--text-secondary)]" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Search retailers..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-10 py-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent sm:text-sm"
              />
              {searchTerm && (
                <button
                  title="Clear search"
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                    dispatch(getAllRetailers({ page: 1, limit: itemsPerPage }));
                  }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <i className="fi fi-rr-xmark h-4 w-4 flex items-center text-[var(--text-secondary)]" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Retailers list */}
        {status === 'loading' ? (
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : status === 'failed' ? (
          <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error || 'Failed to load retailers. Please try again.'}
                </p>
              </div>
            </div>
          </div>
        ) : retailers.length === 0 ? (
          <div className="mt-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-[var(--text-secondary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-[var(--text-primary)]">No retailers found</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Get started by adding a new retailer.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
              >
                <i className="fi fi-rr-plus h-4 w-4 flex items-center text-[var(--text-secondary)]" />
                Add Retailer
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {retailers.map((retailer) => (
                <div
                  key={retailer._id}
                  onClick={() => navigate(`/retailers/${retailer._id}`)}
                  className="bg-white overflow-hidden shadow rounded-lg border border-[var(--border-color)] hover:shadow-md transition-shadow duration-200 cursor-pointer"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-[var(--color-primary)] rounded-md p-3">
                        <i className="fi fi-rr-store h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <h3 className="text-lg font-medium text-[var(--text-primary)] truncate">
                          {retailer.name}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--text-secondary)] truncate">
                          {retailer.email}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center text-sm text-[var(--text-secondary)]">
                        <i className="fi fi-rr-phone-call h-4 w-4 mr-2" />
                        <span>{retailer.phone}</span>
                      </div>
                      <div className="mt-2 flex items-start text-sm text-[var(--text-secondary)]">
                        <i className="fi fi-rr-marker h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">
                          {[retailer.address, retailer.city, retailer.state, retailer.country, retailer.zipCode]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                      {retailer.gst && (
                        <div className="mt-2 flex items-center text-sm text-[var(--text-secondary)]">
                          <i className="fi fi-rr-document h-4 w-4 mr-2" />
                          <span>GST: {retailer.gst}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-[var(--bg-secondary)] px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <a
                        href={`/retailers/${retailer._id}`}
                        className="font-medium text-[var(--color-primary)] hover:text-opacity-80"
                      >
                        View details<span className="sr-only">, {retailer.name}</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-[var(--border-color)] pt-4">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-[var(--border-color)] text-sm font-medium rounded-md text-[var(--text-primary)] bg-white hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-[var(--border-color)] text-sm font-medium rounded-md text-[var(--text-primary)] bg-white hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Showing <span className="font-medium">{startItem}</span> to{' '}
                      <span className="font-medium">{endItem}</span> of{' '}
                      <span className="font-medium">{pagination?.total || 0}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[var(--border-color)] bg-white text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <i className="fi fi-rr-arrow-left h-4 w-4" />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show pages around current page
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                                : 'bg-white border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[var(--border-color)] bg-white text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <i className="fi fi-rr-arrow-right h-4 w-4" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Retailer Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center">
              <h3 className="text-lg font-medium text-[var(--text-primary)]">Add New Retailer</h3>
              <button
                title="Close"
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <i className="fi fi-rr-cross h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={(e) => {
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
                  zipCode: formData.get('pincode') as string,
                  gst: formData.get('gstNumber') as string || undefined,
                  pan: formData.get('panNumber') as string || undefined,
                };
                handleCreateRetailer(retailerData);
              }}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="name" className="block text-sm font-medium text-[var(--text-primary)]">
                      Retailer Name <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="block w-full rounded-md border-[var(--border-color)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)]">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        className="block w-full rounded-md border-[var(--border-color)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-primary)]">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        required
                        className="block w-full rounded-md border-[var(--border-color)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="gstNumber" className="block text-sm font-medium text-[var(--text-primary)]">
                      GST Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="gstNumber"
                        id="gstNumber"
                        className="block w-full rounded-md border-[var(--border-color)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="address" className="block text-sm font-medium text-[var(--text-primary)]">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="address"
                        id="address"
                        required
                        className="block w-full rounded-md border-[var(--border-color)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="city" className="block text-sm font-medium text-[var(--text-primary)]">
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="city"
                        id="city"
                        required
                        className="block w-full rounded-md border-[var(--border-color)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="state" className="block text-sm font-medium text-[var(--text-primary)]">
                      State <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="state"
                        id="state"
                        required
                        className="block w-full rounded-md border-[var(--border-color)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="pincode" className="block text-sm font-medium text-[var(--text-primary)]">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="pincode"
                        id="pincode"
                        required
                        className="block w-full rounded-md border-[var(--border-color)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="country" className="block text-sm font-medium text-[var(--text-primary)]">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="country"
                        id="country"
                        required
                        defaultValue="India"
                        className="block w-full rounded-md border-[var(--border-color)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="panNumber" className="block text-sm font-medium text-[var(--text-primary)]">
                      PAN Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="panNumber"
                        id="panNumber"
                        className="block w-full rounded-md border-[var(--border-color)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-[var(--border-color)] rounded-md shadow-sm text-sm font-medium text-[var(--text-primary)] bg-white hover:bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
                  >
                    {status === 'loading' ? 'Saving...' : 'Save Retailer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </FullLayout>
  );
}
