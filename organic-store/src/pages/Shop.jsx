import React, { useState, useEffect, useCallback } from 'react';
import { sortOptions } from '../data/shopData';
import ProductCard from '../components/ProductCard';
import { searchProducts, fetchCategories } from '../services/api';

export default function Shop({ onCartUpdate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9); // Match the UI design (9 products per page)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 9,
    hasNext: false,
    hasPrevious: false,
  });
  
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState(1000); // Maximum price filter

  // Fetch categories from API
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const apiCategories = await fetchCategories();
        console.log('Fetched categories from API:', apiCategories);
        
        // Map API categories to the format expected by the UI
        // Add "All Products" option at the beginning
        const mappedCategories = [
          { id: 'all', name: 'All Products', count: null },
          ...apiCategories.map((cat) => ({
            id: cat.id?.toString() || cat.slug || cat.name,
            name: cat.name,
            count: cat.productCount || 0,
          }))
        ];
        
        setCategories(mappedCategories);
      } catch (err) {
        console.error('Error loading categories:', err);
        // Fallback to empty array or default categories on error
        setCategories([{ id: 'all', name: 'All Products', count: null }]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Fetch products from API with filters
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Build search parameters
      const searchParams = {
        pageNo: currentPage,
        pageSize: pageSize,
        sortBy: sortBy, // Send sortBy to backend
      };

      // Add category filter if not 'all'
      if (selectedCategory !== 'all') {
        const categoryId = parseInt(selectedCategory);
        if (!isNaN(categoryId)) {
          searchParams.categoryIds = [categoryId];
        }
      }

      // Add price filter (maxPrice)
      if (priceRange < 1000) {
        searchParams.maxPrice = priceRange;
      }

      // Add name search filter
      if (searchQuery && searchQuery.trim()) {
        searchParams.nameStartsWith = searchQuery.trim();
      }

      const data = await searchProducts(searchParams);
      
      console.log('Received data from API:', data);
      
      // Check if products array exists
      if (!data || !data.products) {
        console.warn('No products data in response:', data);
        setProducts([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: pageSize,
          hasNext: false,
          hasPrevious: false,
        });
        setLoading(false);
        return;
      }
      
      if (!Array.isArray(data.products)) {
        console.warn('Products is not an array:', data.products);
        setProducts([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: pageSize,
          hasNext: false,
          hasPrevious: false,
        });
        setLoading(false);
        return;
      }
      
      // Map API products to match ProductCard expected format
      const mappedProducts = data.products.map((product) => {
        // Handle image URL - prepend base URL if it's a relative path
        let imageUrl = product.imageUrl || product.imagePath || '/images/placeholder.jpg';
        if (imageUrl && imageUrl.startsWith('/')) {
          imageUrl = `http://localhost:8081${imageUrl}`;
        }
        
        // Determine the display price (use salePrice if onSale, otherwise use regular price)
        const displayPrice = product.onSale && product.salePrice 
          ? parseFloat(product.salePrice) 
          : (product.price ? parseFloat(product.price) : 0);
        
        return {
          id: product.id,
          name: product.name,
          price: displayPrice,
          originalPrice: product.price ? parseFloat(product.price) : null,
          unit: product.unit || 'kg',
          image: imageUrl,
          rating: product.rating ? Math.round(parseFloat(product.rating)) : 0,
          isOrganic: product.isOrganic || false,
          isNonGmo: product.isNonGmo || false,
          stockQty: product.stockQty || 0,
          onSale: product.onSale || false,
          salePrice: product.salePrice ? parseFloat(product.salePrice) : null,
          category: product.categoryName || '',
          categoryId: product.categoryId,
          description: product.description || '',
        };
      });
      
      setProducts(mappedProducts);
      setPagination({
        currentPage: data.pagination?.currentPage || currentPage,
        totalPages: data.pagination?.totalPages || 1,
        totalItems: data.pagination?.totalItems || mappedProducts.length,
        itemsPerPage: data.pagination?.itemsPerPage || pageSize,
        hasNext: data.pagination?.hasNext || false,
        hasPrevious: data.pagination?.hasPrevious || false,
      });
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, selectedCategory, priceRange, searchQuery, sortBy]);

  // Load products when filters, pagination, or sorting change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // All sorting is done on backend, so products are already sorted
  // No client-side sorting needed
  const sortedProducts = products;

  // Handle filter changes - reset to page 1 when filters change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (newPriceRange) => {
    setPriceRange(newPriceRange);
    setCurrentPage(1);
  };

  const handleSearchChange = (newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    // Don't set currentPage here, let the debounce effect handle it
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to page 1 when sort changes
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = Math.min(startIndex + pagination.itemsPerPage, pagination.totalItems);

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
              <li className="text-gray-900 font-medium">Shop</li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900">
            Shop Our Fresh Produce
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Filters */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-md space-y-6">
                {/* Search Input */}
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                  />
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                  {categoriesLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fresh-green-600"></div>
                    </div>
                  ) : (
                    <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {categories.map((category) => (
                        <li key={category.id}>
                          <button
                            onClick={() => handleCategoryChange(category.id)}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                              selectedCategory === category.id
                                ? 'bg-fresh-green-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span className="flex items-center justify-between">
                              <span>{category.name}</span>
                              {category.count !== null && (
                                <span className="text-sm">({category.count})</span>
                              )}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={priceRange}
                      onChange={(e) => handlePriceRangeChange(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₹0.00</span>
                      <span>₹{priceRange.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Note: Dietary & Status filters are not yet implemented in backend */}

                {/* 
                <div className="relative bg-gradient-to-br from-fresh-green-600 to-fresh-green-700 rounded-xl p-6 text-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <h3 className="font-bold text-lg mb-2">Special Offer</h3>
                    <p className="text-sm mb-4">Get 20% off on your first order!</p>
                    <button className="bg-white text-fresh-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm">
                      Shop Now
                    </button>
                  </div>
                </div>*/}
              </div>
            </aside>

            {/* Right Content Area - Product Grid */}
            <div className="lg:col-span-3">
              {/* Top Bar - Results Count and Sort in alignment */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                {loading ? (
                  <p className="text-gray-600 text-sm">Loading products...</p>
                ) : error ? (
                  <p className="text-red-600 text-sm">Error: {error}</p>
                ) : (
                  <p className="text-gray-600 text-sm">
                    Showing {startIndex + 1} - {endIndex} of {pagination.totalItems} results
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <label className="text-gray-700 font-medium text-sm">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600 text-sm"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Divider */}
              <div className="border-b border-gray-200 mb-6"></div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-fresh-green-600 mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load products</p>
                    <button
                      onClick={() => {
                        setError(null);
                        setCurrentPage(1);
                      }}
                      className="px-4 py-2 bg-fresh-green-600 text-white rounded-lg hover:bg-fresh-green-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Product Grid */}
              {!loading && !error && (
                <>
                  {products.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No products found</p>
                      <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or check back later.</p>
                      <button
                        onClick={() => {
                          setSelectedCategory('all');
                          setSearchQuery('');
                          setPriceRange(1000);
                          setCurrentPage(1);
                        }}
                        className="mt-4 px-4 py-2 bg-fresh-green-600 text-white rounded-lg hover:bg-fresh-green-700 transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {sortedProducts.map((product) => (
                        <ProductCard 
                          key={product.id} 
                          product={product}
                          onAddToCart={() => {
                            // Refresh cart count when item is added
                            if (onCartUpdate) {
                              onCartUpdate();
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {pagination.totalPages > 0 && (
                    <div className="flex flex-col items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                      {/* Pagination Info */}
                      <div className="text-sm text-gray-600">
                        Page {pagination.currentPage} of {pagination.totalPages} 
                        {pagination.totalItems > 0 && ` (${pagination.totalItems} total products)`}
                      </div>
                      
                      {/* Pagination Controls - Always show, but disable when not applicable */}
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={!pagination.hasPrevious || loading || pagination.totalPages <= 1}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-gray-700"
                        >
                          Previous
                        </button>
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            disabled={loading}
                            className={`px-4 py-2 text-sm border rounded-lg transition-colors min-w-[40px] disabled:opacity-50 disabled:cursor-not-allowed ${
                              pagination.currentPage === page
                                ? 'bg-fresh-green-600 text-white border-fresh-green-600 font-semibold'
                                : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={!pagination.hasNext || loading || pagination.totalPages <= 1}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-gray-700"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

