import { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FiSearch, FiChevronLeft, FiChevronRight, FiX, FiPackage, FiTruck, FiCheckCircle, FiClock, FiUser, FiMapPin } from 'react-icons/fi';
import { vendorAPI } from '../../services/api';
import { useVendorGuard } from '../../lib/useVendorGuard';
import { formatCurrency, ORDER_STATUS, STATUS_LABELS, getStatusPill, formatPaymentInfo } from '../../lib/format';
import VendorLayout from '../../components/vendor/VendorLayout';

const TABS = [
  { key: 'ALL', label: 'All Orders' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const CANCEL_REASONS = [
  'Out of Stock',
  'Damaged Item',
  'Price Mismatch',
  'Customer Request',
  'Fraud Suspected',
  'Other',
];

const WORKFLOW_STEPS = [
  { status: 'PENDING', label: 'Pending', icon: FiClock },
  { status: 'CONFIRMED', label: 'Confirmed', icon: FiCheckCircle },
  { status: 'PROCESSING', label: 'Processing', icon: FiPackage },
  { status: 'SHIPPED', label: 'Shipped', icon: FiTruck },
  { status: 'DELIVERED', label: 'Delivered', icon: FiCheckCircle },
  { status: 'COMPLETED', label: 'Completed', icon: FiCheckCircle },
];

const PAGE_SIZE = 10;

function pageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('...');
    out.push(p);
  });
  return out;
}

function getNextAction(status) {
  switch (status) {
    case 'PENDING': return { label: 'Accept Order', target: 'CONFIRMED' };
    case 'CONFIRMED': return { label: 'Start Preparing', target: 'PROCESSING' };
    case 'PROCESSING': return { label: 'Ship Order', target: 'SHIPPED' };
    case 'SHIPPED': return { label: 'Mark Delivered', target: 'DELIVERED' };
    case 'DELIVERED': return { label: 'Complete Order', target: 'COMPLETED' };
    default: return null;
  }
}

