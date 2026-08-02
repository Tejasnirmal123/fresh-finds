import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus, downloadOrdersAsCsv } from '../../services/api';

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, startDate, endDate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllOrders(
        statusFilter || null,
        startDate || null,
        endDate || null
      );
      setOrders(data || []);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      // Update the order in the list
      setOrders(orders.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status: ' + (err.message || 'Unknown error'));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const updatedOrder = await updateOrderStatus(orderId, null, newPaymentStatus);
      // Update the order in the list
      setOrders(orders.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
    } catch (err) {
      console.error('Error updating payment status:', err);
      alert('Failed to update payment status: ' + (err.message || 'Unknown error'));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleMarkAsDelivered = async (orderId) => {
    await handleStatusChange(orderId, 'DELIVERED');
  };

  const handleMarkAsPaid = async (orderId) => {
    await handlePaymentStatusChange(orderId, 'PAID');
  };

  const handleDownloadCsv = async () => {
    try {
      setDownloading(true);
      await downloadOrdersAsCsv(
        statusFilter || null,
        startDate || null,
        endDate || null
      );
    } catch (err) {
      console.error('Error downloading CSV:', err);
      alert('Failed to download CSV: ' + (err.message || 'Unknown error'));
    } finally {
      setDownloading(false);
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fresh-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadOrders}
          className="text-fresh-green-600 font-semibold hover:text-fresh-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Orders</h2>
          <p className="text-gray-600 text-sm mt-1">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            disabled={downloading || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV
              </>
            )}
          </button>
          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-fresh-green-600 text-white rounded-lg font-semibold hover:bg-fresh-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 text-lg">No orders found</p>
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
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status || 'PENDING'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingOrderId === order.id}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-fresh-green-600 ${getStatusBadgeColor(order.status)} cursor-pointer disabled:opacity-50`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        {updatingOrderId === order.id && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-fresh-green-600"></div>
                        )}
                        {order.status !== 'DELIVERED' && (
                          <button
                            onClick={() => handleMarkAsDelivered(order.id)}
                            disabled={updatingOrderId === order.id}
                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                            title="Mark as Delivered"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadgeColor(order.paymentStatus)}`}>
                          {order.paymentStatus || 'PENDING'}
                        </span>
                        {order.paymentStatus !== 'PAID' && (
                          <button
                            onClick={() => handleMarkAsPaid(order.id)}
                            disabled={updatingOrderId === order.id}
                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                            title="Mark as Paid"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Customer:</span>{' '}
                        {order.customerFirstName} {order.customerLastName}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span> {order.customerEmail}
                      </p>
                      {order.customerPhone && (
                        <p>
                          <span className="font-medium">Phone:</span> {order.customerPhone}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Date:</span> {formatDate(order.createdAt)}
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
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                    </p>
                    <button
                      onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                      className="mt-2 text-fresh-green-600 hover:text-fresh-green-700 font-semibold text-sm flex items-center gap-1 md:ml-auto"
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
  );
}

