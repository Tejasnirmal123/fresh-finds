// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/fresh-finds/api/v1';
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/fresh-finds/api/v1';

/**
 * Get stored auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Get stored user info
 */
export const getUserInfo = () => {
  const userStr = localStorage.getItem('userInfo');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Set auth token and user info
 */
export const setAuthToken = (token, userInfo) => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
};

/**
 * Clear auth token and user info
 */
export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userInfo');
};

/**
 * Get authorization header
 */
export const getAuthHeader = () => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Global navigation handler - will be set by App component
let globalNavigateHandler = null;

/**
 * Set the global navigation handler (called from App.jsx)
 */
export const setNavigationHandler = (handler) => {
  globalNavigateHandler = handler;
};

/**
 * Navigate without prop-drilling onNavigate through every component
 * (e.g. redirecting to login when an unauthenticated user tries a gated action)
 */
export const navigateTo = (page, data = null) => {
  if (globalNavigateHandler) {
    globalNavigateHandler(page, data);
  }
};

/**
 * Handle API response - check for 401 (unauthorized) and clear auth if needed
 */
export const handleApiResponse = async (response) => {
  if (response.status === 401) {
    // Token expired or invalid, clear auth
    clearAuth();
    // Trigger navigation to login if handler is available
    if (globalNavigateHandler) {
      globalNavigateHandler('login');
    } else {
      // Fallback: reload page if navigation handler not set
      window.location.reload();
    }
    throw new Error('Session expired. Please login again.');
  }
  return response;
};

/**
 * Fetch all categories from the API
 * @returns {Promise<Array>} Array of category objects
 */
