import { useEffect, useState } from 'react';
import { FullLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { createRetailer, getAllRetailers } from '../../store/slices/retailersSlice';
import type { RetailerFormData } from '../../types';
import type { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { RetailerForm } from '../../components/forms/RetailerForm';

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

  const { user } = useAppSelector((state: RootState) => state.auth);

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
      rte: user?.role === "rte" ? user?._id : null,
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
      return true; // Return true to indicate success
    } catch (err) {
      console.error('Failed to create retailer:', err);
      return false; // Return false to indicate failure
    }
  };

  // Calculate pagination values
  const totalPages = pagination?.totalPages || 1;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, pagination?.total || retailers.length);

  // Initial data load
  useEffect(() => {
    dispatch(getAllRetailers({
      rte: user?.role === "rte" ? user?._id : null,
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm
    }));
  }, [dispatch, currentPage, itemsPerPage, searchTerm, user?.role, user?._id]);

  return (
    <FullLayout>
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
                  Retailers
                </span>
              </button>
              <div className="flex gap-2 items-center">
                {user?.role === "rte" && (
                  <span className="rounded-full bg-gray-100 p-2 cursor-pointer" onClick={() => setIsFormOpen(true)}>
                    <i className="fi fi-sr-plus text-gray-500 flex items-center" />
                  </span>
                )}
                
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
                  placeholder="Search retailers..."
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
          <div className="p-2">
            <div className="">
              {retailers.map((retailer) => (
                <div
                  key={retailer._id}
                  
                  className="my-1 p-2 bg-white overflow-hidden shadow rounded-2xl hover:shadow-md transition-shadow duration-200 cursor-pointer border border-[var(--border-color)]"
                >
                  <div className="p-2 grid grid-cols-12 gap-2 h-full border-b border-dotted" onClick={() => navigate(`/retailers/${retailer._id}`)}>
                    <div className="col-span-3 h-full">
                      {retailer?.images && retailer?.images?.length > 0 && (
                        <div className="h-full flex items-center bg-gray-200 rounded-xl ">
                          <img className="h-full rounded-md" src={retailer.images[0]} alt="product" />
                        </div>
                      )}
                    </div>
                    <div className="col-span-8" >
                      <div className="truncate pb-1">
                        <h3 className="text-md font-semibold text-[var(--text-primary)]">{retailer.name}</h3>
                        <p className="text-xs text-gray-500 truncate">Owner: {retailer.ownerName}</p>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <i className="fi fi-rr-marker flex items-center text-md text-violet"></i>
                        <p className="text-sm text-gray-500 truncate">{retailer.address}</p>
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <i className="fi fi-rr-angle-right flex items-center text-md text-violet"></i>
                    </div>
                  </div>
                  <div className="p-2 flex items-center gap-2">
                      <i className="fi fi-rr-shopping-cart flex items-center text-md text-violet"></i>
                      <p className="text-sm text-gray-500">{retailer.ordersPlaced?.length || 0} orders placed</p>
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
      <RetailerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateRetailer}
        isLoading={status === 'loading'}
      />
    </FullLayout>
  );
}
