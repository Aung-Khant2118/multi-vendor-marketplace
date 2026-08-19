import { useEffect, useMemo, useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import { customerAPI } from '../services/api';
import { FALLBACK_PRODUCTS } from '../lib/catalog';
import { useWishlist } from '../features/wishlist/WishlistContext';
import { useQuickAddToCart } from '../lib/useQuickAddToCart';
import AppLayout from '../components/layout/AppLayout';
import ProductCard from '../components/marketplace/ProductCard';

export default function Wishlist() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState(null);
  const { addToCart, loadingId } = useQuickAddToCart();

  useEffect(() => {
    customerAPI
      .getProducts()
      .then((res) => setProducts(res.data?.data || []))
      .catch(() => setProducts([]));
  }, []);

  const items = useMemo(() => {
    const catalog = products && products.length > 0 ? products : FALLBACK_PRODUCTS;
    return catalog.filter((p) => ids.includes(p.id));
  }, [products, ids]);

  const loading = products === null;

  return (
    <AppLayout>
      <div className="page-heading">
        <div>
          <h1>Wishlist</h1>
          <p>Items you have saved for later, stored on this device</p>
        </div>
      </div>

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