export const fetchCategories = async () => {
  try {
    console.log('Fetching categories from:', `${API_BASE_URL}/categories`);
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    
    // Handle the API response structure
    if (data.status === 'SUCCESS' && data.data) {
      console.log('Categories received:', data.data);
      return data.data;
    }
    
    console.error('Invalid response format:', data);
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Fetch all products from the API with pagination
 * @param {number} pageNo - Page number (default: 1)
 * @param {number} pageSize - Items per page (default: 10)
 * @returns {Promise<Object>} Object containing products array and pagination info
 */
export const fetchProducts = async (pageNo = 1, pageSize = 10) => {
  try {
    const url = `${API_BASE_URL}/products?pageNo=${pageNo}&pageSize=${pageSize}`;
    console.log('Fetching products from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    
    console.log('Response status:', response.status);
    
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Full API Response:', JSON.stringify(data, null, 2));
    
    // Handle the API response structure - status can be "SUCCESS" (string) or SUCCESS (enum)
    const status = data.status;
    let responseData = data.data;
    
    console.log('Response status:', status);
    console.log('Response data:', responseData);
    console.log('Response data type:', typeof responseData);
    
    // If responseData is null/undefined, try to get it from body
    if (!responseData && data.body) {
      responseData = data.body;
      console.log('Using data.body instead:', responseData);
    }
    
    // Check if status indicates success (handle both string and enum)
    // Also handle case where response might be directly the data
    if (status === 'SUCCESS' && responseData) {
      const productsData = responseData;
      
      // Log the structure to debug
      console.log('ProductsData structure:', productsData);
      console.log('ProductsData.products:', productsData.products);
      console.log('ProductsData.pagination:', productsData.pagination);
      
      // Check if productsData is actually the ProductListResponse
      if (productsData.products !== undefined) {
        // Ensure products array exists, default to empty array
        const products = Array.isArray(productsData.products) ? productsData.products : [];
        // Ensure pagination exists with defaults
        const pagination = productsData.pagination || {
          currentPage: pageNo,
          totalPages: 1,
          totalItems: products.length,
          itemsPerPage: pageSize,
          hasNext: false,
          hasPrevious: false,
        };
        
        console.log('Final products array:', products);
        console.log('Final pagination:', pagination);
        console.log('Products count:', products.length);
        
        return {
          products,
          pagination,
        };
      } else {
        console.error('ProductsData does not contain products array. Structure:', productsData);
        throw new Error('Response data does not contain products array');
      }
    }
    
    // If no status or status is not SUCCESS, but we have data, try to parse it anyway
    if (responseData && responseData.products !== undefined) {
      console.warn('Response status is not SUCCESS, but attempting to parse data anyway');
      const products = Array.isArray(responseData.products) ? responseData.products : [];
      const pagination = responseData.pagination || {
        currentPage: pageNo,
        totalPages: 1,
        totalItems: products.length,
        itemsPerPage: pageSize,
        hasNext: false,
        hasPrevious: false,
      };
      
      return {
        products,
        pagination,
      };
    }
    
    console.error('Invalid response format. Status:', status, 'Data:', responseData);
    console.error('Full response:', data);
    throw new Error(`Invalid response format. Status: ${status}, Data: ${JSON.stringify(responseData)}`);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Search products with filters using POST request
 * @param {Object} searchParams - Search parameters object
 * @param {number} searchParams.pageNo - Page number (default: 1)
 * @param {number} searchParams.pageSize - Items per page (default: 10)
 * @param {Array<number>} searchParams.categoryIds - List of category IDs to filter by
 * @param {number} searchParams.minPrice - Minimum price filter
 * @param {number} searchParams.maxPrice - Maximum price filter
 * @param {string} searchParams.nameStartsWith - Name prefix filter
 * @param {string} searchParams.sortBy - Sort order: "popularity", "price-low", "price-high" (default: "popularity")
 * @returns {Promise<Object>} Object containing products array and pagination info
 */
export const searchProducts = async (searchParams = {}) => {
  try {
    const {
      pageNo = 1,
      pageSize = 10,
      categoryIds = null,
      minPrice = null,
      maxPrice = null,
      nameStartsWith = null,
      sortBy = 'popularity',
    } = searchParams;

    const requestBody = {
      pageNo,
      pageSize,
      sortBy, // Always include sortBy
    };

    // Add filters only if they are provided
    if (categoryIds && categoryIds.length > 0) {
      requestBody.categoryIds = categoryIds;
    }
    if (minPrice !== null && minPrice !== undefined) {
      requestBody.minPrice = minPrice;
    }
    if (maxPrice !== null && maxPrice !== undefined) {
      requestBody.maxPrice = maxPrice;
    }
    if (nameStartsWith && nameStartsWith.trim()) {
      requestBody.nameStartsWith = nameStartsWith.trim();
    }

    const url = `${API_BASE_URL}/products/search`;
    console.log('Searching products:', url, requestBody);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('Response status:', response.status);
    
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Full API Response:', JSON.stringify(data, null, 2));
    
    // Handle the API response structure
    const status = data.status;
    let responseData = data.data;
    
    console.log('Response status:', status);
    console.log('Response data:', responseData);
    
    // If responseData is null/undefined, try to get it from body
    if (!responseData && data.body) {
      responseData = data.body;
      console.log('Using data.body instead:', responseData);
    }
    
    // Check if status indicates success
    if (status === 'SUCCESS' && responseData) {
      const productsData = responseData;
      
      // Log the structure to debug
      console.log('ProductsData structure:', productsData);
      console.log('ProductsData.products:', productsData.products);
      console.log('ProductsData.pagination:', productsData.pagination);
      
      // Check if productsData is actually the ProductListResponse
      if (productsData.products !== undefined) {
        // Ensure products array exists, default to empty array
        const products = Array.isArray(productsData.products) ? productsData.products : [];
        // Ensure pagination exists with defaults
        const pagination = productsData.pagination || {
          currentPage: pageNo,
          totalPages: 1,
          totalItems: products.length,
          itemsPerPage: pageSize,
          hasNext: false,
          hasPrevious: false,
        };
        
        console.log('Final products array:', products);
        console.log('Final pagination:', pagination);
        console.log('Products count:', products.length);
        
        return {
          products,
          pagination,
        };
      } else {
        console.error('ProductsData does not contain products array. Structure:', productsData);
        throw new Error('Response data does not contain products array');
      }
    }
    
    // If no status or status is not SUCCESS, but we have data, try to parse it anyway
    if (responseData && responseData.products !== undefined) {
      console.warn('Response status is not SUCCESS, but attempting to parse data anyway');
      const products = Array.isArray(responseData.products) ? responseData.products : [];
      const pagination = responseData.pagination || {
        currentPage: pageNo,
        totalPages: 1,
        totalItems: products.length,
        itemsPerPage: pageSize,
        hasNext: false,
        hasPrevious: false,
      };
      
      return {
        products,
        pagination,
      };
    }
    
    console.error('Invalid response format. Status:', status, 'Data:', responseData);
    console.error('Full response:', data);
    throw new Error(`Invalid response format. Status: ${status}, Data: ${JSON.stringify(responseData)}`);
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

/**
 * Create a new product with images
 * @param {FormData} formData - FormData containing product fields and images
 * @returns {Promise<Object>} Created product object
 */
export const createProduct = async (formData) => {
  try {
    const url = `${API_BASE_URL}/products`;
    console.log('Creating product:', url);
    
    // Debug: Log FormData contents
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name}, size: ${value.size}, type: ${value.type}`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    // For FormData with fetch, we MUST NOT set Content-Type header
    // The browser will automatically set it to: multipart/form-data; boundary=...
    // If we set it manually, the boundary will be missing and Spring Boot will fail to parse
    
    const authHeader = getAuthHeader();
    
    // Create fetch options - only include Authorization, let browser handle Content-Type
    const fetchOptions = {
      method: 'POST',
      body: formData, // FormData - browser sets Content-Type automatically
    };
    
    // Only add Authorization header if it exists
    if (authHeader.Authorization) {
      fetchOptions.headers = {
        'Authorization': authHeader.Authorization
        // DO NOT set Content-Type here - browser will add it with boundary
      };
    }
    
    console.log('Fetch options:', {
      method: fetchOptions.method,
      hasBody: !!fetchOptions.body,
      headers: fetchOptions.headers
    });
    
    const response = await fetch(url, fetchOptions);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Product created:', data);
    
    // Handle the API response structure
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    
    console.error('Invalid response format:', data);
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Create a new category with image
 * @param {FormData} formData - FormData containing category fields and image
 * @returns {Promise<Object>} Created category object
 */
export const createCategory = async (formData) => {
  try {
    const url = `${API_BASE_URL}/categories`;
    console.log('Creating category:', url);
    
    // For FormData, do NOT set Content-Type header - browser will set it automatically with boundary
    const authHeader = getAuthHeader();
    const headers = {};
    if (authHeader.Authorization) {
      headers.Authorization = authHeader.Authorization;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: formData, // FormData for multipart/form-data - browser sets Content-Type automatically
    });
    
    console.log('Response status:', response.status);
    
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Category created:', data);
    
    // Handle the API response structure
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    
    console.error('Invalid response format:', data);
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Update an existing product
 * @param {number} productId - Product ID to update
 * @param {FormData} formData - FormData containing product information and images
 * @returns {Promise<Object>} Updated product object
 */
export const updateProduct = async (productId, formData) => {
  try {
    const url = `${API_BASE_URL}/products/${productId}`;
    console.log('Updating product:', url);
    
    // For FormData, do NOT set Content-Type header - browser will set it automatically with boundary
    const authHeader = getAuthHeader();
    const headers = {};
    if (authHeader.Authorization) {
      headers.Authorization = authHeader.Authorization;
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: headers,
      body: formData, // FormData for multipart/form-data - browser sets Content-Type automatically
    });
    
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Get product by ID
 * @param {number} productId - Product ID
 * @returns {Promise<Object>} Product object
 */
export const getProductById = async (productId) => {
  try {
    const url = `${API_BASE_URL}/products/${productId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

/**
 * Get all products (for admin listing)
 * @param {number} pageNo - Page number (default: 1)
 * @param {number} pageSize - Items per page (default: 100)
 * @returns {Promise<Object>} Products list with pagination
 */
export const getAllProductsForAdmin = async (pageNo = 1, pageSize = 100) => {
  try {
    return await searchProducts({ pageNo, pageSize, sortBy: 'popularity' });
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
};

/**
 * Update an existing category
 * @param {number} categoryId - Category ID to update
 * @param {FormData} formData - FormData containing category information and image
 * @returns {Promise<Object>} Updated category object
 */
export const updateCategory = async (categoryId, formData) => {
  try {
    const url = `${API_BASE_URL}/categories/${categoryId}`;
    console.log('Updating category:', url);
    
    // For FormData, do NOT set Content-Type header - browser will set it automatically with boundary
    const authHeader = getAuthHeader();
    const headers = {};
    if (authHeader.Authorization) {
      headers.Authorization = authHeader.Authorization;
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: headers,
      body: formData, // FormData for multipart/form-data - browser sets Content-Type automatically
    });
    
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Get category by ID
 * @param {number} categoryId - Category ID
 * @returns {Promise<Object>} Category object
 */
export const getCategoryById = async (categoryId) => {
  try {
    const url = `${API_BASE_URL}/categories/${categoryId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

/**
 * Start registration - creates a pending registration and emails an OTP.
 * No account exists yet and no auth token is issued until verifyOtp succeeds.
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.firstName - User first name
 * @param {string} userData.lastName - User last name
 * @param {string} userData.phone - User phone (optional)
 * @returns {Promise<Object>} { message } confirming the OTP was sent
 */
export const register = async (userData) => {
  try {
    const url = `${API_BASE_URL}/auth/register`;
    console.log('Registering user:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Registration response:', data);

    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Verify the OTP sent during registration. On success, the account is
 * created and an auth token is issued (auto-login), same as login().
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<Object>} Auth response with token and user info
 */
export const verifyOtp = async (email, otp) => {
  try {
    const url = `${API_BASE_URL}/auth/verify-otp`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();

    if (data.status === 'SUCCESS' && data.data) {
      const authData = data.data;
      setAuthToken(authData.token, {
        id: authData.id,
        email: authData.email,
        firstName: authData.firstName,
        lastName: authData.lastName,
        role: authData.role,
      });
      return authData;
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Resend the registration OTP.
 * @param {string} email
 * @returns {Promise<Object>} { message }
 */
export const resendOtp = async (email) => {
  try {
    const url = `${API_BASE_URL}/auth/resend-otp`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();

    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error resending OTP:', error);
    throw error;
  }
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Auth response with token and user info
 */
export const login = async (credentials) => {
  try {
    const url = `${API_BASE_URL}/auth/login`;
    console.log('Logging in:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Login response:', data);
    
    if (data.status === 'SUCCESS' && data.data) {
      const authData = data.data;
      // Store token and user info
      setAuthToken(authData.token, {
        id: authData.id,
        email: authData.email,
        firstName: authData.firstName,
        lastName: authData.lastName,
        role: authData.role,
      });
      return authData;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  clearAuth();
};

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile with address information
 */
export const getUserProfile = async () => {
  try {
    const url = `${API_BASE_URL}/auth/me`;
    console.log('Fetching user profile:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    
    console.log('Response status:', response.status);
    
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('User profile response:', data);
    
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};


/**
 * Get user's cart
 * @returns {Promise<Object>} Cart response with items and totals
 */
export const getCart = async () => {
  try {
    const url = `${API_BASE_URL}/cart`;
    console.log('Fetching cart:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    
    console.log('Response status:', response.status);
    
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Cart response:', data);
    
    // Handle the API response structure
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

/**
 * Add item to cart
 * @param {Object} itemData - Item data
 * @param {number} itemData.productId - Product ID
 * @param {number} itemData.quantity - Quantity to add
 * @returns {Promise<Object>} Updated cart response
 */
export const addToCart = async (itemData) => {
  try {
    const url = `${API_BASE_URL}/cart/items`;
    console.log('Adding to cart:', url, itemData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(itemData),
    });
    
    console.log('Response status:', response.status);
    
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Add to cart response:', data);
    
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

/**
 * Update cart item quantity
 * @param {number} cartItemId - Cart item ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Updated cart response
 */
export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const url = `${API_BASE_URL}/cart/items/${cartItemId}`;
    console.log('Updating cart item:', url, { quantity });
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ quantity }),
    });
    
    console.log('Response status:', response.status);
    
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Update cart item response:', data);
    
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

/**
 * Remove item from cart
 * @param {number} cartItemId - Cart item ID
 * @returns {Promise<void>}
 */
export const removeCartItem = async (cartItemId) => {
  try {
    const url = `${API_BASE_URL}/cart/items/${cartItemId}`;
    console.log('Removing cart item:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    
    console.log('Response status:', response.status);
    
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Remove cart item response:', data);
    
    return data;
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
};

/**
 * Clear entire cart
 * @returns {Promise<void>}
 */
export const clearCart = async () => {
  try {
    const url = `${API_BASE_URL}/cart`;
    console.log('Clearing cart:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    
    console.log('Response status:', response.status);
    
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Clear cart response:', data);
    
    return data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

/**
 * Create order from cart
 * @param {Object} orderData - Order data including delivery information
 * @returns {Promise<Object>} Created order response
 */
export const createOrder = async (orderData) => {
  try {
    const url = `${API_BASE_URL}/orders`;
    console.log('Creating order:', url, orderData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(orderData),
    });
    
    console.log('Response status:', response.status);
    
    // Handle 401 errors (will throw and redirect)
    await handleApiResponse(response);
    
    // If we get here, response is not 401, but might be other error
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = `HTTP error! status: ${response.status}`;
      }
      console.error('Error response:', errorText);
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    
    // Parse JSON response
    const data = await response.json();
    console.log('Create order response:', data);
    
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Get user's orders
 * @returns {Promise<Array>} List of user's orders
 */
export const getUserOrders = async () => {
  try {
    const url = `${API_BASE_URL}/orders/my-orders`;
    console.log('Fetching user orders:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    
    console.log('Response status:', response.status);
    
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Get user orders response:', data);
    
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

/**
 * Get all orders (Admin only)
 * @returns {Promise<Array>} List of orders
 */
export const getAllOrders = async (status = null, startDate = null, endDate = null) => {
  try {
    let url = `${API_BASE_URL}/orders`;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) {
      url += '?' + params.toString();
    }
    console.log('Fetching all orders:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    
    console.log('Response status:', response.status);
    
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Get orders response:', data);
    
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Update order status (Admin only)
 * @param {number} orderId - ID of the order to update
 * @param {string} status - New status (optional)
 * @param {string} paymentStatus - New payment status (optional)
 * @param {string} notes - Optional notes
 * @returns {Promise<Object>} Updated order object
 */
export const updateOrderStatus = async (orderId, status = null, paymentStatus = null, notes = null) => {
  try {
    const url = `${API_BASE_URL}/orders/${orderId}`;
    const requestBody = {};
    if (status) requestBody.status = status;
    if (paymentStatus) requestBody.paymentStatus = paymentStatus;
    if (notes) requestBody.notes = notes;
    
    console.log('Updating order:', url, requestBody);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);

    await handleApiResponse(response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Order updated:', data);

    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

/**
 * Download orders as CSV (Admin only)
 * @param {string} status - Optional status filter
 * @param {string} startDate - Optional start date filter (YYYY-MM-DD)
 * @param {string} endDate - Optional end date filter (YYYY-MM-DD)
 * @returns {Promise<void>}
 */
export const downloadOrdersAsCsv = async (status = null, startDate = null, endDate = null) => {
  try {
    let url = `${API_BASE_URL}/orders/download`;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) {
      url += '?' + params.toString();
    }
    console.log('Downloading orders CSV:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
      },
    });

    console.log('Response status:', response.status);

    await handleApiResponse(response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the blob from response
    const blob = await response.blob();
    
    // Create a download link
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'orders.csv';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    console.log('CSV downloaded successfully');
  } catch (error) {
    console.error('Error downloading orders CSV:', error);
    throw error;
  }
};
