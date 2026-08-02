import React, { useState, useEffect } from 'react';
import { getCart, updateCartItem, removeCartItem, clearCart } from '../services/api';

export default function Cart({ onCartUpdate, onNavigate }) {
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const cartData = await getCart();
      setItems(cartData.items || []);
      setSubtotal(cartData.subtotal ? parseFloat(cartData.subtotal) : 0);
      setTotal(cartData.total ? parseFloat(cartData.total) : 0);
    } catch (err) {
      console.error('Error loading cart:', err);
      setError(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, change) => {
    try {
      const item = items.find(i => i.id === cartItemId);
      if (!item) return;
      
      const newQuantity = Math.max(1, item.quantity + change);
      const cartData = await updateCartItem(cartItemId, newQuantity);
      setItems(cartData.items || []);
      setSubtotal(cartData.subtotal ? parseFloat(cartData.subtotal) : 0);
      setTotal(cartData.total ? parseFloat(cartData.total) : 0);
      
      // Update cart count in header
      if (onCartUpdate) {
        onCartUpdate();
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError(err.message || 'Failed to update quantity');
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await removeCartItem(cartItemId);
      await loadCart(); // Reload cart to get updated totals
      
      // Update cart count in header
      if (onCartUpdate) {
        onCartUpdate();
      }
    } catch (err) {
      console.error('Error removing item:', err);
      setError(err.message || 'Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setItems([]);
      setSubtotal(0);
      setTotal(0);
      
      // Update cart count in header
      if (onCartUpdate) {
        onCartUpdate();
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.message || 'Failed to clear cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-10 md:py-14 overflow-hidden">
        {/* Two light green colors background with wave-like curve */}
        <div className="absolute inset-0">
          {/* Base color - lighter green */}
          <div className="absolute inset-0 bg-fresh-green-50"></div>
          {/* Curved shape - darker green from bottom */}
          <div 
            className="absolute inset-0 bg-fresh-green-100" 
            style={{ 
              clipPath: 'ellipse(150% 80% at 50% 100%)',
            }}
          ></div>
        </div>
        
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          {/* Breadcrumb */}
          <nav className="mb-4">
            <ol className="flex items-center gap-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-fresh-green-600 transition-colors">Home</a></li>
              <li>/</li>
              <li className="text-gray-900 font-medium">Cart</li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-3">
            Your Shopping Cart
          </h1>
          <p className="text-lg text-gray-600">
            Review your selected items before checkout.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Cart Items */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fresh-green-600 mx-auto"></div>
                  <p className="text-gray-600 text-lg mt-4">Loading cart...</p>
                </div>
              ) : error ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <p className="text-red-600 text-lg mb-4">{error}</p>
                  <button onClick={loadCart} className="text-fresh-green-600 font-semibold hover:text-fresh-green-700">
                    Retry
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
                  <button 
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('shop');
                      }
                    }}
                    className="text-fresh-green-600 font-semibold hover:text-fresh-green-700"
                  >
                    ← Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  {/* Table Headers - Desktop */}
                  <div className="hidden md:grid grid-cols-12 gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div className="col-span-5">
                      <span className="text-sm font-semibold text-gray-700">Product</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-sm font-semibold text-gray-700">Price</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-sm font-semibold text-gray-700">Quantity</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-sm font-semibold text-gray-700">Subtotal</span>
                    </div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="bg-white rounded-xl p-4 shadow-md">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Product Info */}
                          <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src={(() => {
                                  // Use productImageUrl if available, otherwise productImagePath
                                  let imgUrl = item.productImageUrl || item.productImagePath;
                                  if (!imgUrl) {
                                    return 'http://localhost:8081/fresh-finds/api/v1/images/placeholder.jpg';
                                  }
                                  // If it's already a full URL, use it
                                  if (imgUrl.startsWith('http')) {
                                    return imgUrl;
                                  }
                                  // If it starts with /, prepend base URL
                                  if (imgUrl.startsWith('/')) {
                                    return `http://localhost:8081${imgUrl}`;
                                  }
                                  // Otherwise, assume it's a relative path
                                  return `http://localhost:8081/fresh-finds/api/v1/images/${imgUrl}`;
                                })()}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  e.target.src = 'http://localhost:8081/fresh-finds/api/v1/images/placeholder.jpg';
                                }}
                              />
                            </div>
                            <div>
                              {item.isOrganic && (
                                <span className="inline-block bg-gray-200 text-fresh-green-600 text-xs font-semibold px-2 py-1 rounded-full mb-1">
                                  ORGANIC
                                </span>
                              )}
                              <h3 className="font-bold text-gray-900">{item.productName}</h3>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="col-span-6 md:col-span-2 text-center">
                            <p className="text-gray-700 font-medium">₹{parseFloat(item.price).toFixed(2)}/{item.unit}</p>
                          </div>

                          {/* Quantity */}
                          <div className="col-span-6 md:col-span-2">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                                disabled={loading}
                              >
                                <span className="text-gray-600">−</span>
                              </button>
                              <span className="w-12 text-center font-semibold text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                                disabled={loading}
                              >
                                <span className="text-gray-600">+</span>
                              </button>
                            </div>
                          </div>

                          {/* Subtotal */}
                          <div className="col-span-12 md:col-span-2 text-center md:text-left">
                            <p className="text-fresh-green-600 font-bold">₹{parseFloat(item.subtotal).toFixed(2)}</p>
                          </div>

                          {/* Remove Button */}
                          <div className="col-span-12 md:col-span-1 flex justify-center md:justify-end">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              disabled={loading}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <button 
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate('shop');
                        }
                      }}
                      className="text-fresh-green-600 border-2 border-fresh-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-fresh-green-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Continue Shopping
                    </button>
                    <button
                      onClick={handleClearCart}
                      className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2"
                      disabled={loading}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear Cart
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-md sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Summary Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="text-fresh-green-600 font-semibold">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-fresh-green-600 font-bold text-lg">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                    />
                    <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>

                {/* Checkout Button */}
                <button 
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('checkout');
                    }
                  }}
                  disabled={items.length === 0 || loading}
                  className="w-full bg-fresh-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-fresh-green-700 transition-colors mb-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Trust Badges */}
                <div className="space-y-3 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-fresh-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-sm text-gray-600">Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-fresh-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">Freshness Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-fresh-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm text-gray-600">Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

