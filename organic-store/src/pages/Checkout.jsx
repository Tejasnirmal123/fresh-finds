import React, { useState, useEffect } from 'react';
import { getCart, createOrder, getUserProfile, API_BASE_URL } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Checkout({ onNavigate, onCartUpdate }) {
  const { user } = useAuth();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    deliveryInstructions: '',
  });

  useEffect(() => {
    loadCart();
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const userProfile = await getUserProfile();
      if (userProfile) {
        setFormData(prev => ({
          ...prev,
          firstName: userProfile.firstName || prev.firstName || '',
          lastName: userProfile.lastName || prev.lastName || '',
          email: userProfile.email || prev.email || '',
          phone: userProfile.phone || prev.phone || '',
          addressLine1: userProfile.addressLine1 || prev.addressLine1 || '',
          addressLine2: userProfile.addressLine2 || prev.addressLine2 || '',
          city: userProfile.city || prev.city || '',
          state: userProfile.state || prev.state || '',
          zipCode: userProfile.zipCode || prev.zipCode || '',
          country: userProfile.country || prev.country || 'India',
        }));
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      // If profile fetch fails, at least try to use basic user info
      if (user) {
        setFormData(prev => ({
          ...prev,
          firstName: user.firstName || prev.firstName || '',
          lastName: user.lastName || prev.lastName || '',
          email: user.email || prev.email || '',
        }));
      }
    }
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCart();
      setCartData(data);
      
      // Redirect to cart if cart is empty
      if (!data.items || data.items.length === 0) {
        if (onNavigate) {
          onNavigate('cart');
        }
      }
    } catch (err) {
      console.error('Error loading cart:', err);
      setError(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const orderData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        deliveryInstructions: formData.deliveryInstructions,
      };

      console.log('Submitting order with data:', orderData);
      const order = await createOrder(orderData);
      console.log('Order created successfully:', order);
      
      // Update cart count (cart is cleared after order creation)
      if (onCartUpdate) {
        onCartUpdate();
      }
      
      // Navigate to order success page with order data
      console.log('Navigating to order-success page with order data:', order);
      if (onNavigate) {
        onNavigate('order-success', { orderData: order });
      } else {
        console.error('onNavigate is not available');
        setError('Navigation failed. Please refresh the page.');
        setSubmitting(false);
        return;
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message || 'Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fresh-green-600"></div>
      </div>
    );
  }

  if (error || !cartData || !cartData.items || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Your cart is empty'}</p>
          <button
            onClick={() => onNavigate && onNavigate('cart')}
            className="text-fresh-green-600 font-semibold hover:text-fresh-green-700"
          >
            ← Back to Cart
          </button>
        </div>
      </div>
    );
  }

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
              <li><button onClick={() => onNavigate && onNavigate('home')} className="hover:text-fresh-green-600 transition-colors">Home</button></li>
              <li>/</li>
              <li><button onClick={() => onNavigate && onNavigate('cart')} className="hover:text-fresh-green-600 transition-colors">Cart</button></li>
              <li>/</li>
              <li className="text-gray-900 font-medium">Checkout</li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-3">
            Checkout
          </h1>
          <p className="text-lg text-gray-600">
            Please provide your delivery details to complete your order.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-md mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Information</h2>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  {/* Address Line 1 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                      placeholder="House/Flat No., Building Name"
                    />
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                      placeholder="Street, Area, Landmark (Optional)"
                    />
                  </div>

                  {/* City, State, Zip */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{6}"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                        placeholder="400001"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                      placeholder="India"
                    />
                  </div>

                  {/* Delivery Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Instructions
                    </label>
                    <textarea
                      name="deliveryInstructions"
                      value={formData.deliveryInstructions}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600 resize-none"
                      placeholder="Any special instructions for delivery (Optional)"
                    ></textarea>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('cart')}
                      className="text-fresh-green-600 border-2 border-fresh-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-fresh-green-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Cart
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-fresh-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-fresh-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Placing Order...
                        </>
                      ) : (
                        <>
                          Place Order
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-md sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Cart Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cartData.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={(() => {
                            let imgUrl = item.productImageUrl || item.productImagePath;
                            if (!imgUrl) return `${API_BASE_URL}/images/placeholder.jpg`;
                            if (imgUrl.startsWith('http')) return imgUrl;
                            if (imgUrl.startsWith('/')) return `${API_BASE_URL}${imgUrl}`;
                            return `${API_BASE_URL}/images/${imgUrl}`;
                          })()}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const currentSrc = e.target.src;
                            if (currentSrc.includes('placeholder.jpg')) {
                              const parent = e.target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">No Image</div>';
                              }
                            } else {
                              e.target.onerror = null;
                              e.target.src = `${API_BASE_URL}/images/placeholder.jpg`;
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{item.productName}</h3>
                        <p className="text-gray-600 text-xs">Qty: {item.quantity} × ₹{parseFloat(item.price).toFixed(2)}</p>
                      </div>
                      <div className="text-fresh-green-600 font-semibold text-sm">
                        ₹{parseFloat(item.subtotal).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Details */}
                <div className="space-y-3 mb-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{cartData.subtotal ? parseFloat(cartData.subtotal).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="text-fresh-green-600 font-semibold">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-fresh-green-600 font-bold text-lg">₹{cartData.total ? parseFloat(cartData.total).toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                </div>

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

