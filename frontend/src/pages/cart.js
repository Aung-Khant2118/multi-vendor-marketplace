import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { customerAPI } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    customerAPI
      .getCart()
      .then((res) => setCart(res.data?.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load cart'));

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    load();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const items = cart?.items || [];

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '640px' }}>
        <h1 className="auth-title">Your Cart</h1>
        <p className="auth-link">
          <Link href="/products">Continue shopping</Link>
        </p>
        {error && <p className="form-error">{error}</p>}
        {!error && items.length === 0 && <p>Your cart is empty.</p>}
        {items.map((it) => (
          <div key={it.variantId} className="info-row">
            <strong>{it.productName}</strong> — {it.sku} x {it.quantity} = ${it.subtotal}
          </div>
        ))}
        {items.length > 0 && (
          <>
            <p style={{ fontWeight: 600 }}>
              Total ({cart?.totalQuantity} items): ${cart?.totalPrice}
            </p>
            <Link href="/checkout" className="btn-primary" style={{ display: 'inline-block' }}>
              Proceed to checkout
            </Link>
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