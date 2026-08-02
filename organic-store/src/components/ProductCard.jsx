import React, { useState } from 'react';
import { addToCart } from '../services/api';

export default function ProductCard({ product, onAddToCart }) {
  const [adding, setAdding] = useState(false);
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const isOutOfStock = (product.stockQty || 0) < 1;

  return (
    <div className={`bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow group ${isOutOfStock ? 'opacity-75' : ''}`}>
      <div className="relative mb-4">
        <div className={`w-full aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center ${isOutOfStock ? 'grayscale' : ''}`}>
          <div className="w-full h-full relative">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-300 ${isOutOfStock ? '' : 'group-hover:scale-110'}`}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
              }}
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                <span className="bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-lg">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isOrganic && (
            <span className="bg-gray-200 text-fresh-green-600 text-xs font-semibold px-3 py-1 rounded-full">
              ORGANIC
            </span>
          )}
          {product.isNonGmo && (
            <span className="bg-gray-200 text-fresh-green-600 text-xs font-semibold px-3 py-1 rounded-full">
              NON-GMO
            </span>
          )}
        </div>
        <button 
          onClick={async () => {
            if (adding) return;
            setAdding(true);
            try {
              await addToCart({ productId: product.id, quantity: 1 });
              if (onAddToCart) {
                onAddToCart();
              }
            } catch (error) {
              console.error('Error adding to cart:', error);
              alert('Failed to add item to cart. Please try again.');
            } finally {
              setAdding(false);
            }
          }}
          disabled={adding || isOutOfStock}
          className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-fresh-green-600 transition-colors group/btn disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-fresh-green-600"></div>
          ) : (
            <svg className="w-5 h-5 text-gray-700 group-hover/btn:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )}
        </button>
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-lg mb-2">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          {renderStars(product.rating || 0)}
        </div>
        <div className="flex items-center gap-2 mb-4">
          {product.onSale && product.originalPrice ? (
            <>
              <p className="text-fresh-green-600 font-semibold">₹{product.price.toFixed(2)}</p>
              <p className="text-gray-400 line-through text-sm">₹{product.originalPrice.toFixed(2)}</p>
              <span className="text-red-600 text-xs font-semibold bg-red-100 px-2 py-1 rounded">SALE</span>
            </>
          ) : (
            <p className="text-gray-700 font-semibold">₹{product.price.toFixed(2)}</p>
          )}
          <span className="text-gray-500 text-sm">/ {product.unit}</span>
        </div>
      </div>
    </div>
  );
}
