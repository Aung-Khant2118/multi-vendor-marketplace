import axios from 'axios';

// Default to localhost backend for local development if env not provided
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

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
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
  
  // Register vendor
  registerVendor: (data) => apiClient.post('/auth/register-vendor', data),
  
  // Get current user
  getCurrentUser: () => apiClient.get('/auth/me'),
  
  // Logout
  logout: () => apiClient.post('/auth/logout'),
  
  // Verify email
  verifyEmail: (token) => apiClient.get(`/auth/verify/${token}`),
  
  // Forgot password
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (token, password) => 
    apiClient.post(`/auth/reset-password/${token}`, { password }),
};

// ===== USER API ENDPOINTS =====
export const userAPI = {
  // Update current user profile
  updateProfile: (data) => apiClient.patch('/users/me', data),
};

// ===== VENDOR API ENDPOINTS =====
export const vendorAPI = {
  // Get vendor dashboard
  getDashboard: () => apiClient.get('/vendor/dashboard'),
  
  // Get vendor products
  getProducts: () => apiClient.get('/vendor/products'),
  
  // Add product
  addProduct: (data) => apiClient.post('/vendor/products', data),
  
  // Update product
  updateProduct: (id, data) => apiClient.put(`/vendor/products/${id}`, data),
  
  // Delete product
  deleteProduct: (id) => apiClient.delete(`/vendor/products/${id}`),
  
  // Get orders
  getOrders: () => apiClient.get('/vendor/orders'),
  
  // Update order status
  updateOrderStatus: (id, status) => 
    apiClient.put(`/vendor/orders/${id}`, { status }),
};

// ===== CUSTOMER API ENDPOINTS =====
export const customerAPI = {
  // Get products
  getProducts: () => apiClient.get('/products'),
  
  // Get product by id
  getProduct: (id) => apiClient.get(`/products/${id}`),
  
  // Add to cart
  addToCart: (data) => apiClient.post('/cart', data),
  
  // Get cart
  getCart: () => apiClient.get('/cart'),
  
  // Checkout
  checkout: (data) => apiClient.post('/orders', data),
  
  // Get orders
  getOrders: () => apiClient.get('/orders'),
  
  // Get order by id
  getOrder: (id) => apiClient.get(`/orders/${id}`),
};