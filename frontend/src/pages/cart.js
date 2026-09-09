import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { FiShoppingCart, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { customerAPI } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import GuestGuard from '../components/Auth/GuestGuard';

export default function Cart() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const load = () =>
    customerAPI
      .getCart()
      .then((res) => setCart(res.data?.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load cart'));

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  const checkout = () => router.push('/checkout');

  const removeItem = async (itemId) => {
    try {
      await customerAPI.removeFromCart(itemId);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const items = cart?.items || [];

  const vendorGroups = useMemo(() => {
    const groups = {};
    items.forEach((it) => {
      const key = it.vendorId || 'unknown';
      if (!groups[key]) {
        groups[key] = { vendorId: it.vendorId, vendorName: it.vendorName || 'Unknown Vendor', items: [], subtotal: 0 };
      }
      groups[key].items.push(it);
      groups[key].subtotal += Number(it.subtotal || 0);
    });
    return Object.values(groups);
  }, [items]);

  if (mounted && !loading && !isAuthenticated) {
    return <GuestGuard message="Log in to view your cart and check out." />;
  }

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
          {vendorGroups.map((group) => (
            <div key={group.vendorId || 'unknown'} className="content-card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <FiShoppingBag size={16} style={{ color: 'var(--accent)' }} />
                <strong>{group.vendorName}</strong>
                <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 13 }}>
                  MMK {group.subtotal.toFixed(2)}
                </span>
              </div>
              {group.items.map((it) => (
                <div key={it.variantId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{it.productName}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {it.variantLabel || it.sku} · Qty {it.quantity}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="pcard-price">MMK {it.subtotal}</span>
                    <button
                      onClick={() => removeItem(it.variantId)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}
                      title="Remove item"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="content-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Total ({cart?.totalQuantity} items)</strong>
              <div className="pcard-price" style={{ fontSize: 20 }}>MMK {cart?.totalPrice}</div>
              {vendorGroups.length > 1 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>
                  {vendorGroups.length} separate orders will be created (one per vendor)
                </p>
              )}
            </div>
            <button className="btn-pill btn-pill-yellow" onClick={checkout}>
              Checkout
            </button>
          </div>
        </>
      )}
    </AppLayout>
  );
}
