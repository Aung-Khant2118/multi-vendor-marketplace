import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { FiShoppingCart } from 'react-icons/fi';
import { customerAPI } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';
import AppLayout from '../components/layout/AppLayout';

export default function Cart() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [error, setError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  const load = () =>
    customerAPI
      .getCart()
      .then((res) => setCart(res.data?.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load cart'));

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    if (isAuthenticated) load();
  }, [loading, isAuthenticated]);

  const checkout = async () => {
    setCheckingOut(true);
    try {
      const res = await customerAPI.checkout({});
      toast.success(`Order #${res.data?.data?.id} placed`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  if (!isAuthenticated) return null;

  const items = cart?.items || [];

  return (
    <AppLayout>
      <div className="page-heading">
        <div>
          <h1>Your Cart</h1>
          <p>Review your items before checkout</p>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      {!error && items.length === 0 ? (
        <div className="empty-state">
          <FiShoppingCart size={32} />
          <div className="empty-state-title">Your cart is empty</div>
          <p>Browse the marketplace to find something you love.</p>
        </div>
      ) : (
        <>
          {items.map((it) => (
            <div key={it.variantId} className="content-card" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{it.productName}</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  {it.sku} · Qty {it.quantity}
                </p>
              </div>
              <span className="pcard-price">${it.subtotal}</span>
            </div>
          ))}

          <div className="content-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Total ({cart?.totalQuantity} items)</strong>
              <div className="pcard-price" style={{ fontSize: 20 }}>${cart?.totalPrice}</div>
            </div>
            <button className="btn-pill btn-pill-yellow" onClick={checkout} disabled={checkingOut}>
              {checkingOut ? 'Placing order…' : 'Checkout'}
            </button>
          </div>
        </>
      )}
    </AppLayout>
  );
}
