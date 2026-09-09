import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiZap, FiTag, FiBox, FiDollarSign, FiShoppingCart } from 'react-icons/fi';
import { vendorAPI } from '../../services/api';
import { useVendorGuard } from '../../lib/useVendorGuard';
import { formatCurrency, formatNumber } from '../../lib/format';
import VendorLayout from '../../components/vendor/VendorLayout';

const STATUS_PILL = {
  Active: 'vpill-green',
  Scheduled: 'vpill-yellow',
  Ended: 'vpill-red',
};

function couponStatus(coupon) {
  if (!coupon.active) return 'Ended';
  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now) return 'Scheduled';
  if (coupon.endDate && new Date(coupon.endDate) < now) return 'Ended';
  return 'Active';
}

function couponKind(coupon) {
  if (coupon.discountType === 'PERCENTAGE') return `${coupon.discountValue}% Off`;
  return `MMK ${coupon.discountValue} Fixed`;
}

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
  const [coupons, setCoupons] = useState([]);
  const [error, setError] = useState('');

  const loadCoupons = () =>
    vendorAPI
      .getCoupons()
      .then((res) => setCoupons(res.data?.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load promotions'));

  useEffect(() => {
    if (!ready) return;
    loadCoupons();
  }, [ready]);

  if (!ready) return null;

  const activeCount = coupons.filter((c) => couponStatus(c) === 'Active').length;
  const totalUsage = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
  const totalDiscountValue = coupons.reduce((sum, c) => sum + (c.discountValue || 0), 0);

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

      {error && <p className="form-error">{error}</p>}

      <div className="vendor-stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="vendor-stat-card">
          <span className="vendor-stat-icon tone-yellow">
            <FiZap size={16} />
          </span>
          <div className="vendor-stat-label">Active Promos</div>
          <div className="vendor-stat-value">{activeCount}</div>
          <div className="vendor-stat-sub">Live</div>
        </div>
        <div className="vendor-stat-card">
          <span className="vendor-stat-icon tone-yellow">
            <FiDollarSign size={16} />
          </span>
          <div className="vendor-stat-label">Total Coupons</div>
          <div className="vendor-stat-value">{coupons.length}</div>
          <div className="vendor-stat-sub">All time</div>
        </div>
        <div className="vendor-stat-card">
          <span className="vendor-stat-icon tone-yellow">
            <FiShoppingCart size={16} />
          </span>
          <div className="vendor-stat-label">Total Uses</div>
          <div className="vendor-stat-value">{formatNumber(totalUsage)}</div>
          <div className="vendor-stat-sub">Redemptions</div>
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
          </div>
          {coupons.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No promotions yet</div>
              <p>Create your first coupon to start driving sales.</p>
            </div>
          ) : (
            <div className="vtable-wrap">
              <table className="vtable">
                <thead>
                  <tr>
                    <th>Promo Name</th>
                    <th>Discount</th>
                    <th>Status</th>
                    <th>Uses</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((promo) => {
                    const status = couponStatus(promo);
                    return (
                      <tr key={promo.id}>
                        <td>
                          <div className="vtable-name">{promo.code}</div>
                          <div className="vtable-sub">{promo.minOrderAmount > 0 ? `Min. MMK ${promo.minOrderAmount}` : 'No minimum'}</div>
                        </td>
                        <td>
                          <span className="vpill vpill-gray">{couponKind(promo)}</span>
                        </td>
                        <td>
                          <span className={`vpill ${STATUS_PILL[status]}`}>{status}</span>
                        </td>
                        <td>{promo.usedCount || 0}</td>
                        <td>{promo.endDate ? new Date(promo.endDate).toLocaleDateString() : 'Ongoing'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </VendorLayout>
  );
}
