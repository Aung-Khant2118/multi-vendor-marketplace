import { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI } from '../../services/api';

// Create context
const AuthContext = createContext();

// Decode JWT payload (backend token subject is the user email, role is a claim)
const decodeToken = (token) => {
  if (!token) return null;
  try {
    const payload = jwtDecode(token);
    return { email: payload.sub || null, role: payload.role || null };
  } catch {
    return null;
  }
};

// Read stored token safely (component may render server-side on first paint)
const getStoredToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;

// Provider component
export function AuthProvider({ children }) {
  // Restore session from the stored JWT without a network call.
  const [user, setUser] = useState(() => decodeToken(getStoredToken()));
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(() => getStoredToken());

  // Fetch current user profile from the backend (/auth/me)
  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const data = response.data?.data || response.data || null;
      if (data) {
        setUser({
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role || null,
          vendorStatus: data.vendorStatus || null,
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
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
          // Backend login returns only a token; derive user (incl. role) from it.
          setUser(decodeToken(token));
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

  // Register vendor (backend /auth/register-vendor creates a VENDOR account + PENDING store)
  const registerVendor = async (vendorData) => {
    try {
      const response = await authAPI.registerVendor({
        firstName: vendorData.firstName,
        lastName: vendorData.lastName,
        email: vendorData.email,
        password: vendorData.password,
        storeName: vendorData.storeName,
        businessAddress: vendorData.businessAddress,
        storeDescription: vendorData.storeDescription,
      });
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
    } catch {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!token;

  // Role-based checks (frontend: convenience/UI only — backend stays authoritative)
  const isVendor = user?.role === 'VENDOR';
  const isAdmin = user?.role === 'ADMIN';

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
    isAdmin,
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