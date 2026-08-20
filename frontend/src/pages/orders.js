import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiPackage } from 'react-icons/fi';
import { customerAPI } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';
import AppLayout from '../components/layout/AppLayout';

export default function Orders() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    if (isAuthenticated) {
      customerAPI
        .getOrders()
        .then((res) => setOrders(res.data?.data || []))
        .catch((err) => setError(err.response?.data?.message || 'Failed to load orders'));
    }
  }, [loading, isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <AppLayout>
      <div className="page-heading">
        <div>
          <h1>My Orders</h1>
          <p>Track and review your past purchases</p>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      {!error && orders.length === 0 ? (
        <div className="empty-state">
          <FiPackage size={32} />
          <div className="empty-state-title">No orders yet</div>
          <p>Your placed orders will show up here.</p>
        </div>
      ) : (
        orders.map((o) => (
          <div key={o.id} className="content-card">
            <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Order #{o.id}</strong>
              <span className="filter-pill" style={{ cursor: 'default' }}>{o.status}</span>
            </div>
            <ul style={{ listStyle: 'none', margin: '8px 0 0' }}>
              {o.items.map((it) => (
                <li key={it.id} style={{ padding: '4px 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                  {it.productName} x {it.quantity} (${it.subtotal})
                </li>
              ))}
            </ul>
            <div className="pcard-price" style={{ marginTop: 10 }}>${o.total}</div>
          </div>
        ))
      )}
    </AppLayout>
  );
}
