import React, { useState, useEffect } from "react";
import { fetchCategories } from "../services/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Loading categories...");
        const data = await fetchCategories();
        console.log("Categories loaded:", data);
        // Get top 4 categories (already sorted by displayOrder from API)
        const topCategories = data.slice(0, 4);
        console.log("Top 4 categories:", topCategories);
        setCategories(topCategories);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError(
          `Failed to load categories: ${err.message}. Please check if the backend is running on http://localhost:8081`
        );
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Fallback image if category doesn't have an image
  const getImageUrl = (category) => {
    console.log("getImageUrl called for category:", category);

    if (category.imageUrl) {
      // Construct full URL if imageUrl is relative
      if (category.imageUrl.startsWith("http")) {
        console.log("Using full imageUrl:", category.imageUrl);
        return category.imageUrl;
      }
      // Handle both /api/v1/images/... and /fresh-finds/api/v1/images/... formats
      const fullUrl = `http://localhost:8081${category.imageUrl}`;
      console.log("Constructed URL from imageUrl:", fullUrl);
      return fullUrl;
    }
    if (category.imagePath) {
      // If we have imagePath but no imageUrl, construct it
      const fullUrl = `http://localhost:8081/fresh-finds/api/v1/images/${category.imagePath}`;
      console.log("Constructed URL from imagePath:", fullUrl);
      return fullUrl;
    }
    // Fallback to a default image
    console.log("No image found, using fallback");
    return "/images/vegetables.jpg";
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10">
            Shop by Category
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
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10">
            Shop by Category
          </h2>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-fresh-green-600 text-white rounded-lg hover:bg-fresh-green-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10">
            Shop by Category
          </h2>
          <div className="text-center py-12">
            <p className="text-gray-600">
              No categories available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10">
          Shop by Category
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group cursor-pointer bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow relative"
            >
              <div className="relative mb-4">
                <div className="w-32 h-32 mx-auto aspect-square rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                  <img
                    src={getImageUrl(category)}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onLoad={() => {
                      console.log(
                        "Image loaded successfully for category:",
                        category.name
                      );
                    }}
                  />
                </div>
              </div>
              {/* Category name and arrow button inline */}
              <div className="flex items-center justify-center">
                <h3 className="text-lg font-semibold text-gray-900 text-center">
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
