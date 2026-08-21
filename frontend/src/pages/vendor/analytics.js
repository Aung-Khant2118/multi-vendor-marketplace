import {
  FiDownload,
  FiCalendar,
  FiBarChart2,
  FiPercent,
  FiShoppingCart,
  FiRefreshCcw,
  FiArrowUp,
  FiArrowDown,
  FiGlobe,
} from 'react-icons/fi';
import { useVendorGuard } from '../../lib/useVendorGuard';
import { formatCurrency, formatNumber } from '../../lib/format';
import { ANALYTICS_STATS, TOP_PRODUCTS_BY_REVENUE, TRAFFIC_SOURCES, TOTAL_TRAFFIC } from '../../lib/vendorDemoData';
import VendorLayout from '../../components/vendor/VendorLayout';

const STAT_CARDS = [
  { key: 'totalRevenue', label: 'Total Revenue', icon: FiBarChart2, tone: 'tone-yellow', format: formatCurrency },
  { key: 'conversionRate', label: 'Conversion Rate', icon: FiPercent, tone: 'tone-blue', format: (v) => v },
  { key: 'avgOrderValue', label: 'Avg Order Value', icon: FiShoppingCart, tone: 'tone-blue', format: formatCurrency },
  { key: 'refundRate', label: 'Refund Rate', icon: FiRefreshCcw, tone: 'tone-pink', format: (v) => v },
];

export default function VendorAnalytics() {
  const { ready } = useVendorGuard();
  if (!ready) return null;

  return (
    <VendorLayout>
      <div className="vendor-heading">
        <div>
          <h1 className="vendor-title">Store Performance</h1>
          <p className="vendor-subtitle">
            Detailed breakdown of revenue, conversion, and traffic across all channels for the last 30 days.
          </p>
        </div>
        <div className="vendor-heading-actions">
          <button type="button" className="vbtn vbtn-outline">
            <FiCalendar /> Last 30 Days
          </button>
          <button type="button" className="vbtn vbtn-yellow">
            <FiDownload /> Export Report
          </button>
        </div>
      </div>

      <div className="vendor-stat-grid">
        {STAT_CARDS.map((card) => {
          const stat = ANALYTICS_STATS[card.key];
          const Icon = card.icon;
          return (
            <div key={card.key} className="vendor-stat-card">
              <span className={`vendor-stat-icon ${card.tone}`}>
                <Icon size={16} />
              </span>
              <div className="vendor-stat-label">{card.label}</div>
              <div className="vendor-stat-value">{card.format(stat.value)}</div>
              <div className={`vendor-stat-trend ${stat.direction}`}>
                {stat.direction === 'up' && <FiArrowUp size={12} />}
                {stat.direction === 'down' && <FiArrowDown size={12} />}
                {stat.deltaLabel}
              </div>
            </div>
          );
        })}
      </div>

      <div className="vendor-two-col analytics">
        <div className="vcard">
          <div className="vcard-head">
            <h2>Top Products by Revenue</h2>
          </div>
          <div className="vtable-wrap">
            <table className="vtable">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {TOP_PRODUCTS_BY_REVENUE.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="vtable-cell-main">
                        <span className="vtable-thumb" />
                        <span className="vtable-name">{p.name}</span>
                      </div>
                    </td>
                    <td>{formatNumber(p.sales)}</td>
                    <td>{formatCurrency(p.revenue)}</td>
                    <td>
                      <span className={`vtrend ${p.trend}`}>
                        {p.trend === 'up' ? <FiArrowUp size={13} /> : <FiArrowDown size={13} />}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="load-more-wrap" style={{ marginTop: 12 }}>
            <a href="#" className="vendor-stat-link">
              View All Products
            </a>
          </div>
        </div>

        <div className="vcard">
          <div className="vcard-head">
            <h2>Traffic Sources</h2>
          </div>
          {TRAFFIC_SOURCES.map((source) => (
            <div key={source.label} className="vtraffic-row">
              <div className="vtraffic-top">
                <span className="vtraffic-label">{source.label}</span>
                <span className="vtraffic-pct">{source.pct}%</span>
              </div>
              <div className="vtraffic-track">
                <div className="vtraffic-fill" style={{ width: `${source.pct}%` }} />
              </div>
              <div className="vtraffic-visitors">{formatNumber(source.visitors)} Visitors</div>
            </div>
          ))}
          <div className="vtraffic-total">
            <FiGlobe size={15} />
            Total Traffic: {formatNumber(TOTAL_TRAFFIC)}
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
