import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../../services/api';

// Create context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Check for stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      // Do not clear token automatically - backend may not expose /auth/me in all environments.
      // Keep token so user can still be authenticated for subsequent requests; user object remains null.
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const token = response.data?.token || response.data?.accessToken || null;
      const userFromResponse = response.data?.user || null;

      if (token) {
        localStorage.setItem('token', token);
        setToken(token);
        if (userFromResponse) {
          setUser(userFromResponse);
        } else {
          // fetch user profile from backend if login response doesn't include user
          await fetchCurrentUser();
        }
      }

      return { success: true, data: response.data };
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      console.error('Login error', status, error.response?.data || error.message);
      return {
        success: false,
        error: message,
        status,
        raw: error.response?.data || null,
      };
    }
  };

  // Register customer
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return { success: true, data: response.data };
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      console.error('Registration error', status, error.response?.data || error.message);
      return {
        success: false,
        error: message,
        status,
        raw: error.response?.data || null,
      };
    }
  };

  // Register vendor (map to backend /auth/register which expects firstName/lastName/email/password)
  const registerVendor = async (vendorData) => {
    try {
      // ensure we have firstName/lastName
      let firstName = vendorData.firstName;
      let lastName = vendorData.lastName;
      if (!firstName && vendorData.fullName) {
        const parts = vendorData.fullName.trim().split(/\s+/);
        firstName = parts.shift();
        lastName = parts.join(' ') || '';
      }

      const payload = {
        firstName,
        lastName,
        email: vendorData.email,
        password: vendorData.password,
      };

      const response = await authAPI.register(payload);
      return { success: true, data: response.data };
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message || 'Vendor registration failed. Please try again.';
      console.error('Vendor registration error', status, error.response?.data || error.message);
      return {
        success: false,
        error: message,
        status,
        raw: error.response?.data || null,
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  // Check if user is authenticated (use token presence so login works even if /auth/me is not available)
  const isAuthenticated = !!token;

  // Check if user is vendor (falls back to accountType when role not available)
  const isVendor = user?.role === 'VENDOR' || user?.accountType === 'VENDOR';

  // The value object
  const value = {
    user,
    loading,
    token,
    login,
    register,
    registerVendor,
    logout,
    isAuthenticated,
    isVendor,
    fetchCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ⭐ THIS IS THE MOST IMPORTANT PART - THE useAuth HOOK EXPORT!
// Make sure this is at the bottom of the file
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}