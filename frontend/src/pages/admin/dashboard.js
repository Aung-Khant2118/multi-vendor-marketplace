import { FiUsers, FiShoppingBag, FiBox, FiShoppingCart, FiDollarSign, FiAlertTriangle } from 'react-icons/fi';
import { HiOutlineUserGroup, HiOutlineFolderPlus } from 'react-icons/hi2';
import AdminLayout from '../../components/admin/AdminLayout';
import VisitSalesChart from '../../components/admin/VisitSalesChart';
import { DASHBOARD_STATS, VISIT_SALES_STATS, RECENT_ADMIN_ACTIVITY } from '../../lib/adminDemoData';
import { formatCurrency, formatNumber } from '../../lib/format';

const ACTIVITY_ICON = {
  ROLE_CHANGE: HiOutlineUserGroup,
  CATEGORY_ADD: HiOutlineFolderPlus,
};

export default function AdminDashboard() {
  const s = DASHBOARD_STATS;

  return (
    <AdminLayout searchPlaceholder="Search dashboard data...">
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
          <div className="astat-value">{formatNumber(s.totalUsers)}</div>
          <div className="astat-label">Total Users</div>
        </div>

        <div className="astat-card">
          <div className="astat-icon">
            <FiShoppingBag size={18} />
          </div>
          <div className="astat-value">{formatNumber(s.totalVendors)}</div>
          <div className="astat-label">Total Vendors</div>
        </div>

        <div className="astat-card">
          <div className="astat-icon">
            <FiBox size={18} />
          </div>
          <div className="astat-value">{formatNumber(s.totalProducts)}</div>
          <div className="astat-label">Total Products</div>
        </div>

        <div className="astat-card">
          <div className="astat-icon">
            <FiShoppingCart size={18} />
          </div>
          <div className="astat-value">{formatNumber(s.totalOrders)}</div>
          <div className="astat-label">Total Orders</div>
        </div>

        <div className="astat-card tone-dark">
          <div className="astat-icon">
            <FiDollarSign size={18} />
          </div>
          <div className="astat-value">{formatCurrency(s.totalRevenue)}</div>
          <div className="astat-label">Total Revenue</div>
        </div>

        <div className="astat-card tone-warn">
          <div className="astat-icon">
            <FiAlertTriangle size={18} />
          </div>
          <div className="astat-value">{s.actionNeeded}</div>
          <div className="astat-label">Action Needed</div>
        </div>
      </div>

      <div className="vendor-two-col analytics">
        <div className="vcard">
          <div className="vcard-head">
            <h2>Visit and Sales Statistics</h2>
            <div className="achart-legend">
              <span className="achart-legend-item">
                <span className="achart-dot" style={{ background: '#10182b' }} /> Visits
              </span>
              <span className="achart-legend-item">
                <span className="achart-dot" style={{ background: '#f3c318' }} /> Sales
              </span>
            </div>
          </div>
          <VisitSalesChart
            months={VISIT_SALES_STATS.months}
            visits={VISIT_SALES_STATS.visits}
            sales={VISIT_SALES_STATS.sales}
          />
        </div>

        <div className="vcard">
          <div className="vcard-head">
            <h2>Recent Admin Activity</h2>
            <a href="#audit" className="btn-sm">
              Audit Log
            </a>
          </div>
          <div className="aactivity-list">
            {RECENT_ADMIN_ACTIVITY.map((a) => {
              const Icon = ACTIVITY_ICON[a.type] || HiOutlineFolderPlus;
              return (
                <div key={a.id} className="aactivity-item">
                  <div className="aactivity-main">
                    <span className={`aactivity-icon tone-${a.tone}`}>
                      <Icon size={17} />
                    </span>
                    <div>
                      <div className="aactivity-tag">{a.type}</div>
                      <div className="aactivity-desc">{a.desc}</div>
                    </div>
                  </div>
                  <span className="aactivity-time">{a.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
