import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiUsers, FiShoppingBag, FiBox, FiShoppingCart, FiDollarSign, FiAlertTriangle } from 'react-icons/fi';
import { HiOutlineUserGroup, HiOutlineFolderPlus } from 'react-icons/hi2';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../services/api';
import { formatCurrency, formatNumber } from '../../lib/format';
import RevenueLineChart from '../../components/charts/RevenueLineChart';
import OrdersBarChart from '../../components/charts/OrdersBarChart';
import VendorGrowthChart from '../../components/charts/VendorGrowthChart';
import StatusPieChart from '../../components/charts/StatusPieChart';

const ACTION_ICON = {
  UPDATE_ROLE: HiOutlineUserGroup,
  APPROVE_VENDOR: FiShoppingBag,
  REJECT_VENDOR: FiShoppingBag,
  SUSPEND_VENDOR: FiShoppingBag,
  CATEGORY_ADD: HiOutlineFolderPlus,
};

const ACTION_TONE = {
  UPDATE_ROLE: 'purple',
  APPROVE_VENDOR: 'green',
  REJECT_VENDOR: 'red',
  SUSPEND_VENDOR: 'amber',
  CATEGORY_ADD: 'green',
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadErrors = [];

    Promise.all([
      adminAPI.getDashboard().catch((err) => {
        loadErrors.push('Failed to load dashboard stats');
        console.error('Dashboard fetch error:', err);
        return { data: {} };
      }),
      adminAPI.getAnalytics().catch((err) => {
        loadErrors.push('Failed to load analytics');
        console.error('Analytics fetch error:', err);
        return { data: {} };
      }),
      adminAPI.getAuditLogs({ page: 0, size: 10 }).catch((err) => {
        loadErrors.push('Failed to load activity');
        console.error('Audit logs fetch error:', err);
        return { data: { data: [] } };
      }),
    ]).then(([dashRes, analyticsRes, auditRes]) => {
      if (cancelled) return;
      setStats(dashRes.data?.data || dashRes.data || null);
      setAnalytics(analyticsRes.data?.data || null);
      setActivity(auditRes.data?.data || []);
      if (loadErrors.length > 0) {
        setError(loadErrors.join('; '));
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="page-heading"><div><h1>Dashboard Overview</h1></div></div>
        <p className="asummary-empty">Loading dashboard...</p>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="page-heading"><div><h1>Dashboard Overview</h1></div></div>
        <p className="form-error">{error || 'Failed to load dashboard data.'}</p>
      </AdminLayout>
    );
  }

  const actionNeeded = stats.pendingVendors || 0;

  return (
      <AdminLayout>
      <div className="page-heading">
        <div>
          <h1>Dashboard Overview</h1>
        </div>
      </div>

      <div className="astat-grid">
        <div className="astat-card">
          <div className="astat-icon">
            <FiUsers size={18} />
          </div>
          <div className="astat-value">{formatNumber(stats.totalUsers)}</div>
          <div className="astat-label">Total Users</div>
        </div>

        <div className="astat-card">
          <div className="astat-icon">
            <FiShoppingBag size={18} />
          </div>
          <div className="astat-value">{formatNumber(stats.totalVendors)}</div>
          <div className="astat-label">Total Vendors</div>
        </div>

        <div className="astat-card">
          <div className="astat-icon">
            <FiBox size={18} />
          </div>
          <div className="astat-value">{formatNumber(stats.totalProducts)}</div>
          <div className="astat-label">Total Products</div>
        </div>

        <div className="astat-card">
          <div className="astat-icon">
            <FiShoppingCart size={18} />
          </div>
          <div className="astat-value">{formatNumber(stats.totalOrders)}</div>
          <div className="astat-label">Total Orders</div>
        </div>

        <div className="astat-card tone-dark">
          <div className="astat-icon">
            <FiDollarSign size={18} />
          </div>
          <div className="astat-value">{formatCurrency(stats.totalRevenue)}</div>
          <div className="astat-label">Total Revenue</div>
        </div>

        <Link href="/admin/vendors?tab=PENDING" className="astat-card tone-warn" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="astat-icon">
            <FiAlertTriangle size={18} />
          </div>
          <div className="astat-value">{actionNeeded}</div>
          <div className="astat-label">Pending Vendors</div>
        </Link>
      </div>

      {/* Charts Section */}
      {analytics && (
        <div className="achart-grid">
          <div className="achart-card">
            <div className="achart-head">
              <h3>Revenue Over Time</h3>
              <span className="achart-subtitle">Monthly completed payments (last 12 months)</span>
            </div>
            <div className="achart-body">
              {analytics.monthlyRevenue?.length > 0 ? (
                <RevenueLineChart data={analytics.monthlyRevenue} height={260} />
              ) : (
                <div className="achart-empty">No revenue data yet</div>
              )}
            </div>
          </div>

          <div className="achart-card">
            <div className="achart-head">
              <h3>Orders Over Time</h3>
              <span className="achart-subtitle">Monthly orders placed (last 12 months)</span>
            </div>
            <div className="achart-body">
              {analytics.monthlyOrders?.length > 0 ? (
                <OrdersBarChart data={analytics.monthlyOrders} height={260} />
              ) : (
                <div className="achart-empty">No order data yet</div>
              )}
            </div>
          </div>

          <div className="achart-card">
            <div className="achart-head">
              <h3>Vendor Registrations</h3>
              <span className="achart-subtitle">New vendor signups (last 12 months)</span>
            </div>
            <div className="achart-body">
              {analytics.monthlyVendors?.length > 0 ? (
                <VendorGrowthChart data={analytics.monthlyVendors} height={260} />
              ) : (
                <div className="achart-empty">No vendor registration data yet</div>
              )}
            </div>
          </div>

          <div className="achart-card">
            <div className="achart-head">
              <h3>Orders by Status</h3>
              <span className="achart-subtitle">Current order distribution</span>
            </div>
            <div className="achart-body">
              {analytics.ordersByStatus && Object.keys(analytics.ordersByStatus).length > 0 ? (
                <StatusPieChart data={analytics.ordersByStatus} height={260} />
              ) : (
                <div className="achart-empty">No status data yet</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="vendor-two-col analytics">
        <div className="vcard">
          <div className="vcard-head">
            <h2>Platform Summary</h2>
          </div>
          <div className="asummary-list">
            <div className="asummary-row">
              <span className="asummary-label">Active Vendors</span>
              <strong className="asummary-value">{formatNumber((stats.totalVendors || 0) - actionNeeded)}</strong>
            </div>
            <div className="asummary-row">
              <span className="asummary-label">Pending Approvals</span>
              <strong className={`asummary-value${actionNeeded > 0 ? ' warn' : ''}`}>{actionNeeded}</strong>
            </div>
            <div className="asummary-row">
              <span className="asummary-label">Avg Revenue / Order</span>
              <strong className="asummary-value">{stats.totalOrders > 0 ? formatCurrency(Number(stats.totalRevenue) / stats.totalOrders) : '\u2014'}</strong>
            </div>
            <div className="asummary-row">
              <span className="asummary-label">Products / Vendor</span>
              <strong className="asummary-value">{stats.totalVendors > 0 ? formatNumber(Math.round(stats.totalProducts / stats.totalVendors)) : '\u2014'}</strong>
            </div>
          </div>
        </div>

        <div className="vcard">
          <div className="vcard-head">
            <h2>Recent Activity</h2>
            <Link href="/admin/audit-logs" className="btn-sm">
              Audit Log
            </Link>
          </div>
          <div className="aactivity-list">
            {activity.length === 0 ? (
              <p className="asummary-empty">No recent activity.</p>
            ) : (
              activity.map((a) => {
                const Icon = ACTION_ICON[a.action] || HiOutlineFolderPlus;
                const tone = ACTION_TONE[a.action] || 'blue';
                return (
                  <div key={a.id} className="aactivity-item">
                    <div className="aactivity-main">
                      <span className={`aactivity-icon tone-${tone}`}>
                        <Icon size={17} />
                      </span>
                      <div>
                        <div className="aactivity-tag">{a.action?.replace(/_/g, ' ')}</div>
                        <div className="aactivity-desc">{a.details || a.action}</div>
                      </div>
                    </div>
                    <span className="aactivity-time">{timeAgo(a.createdAt)}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
