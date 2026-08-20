import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { FiHeart, FiStar, FiCheckCircle, FiHome as FiStoreIcon, FiShoppingCart } from 'react-icons/fi';
import { customerAPI } from '../../services/api';
import { useAuth } from '../../features/auth/AuthContext';
import { useWishlist } from '../../features/wishlist/WishlistContext';
import { enrichProduct } from '../../lib/catalog';
import AppLayout from '../../components/layout/AppLayout';

export default function ProductDetail() {
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    customerAPI
      .getProduct(id)
      .then((res) => {
        setProduct(res.data?.data || null);
        return customerAPI.getVariants(id);
      })
      .then((vres) => {
        const v = vres.data?.data || [];
        setVariants(v);
        if (v.length > 0) setSelectedVariant(v[0].id);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load product'));
  }, [id]);

  const addToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart');
      router.push('/auth/login');
      return;
    }
    if (!selectedVariant) {
      toast.error('Select a variant first');
      return;
    }
    setAdding(true);
    try {
      await customerAPI.addToCart({ variantId: Number(selectedVariant), quantity: Number(quantity) });
      toast.success('Added to cart');
      router.push('/cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <p className="form-error">{error}</p>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout>
        <p>Loading product…</p>
      </AppLayout>
    );
  }

  const p = enrichProduct(product);
  const wishlisted = isWishlisted(p.id);

  return (
    <AppLayout>
      <div className="content-card" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 380px) 1fr', gap: 32 }} className="pdp-grid">
          <div className="pcard-media" style={{ borderRadius: 'var(--radius-lg)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.displayImage} alt={p.name} />
            <button
              type="button"
              className={`pcard-wishlist ${wishlisted ? 'active' : ''}`}
              onClick={() => toggleWishlist(p.id)}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <FiHeart fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{p.name}</h1>
            <div className="pcard-store" style={{ margin: '10px 0' }}>
              <FiStoreIcon />
              <span>{p.displayStoreName}</span>
              {p.displayVerified && <FiCheckCircle className="verified" />}
              <span style={{ marginLeft: 10 }}>
                <FiStar style={{ color: 'var(--yellow-600)' }} /> {p.displayRating} ({p.displayReviewCount})
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{p.description}</p>
            <div className="pcard-price" style={{ fontSize: 26, marginBottom: 20 }}>
              ${Number(p.price).toFixed(2)}
            </div>

            <div className="form-group">
              <label className="form-label">Variant</label>
              <select
                className="form-input"
                value={selectedVariant || ''}
                onChange={(e) => setSelectedVariant(e.target.value)}
              >
                {!variants.length && <option value="">No variants</option>}
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.sku || `Variant #${v.id}`} — ${v.price} (stock: {v.stock})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                className="form-input"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{ maxWidth: 120 }}
              />
            </div>

            <button className="btn-pill btn-pill-yellow" onClick={addToCart} disabled={adding}>
              <FiShoppingCart /> {adding ? 'Adding…' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 700px) {
          .pdp-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}
