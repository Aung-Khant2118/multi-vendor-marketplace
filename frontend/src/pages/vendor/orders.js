import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { vendorAPI } from '../../services/api';
import { useAuth } from '../../features/auth/AuthContext';

const STATUS = ['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELED'];

export default function VendorOrders() {
  const { isAuthenticated, isVendor } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const load = () =>
    vendorAPI
      .getOrders()
      .then((res) => setOrders(res.data?.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load orders'));

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    if (!isVendor) {
      router.replace('/dashboard');
      return;
    }
    load();
  }, [isAuthenticated, isVendor]);

  const update = async (orderId, status) => {
    try {
      await vendorAPI.updateOrderStatus(orderId, { status });
      toast.success('Order status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  if (!isAuthenticated || !isVendor) return null;

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '720px' }}>
        <h1 className="auth-title">Vendor Orders</h1>
        <p className="auth-link">
          <Link href="/dashboard">Back to dashboard</Link>
        </p>
        {error && <p className="form-error">{error}</p>}
        {!error && orders.length === 0 && <p>No orders yet.</p>}
        {orders.map((o) => (
          <div key={o.id} className="dashboard-section">
            <div className="info-row">
              <strong>Order #{o.id}</strong> — {o.status} — ${o.total}
            </div>
            <ul>
              {o.items.map((it) => (
                <li key={it.id}>
                  {it.productName} x {it.quantity} (${it.subtotal})
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 8 }}>
              <select className="form-input" defaultValue="" onChange={(e) => update(o.id, e.target.value)}>
                <option value="" disabled>
                  Update status…
                </option>
                {STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}