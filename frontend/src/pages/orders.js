import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiPackage, FiSearch, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { customerAPI } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';
import { useHasMounted } from '../lib/useHasMounted';
import AppLayout from '../components/layout/AppLayout';
import GuestGuard from '../components/Auth/GuestGuard';
import { formatCurrency, getStatusPill, ORDER_STATUS } from '../lib/format';

const CANCEL_REASONS = [
  'Changed my mind',
  'Found a better price',
  'Ordered by mistake',
  'Other',
];

export default function Orders() {
  const { isAuthenticated, loading } = useAuth();
  const mounted = useHasMounted();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNote, setCancelNote] = useState('');
  const [showCancelFor, setShowCancelFor] = useState(null);

  const load = () => {
    customerAPI
      .getOrders()
      .then((res) => setOrders(res.data?.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load orders'));
  };

  useEffect(() => {
    if (!mounted) return;
    if (!loading && !isAuthenticated) return;
    if (isAuthenticated) load();
  }, [mounted, loading, isAuthenticated]);

  const handleCancel = async (orderId) => {
    if (!cancelReason) { toast.error('Please select a reason'); return; }
    setCancellingId(orderId);
    try {
      await customerAPI.cancelOrder(orderId, { reason: cancelReason, customNote: cancelNote || undefined });
      toast.success('Order cancelled');
      setCancelReason('');
      setCancelNote('');
      setShowCancelFor(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally {
      setCancellingId(null);
    }
  };

  if (!mounted) return null;
  if (!loading && !isAuthenticated) {
    return <GuestGuard message="Log in to view your order history." />;
  }

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
        orders.map((o) => {
          const pill = getStatusPill(o.status);
          const canCancel = o.status === ORDER_STATUS.PENDING || o.status === ORDER_STATUS.CONFIRMED;
          const isCancelled = o.status === ORDER_STATUS.CANCELLED;

          return (
            <div key={o.id} className="content-card" style={{ marginBottom: 12 }}>
              <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Order #{o.id}</strong>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 8 }}>
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </span>
                </div>
                <span className={`vpill ${pill.cls}`}>{pill.label}</span>
              </div>

              <ul style={{ listStyle: 'none', margin: '8px 0 0' }}>
                {o.items?.map((it) => (
                  <li key={it.id} style={{ padding: '4px 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                    {it.productName} ({it.variantLabel}) x {it.quantity} — {formatCurrency(it.subtotal)}
                  </li>
                ))}
              </ul>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
                <div className="pcard-price">{formatCurrency(o.total)}</div>
                {canCancel && (
                  <div>
                    {showCancelFor === o.id ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                          className="form-input"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          style={{ width: 160, fontSize: 13 }}
                        >
                          <option value="">Reason...</option>
                          {CANCEL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <input
                          className="form-input"
                          placeholder="Note (optional)"
                          value={cancelNote}
                          onChange={(e) => setCancelNote(e.target.value)}
                          style={{ width: 140, fontSize: 13 }}
                        />
                        <button
                          type="button"
                          className="vbtn vbtn-red"
                          style={{ fontSize: 13, padding: '4px 10px' }}
                          disabled={!cancelReason || cancellingId === o.id}
                          onClick={() => handleCancel(o.id)}
                        >
                          {cancellingId === o.id ? '...' : 'Confirm'}
                        </button>
                        <button
                          type="button"
                          className="vbtn"
                          style={{ fontSize: 13, padding: '4px 10px' }}
                          onClick={() => { setShowCancelFor(null); setCancelReason(''); setCancelNote(''); }}
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="vbtn vbtn-red"
                        style={{ fontSize: 13, padding: '4px 10px' }}
                        onClick={() => setShowCancelFor(o.id)}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isCancelled && o.cancellationReason && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: '#fbe3e7', borderRadius: 6, fontSize: 13 }}>
                  <strong style={{ color: '#c0293f' }}>Cancellation Reason:</strong> {o.cancellationReason}
                  {o.cancellationNote && <span style={{ color: 'var(--text-secondary)' }}> — {o.cancellationNote}</span>}
                  {o.cancelledBy && <span style={{ color: 'var(--text-secondary)', display: 'block', marginTop: 4 }}>Cancelled by: {o.cancelledBy}</span>}
                </div>
              )}
            </div>
          );
        })
      )}
    </AppLayout>
  );
}
