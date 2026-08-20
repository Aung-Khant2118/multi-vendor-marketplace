import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { customerAPI } from '../../services/api';
import { useAuth } from '../../features/auth/AuthContext';

export default function Products() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    customerAPI
      .getProducts()
      .then((res) => setProducts(res.data?.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load products'));
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '760px' }}>
        <h1 className="auth-title">Products</h1>
        <p className="auth-link">
          <Link href="/dashboard">Back to dashboard</Link>
        </p>
        {error && <p className="form-error">{error}</p>}
        {!error && products.length === 0 && <p>No products yet.</p>}
        <div className="product-list">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <p className="product-price">${p.price}</p>
              <Link href={`/products/${p.id}`}>View & add to cart</Link>
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