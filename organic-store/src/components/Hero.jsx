import React from "react";

export default function Hero({ onNavigate }) {
  return (
    <section className="bg-fresh-green-50 py-12 md:py-20">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Farm-Fresh Fruits & Vegetables Delivered Daily.
            </h1>

            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-fresh-green-600">
                100% Fresh
              </span>
              <svg
                className="w-5 h-5 text-fresh-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <p className="text-lg text-gray-600 leading-relaxed">
              Order hand-picked, locally sourced produce directly from the farm
              to your kitchen table. Experience the taste of true freshness.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
              onClick={() => onNavigate && onNavigate('shop')}
              className="bg-fresh-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-fresh-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Shop Now
              </button>
              <button
              onClick={() => onNavigate && onNavigate('contact')}
              className="bg-white text-fresh-green-600 border border-fresh-green-600 px-8 py-3 rounded-full font-semibold hover:bg-fresh-green-50 transition-colors"
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <img
              src="/images/dragon_fruit_transparent.png"
              alt="Fresh produce display"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
