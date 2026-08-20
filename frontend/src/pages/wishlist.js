import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { wishlistAPI } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadWishlist = () => {
    wishlistAPI
      .getWishlist()
      .then((res) => setItems(res.data?.data?.items || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load wishlist'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    loadWishlist();
  }, [isAuthenticated]);

  const removeItem = async (itemId) => {
    try {
      const res = await wishlistAPI.removeItem(itemId);
      setItems(res.data?.data?.items || items.filter((i) => i.id !== itemId));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove item');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '760px' }}>
        <h1 className="auth-title">My Wishlist</h1>
        <p className="auth-link">
          <Link href="/dashboard">Back to dashboard</Link>
        </p>
        {error && <p className="form-error">{error}</p>}
        {loading && <p>Loading...</p>}
        {!loading && !error && items.length === 0 && <p>Your wishlist is empty.</p>}
        <div className="product-list">
          {items.map((item) => (
            <div key={item.id} className="product-card">
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.productName} className="product-image" />
              )}
              <h3>{item.productName}</h3>
              <p className="product-price">${item.price}</p>
              <Link href={`/products/${item.productId}`}>View product</Link>
              <button className="btn-secondary" onClick={() => removeItem(item.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - OUTSIDE the card */}
      <div className="auth-footer">
        <p className="brand">ZayLink</p>
        <p className="copyright">© 2026 ZayLink. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </div>
  );
}