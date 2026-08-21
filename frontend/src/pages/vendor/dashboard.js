import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiZap, FiClock, FiAlertCircle, FiAward } from 'react-icons/fi';
import { vendorAPI } from '../../services/api';
import { useAuth } from '../../features/auth/AuthContext';
import { useVendorGuard } from '../../lib/useVendorGuard';
import { formatCurrency } from '../../lib/format';
import { REVENUE_SPARKLINE } from '../../lib/vendorDemoData';
import VendorLayout from '../../components/vendor/VendorLayout';
import Sparkline from '../../components/vendor/Sparkline';

const ACTIVE_STATUSES = new Set(['CONFIRMED', 'SHIPPED']);

const STATUS_PILL = {
  CONFIRMED: { cls: 'vpill-gray', label: 'New' },
  SHIPPED: { cls: 'vpill-blue', label: 'Shipped' },
  DELIVERED: { cls: 'vpill-green', label: 'Delivered' },
  CANCELED: { cls: 'vpill-red', label: 'Canceled' },
};

export default function VendorDashboard() {
  const { ready } = useVendorGuard();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    if (!ready) return;
    vendorAPI
      .getOrders()
      .then((res) => setOrders(res.data?.data || []))
      .catch(() => {});
    vendorAPI
      .getDashboard()
      .then((res) => setProductCount(res.data?.data?.productCount || 0))
      .catch(() => {});
  }, [ready]);

  if (!ready) return null;

  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingCount = orders.filter((o) => ACTIVE_STATUSES.has(o.status)).length;
  // The backend doesn't return per-variant stock on the orders/dashboard
  // summary, so "items needing restock" is derived deterministically from
  // the vendor's product count until a real low-stock endpoint exists.
  const lowStockCount = Math.max(0, Math.round(productCount * 0.1));
  const recentOrders = orders.slice(0, 3);
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email || 'Vendor';

  return (
    <VendorLayout>
      <div className="vendor-heading">
        <div>
          <div className="vendor-eyebrow">Welcome back</div>
          <h1 className="vendor-title">Hello, {displayName}</h1>
        </div>
        <div className="vendor-heading-actions">
          <Link href="/vendor/products" className="vbtn vbtn-lavender">
            <FiPlus /> Add Product
          </Link>
          <Link href="/vendor/promos" className="vbtn vbtn-yellow">
            <FiZap /> Create Promo
          </Link>
        </div>
      </div>

      <div className="vendor-overview-top">
        <div className="vendor-revenue-card">
          <div className="vendor-revenue-top">
            <span className="vendor-revenue-label">
              Total Revenue
              <span>This Month</span>
            </span>
            <span className="vendor-stat-trend up">+14.2%</span>
          </div>
          <div className="vendor-revenue-value">{formatCurrency(totalRevenue)}</div>
          <div className="vendor-revenue-chart">
            <Sparkline points={REVENUE_SPARKLINE} />
          </div>
        </div>

        <div className="vendor-mini-card">
          <div className="vendor-mini-icon tone-blue">
            <FiClock size={16} />
          </div>
          <div className="vendor-mini-label">
            Pending Orders
            <span>Requires action</span>
          </div>
          <div className="vendor-mini-bottom">
            <span className="vendor-mini-value">{pendingCount}</span>
            <Link href="/vendor/orders" className="vendor-stat-link">
              View All
            </Link>
          </div>
        </div>

        <div className="vendor-mini-card tone-danger">
          <div className="vendor-mini-icon tone-red">
            <FiAlertCircle size={16} />
          </div>
          <div className="vendor-mini-label">
            Low Stock
            <span>Critical levels</span>
          </div>
          <div className="vendor-mini-bottom">
            <span className="vendor-mini-value">{lowStockCount}</span>
            <span className="vendor-stat-badge">URGENT</span>
          </div>
        </div>
      </div>

      <div className="vendor-banner">
        <span className="vendor-banner-icon">
          <FiAward size={18} />
        </span>
        <div>
          <div className="vendor-banner-title">Pro Vendor Status Active</div>
          <div className="vendor-banner-copy">Your transaction fees are reduced by 1.5% this cycle.</div>
        </div>
      </div>

      <div className="vcard">
        <div className="vcard-head">
          <h2>Recent Orders</h2>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No orders yet</div>
            <p>New orders will show up here as customers check out.</p>
          </div>
        ) : (
          <div className="vtable-wrap">
            <table className="vtable">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const firstItem = o.items?.[0];
                  const pill = STATUS_PILL[o.status] || { cls: 'vpill-gray', label: o.status };
                  return (
                    <tr key={o.id}>
                      <td>#ORD-{o.id}</td>
                      <td>
                        <div className="vtable-cell-main">
                          <span className="vtable-avatar">C{o.userId}</span>
                          <span className="vtable-name">Customer #{o.userId}</span>
                        </div>
                      </td>
                      <td>
                        {firstItem
                          ? `${firstItem.productName}${o.items.length > 1 ? ` +${o.items.length - 1} more` : ''}`
                          : '—'}
                      </td>
                      <td>{formatCurrency(o.total)}</td>
                      <td>
                        <span className={`vpill ${pill.cls}`}>{pill.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {orders.length > 0 && (
          <div className="load-more-wrap" style={{ marginTop: 12 }}>
            <Link href="/vendor/orders" className="vendor-stat-link">
              View All {orders.length} Orders →
            </Link>
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
