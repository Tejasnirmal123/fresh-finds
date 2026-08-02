import React, { useState, useEffect } from 'react';
import { createCategory, updateCategory, fetchCategories, getCategoryById } from '../../services/api';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    displayOrder: 0,
  });

  const [image, setImage] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      const categoriesList = Array.isArray(data) ? data : [];
      console.log('Loaded categories:', categoriesList);
      if (categoriesList.length > 0) {
        console.log('First category image data:', {
          imageUrl: categoriesList[0].imageUrl,
          imagePath: categoriesList[0].imagePath,
          image: categoriesList[0].image
        });
      }
      setCategories(categoriesList);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'name') {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  const handleEdit = async (categoryId) => {
    try {
      setLoading(true);
      const category = await getCategoryById(categoryId);
      
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        displayOrder: category.displayOrder || 0,
      });
      
      setEditingCategory(categoryId);
      setImage(null);
      setError(null);
      setSuccess(false);
      
      // Scroll to form
      document.getElementById('category-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      setError(err.message || 'Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      displayOrder: 0,
    });
    setImage(null);
    const fileInput = document.querySelector('#category-form input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('slug', formData.slug);
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      if (formData.displayOrder) {
        formDataToSend.append('displayOrder', formData.displayOrder);
      }
      
      if (image) {
        formDataToSend.append('image', image);
      }

      if (editingCategory) {
        await updateCategory(editingCategory, formDataToSend);
        setSuccess(true);
        setEditingCategory(null);
      } else {
        await createCategory(formDataToSend);
        setSuccess(true);
      }
      
      resetForm();
      await loadCategories();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || `Failed to ${editingCategory ? 'update' : 'create'} category`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Form */}
      <div id="category-form" className="lg:sticky lg:top-6 lg:self-start">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>
            {editingCategory && (
              <button
                onClick={handleCancelEdit}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Cancel
              </button>
            )}
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              Category {editingCategory ? 'updated' : 'created'} successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1">
                Basic Information
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                  placeholder="e.g., Fresh Fruits"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                  placeholder="e.g., fresh-fruits"
                />
                <p className="text-xs text-gray-500 mt-1">Lowercase, alphanumeric with hyphens</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600 resize-none"
                  placeholder="Category description..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>
            </div>

            {/* Image */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1">
                Category Image
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                />
                {image && (
                  <p className="text-xs text-gray-600 mt-1">Selected: {image.name}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-fresh-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-fresh-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {editingCategory ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingCategory ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} />
                  </svg>
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column - List */}
      <div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
            <button
              onClick={loadCategories}
              className="text-fresh-green-600 hover:text-fresh-green-700 text-sm font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {loading && categories.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fresh-green-600"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No categories found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                    editingCategory === category.id ? 'border-fresh-green-600 bg-fresh-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {(() => {
                        let imageSrc = null;
                        
                        // Try imageUrl first (might be relative or absolute)
                        if (category.imageUrl) {
                          // If it's already a full URL, use it
                          if (category.imageUrl.startsWith('http')) {
                            imageSrc = category.imageUrl;
                          } else {
                            // If it's relative, prepend base URL
                            imageSrc = `http://localhost:8081${category.imageUrl.startsWith('/') ? '' : '/'}${category.imageUrl}`;
                          }
                        } else if (category.imagePath) {
                          // Then try to construct from imagePath
                          if (category.imagePath.startsWith('http')) {
                            imageSrc = category.imagePath;
                          } else {
                            // Construct full URL from relative path
                            imageSrc = `http://localhost:8081/fresh-finds/api/v1/images/${category.imagePath}`;
                          }
                        }
                        
                        if (imageSrc) {
                          return (
                            <img
                              src={imageSrc}
                              alt={category.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Replace with a placeholder div
                                const parent = e.target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">No Image</div>';
                                }
                              }}
                            />
                          );
                        } else {
                          return (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">
                              No Image
                            </div>
                          );
                        }
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{category.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>Order: {category.displayOrder || 0}</span>
                        {category.productCount !== undefined && (
                          <span>• {category.productCount} products</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(category.id)}
                      className="text-fresh-green-600 hover:text-fresh-green-700 p-2"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

