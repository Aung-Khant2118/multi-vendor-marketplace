import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { wishlistAPI } from '../../services/api';
import { useAuth } from '../auth/AuthContext';

const STORAGE_KEY = 'zaylink_wishlist_ids';
const WishlistContext = createContext();

const readStored = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [ids, setIds] = useState(() => readStored());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist from backend when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    wishlistAPI
      .getWishlist()
      .then((res) => {
        const data = res.data?.data;
        const wishlistItems = data?.items || [];
        setItems(wishlistItems);
        setIds(wishlistItems.map((item) => item.productId));
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  // Sync localStorage for guests
  useEffect(() => {
    if (typeof window === 'undefined' || isAuthenticated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids, isAuthenticated]);

  const isWishlisted = useCallback(
    (productId) => ids.includes(productId),
    [ids]
  );

  const toggleWishlist = useCallback(
    async (productId) => {
      if (!isAuthenticated) {
        // Guest: use localStorage
        setIds((prev) =>
          prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
        );
        return;
      }

      // Authenticated: use backend API
      if (ids.includes(productId)) {
        // Find the wishlist item ID to remove
        const item = items.find((i) => i.productId === productId);
        if (item) {
          try {
            const res = await wishlistAPI.removeItem(item.id);
            const data = res.data?.data;
            setItems(data?.items || []);
            setIds((data?.items || []).map((i) => i.productId));
          } catch {
            // ignore
          }
        }
      } else {
        try {
          const res = await wishlistAPI.addItem(productId);
          const data = res.data?.data;
          setItems(data?.items || []);
          setIds((data?.items || []).map((i) => i.productId));
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated, ids, items]
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!isAuthenticated) {
        setIds((prev) => prev.filter((id) => id !== productId));
        return;
      }

      const item = items.find((i) => i.productId === productId);
      if (item) {
        try {
          const res = await wishlistAPI.removeItem(item.id);
          const data = res.data?.data;
          setItems(data?.items || []);
          setIds((data?.items || []).map((i) => i.productId));
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated, items]
  );

  return (
    <WishlistContext.Provider value={{ ids, items, loading, isWishlisted, toggleWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
