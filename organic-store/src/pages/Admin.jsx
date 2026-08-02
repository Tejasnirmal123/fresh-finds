import React, { useState } from 'react';
import ProductManagement from '../components/admin/ProductManagement';
import CategoryManagement from '../components/admin/CategoryManagement';
import OrdersList from '../components/admin/OrdersList';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('product');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb + Page Title Section - Hero */}
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
              <li className="text-gray-900 font-medium">Admin</li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('product')}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                    activeTab === 'product'
                      ? 'text-fresh-green-600 border-b-2 border-fresh-green-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Create Product
                </button>
                <button
                  onClick={() => setActiveTab('category')}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                    activeTab === 'category'
                      ? 'text-fresh-green-600 border-b-2 border-fresh-green-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Create Category
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                    activeTab === 'orders'
                      ? 'text-fresh-green-600 border-b-2 border-fresh-green-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Orders
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-transparent">
            {activeTab === 'product' ? (
              <ProductManagement />
            ) : activeTab === 'category' ? (
              <CategoryManagement />
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                <OrdersList />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

