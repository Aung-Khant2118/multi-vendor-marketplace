import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { customerAPI } from '../../services/api';
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
          </>
        )}
      </div>
    </div>
  );
}