export default function VendorOrders() {
  const { ready } = useVendorGuard();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('ALL');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelling, setCancelling] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNote, setCancelNote] = useState('');

  const load = useCallback(() => {
    vendorAPI
      .getOrders({ page: page - 1, size: 20 })
      .then((res) => {
        setOrders(res.data?.data || []);
        setTotalElements(res.data?.totalElements || 0);
        setTotalPages(res.data?.totalPages || 1);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load orders'));
  }, [page]);

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready, load]);

  const updateStatus = async (orderId, status) => {
    setUpdating(true);
    try {
      await vendorAPI.updateOrderStatus(orderId, { status });
      toast.success('Order status updated');
      load();
      setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status } : prev));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!cancelReason) { toast.error('Please select a reason'); return; }
    setCancelling(orderId);
    try {
      await vendorAPI.cancelOrder(orderId, { reason: cancelReason, customNote: cancelNote || undefined });
      toast.success('Order cancelled');
      setCancelReason('');
      setCancelNote('');
      setCancelling(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
      setCancelling(null);
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (tab !== 'ALL' && o.status !== tab) return false;
      if (query) {
        const q = query.toLowerCase();
        const matchId = `${o.id}`.includes(q);
        const matchName = o.customerName?.toLowerCase().includes(q);
        const matchCustomer = `customer #${o.userId}`.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchCustomer) return false;
      }
      return true;
    });
  }, [orders, tab, query]);

  const pageOrders = filtered;
  const currentPage = page;

  if (!ready) return null;

  return (
    <VendorLayout>
      <div className="vendor-heading">
        <div>
          <h1 className="vendor-title">Orders</h1>
          <p className="vendor-subtitle">A vendor could have an Orders page like this:</p>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="vtab-row">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`vtab ${tab === t.key ? 'active' : ''}`}
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
          >
            {t.label}
          </button>
        ))}
        <div className="vtab-search">
          <FiSearch size={15} />
          <input
            placeholder="Search order ID, customer..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="vcard">
        {pageOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No orders found</div>
            <p>Try a different tab or search term.</p>
          </div>
        ) : (
          <div className="vtable-wrap">
            <table className="vtable">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Order Status</th>
                  <th>Payment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pageOrders.map((o) => {
                  const pill = getStatusPill(o.status);
                  const itemCount = o.items?.length || 0;
                  const customerName = o.customerName || `Customer #${o.userId}`;
                  const paymentInfo = formatPaymentInfo(o.paymentMethod, o.paymentStatus);
                  return (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600 }}>#ORD-{o.id}</td>
                      <td>
                        <div className="vtable-cell-main">
                          <span className="vtable-avatar">{customerName.charAt(0).toUpperCase()}</span>
                          <div>
                            <div className="vtable-name">{customerName}</div>
                          </div>
                        </div>
                      </td>
                      <td>{itemCount} {itemCount === 1 ? 'item' : 'items'}</td>
                      <td>{formatCurrency(o.total)}</td>
                      <td>
                        <span className={`vpill ${pill.cls}`}>{pill.label}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 13 }}>{paymentInfo}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="vbtn vbtn-outline"
                          style={{ padding: '6px 14px', fontSize: 13 }}
                          onClick={() => setSelectedOrder(o)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="vpagination">
          <span className="vpagination-info">
            Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, totalElements)} of {totalElements} entries
          </span>
          <div className="vpagination-controls">
            <button className="vpage-btn" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page">
              <FiChevronLeft size={14} />
            </button>
            {pageList(currentPage, totalPages).map((p, i) =>
              p === '...' ? (
                <span key={`e${i}`} className="vpage-ellipsis">…</span>
              ) : (
                <button
                  key={p}
                  className={`vpage-btn ${p === currentPage ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
            )}
            <button className="vpage-btn" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} aria-label="Next page">
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onAdvance={updateStatus}
          onCancel={cancelOrder}
          updating={updating}
          cancelling={cancelling === selectedOrder.id}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          cancelNote={cancelNote}
          setCancelNote={setCancelNote}
        />
      )}
    </VendorLayout>
  );
}

function OrderDetailModal({ order, onClose, onAdvance, onCancel, updating, cancelling, cancelReason, setCancelReason, cancelNote, setCancelNote }) {
  const pill = getStatusPill(order.status);
  const nextAction = getNextAction(order.status);
  const itemCount = order.items?.length || 0;
  const customerName = order.customerName || `Customer #${order.userId}`;
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  const currentStepIndex = WORKFLOW_STEPS.findIndex((s) => s.status === order.status);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 style={{ margin: 0, fontSize: 18 }}>Order #ORD-{order.id}</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className={`vpill ${pill.cls}`}>{pill.label}</span>
            {order.paymentMethod && (
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {formatPaymentInfo(order.paymentMethod, order.paymentStatus)}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiUser size={14} /> Customer
              </div>
              <div style={{ fontWeight: 500 }}>{customerName}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>User #{order.userId}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Order Date</div>
              <div style={{ fontWeight: 500 }}>{date}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Order Workflow</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {WORKFLOW_STEPS.map((step, i) => {
              const isCompleted = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const Icon = step.icon;
              return (
                <div
                  key={step.status}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: isCurrent ? 600 : 400,
                    background: isCurrent ? '#e4e9fb' : isCompleted ? '#dff3df' : '#f5f5f5',
                    color: isCurrent ? '#4c5fd7' : isCompleted ? '#238a3d' : '#9ca3af',
                  }}
                >
                  <Icon size={14} />
                  {step.label}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Items ({itemCount})</div>
          {order.items?.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color-light)', fontSize: 14 }}>
              <div>
                <div style={{ fontWeight: 500 }}>{item.productName || `Variant #${item.variantId}`}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</div>
              </div>
              <div style={{ fontWeight: 500 }}>{formatCurrency(item.subtotal)}</div>
            </div>
          ))}
        </div>

        {order.shippingAddress && (
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiMapPin size={14} /> Shipping Address
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              <div>{order.shippingAddress.recipientName}</div>
              <div>{order.shippingAddress.line1}</div>
              {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
              <div>{[order.shippingAddress.city, order.shippingAddress.region].filter(Boolean).join(', ')}</div>
              <div>{order.shippingAddress.country}</div>
            </div>
          </div>
        )}

        <div style={{ padding: '16px 24px', background: '#fafafa', borderRadius: '0 0 12px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
            <span>{formatCurrency(order.shippingCost)}</span>
          </div>
          {order.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4, color: '#238a3d' }}>
              <span>Discount</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 600, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        {nextAction && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="vbtn vbtn-yellow"
              disabled={updating}
              onClick={() => onAdvance(order.id, nextAction.target)}
            >
              {nextAction.label}
            </button>
            {order.status === 'PENDING' && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  className="form-input"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{ width: 180, fontSize: 13 }}
                >
                  <option value="">Cancel reason...</option>
                  {CANCEL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <input
                  className="form-input"
                  placeholder="Custom note (optional)"
                  value={cancelNote}
                  onChange={(e) => setCancelNote(e.target.value)}
                  style={{ width: 180, fontSize: 13 }}
                />
                <button
                  type="button"
                  className="vbtn vbtn-red"
                  disabled={!cancelReason || cancelling}
                  onClick={() => onCancel(order.id)}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
