import { createContext, useContext, useEffect, useState } from 'react';

// There is no wishlist API on the backend, so wishlist state lives entirely
// in localStorage on the client. It works for guests and signed-in users
// alike, matching the "Wishlist" nav item shown for both in the reference
// designs.
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
  const [ids, setIds] = useState(() => readStored());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const isWishlisted = (productId) => ids.includes(productId);

  const toggleWishlist = (productId) => {
    setIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const removeFromWishlist = (productId) => {
    setIds((prev) => prev.filter((id) => id !== productId));
  };

  return (
    <WishlistContext.Provider value={{ ids, isWishlisted, toggleWishlist, removeFromWishlist }}>
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
