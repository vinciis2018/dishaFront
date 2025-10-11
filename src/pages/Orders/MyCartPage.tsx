import { useState, useEffect } from 'react';
import { FullLayout } from '../../layouts/AppLayout';
import { useNavigate } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import type { Product } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store';
import { createOrder } from '../../store/slices/ordersSlice';

interface CartItem extends Product {
  name: string;
  quantity: number;
  price: number; // Ensure price is defined in the CartItem interface
}

type CartItems = Record<string, CartItem>;

export function MyCartPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<CartItems>({});
  const [filteredItems, setFilteredItems] = useState<CartItems>({});
  
  const { user } = useAppSelector((state) => state.auth);

  const { status } = useAppSelector((state) => state.orders);

  // Load cart items from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        setFilteredItems(parsedCart);
      } catch (error) {
        console.error('Error parsing cart data:', error);
      }
    }
  }, []);

  // Update filtered items when cart items change
  useEffect(() => {
    setFilteredItems(cartItems);
  }, [cartItems]);
  // Debounced search
  const debouncedSearch = useDebouncedCallback(
    (search: string) => {
      if (search.trim() === '') {
        setFilteredItems(cartItems);
      } else {
        // Filter cart items based on search term (case-insensitive)
        const filtered = Object.entries(cartItems).reduce((acc, [key, item]) => {
          if (
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            (item.formula && item.formula.toLowerCase().includes(search.toLowerCase()))
          ) {
            acc[key] = item;
          }
          return acc;
        }, {} as CartItems);
        
        setFilteredItems(filtered);
      }
    },
    300 // 300ms delay
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === '') {
      setFilteredItems(cartItems);
    } else {
      debouncedSearch(value);
    }
  };

  // Clear search and reset filtered items
  const clearSearch = () => {
    setSearchTerm('');
    setFilteredItems(cartItems);
  };

  // Load cart items from localStorage on component mount is already handled by the first useEffect

  const handleOrderPlacement = () => {
    console.log('Order placed');
    const products = Object.entries(filteredItems)?.map(([id, product]) => ({
      productId: id,
      ...product,
    }));

    dispatch(createOrder({
      userId: user?._id || "",
      username: user?.username || "",
      totalAmount: 0,
      paymentMethod: "",
      deliveryAddress: {
        address: "",
        state: "",
        city: "",
        street: "",
        pincode: "",
      },
      products: products, 
    }))
  };
  
  useEffect(() => {
    if (status == "succeeded") {
      console.log("status: ", status);
      localStorage.setItem("cart", "");
      navigate("/products");
    }
  }, [navigate, status]);
  return (
    <FullLayout>
      <div className="p-4 bg-[var(--background-alt)]">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">My Cart</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              A list of all the products in your cart.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleOrderPlacement}
            >
              Place Order
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-10 py-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent sm:text-sm"
              />
              {searchTerm && (
                <button
                  title="Clear search"
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <i className="fi fi-rr-xmark h-4 w-4 flex items-center text-[var(--text-secondary)]" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products list */}
        {Object.keys(filteredItems).length === 0 ? (
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
              Add products to your cart.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-secondary)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-secondary)]"
              >
                <i className="fi fi-rr-plus h-4 w-4 flex items-center text-[var(--text-secondary)]" />
                Go Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(filteredItems).map(([id, product]) => (
                <div
                  key={id}
                  onClick={() => navigate(`/products/${id}`)}
                  className="bg-[var(--bg-secondary)] overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer border border-[var(--border-color)]"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-[var(--color-primary)] rounded-md p-3">
                        <svg
                          className="h-6 w-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-[var(--text-primary)]">{product.name}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{product.formula}</p>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                          Quantity: {product.quantity} | 
                          Price: INR{(product.price * product.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    
    </FullLayout>
  );
}
