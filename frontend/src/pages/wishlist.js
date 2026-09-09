import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FiHeart } from 'react-icons/fi';
import { customerAPI } from '../services/api';
import { useWishlist } from '../features/wishlist/WishlistContext';
import { useAuth } from '../features/auth/AuthContext';
import { useQuickAddToCart } from '../lib/useQuickAddToCart';
import AppLayout from '../components/layout/AppLayout';
import ProductCard from '../components/marketplace/ProductCard';

export default function Wishlist() {
  const { ids } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState(null);
  const { addToCart, loadingId } = useQuickAddToCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    customerAPI
      .getProducts()
      .then((res) => setProducts(res.data?.data || []))
      .catch((err) => { console.error('Failed to load products:', err); setProducts([]); });
  }, []);

  const items = useMemo(() => {
    const catalog = products || [];
    return catalog.filter((p) => ids.includes(p.id));
  }, [products, ids]);

  const loading = products === null;

  return (
    <AppLayout>
      <div className="page-heading">
        <div>
          <h1>Wishlist</h1>
          <p>Items you have saved for later</p>
        </div>
      </div>

      {mounted && !isAuthenticated && (
        <div className="content-card" style={{ marginBottom: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <FiHeart size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 14 }}>
            <Link href="/auth/login" style={{ fontWeight: 600 }}>Log in</Link> to sync your wishlist across devices.
          </p>
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <FiHeart size={32} />
          <div className="empty-state-title">Your wishlist is empty</div>
          <p>Tap the heart icon on any product to save it here.</p>
        </div>
      ) : (
        <div className="product-grid">
          {items.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              variant="category"
              onAddToCart={addToCart}
              addToCartLoading={loadingId === p.id}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
