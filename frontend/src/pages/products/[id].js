import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { customerAPI, wishlistAPI } from '../../services/api';
import { useAuth } from '../../features/auth/AuthContext';

export default function ProductDetail() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);
  const [wishlistBusy, setWishlistBusy] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
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
  }, [isAuthenticated, id]);

  const toggleWishlist = async () => {
    if (!product || wishlistBusy) return;
    setWishlistBusy(true);
    try {
      if (inWishlist) {
        await wishlistAPI.removeItem(wishlistItemId);
        setInWishlist(false);
        setWishlistItemId(null);
        toast.success('Removed from wishlist');
      } else {
        const res = await wishlistAPI.addItem(product.id);
        const added = (res.data?.data?.items || []).find(
          (i) => Number(i.productId) === Number(product.id)
        );
        setInWishlist(true);
        setWishlistItemId(added ? added.id : null);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update wishlist');
    } finally {
      setWishlistBusy(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    wishlistAPI
      .getWishlist()
      .then((res) => {
        const found = (res.data?.data?.items || []).find(
          (i) => Number(i.productId) === Number(id)
        );
        setInWishlist(!!found);
        setWishlistItemId(found ? found.id : null);
      })
      .catch(() => {});
  }, [isAuthenticated, id]);

  const addToCart = async () => {
    if (!selectedVariant) {
      toast.error('Select a variant first');
      return;
    }
    try {
      await customerAPI.addToCart({ variantId: Number(selectedVariant), quantity: Number(quantity) });
      toast.success('Added to cart');
      router.push('/cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '640px' }}>
        <p className="auth-link">
          <Link href="/products">Back to products</Link>
        </p>
        {error && <p className="form-error">{error}</p>}
        {product && (
          <>
            <h1 className="auth-title">{product.name}</h1>
            <p>{product.description}</p>
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
              />
            </div>
            <button className="btn-primary" onClick={addToCart}>
              Add to cart
            </button>
            <button className="btn-secondary" onClick={toggleWishlist} disabled={wishlistBusy} style={{ marginTop: '10px', width: '100%' }}>
              {inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            </button>
          </>
        )}
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