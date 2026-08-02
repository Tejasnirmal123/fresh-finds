import React, { useState, useEffect } from 'react';
import { searchProducts } from '../services/api';

export default function SeasonalFavorites({ onNavigate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSeasonalProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch products from API (fetch more to ensure we get enough seasonal ones)
        const data = await searchProducts({
          pageNo: 1,
          pageSize: 50, // Fetch more to filter for seasonal
          sortBy: 'popularity',
        });
        
        // Filter products where isSeasonal = true
        const seasonalProducts = (data.products || []).filter(product => product.isSeasonal === true);
        
        // Take only first 4 products
        const top4Seasonal = seasonalProducts.slice(0, 4);
        
        setProducts(top4Seasonal);
      } catch (err) {
        console.error('Failed to load seasonal products:', err);
        setError('Failed to load seasonal products');
      } finally {
        setLoading(false);
      }
    };

    loadSeasonalProducts();
  }, []);

  // Helper function to get image URL
  const getImageUrl = (product) => {
    // Use imageUrl first, then imagePath, then fallback
    let imageUrl = product.imageUrl || product.imagePath || '/images/placeholder.jpg';
    
    // If it's already a full URL, use it
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it starts with /, prepend base URL
    if (imageUrl.startsWith('/')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081/fresh-finds/api/v1';
      const baseUrl = apiUrl.split('/fresh-finds')[0] || 'http://localhost:8081';
      return `${baseUrl}${imageUrl}`;
    }
    
    // Otherwise, construct full URL from imagePath
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081/fresh-finds/api/v1';
    const baseUrl = apiUrl.split('/fresh-finds')[0] || 'http://localhost:8081';
    return `${baseUrl}/fresh-finds/api/v1/images/${imageUrl}`;
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10">
            Seasonal Favorites
          </h2>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fresh-green-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
            Seasonal Favorites
          </h2>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
            Seasonal Favorites
          </h2>
          <div className="text-center py-12">
            <p className="text-gray-600">
              No seasonal products available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-10 w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10">
            Seasonal Favorites
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            // Determine display price (use salePrice if onSale, otherwise use regular price)
            const displayPrice = product.onSale && product.salePrice 
              ? parseFloat(product.salePrice) 
              : (product.price ? parseFloat(product.price) : 0);
            
            return (
              <div 
                key={product.id} 
                className="bg-white rounded-xl p-4 group"
              >
                <div className="relative mb-4">
                  <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-visible flex items-center justify-center">
                    <div className="relative w-3/4 h-3/4 aspect-square overflow-visible rounded-lg">
                      <img 
                        src={getImageUrl(product)} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                      {product.isOrganic && (
                        <span className="absolute -top-2 -left-2 bg-gray-200 text-fresh-green-600 text-xs font-semibold px-3 py-1 rounded-full">
                          Organic
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-700 font-semibold mb-4">₹{displayPrice.toFixed(2)} / {product.unit || 'kg'}</p>
                  <button
                  onClick={() => onNavigate && onNavigate('shop')}
                  className="w-full bg-fresh-green-600 text-white py-2 rounded-lg font-semibold hover:bg-fresh-green-700 transition-colors"
                  >
                    View Product
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}