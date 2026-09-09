import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiZap, FiClock } from 'react-icons/fi';
import { vendorAPI } from '../../services/api';
import { useAuth } from '../../features/auth/AuthContext';
import { useVendorGuard } from '../../lib/useVendorGuard';
import { formatCurrency, getStatusPill } from '../../lib/format';
import VendorLayout from '../../components/vendor/VendorLayout';
import RevenueLineChart from '../../components/charts/RevenueLineChart';
import StatusPieChart from '../../components/charts/StatusPieChart';

export default function VendorDashboard() {
  const { ready } = useVendorGuard();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [productCount, setProductCount] = useState(0);
  const [timeSeries, setTimeSeries] = useState(null);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (!ready) return;

    const loadErrors = [];

    vendorAPI
      .getOrders({ page: 0, size: 3 })
      .then((res) => setOrders(res.data?.data || []))
      .catch((err) => {
        loadErrors.push('Failed to load orders');
        console.error('Orders fetch error:', err);
      });

    vendorAPI
      .getDashboard()
      .then((res) => setProductCount(res.data?.data?.productCount || 0))
      .catch((err) => {
        loadErrors.push('Failed to load dashboard stats');
        console.error('Dashboard fetch error:', err);
      });

    vendorAPI
      .getAnalytics()
      .then((res) => setAnalytics(res.data?.data || null))
      .catch((err) => {
        loadErrors.push('Failed to load analytics');
        console.error('Analytics fetch error:', err);
      });

    vendorAPI
      .getAnalyticsTimeSeries()
      .then((res) => setTimeSeries(res.data?.data || null))
      .catch((err) => {
        loadErrors.push('Failed to load analytics');
        console.error('Analytics fetch error:', err);
      });

    if (loadErrors.length > 0) {
      setErrors(loadErrors);
    }
  }, [ready]);

  if (!ready) return null;

  const totalRevenue = analytics?.totalRevenue || 0;
  const totalOrders = analytics?.totalOrders || 0;
  const statusBreakdown = analytics?.statusBreakdown || {};
  const pendingCount = (statusBreakdown['PENDING'] || 0) + (statusBreakdown['CONFIRMED'] || 0) +
    (statusBreakdown['PROCESSING'] || 0) + (statusBreakdown['SHIPPED'] || 0);
  const recentOrders = orders;
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email || 'Vendor';

  const monthlyRevenue = timeSeries?.monthlyRevenue || [];

  return (
    <VendorLayout>
      {errors.length > 0 && (
        <div className="vendor-error-banner">
          {errors.map((err, i) => (
            <div key={i} className="form-error">{err}</div>
          ))}
        </div>
      )}

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
              <span>All Time</span>
            </span>
          </div>
          <div className="vendor-revenue-value">{formatCurrency(totalRevenue)}</div>
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

        <div className="vendor-mini-card">
          <div className="vendor-mini-icon tone-blue">
            <FiClock size={16} />
          </div>
          <div className="vendor-mini-label">
            Total Products
            <span>In your store</span>
          </div>
          <div className="vendor-mini-bottom">
            <span className="vendor-mini-value">{productCount}</span>
            <Link href="/vendor/products" className="vendor-stat-link">
              Manage
            </Link>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="achart-grid">
        <div className="achart-card">
          <div className="achart-head">
            <h3>Revenue Trend</h3>
            <span className="achart-subtitle">Monthly revenue (last 12 months)</span>
          </div>
          <div className="achart-body">
            {monthlyRevenue.length > 0 ? (
              <RevenueLineChart data={monthlyRevenue} height={260} />
            ) : (
              <div className="achart-empty">No revenue data yet. Sales will appear here once customers place orders.</div>
            )}
          </div>
        </div>

        <div className="achart-card">
          <div className="achart-head">
            <h3>Order Status Breakdown</h3>
            <span className="achart-subtitle">Distribution of your order statuses</span>
          </div>
          <div className="achart-body">
            {Object.keys(statusBreakdown).length > 0 ? (
              <StatusPieChart data={statusBreakdown} height={260} />
            ) : (
              <div className="achart-empty">No orders yet. Status breakdown will appear here.</div>
            )}
          </div>
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
                  const pill = getStatusPill(o.status);
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
                          : '\u2014'}
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
              View All {totalOrders} Orders &rarr;
            </Link>
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
