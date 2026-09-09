import { useEffect, useState } from 'react';
import {
  FiDownload,
  FiCalendar,
  FiBarChart2,
  FiPercent,
  FiShoppingCart,
  FiRefreshCcw,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';
import { vendorAPI } from '../../services/api';
import { useVendorGuard } from '../../lib/useVendorGuard';
import { formatCurrency, formatNumber } from '../../lib/format';
import VendorLayout from '../../components/vendor/VendorLayout';
import RevenueLineChart from '../../components/charts/RevenueLineChart';
import OrdersBarChart from '../../components/charts/OrdersBarChart';
import StatusPieChart from '../../components/charts/StatusPieChart';
import TopProductsBarChart from '../../components/charts/TopProductsBarChart';

export default function VendorAnalytics() {
  const { ready } = useVendorGuard();
  const [stats, setStats] = useState(null);
  const [timeSeries, setTimeSeries] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    vendorAPI
      .getAnalytics()
      .then((res) => setStats(res.data?.data || null))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics'));
    vendorAPI
      .getAnalyticsTimeSeries()
      .then((res) => setTimeSeries(res.data?.data || null))
      .catch(() => {});
  }, [ready]);

  if (!ready) return null;

  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const avgOrderValue = stats?.avgOrderValue ?? 0;
  const refundRate = stats?.refundRate ?? '0.0%';
  const topProducts = stats?.topProducts ?? [];

  const monthlyRevenue = timeSeries?.monthlyRevenue || [];
  const monthlyOrders = timeSeries?.monthlyOrders || [];
  const statusBreakdown = timeSeries?.statusBreakdown || {};

  return (
    <VendorLayout>
      <div className="vendor-heading">
        <div>
          <h1 className="vendor-title">Store Performance</h1>
          <p className="vendor-subtitle">
            Detailed breakdown of revenue, orders, and product performance.
          </p>
        </div>
        <div className="vendor-heading-actions">
          <button type="button" className="vbtn vbtn-outline">
            <FiCalendar /> All Time
          </button>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="vendor-stat-grid">
        <div className="vendor-stat-card">
          <span className="vendor-stat-icon tone-yellow">
            <FiBarChart2 size={16} />
          </span>
          <div className="vendor-stat-label">Total Revenue</div>
          <div className="vendor-stat-value">{formatCurrency(totalRevenue)}</div>
          <div className="vendor-stat-trend up">All time</div>
        </div>
        <div className="vendor-stat-card">
          <span className="vendor-stat-icon tone-blue">
            <FiShoppingCart size={16} />
          </span>
          <div className="vendor-stat-label">Total Orders</div>
          <div className="vendor-stat-value">{formatNumber(totalOrders)}</div>
          <div className="vendor-stat-sub">Orders with your items</div>
        </div>
        <div className="vendor-stat-card">
          <span className="vendor-stat-icon tone-blue">
            <FiPercent size={16} />
          </span>
          <div className="vendor-stat-label">Avg Order Value</div>
          <div className="vendor-stat-value">{formatCurrency(avgOrderValue)}</div>
          <div className="vendor-stat-sub">Per order</div>
        </div>
        <div className="vendor-stat-card">
          <span className="vendor-stat-icon tone-pink">
            <FiRefreshCcw size={16} />
          </span>
          <div className="vendor-stat-label">Refund Rate</div>
          <div className="vendor-stat-value">{refundRate}</div>
          <div className="vendor-stat-sub">Of items sold</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="achart-grid">
        <div className="achart-card">
          <div className="achart-head">
            <h3>Revenue Trend</h3>
            <span className="achart-subtitle">Monthly revenue from your products (last 12 months)</span>
          </div>
          <div className="achart-body">
            {monthlyRevenue.length > 0 ? (
              <RevenueLineChart data={monthlyRevenue} height={280} />
            ) : (
              <div className="achart-empty">No revenue trend data yet</div>
            )}
          </div>
        </div>

        <div className="achart-card">
          <div className="achart-head">
            <h3>Orders Trend</h3>
            <span className="achart-subtitle">Monthly orders containing your products (last 12 months)</span>
          </div>
          <div className="achart-body">
            {monthlyOrders.length > 0 ? (
              <OrdersBarChart data={monthlyOrders} height={280} />
            ) : (
              <div className="achart-empty">No order trend data yet</div>
            )}
          </div>
        </div>

        <div className="achart-card">
          <div className="achart-head">
            <h3>Order Status Breakdown</h3>
            <span className="achart-subtitle">Distribution of your order item statuses</span>
          </div>
          <div className="achart-body">
            {Object.keys(statusBreakdown).length > 0 ? (
              <StatusPieChart data={statusBreakdown} height={280} />
            ) : (
              <div className="achart-empty">No status data yet</div>
            )}
          </div>
        </div>

        <div className="achart-card">
          <div className="achart-head">
            <h3>Top Products by Revenue</h3>
            <span className="achart-subtitle">Your best-performing products</span>
          </div>
          <div className="achart-body">
            {topProducts.length > 0 ? (
              <TopProductsBarChart data={topProducts} height={280} />
            ) : (
              <div className="achart-empty">No product sales data yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="vcard">
        <div className="vcard-head">
          <h2>Top Products by Revenue</h2>
        </div>
        {topProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No sales data yet</div>
            <p>Once customers purchase your products, revenue data will appear here.</p>
          </div>
        ) : (
          <div className="vtable-wrap">
            <table className="vtable">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div className="vtable-cell-main">
                        <span className="vtable-name">{p.name}</span>
                      </div>
                    </td>
                    <td>{formatNumber(p.sales)}</td>
                    <td>{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
