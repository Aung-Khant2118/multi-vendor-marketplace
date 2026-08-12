import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { customerAPI } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    customerAPI
      .getOrders()
      .then((res) => setOrders(res.data?.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load orders'));
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '680px' }}>
        <h1 className="auth-title">My Orders</h1>
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
          </div>
        ))}
      </div>
    </div>
  );
}