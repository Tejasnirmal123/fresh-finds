import React, { useState, useEffect } from 'react';
import { getUserOrders } from '../services/api';

export default function OrderHistory({ onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserOrders();
      setOrders(data || []);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusBadgeColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="relative py-10 md:py-14 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-fresh-green-50"></div>
            <div
              className="absolute inset-0 bg-fresh-green-100"
              style={{
                clipPath: 'ellipse(150% 80% at 50% 100%)',
              }}
            ></div>
          </div>
          <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fresh-green-600"></div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="relative py-10 md:py-14 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-fresh-green-50"></div>
            <div
              className="absolute inset-0 bg-fresh-green-100"
              style={{
                clipPath: 'ellipse(150% 80% at 50% 100%)',
              }}
            ></div>
          </div>
          <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadOrders}
                className="text-fresh-green-600 font-semibold hover:text-fresh-green-700"
              >
                Retry
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-10 md:py-14 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-fresh-green-50"></div>
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
              <li>
                <button onClick={() => onNavigate && onNavigate('home')} className="hover:text-fresh-green-600 transition-colors">
                  Home
                </button>
              </li>
              <li>/</li>
              <li className="text-gray-900 font-medium">Order History</li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-3">
            My Orders
          </h1>
          <p className="text-lg text-gray-600">
            View and track all your past orders.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-md">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 text-lg mb-4">No orders found</p>
              <button
                onClick={() => onNavigate && onNavigate('shop')}
                className="text-fresh-green-600 font-semibold hover:text-fresh-green-700"
              >
                Start Shopping →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(order.status)}`}>
                            {order.status || 'PENDING'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadgeColor(order.paymentStatus)}`}>
                            {order.paymentStatus || 'PENDING'}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Placed on:</span> {formatDate(order.createdAt)}
                          </p>
                          <p>
                            <span className="font-medium">Items:</span> {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="text-right">
                        <div className="mb-2">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold text-fresh-green-600">
                            ₹{order.total ? parseFloat(order.total).toFixed(2) : '0.00'}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                          className="text-fresh-green-600 hover:text-fresh-green-700 font-semibold text-sm flex items-center gap-1 md:ml-auto"
                        >
                          {selectedOrder === order.id ? 'Hide' : 'View'} Details
                          <svg
                            className={`w-4 h-4 transition-transform ${selectedOrder === order.id ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Order Details */}
                    {selectedOrder === order.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Shipping Address */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-3">Shipping Address</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>{order.customerFirstName} {order.customerLastName}</p>
                              <p>{order.shippingStreet}</p>
                              <p>
                                {order.shippingCity}, {order.shippingState} {order.shippingZipCode}
                              </p>
                              <p>{order.shippingCountry}</p>
                            </div>
                            {order.notes && (
                              <div className="mt-4">
                                <h5 className="font-semibold text-gray-900 mb-1">Delivery Instructions</h5>
                                <p className="text-sm text-gray-600">{order.notes}</p>
                              </div>
                            )}
                          </div>

                          {/* Order Items */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-3">Order Items</h4>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                              {order.items?.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0">
                                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    <img
                                      src={(() => {
                                        let imgUrl = item.productImageUrl || item.productImagePath;
                                        if (!imgUrl) return 'http://localhost:8081/fresh-finds/api/v1/images/placeholder.jpg';
                                        if (imgUrl.startsWith('http')) return imgUrl;
                                        if (imgUrl.startsWith('/')) return `http://localhost:8081${imgUrl}`;
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
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-semibold text-gray-900 text-sm truncate">{item.productName}</h5>
                                    <p className="text-gray-600 text-xs">Qty: {item.quantity} × ₹{parseFloat(item.price).toFixed(2)}</p>
                                  </div>
                                  <div className="text-fresh-green-600 font-semibold text-sm">
                                    ₹{parseFloat(item.subtotal).toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-semibold">₹{order.subtotal ? parseFloat(order.subtotal).toFixed(2) : '0.00'}</span>
                              </div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Tax</span>
                                <span className="font-semibold">₹{order.tax ? parseFloat(order.tax).toFixed(2) : '0.00'}</span>
                              </div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-semibold">₹{order.shipping ? parseFloat(order.shipping).toFixed(2) : '0.00'}</span>
                              </div>
                              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                                <span>Total</span>
                                <span className="text-fresh-green-600">₹{order.total ? parseFloat(order.total).toFixed(2) : '0.00'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

