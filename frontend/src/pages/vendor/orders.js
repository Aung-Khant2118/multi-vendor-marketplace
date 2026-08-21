import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { FiDownload, FiPlus, FiSearch, FiSliders, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { vendorAPI } from '../../services/api';
import { useVendorGuard } from '../../lib/useVendorGuard';
import { formatCurrency } from '../../lib/format';
import VendorLayout from '../../components/vendor/VendorLayout';

const STATUS = ['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELED'];

const STATUS_PILL = {
  CONFIRMED: { cls: 'vpill-red', label: 'Pending' },
  SHIPPED: { cls: 'vpill-yellow', label: 'Processing' },
  DELIVERED: { cls: 'vpill-gray', label: 'Completed' },
  CANCELED: { cls: 'vpill-gray', label: 'Canceled' },
};

const TABS = [
  { key: 'ALL', label: 'All Orders' },
  { key: 'CONFIRMED', label: 'Pending' },
  { key: 'SHIPPED', label: 'Processing' },
  { key: 'DELIVERED', label: 'Completed' },
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

export default function VendorOrders() {
  const { ready } = useVendorGuard();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('ALL');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const load = () =>
    vendorAPI
      .getOrders()
      .then((res) => setOrders(res.data?.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load orders'));

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready]);

  const update = async (orderId, status) => {
    try {
      await vendorAPI.updateOrderStatus(orderId, { status });
      toast.success('Order status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (tab !== 'ALL' && o.status !== tab) return false;
      if (query && !`${o.id}`.includes(query) && !`${o.userId}`.includes(query)) return false;
      return true;
    });
  }, [orders, tab, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageOrders = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const activeOrders = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'SHIPPED').length;
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
  const delivered = orders.filter((o) => o.status === 'DELIVERED').length;
  const fulfillmentRate = orders.length ? (delivered / orders.length) * 100 : 0;

  if (!ready) return null;

  return (
    <VendorLayout>
      <div className="vendor-heading">
        <div>
          <h1 className="vendor-title">Orders</h1>
          <p className="vendor-subtitle">Manage and track your active marketplace fulfillments.</p>
        </div>
        <div className="vendor-heading-actions">
          <button type="button" className="vbtn vbtn-outline">
            <FiDownload /> Export CSV
          </button>
          <button type="button" className="vbtn vbtn-yellow">
            <FiPlus /> Create Order
          </button>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="vendor-stat-grid">
        <div className="vendor-stat-card accent-left">
          <div className="vendor-stat-label">Total Revenue</div>
          <div className="vendor-stat-value">{formatCurrency(totalRevenue)}</div>
          <div className="vendor-stat-trend up">↗ +12% this week</div>
        </div>
        <div className="vendor-stat-card">
          <div className="vendor-stat-label">Active Orders</div>
          <div className="vendor-stat-value">{activeOrders}</div>
          <div className="vendor-stat-sub">{activeOrders} need attention</div>
        </div>
        <div className="vendor-stat-card">
          <div className="vendor-stat-label">Avg Order Value</div>
          <div className="vendor-stat-value">{formatCurrency(avgOrderValue)}</div>
        </div>
        <div className="vendor-stat-card">
          <div className="vendor-stat-label">Fulfillment Rate</div>
          <div className="vendor-stat-value">{fulfillmentRate.toFixed(1)}%</div>
        </div>
      </div>

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
        <button type="button" className="vbtn vbtn-outline">
          <FiSliders /> Filters
        </button>
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
                  <th></th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageOrders.map((o) => {
                  const pill = STATUS_PILL[o.status] || { cls: 'vpill-gray', label: o.status };
                  const itemCount = o.items?.length || 0;
                  const date = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                  return (
                    <tr key={o.id}>
                      <td>
                        <input type="checkbox" />
                      </td>
                      <td>#ORD-{o.id}</td>
                      <td>
                        <div className="vtable-cell-main">
                          <span className="vtable-avatar">C{o.userId}</span>
                          <div>
                            <div className="vtable-name">Customer #{o.userId}</div>
                          </div>
                        </div>
                      </td>
                      <td>{date}</td>
                      <td>{itemCount} {itemCount === 1 ? 'item' : 'items'}</td>
                      <td>{formatCurrency(o.total)}</td>
                      <td>
                        <span className={`vpill ${pill.cls}`}>{pill.label}</span>
                      </td>
                      <td>
                        <select
                          className="form-input status-select"
                          style={{ padding: '6px 10px', fontSize: 12.5 }}
                          value={o.status}
                          onChange={(e) => update(o.id, e.target.value)}
                        >
                          {STATUS.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_PILL[s].label}
                            </option>
                          ))}
                        </select>
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
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} entries
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
    </VendorLayout>
  );
}
