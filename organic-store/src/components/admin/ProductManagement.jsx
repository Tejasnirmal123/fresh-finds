import React, { useState, useEffect } from 'react';
import { createProduct, updateProduct, getAllProductsForAdmin, getProductById } from '../../services/api';
import { fetchCategories } from '../../services/api';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: '',
    description: '',
    price: '',
    unit: 'kg',
    isOrganic: false,
    isNonGmo: false,
    stockQty: 0,
    onSale: false,
    salePrice: '',
    displayOrder: 0,
    tags: '',
  });

  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProductsForAdmin(1, 100);
      const productsList = data.products || [];
      console.log('Loaded products:', productsList);
      if (productsList.length > 0) {
        console.log('First product image data:', {
          imageUrl: productsList[0].imageUrl,
          imagePath: productsList[0].imagePath,
          image: productsList[0].image
        });
      }
      setProducts(productsList);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Error loading categories:', err);
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
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
      
      if (name === 'name') {
        setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
      }
    }
  };

  const handleEdit = async (productId) => {
    try {
      setLoading(true);
      const product = await getProductById(productId);
      
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        categoryId: product.categoryId || '',
        description: product.description || '',
        price: product.price || '',
        unit: product.unit || 'kg',
        isOrganic: product.isOrganic || false,
        isNonGmo: product.isNonGmo || false,
        stockQty: product.stockQty || 0,
        onSale: product.onSale || false,
        salePrice: product.salePrice || '',
        displayOrder: product.displayOrder || 0,
        tags: product.tags?.join(', ') || '',
      });
      
      setEditingProduct(productId);
      setImage(null);
      setImages([]);
      setError(null);
      setSuccess(false);
      
      // Scroll to form
      document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      categoryId: '',
      description: '',
      price: '',
      unit: 'kg',
      isOrganic: false,
      isNonGmo: false,
      stockQty: 0,
      onSale: false,
      salePrice: '',
      displayOrder: 0,
      tags: '',
    });
    setImage(null);
    setImages([]);
    const fileInputs = document.querySelectorAll('#product-form input[type="file"]');
    fileInputs.forEach(input => input.value = '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formDataToSend = new FormData();
      
      // Add required fields
      formDataToSend.append('name', formData.name || '');
      formDataToSend.append('slug', formData.slug || '');
      formDataToSend.append('categoryId', String(formData.categoryId || ''));
      formDataToSend.append('price', String(formData.price || '0'));
      formDataToSend.append('unit', formData.unit || 'kg');
      
      // Add optional description
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      
      // Add main image if provided
      if (image) {
        formDataToSend.append('image', image);
      }
      
      // Add additional images if provided
      if (images && images.length > 0) {
        images.forEach((img) => {
          if (img) {
            formDataToSend.append('images', img);
          }
        });
      }
      
      // Add boolean fields - send as "true" or "false" strings
      formDataToSend.append('isOrganic', formData.isOrganic ? 'true' : 'false');
      formDataToSend.append('isNonGmo', formData.isNonGmo ? 'true' : 'false');
      formDataToSend.append('onSale', formData.onSale ? 'true' : 'false');
      
      // Add optional numeric fields
      if (formData.stockQty !== undefined && formData.stockQty !== null && formData.stockQty !== '') {
        formDataToSend.append('stockQty', String(formData.stockQty));
      }
      
      if (formData.onSale && formData.salePrice) {
        formDataToSend.append('salePrice', String(formData.salePrice));
      }
      
      if (formData.displayOrder !== undefined && formData.displayOrder !== null && formData.displayOrder !== '') {
        formDataToSend.append('displayOrder', String(formData.displayOrder));
      }
      
      // Add tags if provided
      if (formData.tags && formData.tags.trim()) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        tagsArray.forEach(tag => {
          formDataToSend.append('tags', tag);
        });
      }
      
      // Debug: Log what we're sending
      console.log('FormData being sent:');
      for (const [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name}, size: ${value.size}`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      if (editingProduct) {
        await updateProduct(editingProduct, formDataToSend);
        setSuccess(true);
        setEditingProduct(null);
      } else {
        await createProduct(formDataToSend);
        setSuccess(true);
      }
      
      resetForm();
      await loadProducts();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || `Failed to ${editingProduct ? 'update' : 'create'} product`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Form */}
      <div id="product-form" className="lg:sticky lg:top-6 lg:self-start">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </h2>
            {editingProduct && (
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
              Product {editingProduct ? 'updated' : 'created'} successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1">
                Basic Information
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
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
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1">
                Pricing & Inventory
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                  >
                    <option value="kg">kg</option>
                    <option value="250gm"></option>
                    <option value="lb">lb</option>
                    <option value="piece">piece</option>
                    <option value="bunch">bunch</option>
                    <option value="pack">pack</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="onSale"
                    checked={formData.onSale}
                    onChange={handleChange}
                    className="w-4 h-4 text-fresh-green-600 border-gray-300 rounded"
                  />
                  <label className="text-xs font-medium text-gray-700">On Sale</label>
                </div>

                {formData.onSale && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Sale Price
                    </label>
                    <input
                      type="number"
                      name="salePrice"
                      value={formData.salePrice}
                      onChange={handleChange}
                      min="0.01"
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stockQty"
                  value={formData.stockQty}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                />
              </div>
            </div>

            {/* Attributes */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1">
                Attributes
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isOrganic"
                    checked={formData.isOrganic}
                    onChange={handleChange}
                    className="w-4 h-4 text-fresh-green-600 border-gray-300 rounded"
                  />
                  <label className="text-xs font-medium text-gray-700">Organic</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isNonGmo"
                    checked={formData.isNonGmo}
                    onChange={handleChange}
                    className="w-4 h-4 text-fresh-green-600 border-gray-300 rounded"
                  />
                  <label className="text-xs font-medium text-gray-700">Non-GMO</label>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                    placeholder="fresh, organic"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1">
                Images
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Main Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Additional Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImages(Array.from(e.target.files || []))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fresh-green-600"
                />
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
                  {editingProduct ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingProduct ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} />
                  </svg>
                  {editingProduct ? 'Update Product' : 'Create Product'}
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
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <button
              onClick={loadProducts}
              className="text-fresh-green-600 hover:text-fresh-green-700 text-sm font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {loading && products.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fresh-green-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No products found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                    editingProduct === product.id ? 'border-fresh-green-600 bg-fresh-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {(() => {
                        let imageSrc = null;
                        
                        // Try imageUrl first (might be relative or absolute)
                        if (product.imageUrl) {
                          // If it's already a full URL, use it
                          if (product.imageUrl.startsWith('http')) {
                            imageSrc = product.imageUrl;
                          } else {
                            // If it's relative, prepend base URL
                            imageSrc = `http://localhost:8081${product.imageUrl.startsWith('/') ? '' : '/'}${product.imageUrl}`;
                          }
                        } else if (product.imagePath) {
                          // Then try to construct from imagePath
                          if (product.imagePath.startsWith('http')) {
                            imageSrc = product.imagePath;
                          } else {
                            // Construct full URL from relative path
                            imageSrc = `http://localhost:8081/fresh-finds/api/v1/images/${product.imagePath}`;
                          }
                        }
                        
                        if (imageSrc) {
                          return (
                            <img
                              src={imageSrc}
                              alt={product.name}
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
                      <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.categoryName}</p>
                      <p className="text-sm font-medium text-fresh-green-600 mt-1">
                        ₹{parseFloat(product.price).toFixed(2)} / {product.unit}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {product.isOrganic && (
                          <span className="text-xs bg-gray-200 text-fresh-green-600 px-2 py-0.5 rounded-full font-semibold">
                            ORGANIC
                          </span>
                        )}
                        {(product.stockQty || 0) >= 1 ? (
                          <span className="text-xs text-green-600">In Stock ({product.stockQty || 0})</span>
                        ) : (
                          <span className="text-xs text-red-600">Out of Stock</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(product.id)}
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

