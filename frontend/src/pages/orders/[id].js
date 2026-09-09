import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { customerAPI } from '../../services/api';
import { useAuth } from '../../features/auth/AuthContext';
import GuestGuard from '../../components/Auth/GuestGuard';

const formatAddress = (a) => {
  if (!a) return '—';
  return [a.line1, a.line2, a.city, a.region, a.postalCode, a.country]
    .filter(Boolean)
    .join(', ');
};

export default function OrderDetail() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!id) return;
    customerAPI
      .getOrder(id)
      .then((res) => setOrder(res.data?.data || null))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load order'));
  }, [isAuthenticated, id]);

  if (!isAuthenticated) {
    return <GuestGuard message="Log in to view order details." layout={false} />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '720px' }}>
        <h1 className="auth-title">Order #{order?.id ?? id}</h1>
        <p className="auth-link">
          <Link href="/orders">Back to orders</Link>
        </p>
        {error && <p className="form-error">{error}</p>}
        {order && (
          <>
            <div className="dashboard-section">
              <div className="info-row">
                <strong>Status:</strong> {order.status}
              </div>
              <div className="info-row">
                <strong>Placed:</strong> {new Date(order.createdAt).toLocaleString()}
              </div>
              <div className="info-row">
                <strong>Payment:</strong> {order.paymentMethod} — {order.paymentStatus}
              </div>
            </div>

            <div className="dashboard-section">
              <h2 className="dashboard-subtitle">Shipping address</h2>
              <p>{formatAddress(order.shippingAddress)}</p>
            </div>

            <div className="dashboard-section">
              <h2 className="dashboard-subtitle">Billing address</h2>
              <p>{formatAddress(order.billingAddress)}</p>
            </div>

            <div className="dashboard-section">
              <h2 className="dashboard-subtitle">Items</h2>
              {(order.items || []).map((it) => (
                <div key={it.id} className="info-row">
                  <strong>{it.productName}</strong> — {it.variantLabel || it.sku} x {it.quantity} = MMK {it.subtotal}{' '}
                  <em>({it.status})</em>
                </div>
              ))}
            </div>

            <div className="dashboard-section">
              <h2 className="dashboard-subtitle">Summary</h2>
              <p>Subtotal: MMK {Number(order.subtotal).toFixed(2)}</p>
              <p>Shipping: MMK {Number(order.shippingCost).toFixed(2)}</p>
              <p style={{ fontWeight: 600 }}>Total: MMK {Number(order.total).toFixed(2)}</p>
              {order.notes && <p>Notes: {order.notes}</p>}
            </div>
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