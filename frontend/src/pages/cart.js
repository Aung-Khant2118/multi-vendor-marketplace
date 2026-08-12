import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
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

  const checkout = async () => {
    try {
      const res = await customerAPI.checkout({});
      toast.success(`Order #${res.data?.data?.id} placed`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    }
  };

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
            <button className="btn-primary" onClick={checkout}>
              Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
}