import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Ensure requests target the backend API root.
 * If NEXT_PUBLIC_API_URL already includes '/api' suffix, use it as-is.
 * Otherwise append '/api' so frontend calls match backend routes.
 */
const API_BASE = API_URL.endsWith('/api')
  ? API_URL
  : API_URL.replace(/\/$/, '') + '/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== Token refresh logic =====
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// Handle token expiration with automatic refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const url = originalRequest.url || '';

      // Skip refresh for auth endpoints (login, register, refresh itself)
      if (url.includes('/auth/login') || url.includes('/auth/register') ||
          url.includes('/auth/refresh') || url.includes('/auth/verify') ||
          url.includes('/auth/forgot-password') || url.includes('/auth/reset-password')) {
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }

      try {
        // Call the refresh endpoint directly (not through apiClient to avoid interceptor loop)
        const response = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        const newToken = response.data?.token;
        const newRefreshToken = response.data?.refreshToken;

        if (newToken) {
          localStorage.setItem('token', newToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ===== AUTH API ENDPOINTS =====
export const authAPI = {
  // Login user
  login: (data) => apiClient.post('/auth/login', data),
  
  // Register customer
  register: (data) => apiClient.post('/auth/register', data),
  
  // // Register vendor
  registerVendor: (data) => apiClient.post('/auth/register-vendor', data),
  
  // Get current user
  getCurrentUser: () => apiClient.get('/auth/me'),
  
  // Logout
  logout: () => apiClient.post('/auth/logout'),
  
  // Verify email
  verifyEmail: (token) => apiClient.get(`/auth/verify/${token}`),
  
  // Refresh the JWT with the user's current role from the database
  refreshRole: () => apiClient.post('/auth/refresh-role'),
  
  // Forgot password
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  
  // Reset password (backend expects { token, newPassword })
  resetPassword: (token, newPassword) => 
    apiClient.post('/auth/reset-password', { token, newPassword }),
};

// ===== USER API ENDPOINTS =====
export const userAPI = {
  // Update current user profile
  updateProfile: (data) => apiClient.patch('/users/me', data),
};

// ===== ADDRESS API ENDPOINTS =====
export const addressAPI = {
  // List current user's addresses
  getAddresses: () => apiClient.get('/addresses'),

  // Create a new address
  createAddress: (data) => apiClient.post('/addresses', data),

  // Update an address (partial)
  updateAddress: (id, data) => apiClient.patch(`/addresses/${id}`, data),

  // Delete an address
  deleteAddress: (id) => apiClient.delete(`/addresses/${id}`),
};

// ===== VENDOR API ENDPOINTS =====
export const vendorAPI = {
  // Get vendor dashboard
  getDashboard: () => apiClient.get('/vendor/dashboard'),
  
  // Get vendor products
  getProducts: () => apiClient.get('/vendor/products'),
  
  // Add product
  addProduct: (data) => apiClient.post('/vendor/products', data),
  
  // Update product (backend uses PATCH)
  updateProduct: (id, data) => apiClient.patch(`/vendor/products/${id}`, data),
  
  // Delete product
  deleteProduct: (id) => apiClient.delete(`/vendor/products/${id}`),

  // Product variants
  getVariants: (productId) => apiClient.get(`/products/${productId}/variants`),
  addVariant: (productId, data) => apiClient.post(`/vendor/products/${productId}/variants`, data),
  updateVariant: (variantId, data) => apiClient.patch(`/vendor/variants/${variantId}`, data),
  deleteVariant: (variantId) => apiClient.delete(`/vendor/variants/${variantId}`),

  // Product images
  uploadImage: (productId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/vendor/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  saveImageUrl: (productId, url) => {
    return apiClient.post(`/vendor/products/${productId}/images/url`, { url });
  },
  deleteImage: (productId, imageId) => apiClient.delete(`/vendor/products/${productId}/images/${imageId}`),
  
  // Get orders
  getOrders: (params = {}) => {
    const q = new URLSearchParams();
    if (params.page != null) q.set('page', params.page);
    if (params.size != null) q.set('size', params.size);
    const qs = q.toString();
    return apiClient.get(`/vendor/orders${qs ? '?' + qs : ''}`);
  },
  
  // Update order status
  updateOrderStatus: (id, status) => 
    apiClient.put(`/vendor/orders/${id}`, { status: typeof status === 'string' ? status : status?.status }),

  // Cancel order
  cancelOrder: (id, data) => apiClient.patch(`/vendor/orders/${id}/cancel`, data),

  // Get vendor analytics
  getAnalytics: () => apiClient.get('/vendor/analytics'),

  // Get vendor analytics time-series (for charts)
  getAnalyticsTimeSeries: () => apiClient.get('/vendor/analytics/timeseries'),

  // Get vendor coupons/promotions
  getCoupons: () => apiClient.get('/vendor/coupons'),

  // Create a coupon/promotion
  createCoupon: (data) => apiClient.post('/vendor/coupons', data),

  // Update a coupon/promotion
  updateCoupon: (id, data) => apiClient.patch(`/vendor/coupons/${id}`, data),

  // Toggle coupon active/inactive
  toggleCoupon: (id) => apiClient.patch(`/vendor/coupons/${id}/toggle`),
};

// ===== NOTIFICATION API ENDPOINTS =====
export const notificationAPI = {
  // List notifications for the authenticated user (paginated)
  list: (params = {}) => {
    const q = new URLSearchParams();
    if (params.page != null) q.set('page', params.page);
    if (params.size != null) q.set('size', params.size);
    const qs = q.toString();
    return apiClient.get(`/notifications${qs ? '?' + qs : ''}`);
  },

  // Unread count for the authenticated user
  unreadCount: () => apiClient.get('/notifications/unread-count'),

  // Mark a single notification as read
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),

  // Mark all notifications as read
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
};

// ===== WISHLIST API ENDPOINTS =====
export const wishlistAPI = {
  // Get current user's wishlist
  getWishlist: () => apiClient.get('/wishlist'),

  // Add a product to the wishlist (backend expects { productId })
  addItem: (productId) => apiClient.post('/wishlist/items', { productId }),

  // Remove a wishlist item by its item id
  removeItem: (itemId) => apiClient.delete(`/wishlist/items/${itemId}`),
};

// ===== CATEGORY API ENDPOINTS =====
export const categoryAPI = {
  getCategories: () => apiClient.get('/categories'),
};

// ===== ADMIN API ENDPOINTS =====
export const adminAPI = {
  // Dashboard
  getDashboard: () => apiClient.get('/admin/dashboard'),

  // Analytics (charts data)
  getAnalytics: () => apiClient.get('/admin/analytics'),

  // Users
  getUsers: (params = {}) => {
    const q = new URLSearchParams();
    if (params.role) q.set('role', params.role);
    if (params.page != null) q.set('page', params.page);
    if (params.size != null) q.set('size', params.size);
    return apiClient.get(`/admin/users?${q}`);
  },
  getUser: (id) => apiClient.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => apiClient.patch(`/admin/users/${id}/role`, { role }),

  // Vendors
  getVendors: (params = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.page != null) q.set('page', params.page);
    if (params.size != null) q.set('size', params.size);
    return apiClient.get(`/admin/vendors?${q}`);
  },
  getVendor: (id) => apiClient.get(`/admin/vendors/${id}`),
  approveVendor: (id) => apiClient.patch(`/admin/vendors/${id}/approve`),
  rejectVendor: (id) => apiClient.patch(`/admin/vendors/${id}/reject`),
  suspendVendor: (id) => apiClient.patch(`/admin/vendors/${id}/suspend`),

  // Audit Logs
  getAuditLogs: (params = {}) => {
    const q = new URLSearchParams();
    if (params.page != null) q.set('page', params.page);
    if (params.size != null) q.set('size', params.size);
    return apiClient.get(`/admin/audit-logs?${q}`);
  },

  // Categories
  getCategories: () => apiClient.get('/admin/categories'),
  createCategory: (data) => apiClient.post('/admin/categories', data),
  updateCategory: (id, data) => apiClient.patch(`/admin/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/admin/categories/${id}`),

  // Orders
  getOrders: (params = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.page != null) q.set('page', params.page);
    if (params.size != null) q.set('size', params.size);
    return apiClient.get(`/admin/orders?${q}`);
  },
  getOrder: (id) => apiClient.get(`/admin/orders/${id}`),

  // Cancel order
  cancelOrder: (id, data) => apiClient.patch(`/admin/orders/${id}/cancel`, data),
};

// ===== CUSTOMER API ENDPOINTS =====
export const customerAPI = {
  // Search products with filters
  getProducts: (params = {}) => {
    const q = new URLSearchParams();
    if (params.q) q.set('q', params.q);
    if (params.category) q.set('category', params.category);
    if (params.vendor) q.set('vendor', params.vendor);
    if (params.priceMin != null) q.set('priceMin', params.priceMin);
    if (params.priceMax != null) q.set('priceMax', params.priceMax);
    if (params.inStock != null) q.set('inStock', params.inStock);
    if (params.minRating != null) q.set('minRating', params.minRating);
    if (params.sort) q.set('sort', params.sort);
    if (params.page != null) q.set('page', params.page);
    if (params.size != null) q.set('size', params.size);
    const qs = q.toString();
    return apiClient.get(`/products${qs ? '?' + qs : ''}`);
  },

  // Autocomplete search suggestions
  autocomplete: (q, limit = 5) => {
    return apiClient.get(`/products/autocomplete?q=${encodeURIComponent(q)}&limit=${limit}`);
  },

  // Get personalized recommendations
  getRecommendations: (params = {}) => {
    const q = new URLSearchParams();
    if (params.tab) q.set('tab', params.tab);
    if (params.limit != null) q.set('limit', params.limit);
    const qs = q.toString();
    return apiClient.get(`/recommendations${qs ? '?' + qs : ''}`);
  },
  
  // Get product — detects numeric id vs slug
  getProduct: (idOrSlug) => {
    const v = String(idOrSlug).trim();
    return /^\d+$/.test(v)
      ? apiClient.get(`/products/id/${v}`)
      : apiClient.get(`/products/${v}`);
  },
  
  // Get variants for a product
  getVariants: (productId) => apiClient.get(`/products/${productId}/variants`),
  
  // Add to cart
  addToCart: (data) => apiClient.post('/cart', data),
  
  // Remove from cart
  removeFromCart: (variantId) => apiClient.delete(`/cart/items/${variantId}`),
  
  // Get cart
  getCart: () => apiClient.get('/cart'),
  
  // Checkout
  checkout: (data) => apiClient.post('/orders', data),
  
  // Get orders
  getOrders: () => apiClient.get('/orders'),
  
  // Get order by id
  getOrder: (id) => apiClient.get(`/orders/${id}`),

  // Cancel order
  cancelOrder: (id, data) => apiClient.patch(`/orders/${id}/cancel`, data),

  // Reviews & Ratings
  getProductReviews: (productId, params = {}) => {
    const q = new URLSearchParams();
    if (params.page != null) q.set('page', params.page);
    if (params.size != null) q.set('size', params.size);
    return apiClient.get(`/products/${productId}/reviews?${q}`);
  },
  getProductRating: (productId) => apiClient.get(`/products/${productId}/rating`),
  hasReviewed: (productId) => apiClient.get(`/products/${productId}/reviewed`),
  submitReview: (data) => apiClient.post('/reviews', data),
};