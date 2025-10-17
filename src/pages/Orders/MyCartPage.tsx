import { useState, useEffect } from 'react';
import { FullLayout } from '../../layouts/AppLayout';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store';
import { createOrder, resetStatus } from '../../store/slices/ordersSlice';
import { getRetailerByOwnerId } from '../../store/slices/retailersSlice';

interface CartItem extends Product {
  name: string;
  price: number; // Ensure price is defined in the CartItem interface
}

type CartItems = Record<string, CartItem>;

interface DeliveryAddress {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: string;
  longitude: string;
}

export function MyCartPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [cart, setCart] = useState<CartItems>(JSON.parse(localStorage.getItem('cart') || '{}'));
  const [filteredItems, setFilteredItems] = useState<CartItems>(JSON.parse(localStorage.getItem('cart') || '{}'));
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: ''
  });
  
  const { user } = useAppSelector((state) => state.auth);
  const { status, error } = useAppSelector((state) => state.orders);
  const { retailer } = useAppSelector((state) => state.retailers);

  // Update filtered items when cart items change
  useEffect(() => {
    setFilteredItems(cart);
    if (user && user?.role === "retailer") {
      dispatch(getRetailerByOwnerId(user?._id || ""))
    }
  }, [cart, dispatch, user]);
 
  // Load cart items from localStorage on component mount is already handled by the first useEffect

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryAddress.address || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode) {
      alert('Please fill in all required address fields');
      return;
    }
    
    // If lat/long are not provided, try to geocode the address
    if (!deliveryAddress.latitude || !deliveryAddress.longitude) {
      // You can add geocoding logic here if needed
      // For now, we'll just set some default values
      setDeliveryAddress(prev => ({
        ...prev,
        latitude: '0',
        longitude: '0'
      }));
    }
    
    setShowAddressForm(false);
  };

  const handleOrderPlacement = () => {
    // if (!deliveryAddress.address || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode) {
    //   setShowAddressForm(true);
    //   return;
    // }
    const products = Object.entries(filteredItems)?.map(([id, product]) => ({
      productId: id,
      ...product,
    }));

    if (user?.role === "retailer" && retailer) {
      const totalAmount = Object.keys(cart).reduce((total, productId) => {
        return total + ((cart[productId].orderQuantity || 0) * (cart[productId].ptr || 0));
      }, 0);

      dispatch(createOrder({
        userId: user?._id || "",
        username: user?.username || "",
        totalAmount: totalAmount,
        paymentMethod: "online", // Default payment method
        deliveryAddress: {
          address: deliveryAddress.address || retailer.address,
          city: deliveryAddress.city || retailer.city,
          state: deliveryAddress.state || retailer.state,
          zipCode: deliveryAddress.zipCode || retailer.zipCode,
          latitude: deliveryAddress.latitude || retailer.latitude || '0',
          longitude: deliveryAddress.longitude || retailer.longitude || '0'
        },
        products: products,
        retailerId: retailer?._id || "",
        retailerName: retailer?.name || "",
        retailerEmail: retailer?.email || "",
        notes: ""
      }));
    }
    
  };
  
  useEffect(() => {
    if (status == "succeeded") {
      console.log("status: ", status);
      dispatch(resetStatus());
      localStorage.setItem("cart", "");
      setCart(JSON.parse(localStorage.getItem('cart') || '{}'));
      navigate("/products");
    }
  }, [navigate, dispatch, status]);


  const Footer = () => {
    if (Object.keys(cart).length === 0) return null;
    return (
      <div className="bg-green2 flex justify-between items-center p-4 rounded-t-2xl">
         <div className="">
          <p className="text-xs font-semibold text-white">Total Amount</p>
          <p className="text-lg font-semibold text-white">
            ₹ {Number(Object.keys(cart).reduce((total, productId) => total + ((cart[productId].orderQuantity || 0) * (cart[productId].ptr || 0)), 0) + 50 + Object.keys(cart).reduce((total, productId) => total + ((cart[productId].orderQuantity || 0) * (cart[productId].ptr || 0) * 0.05), 0)).toFixed(2)}
          </p>
          <p className="text-xs text-gray-200">{Object.keys(cart).length} Products added to cart</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-transparent rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={handleOrderPlacement}
          >
            Place Order
          </button>
        </div>
      </div>
    );
  };

  const AddressForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Delivery Address</h3>
        <form onSubmit={handleAddressSubmit} className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              id="address"
              value={deliveryAddress.address}
              onChange={(e) => setDeliveryAddress({...deliveryAddress, address: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                id="city"
                value={deliveryAddress.city}
                onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                id="state"
                value={deliveryAddress.state}
                onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700">ZIP Code</label>
            <input
              type="text"
              id="zipcode"
              value={deliveryAddress.zipCode}
              onChange={(e) => setDeliveryAddress({...deliveryAddress, zipCode: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude</label>
              <input
                type="text"
                id="latitude"
                value={deliveryAddress.latitude}
                onChange={(e) => setDeliveryAddress({...deliveryAddress, latitude: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., 12.9716"
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude</label>
              <input
                type="text"
                id="longitude"
                value={deliveryAddress.longitude}
                onChange={(e) => setDeliveryAddress({...deliveryAddress, longitude: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., 77.5946"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowAddressForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-violet border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <FullLayout footer={Footer()}>
      {showAddressForm && <AddressForm />}
      <div className="h-screen">
        <div className="px-4 py-2 bg-white">
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
                  Checkout
                </span>
              </button>
              
              <div className="flex gap-2 items-center">
                <span className="relative rounded-full bg-gray-100 p-2 cursor-pointer" onClick={() => navigate("/cart")}>
                  <i className="fi fi-br-interrogation text-gray-500 flex items-center" />
                </span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Cart items */}
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
        ) : Object.keys(filteredItems).length === 0 ? (
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
              Explore our wide range of products and place your order...
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
              >
                <i className="fi fi-rr-plus h-4 w-4 flex items-center text-[var(--text-secondary)]" />
                Go Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="p-2 overflow-y-auto h-screen pb-20">
            <div className="rounded-2xl border bg-white p-2">
              <div className="flex items-center justify-between p-2 border-b border-dotted">
                <h1 className="font-semibold text-lg">Added Products</h1>
                <p className="text-xs font-semibold text-gray-500 cursor-pointer">Remove All</p>
              </div>
              <div className="">
                {Object.entries(filteredItems).map(([id, product]) => (
                  <div
                    key={id}
                    className="grid grid-cols-7 border-b p-2 border-dotted"
                  >
                    <div
                      className="col-span-1"
                      onClick={() => navigate(`/products/${id}`)}
                    >
                      <img src={product.images[0]} alt={product.name} />
                    </div>
                    <div className="col-span-3 flex items-center">
                      <h1 className="text-sm font-semibold">{product.name}</h1>
                    </div>
                    <div className="col-span-2 p-1">
                      <div className="bg-violet rounded-full p-2">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            className="h-5 w-5 text-sm font-bold text-violet flex items-center justify-center bg-white border border-transparent rounded-full shadow-sm hover:bg-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-violet"
                            // onClick={() => handleRemoveFromCart(product)}
                            disabled={cart[product._id]?.orderQuantity === 1}
                          >
                            -
                          </button>
                          <span className="text-sm font-bold text-white">{cart[product._id]?.orderQuantity}</span>
                          <button
                            type="button"
                            className="h-5 w-5 text-sm font-bold text-violet flex items-center justify-center bg-white border border-transparent rounded-full shadow-sm hover:bg-white focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-violet"
                            // onClick={() => handleAddToCart(product, 1)}
                            disabled={cart[product._id]?.orderQuantity === product?.unitQuantity}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <p className="text-xs font-semibold text-violet">₹ {(cart[product._id]?.orderQuantity || 0) * (cart[product._id]?.ptr || 0)}</p>
                    </div>  
                  </div>
                ))}
              </div>
            </div>

            <div className="my-2 bg-white border rounded-2xl">
              <div className="flex items-center justify-between p-4">
                <p className="text-sm ">Missed Something?</p>
                <p className="text-sm text-violet font-semibold">
                  Add More {"  >"}
                </p>
              </div>
            </div>
            <div className="px-2 py-2">
              <h1 className="text-sm font-semibold">Add Similar Items</h1>
              <div className="flex items-center gap-2 overflow-x-auto max-w-screen">
                {}
                <div className="">

                </div>
              </div>

            </div>
            <div className="my-2 bg-white border rounded-2xl">
              <div className="flex items-center justify-between p-4">
                <p className="text-sm ">View Coupons & Offers</p>
                <p className="text-sm text-violet font-semibold">
                {"  >"}
                </p>
              </div>
            </div>

            <div className="my-2">
              <div className="rounded-2xl border bg-white p-2">
                <div className="p-2 flex items-center justify-between">
                  <h1 className="text-sm font-semibold">Bill Summary</h1>
                  <p className="text-sm font-bold">
                    ₹ {
                    Number(Object.keys(cart).reduce((total, productId) => total + ((cart[productId].orderQuantity || 0) * (cart[productId].ptr || 0)), 0).toFixed(2))
                    + Number(Object.keys(cart).reduce((total, productId) => total + ((cart[productId].orderQuantity || 0) * (cart[productId].ptr || 0) * 0.05), 0).toFixed(2))
                    + Number(50)
                    }

                  </p>
                </div>
                <div className="px-2 py-1 flex items-center justify-between">
                  <p className="text-xs text-gray-500">Item Total</p>
                  <p className="text-xs text-gray-500">₹ {Object.keys(cart).reduce((total, productId) => total + ((cart[productId].orderQuantity || 0) * (cart[productId].ptr || 0)), 0).toFixed(2)}</p>
                </div>
                <div className="px-2 py-1 flex items-center justify-between">
                  <p className="text-xs text-gray-500">Tax</p>
                  <p className="text-xs text-gray-500">5%</p>
                </div>
                <div className="px-2 py-1 flex items-center justify-between">
                  <p className="text-xs text-gray-500">Discount</p>
                  <p className="text-xs text-gray-500">N/A</p>
                </div>
                <div className="px-2 py-1 flex items-center justify-between">
                  <p className="text-xs text-gray-500">Delivery Charge</p>
                  <p className="text-xs text-gray-500">₹ 50</p>
                </div>
              </div>
            </div>

            <div className="my-2 bg-white border rounded-2xl">
              <div className="flex items-center justify-between p-4">
                <p className="text-sm ">Payment Mode</p>
                <p className="text-sm text-violet font-semibold">
                Credit {"  >"}
                </p>
              </div>
            </div>

            <div className="my-2 bg-white border rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Retailer's Location</p>
                {user?.role === 'retailer' && (
                  <button 
                    type="button" 
                    onClick={() => setShowAddressForm(true)}
                    className="text-xs text-violet font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {retailer?.address ? (
                  <>
                    <p>{retailer.address}</p>
                    <p>{retailer.city}, {retailer.state} - {retailer.zipCode}</p>
                    {retailer.phone && <p className="mt-1">Phone: {retailer.phone}</p>}
                  </>
                ) : user?.role === 'retailer' ? (
                  <p className="text-amber-600">Please update your store location details in your profile.</p>
                ) : (
                  <p>No location details available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    
    </FullLayout>
  );
}
