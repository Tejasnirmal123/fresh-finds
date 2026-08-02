import React from 'react';

export default function OrderSuccess({ orderData, onNavigate }) {
  console.log('OrderSuccess component rendered with orderData:', orderData);
  
  if (!orderData) {
    console.warn('No order data provided, redirecting to home');
    // If no order data, redirect to home
    if (onNavigate) {
      setTimeout(() => onNavigate('home'), 100);
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No order data found. Redirecting...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fresh-green-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        {/* Order Details Box */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Order Details</h2>
          
          <div className="space-y-4">
            {/* Order ID */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Order ID:</span>
              <span className="text-gray-900 font-bold">{orderData.orderNumber || 'N/A'}</span>
            </div>

            {/* Total Amount */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Total Amount:</span>
              <span className="text-gray-900 font-bold text-lg">
                ₹{orderData.total ? parseFloat(orderData.total).toFixed(2) : '0.00'}
              </span>
            </div>

            {/* Payment Method */}
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-700 font-medium">Payment Method:</span>
              <span className="text-gray-900 font-semibold">
                {orderData.paymentMethod 
                  ? orderData.paymentMethod.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                  : 'Cash on Delivery'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          {/*<button
            onClick={() => {
              // TODO: Navigate to order details page when implemented
              if (onNavigate) {
                onNavigate('home');
              }
            }}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            View Order Details
          </button>*/}
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('shop');
              }
            }}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('home');
              }
            }}
            className="px-6 py-3 bg-white text-gray-900 border-2 border-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Footer Information */}
        <div className="text-center space-y-2 text-gray-600 text-sm">
          <p>For any queries, please contact our customer support.</p>
        </div>
      </div>
    </div>
  );
}

