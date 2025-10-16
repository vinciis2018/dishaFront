import { useParams, useNavigate } from 'react-router-dom';
import { FullLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { useEffect, useState } from 'react';
import { getProductDetails, updateProduct } from '../../store/slices/productsSlice';
import { ProductForm } from '../../components/forms/ProductForm';
import type { ProductFormData } from '../../types';
import { toast } from 'react-toastify';

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [productQuantity, setProductQuantity] = useState(() => {
    return JSON.parse(localStorage.getItem('cart') || '{}')?.[id || '']?.orderQuantity || 1;
});

  const { product, status } = useAppSelector((state) => state.products);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem('cart') || '{}');
  });

  const { user } = useAppSelector((state) => state.auth);

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
    if (product) {
      console.log("asadd", productQuantity, cart[product._id].orderQuantity)
      if (!cartItemIds.includes(product._id) || productQuantity !== cart[product._id].orderQuantity) {
        const productToAdd = {...product, orderQuantity: productQuantity};
        console.log(productToAdd);
        cart[productToAdd?._id] = productToAdd;
        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Product added to cart');
      } else {
        navigate("/cart");
      }
    }
    setCart(JSON.parse(localStorage.getItem('cart') || '{}'));
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
              <i className="fi fi-sr-pencil h-5 w-5" />
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
          <i className="fi fi-sr-document-text mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No product found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">The requested product could not be found.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fi fi-sr-arrow-left -ml-1 mr-2 h-4 w-4" />
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
  
  const Footer = () => {
    return (
      <div className="flex justify-between items-center p-4 bg-white rounded-t-2xl">
        <div className="w-1/3">
          {/* Add quantity */}
          <div className="bg-violet rounded-full p-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="h-5 w-5 text-sm font-bold text-violet flex items-center justify-center bg-white border border-transparent rounded-full shadow-sm hover:bg-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-violet"
                onClick={() => setProductQuantity(productQuantity - 1)}
                disabled={productQuantity === 1}
              >
                -
              </button>
              <span className="text-sm font-bold text-white">{productQuantity}</span>
              <button
                type="button"
                className="h-5 w-5 text-sm font-bold text-violet flex items-center justify-center bg-white border border-transparent rounded-full shadow-sm hover:bg-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-violet"
                onClick={() => setProductQuantity(productQuantity + 1)}
                disabled={productQuantity === unitQuantity}
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-violet border border-transparent rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={handleAddToCart}
          >
            {Object.keys(cart).includes(product._id) && cart[product._id].orderQuantity == productQuantity ? "Checkout" : "Add To Cart"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <FullLayout footer={Footer()}>
      <div className="max-w-7xl mx-auto">
        <div className="px-4 py-2 bg-white">
          <div className="flex flex-row items-center justify-between gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <span className="rounded-full bg-gray-100 p-2 mr-1">
                <i className="fi fi-rr-arrow-left flex items-center" />
              </span>
              <span className="text-lg font-semibold">
                Product Details
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
                <span className="rounded-full bg-gray-100 p-2 cursor-pointer" onClick={() => setIsEditMode(true)}>
                  <i className="fi fi-sr-edit text-gray-500 flex items-center" />
                  </span>
              )}
            </div>
          </div>
        </div>

        <div className="h-screen overflow-y-auto py-2">
          {/* Main Content */}
          <div className="bg-white">
            <div className="">
              <img src={product.images[0]} alt="product" />
            </div>
            <div className="px-4">
              <div className="">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {name}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{formula}</p>
              </div>
              <div className="flex items-center gap-2 py-1">
                <p className="text-md font-semibold text-violet">PTR ₹ {product.ptr}</p>
                <p className="text-sm text-gray-500">MRP ₹ {product.mrp}</p>
              </div>
              <div className="py-1 space-y-1">
                <p className="text-xs text-gray-500">Pack Size</p>
                <p className="text-xs font-semibold text-gray-800">Description</p>
                <p className="text-xs text-gray-500 ">{product.description}</p>
              </div>
              <div className="py-1 space-y-1">
                <p className="text-xs font-semibold text-gray-800">Manufacturer</p>
                <p className="text-xs text-gray-500 ">{manufacturer}</p>
              </div>
              <div className="py-1 space-y-1">
                <p className="text-xs font-semibold text-gray-800">Stocks</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-1 py-1 space-y-1">
                    <p className="text-xs font-semibold text-gray-800">Available</p>
                    <p className="text-xs text-gray-500 ">{unitQuantity}</p>
                  </div>
                  <div className="col-span-1 py-1 space-y-1">
                    <p className="text-xs font-semibold text-gray-800">Min. Order Quantity</p>
                    <p className="text-xs text-gray-500 ">{minOrderQuantity}</p>
                  </div>
                </div>
              </div>
              <div className="py-1 space-y-1">
                <p className="text-xs font-semibold text-gray-800">Availability</p>
                <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {availability ? "Available" : "Not Available"}
                    </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FullLayout>
  );
}
