import { FiPlus, FiZap, FiTag, FiBox, FiDollarSign, FiShoppingCart } from 'react-icons/fi';
import { useVendorGuard } from '../../lib/useVendorGuard';
import { formatCurrency, formatNumber } from '../../lib/format';
import { PROMOS_STATS, ACTIVE_PROMOTIONS } from '../../lib/vendorDemoData';
import VendorLayout from '../../components/vendor/VendorLayout';

const STATUS_PILL = {
  Active: 'vpill-green',
  Scheduled: 'vpill-yellow',
  Ended: 'vpill-red',
};

const TOOLS = [
  {
    icon: FiTag,
    title: 'Discount Codes',
    copy: 'Create custom % or fixed amount codes for specific customer groups.',
  },
  {
    icon: FiZap,
    title: 'Flash Sales',
    copy: 'Set up time-limited discounts to drive immediate conversions.',
    active: true,
  },
  {
    icon: FiBox,
    title: 'Bundle Deals',
    copy: 'Offer automatic discounts when customers buy items together.',
  },
];

export default function VendorPromos() {
  const { ready } = useVendorGuard();
  if (!ready) return null;

  return (
    <VendorLayout>
      <div className="vendor-heading">
        <div>
          <h1 className="vendor-title">Promotions</h1>
          <p className="vendor-subtitle">Manage and track your marketing campaigns.</p>
        </div>
        <div className="vendor-heading-actions">
          <button type="button" className="vbtn vbtn-yellow">
            <FiPlus /> Create New Promo
          </button>
        </div>
      </div>

      <div className="vendor-stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="vendor-stat-card">
          <span className="vendor-stat-icon tone-yellow">
            <FiZap size={16} />
          </span>
          <div className="vendor-stat-label">Active Promos</div>
          <div className="vendor-stat-value">{PROMOS_STATS.activePromos}</div>
          <div className="vendor-stat-sub">Live</div>
        </div>
        <div className="vendor-stat-card">
          <span className="vendor-stat-icon tone-yellow">
            <FiDollarSign size={16} />
          </span>
          <div className="vendor-stat-label">Promo Revenue</div>
          <div className="vendor-stat-value">{formatCurrency(PROMOS_STATS.promoRevenue)}</div>
          <div className="vendor-stat-sub">Last 30 days</div>
        </div>
        <div className="vendor-stat-card">
          <span className="vendor-stat-icon tone-yellow">
            <FiShoppingCart size={16} />
          </span>
          <div className="vendor-stat-label">Total Conversions</div>
          <div className="vendor-stat-value">{formatNumber(PROMOS_STATS.totalConversions)}</div>
          <div className="vendor-stat-sub">Uses</div>
        </div>
      </div>

      <div className="vendor-two-col promos">
        <div className="vcard">
          <div className="vcard-head">
            <h2>Marketing Tools</h2>
          </div>
          <div className="vtool-list">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.title} className={`vtool-item ${tool.active ? 'active' : ''}`}>
                  <span className="vtool-icon">
                    <Icon size={17} />
                  </span>
                  <div>
                    <div className="vtool-title">{tool.title}</div>
                    <div className="vtool-copy">{tool.copy}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="vcard">
          <div className="vcard-head">
            <h2>Active Promotions</h2>
            <a href="#" className="vendor-stat-link">
              View All
            </a>
          </div>
          <div className="vtable-wrap">
            <table className="vtable">
              <thead>
                <tr>
                  <th>Promo Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Usage</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVE_PROMOTIONS.map((promo) => (
                  <tr key={promo.id}>
                    <td>
                      <div className="vtable-name">{promo.name}</div>
                      <div className="vtable-sub">{promo.type}</div>
                    </td>
                    <td>
                      <span className="vpill vpill-gray">{promo.kind}</span>
                    </td>
                    <td>
                      <span className={`vpill ${STATUS_PILL[promo.status]}`}>{promo.status}</span>
                    </td>
                    <td>{promo.usage}</td>
                    <td>{promo.endDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
