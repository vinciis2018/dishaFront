import { useEffect, useState } from 'react';
import { FullLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { createProduct, getAllProducts } from '../../store/slices/productsSlice';
import type { Product, ProductFormData } from '../../types';
import type { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { ProductForm } from '../../components/forms/ProductForm';

export function ProductsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openQuantityAdd, setOpenQuantityAdd] = useState<string[]>([]);
  // Add this near your other state declarations
  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem('cart') || '{}');
  });

  const itemsPerPage = 10;
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { 
    products, 
    status, 
    error, 
    pagination 
  } = useAppSelector((state: RootState) => state.products);

  const { user } = useAppSelector((state: RootState) => state.auth);
  // Debounced search
  const debouncedSearch = useDebouncedCallback(
    (search: string) => {
      setCurrentPage(1);
      dispatch(getAllProducts({ page: 1, limit: itemsPerPage, search }));
    },
    300 // 300ms delay
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Clear search - used in the clear button click handler

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    dispatch(getAllProducts({ 
      page, 
      limit: itemsPerPage, 
      search: searchTerm 
    }));
  };

  // Handle create product
  const handleCreateProduct = async (productData: ProductFormData) => {
    try {
      await dispatch(
        createProduct({
          name: productData.name,
          formula: productData.formula,
          images: productData.images,
          manufacturer: productData.manufacturer,
          unitQuantity: productData.unitQuantity,
          availability: productData.availability,
          minOrderQuantity: productData.minOrderQuantity
        })
      ).unwrap();
      
      // Close the form and refresh the products list
      setIsFormOpen(false);
      dispatch(getAllProducts({ page: currentPage, limit: itemsPerPage, search: searchTerm }));
    } catch (err) {
      console.error('Failed to create product:', err);
    }
  };


  // Calculate pagination values
  const totalPages = pagination?.totalPages || 1;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, pagination?.total || products.length);

  // Initial data load
  useEffect(() => {
    dispatch(getAllProducts({ page: currentPage, limit: itemsPerPage, search: searchTerm }));
  }, [dispatch, currentPage, itemsPerPage, searchTerm]);


  const updateCart = (newCart: Record<string, unknown>) => {
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const handleAddToCart = (prod: Product, quantity= 1) => {
    const newCart = { ...cart };
    if (newCart[prod._id]) {
      newCart[prod._id].orderQuantity += quantity;
    } else {
      newCart[prod._id] = {
        ...prod,
        orderQuantity: quantity,
        retailerId: user?._id,
        retailerName: user?.username,
        retailerEmail: user?.email
      };
    }
    updateCart(newCart);
  }

  const handleRemoveFromCart = (prod: Product) => {
    const newCart = { ...cart };
    if (newCart[prod._id]) {
      if (newCart[prod._id].orderQuantity <= 1) {
        delete newCart[prod._id];
        setOpenQuantityAdd((prev) => {
          if (prev.includes(prod._id)) {
            return prev.filter((id) => id !== prod._id);
          } else {
            return prev;
          }
        });
      } else {
        newCart[prod._id].orderQuantity -= 1;
      }
      updateCart(newCart);
    }
  }

  const Footer = () => {
    if (Object.keys(cart).length === 0) return null;
    return (
      <div className="bg-green2 flex justify-between items-center p-4 rounded-t-2xl">
        <div className="">
          <p className="text-xs font-semibold text-white">Total Amount</p>
          <p className="text-lg font-semibold text-white">₹ {Object.keys(cart).reduce((total, productId) => total + ((cart[productId].orderQuantity || 0) * (cart[productId].ptr || 0)), 0).toFixed(2)}</p>
          <p className="text-xs text-gray-200">{Object.keys(cart).length} Products added to cart</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-transparent rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => {
              updateCart(cart);
              alert('Products added to cart');
              navigate("/cart");
            }}
          >
            Checkout
          </button>
        </div>
      </div>
    );
  };


  return (
    <FullLayout footer={Footer()}>
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
                  Products
                </span>
              </button>
              <div className="flex gap-2 items-center">
                <span className="relative rounded-full bg-gray-100 p-2 cursor-pointer" onClick={() => navigate("/cart")}>
                  {Object.keys(cart)?.length > 0 && (
                    <div className="h-4 w-4 absolute -top-1 -right-1 bg-green2 rounded-full text-xs text-white flex items-center justify-center">{Object.keys(cart)?.length}</div>
                  )}
                  <i className="fi fi-sr-shopping-bag text-gray-500 flex items-center" />
                </span>
                {user?.role === "admin" && (
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
                      dispatch(getAllProducts({ page: 1, limit: itemsPerPage }));
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

              
        {/* Products list */}
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
                  {error || 'Failed to load products. Please try again.'}
                </p>
              </div>
            </div>
          </div>
        ) : products.length === 0 ? (
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
            <h3 className="mt-2 text-sm font-medium text-[var(--text-primary)]">No products</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Get started by creating a new product.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
              >
                <i className="fi fi-rr-plus h-4 w-4 flex items-center text-[var(--text-secondary)]" />
                New Product
              </button>
            </div>
          </div>
        ) : (
          <div className="p-2">
            <div className="">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="my-1 bg-white overflow-hidden shadow rounded-2xl hover:shadow-md transition-shadow duration-200 cursor-pointer border border-[var(--border-color)]"
                >
                  <div className="p-4 flex gap-2 justify-between h-full">
                    <div
                      className="" 
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      <div className="truncate pb-1">
                        <h3 className="text-md font-semibold text-[var(--text-primary)]">{product.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{product.formula}</p>
                      </div>
                      <div className="flex items-center gap-2 py-1">
                        <div className='border rounded-full p-2 flex items-center gap-2'>
                          <p className="text-xs text-gray-500">Pack Size</p>
                          <i className="fi fi-rr-angle-small-down h-4 w-4 flex items-center" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <p className="text-md font-semibold text-violet">PTR ₹ {product.ptr}</p>
                        <p className="text-sm text-gray-500">MRP ₹ {product.mrp}</p>
                      </div>
                    </div>
                    <div className="h-full">
                      <div className="h-4/5 flex items-center bg-gray-200 rounded-xl ">
                        <img className="h-full rounded-md" src={product.images[0]} alt="product" />
                      </div>
                      <div className="-mt-4 mx-2">
                        {openQuantityAdd.includes(product._id) || cart[product._id] ? (
                          <div className="bg-violet rounded-full p-2">
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                className="h-5 w-5 text-sm font-bold text-violet flex items-center justify-center bg-white border border-transparent rounded-full shadow-sm hover:bg-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-violet"
                                onClick={() => handleRemoveFromCart(product)}
                                disabled={cart[product._id]?.orderQuantity === 0}
                              >
                                -
                              </button>
                              <span className="text-sm font-bold text-white">{cart[product._id]?.orderQuantity}</span>
                              <button
                                type="button"
                                className="h-5 w-5 text-sm font-bold text-violet flex items-center justify-center bg-white border border-transparent rounded-full shadow-sm hover:bg-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-violet"
                                onClick={() => handleAddToCart(product, 1)}
                                disabled={cart[product._id]?.orderQuantity === product?.unitQuantity}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="w-full rounded-full flex items-center justify-center bg-violet text-white font-semibold p-2"
                            onClick={() => {
                              handleAddToCart(product, 1);
                              setOpenQuantityAdd((prev) => {
                                if (prev.includes(product._id)) {
                                  return prev;
                                } else {
                                  return [...prev, product._id];
                                }
                              });
                            }}
                          >
                            Add
                          </button>
                        )}
                        
                      </div>
                    </div>
                      
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-[var(--border-color)] text-sm font-medium rounded-md text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-[var(--border-color)] text-sm font-medium rounded-md text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Showing <span className="font-medium">{startItem}</span> to{' '}
                      <span className="font-medium">{endItem}</span> of{' '}
                      <span className="font-medium">{pagination?.total || products.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                                : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateProduct}
        isLoading={status === 'loading'}
      />
    </FullLayout>
  );
}
