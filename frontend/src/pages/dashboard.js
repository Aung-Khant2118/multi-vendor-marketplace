import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiShoppingBag, FiHeart, FiDollarSign, FiPackage } from 'react-icons/fi';
import { customerAPI } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';
import { formatCurrency, getStatusPill } from '../lib/format';
import AppLayout from '../components/layout/AppLayout';

const ACTIVE_STATUSES = new Set(['CONFIRMED', 'PROCESSING', 'SHIPPED']);

export default function Dashboard() {
  const { user, isAdmin, isVendor, syncing } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Admins and vendors should land on their own dashboards, not the customer one.
  useEffect(() => {
    if (!mounted || syncing) return;
    if (isAdmin) {
      router.replace('/admin/dashboard');
      return;
    }
    if (isVendor) {
      router.replace('/vendor/dashboard');
    }
  }, [mounted, syncing, isAdmin, isVendor, router]);

  useEffect(() => {
    if (!mounted || syncing || isAdmin || isVendor) return;
    customerAPI
      .getOrders()
      .then((res) => setOrders(res.data?.data || []))
      .catch((err) => {
        console.error('Failed to load orders:', err);
        setError('Failed to load your orders');
      })
      .finally(() => setLoading(false));
  }, [mounted, syncing, isAdmin, isVendor]);

  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.has(o.status)).length;
  const recentOrders = orders.slice(0, 5);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email || 'there';

  if (!mounted || syncing || isAdmin || isVendor) return null;

  return (
    <AppLayout>
      <div className="page-heading">
        <div>
          <h1>Welcome back, {displayName}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Here's an overview of your account and recent activity.
          </p>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="astat-grid" style={{ marginBottom: 24 }}>
        <div className="astat-card">
          <div className="astat-icon">
            <FiShoppingBag size={18} />
          </div>
          <div className="astat-value">{orders.length}</div>
          <div className="astat-label">Total Orders</div>
        </div>

        <div className="astat-card">
          <div className="astat-icon">
            <FiDollarSign size={18} />
          </div>
          <div className="astat-value">{formatCurrency(totalSpent)}</div>
          <div className="astat-label">Total Spent</div>
        </div>

        <div className="astat-card">
          <div className="astat-icon">
            <FiPackage size={18} />
          </div>
          <div className="astat-value">{activeOrders}</div>
          <div className="astat-label">Active Orders</div>
        </div>
      </div>

      <div className="vendor-two-col analytics">
        <div className="vcard">
          <div className="vcard-head">
            <h2>Recent Orders</h2>
            <Link href="/orders" className="btn-sm">
              View All
            </Link>
          </div>
          {loading ? (
            <p style={{ padding: 20, color: 'var(--text-secondary)' }}>Loading orders...</p>
          ) : recentOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No orders yet</div>
              <p>Start shopping to see your orders here.</p>
              <Link href="/" className="vbtn vbtn-lavender" style={{ marginTop: 12 }}>
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="vtable-wrap">
              <table className="vtable">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => {
                    const pill = getStatusPill(o.status);
                    const date = o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '\u2014';
                    return (
                      <tr key={o.id}>
                        <td>#ORD-{o.id}</td>
                        <td>{date}</td>
                        <td>{o.items?.length || 0} items</td>
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
        </div>

        <div className="vcard">
          <div className="vcard-head">
            <h2>Quick Actions</h2>
          </div>
          <div style={{ padding: 20 }}>
            <Link
              href="/wishlist"
              className="vbtn vbtn-outline"
              style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
            >
              <FiHeart size={16} /> View Wishlist
            </Link>
            <Link
              href="/recommended"
              className="vbtn vbtn-outline"
              style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
            >
              <FiShoppingBag size={16} /> Recommended for You
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
