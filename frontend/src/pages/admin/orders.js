import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPackage, FiEye, FiX } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import Pagination from '../../components/admin/Pagination';
import { adminAPI } from '../../services/api';
import { STATUS_LABELS, getStatusPill, formatCurrency } from '../../lib/format';

const TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const CANCEL_REASONS = [
  'Customer Request',
  'Fraud Suspected',
  'Delivery Refused',
  'Address Unverifiable',
  'Other',
];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNote, setCancelNote] = useState('');

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    setLoading(true);
    const params = { page: page - 1, size: pageSize };
    if (tab !== 'ALL') params.status = tab;
    adminAPI
      .getOrders(params)
      .then((res) => {
        setOrders(res.data?.data || []);
        setTotalCount(res.data?.totalElements || 0);
      })
      .catch(() => {
        setOrders([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, [tab, page, pageSize]);

  const changeTab = (key) => {
    setTab(key);
    setPage(1);
  };

  const viewOrder = async (id) => {
    setDetailLoading(true);
    try {
      const res = await adminAPI.getOrder(id);
      setSelectedOrder(res.data?.data || null);
    } catch {
      /* handled by interceptor */
    } finally {
      setDetailLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!cancelReason) { toast.error('Please select a reason'); return; }
    setCancelling(true);
    try {
      const res = await adminAPI.cancelOrder(orderId, { reason: cancelReason, customNote: cancelNote || undefined });
      toast.success('Order cancelled');
      setSelectedOrder(res.data?.data || null);
      setCancelReason('');
      setCancelNote('');
      const params = { page: page - 1, size: pageSize };
      if (tab !== 'ALL') params.status = tab;
      const listRes = await adminAPI.getOrders(params);
      setOrders(listRes.data?.data || []);
      setTotalCount(listRes.data?.totalElements || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <AdminLayout>
      <div className="page-heading">
        <div>
          <h1>Order Management</h1>
        </div>
      </div>

      <div className="vtab-row">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={`vtab ${tab === t.key ? 'active' : ''}`} onClick={() => changeTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="vcard">
        {loading ? (
          <p style={{ padding: 20, color: 'var(--text-secondary)', textAlign: 'center' }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No orders found</div>
            <p>Try a different status tab.</p>
          </div>
        ) : (
          <div className="vtable-wrap">
            <table className="vtable">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const pill = getStatusPill(o.status);
                  return (
                    <tr key={o.id}>
                      <td>
                        <div className="vtable-cell-main">
                          <span className="aactivity-icon tone-blue">
                            <FiPackage size={16} />
                          </span>
                          <div>
                            <div className="vtable-name">#{o.id}</div>
                            <div className="vtable-sub">{o.items?.length || 0} item(s)</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="vtable-sub">{o.customerName || 'Unknown'}</div>
                      </td>
                      <td>
                        <span className={`vpill ${pill.cls}`}>{pill.label}</span>
                      </td>
                      <td>{formatCurrency(o.total)}</td>
                      <td>{formatDate(o.createdAt)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="vtable-kebab"
                          onClick={() => viewOrder(o.id)}
                          title="View order details"
                        >
                          <FiEye size={16} />
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

      {totalCount > 0 && (
        <Pagination
          page={currentPage}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          totalCount={totalCount}
          itemLabel="orders"
        />
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{selectedOrder.id}</h2>
              <button type="button" className="modal-close" onClick={() => setSelectedOrder(null)}>
                &times;
              </button>
            </div>
            {detailLoading ? (
              <p style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</p>
            ) : (
              <div className="modal-body">
                <div className="info-row">
                  <strong>Status:</strong>{' '}
                  <span className={`vpill ${getStatusPill(selectedOrder.status).cls}`}>
                    {getStatusPill(selectedOrder.status).label}
                  </span>
                </div>
                <div className="info-row">
                  <strong>Customer:</strong> {selectedOrder.customerName || 'Unknown'}
                </div>
                <div className="info-row">
                  <strong>Payment:</strong> {selectedOrder.paymentMethod} — {selectedOrder.paymentStatus}
                </div>
                <div className="info-row">
                  <strong>Placed:</strong> {formatDate(selectedOrder.createdAt)}
                </div>
                <div className="info-row">
                  <strong>Subtotal:</strong> {formatCurrency(selectedOrder.subtotal)}
                </div>
                <div className="info-row">
                  <strong>Shipping:</strong> {formatCurrency(selectedOrder.shippingCost)}
                </div>
                <div className="info-row">
                  <strong>Total:</strong> {formatCurrency(selectedOrder.total)}
                </div>
                {selectedOrder.notes && (
                  <div className="info-row">
                    <strong>Notes:</strong> {selectedOrder.notes}
                  </div>
                )}

                <h3 style={{ marginTop: 16, marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Items</h3>
                {(selectedOrder.items || []).map((it) => (
                  <div key={it.id} className="info-row" style={{ fontSize: 13 }}>
                    <span>{it.productName}</span>
                    <span> x {it.quantity}</span>
                    <span> = {formatCurrency(it.subtotal)}</span>
                    <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>({it.status})</span>
                  </div>
                ))}

                {selectedOrder.cancellationReason && (
                  <div style={{ marginTop: 12, padding: '8px 12px', background: '#fbe3e7', borderRadius: 6, fontSize: 13 }}>
                    <strong style={{ color: '#c0293f' }}>Cancellation Reason:</strong> {selectedOrder.cancellationReason}
                    {selectedOrder.cancellationNote && <span> — {selectedOrder.cancellationNote}</span>}
                    {selectedOrder.cancelledBy && <span style={{ display: 'block', marginTop: 4, color: 'var(--text-secondary)' }}>By: {selectedOrder.cancelledBy}</span>}
                  </div>
                )}

                {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'DELIVERED' && (
                  <div style={{ marginTop: 16, padding: '12px', background: '#f8f9fa', borderRadius: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Admin Cancel</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <select
                        className="form-input"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        style={{ width: 180, fontSize: 13 }}
                      >
                        <option value="">Reason...</option>
                        {CANCEL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <input
                        className="form-input"
                        placeholder="Internal note"
                        value={cancelNote}
                        onChange={(e) => setCancelNote(e.target.value)}
                        style={{ width: 180, fontSize: 13 }}
                      />
                      <button
                        type="button"
                        className="vbtn vbtn-red"
                        style={{ fontSize: 13 }}
                        disabled={!cancelReason || cancelling}
                        onClick={() => cancelOrder(selectedOrder.id)}
                      >
                        {cancelling ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
