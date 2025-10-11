import { useParams, useNavigate } from 'react-router-dom';
import { FullLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { ArrowLeftIcon, DocumentTextIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { getProductDetails, updateProduct } from '../../store/slices/productsSlice';
import { ProductForm } from '../../components/forms/ProductForm';
import type { ProductFormData } from '../../types';
import { toast } from 'react-toastify';

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { product, status } = useAppSelector((state) => state.products);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getProductDetails(id));
    }
  }, [dispatch, id]);

  const handleUpdateProduct = async (formData: ProductFormData) => {
    if (id) {
      console.log(id)
      try {
        setIsSubmitting(true);
        const resultAction = await dispatch(updateProduct({ id, productData: formData }));
        if (updateProduct.fulfilled.match(resultAction)) {
          toast.success('Product updated successfully');
          setIsEditMode(false);
          // Refresh product details
          dispatch(getProductDetails(id));
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

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    const cartItemIds = Object.keys(cart);
    console.log(cartItemIds);
    console.log(product?._id)
    if (product && !cartItemIds.includes(product?._id)) {
      cart[product?._id] = product;
      localStorage.setItem('cart', JSON.stringify(cart));
    }
      
    alert('Product added to cart');
  };

  if (isEditMode && product) {
    return (
      <FullLayout>
        <div className="p-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Product</h2>
            <button
              type="button"
              onClick={() => setIsEditMode(true)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Edit product details"
              aria-label="Edit product details"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          </div>
          <ProductForm
            isOpen={isEditMode}
            onClose={() => setIsEditMode(false)}
            onSubmit={handleUpdateProduct}
            initialData={{
              name: product.name,
              formula: product.formula || 'calcium carbonate',
              images: product.images || [],
              manufacturer: product.manufacturer || 'ekum',
              unitQuantity: product.unitQuantity || 10,
              availability: product.availability || true,
              minOrderQuantity: product.minOrderQuantity || 10,
            }}
            isLoading={isSubmitting}
          />
        </div>
      </FullLayout>
    );
  }

  if (!product) {
    return (
      <FullLayout>
        <div className="p-8 text-center">
          <p>Loading product details...</p>
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

  if (!product) {
    return (
      <FullLayout>
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No product found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">The requested product could not be found.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-4 w-4" />
              Back to Products
            </button>
          </div>
        </div>
      </FullLayout>
    );
  }

  const { name, formula,
    // images,
    manufacturer, unitQuantity, availability, minOrderQuantity 
  } = product;
  
  return (
    <FullLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Products
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setIsEditMode(true)}
              type="button"
            >
              Edit Product
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleAddToCart}
            >
              Add To Cart
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          {/* Main Content */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Campaign Info */}
              <div className="md:col-span-2 space-y-8">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {name}
                      </h1>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{formula}</p>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Location Details */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-3">
                        Manufacturer
                      </h3>
                      <div className="space-y-3">
                        {manufacturer}
                      </div>
                    </div>

                    {/* Product Information */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-3">
                        Availability
                      </h3>
                      <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {availability ? "Available" : "Not Available"}
                          </p>
                      </div>
                    </div>

                    {/* Coordinates */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-3">
                        Stocks
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {unitQuantity}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Min Order Quantity</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {minOrderQuantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Images */}
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FullLayout>
  );
}
