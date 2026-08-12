import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../features/auth/AuthContext';

export default function Dashboard() {
  const { user, loading, isAuthenticated, isVendor, isAdmin, logout, fetchCurrentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  const roleLabel = isAdmin ? 'Administrator' : isVendor ? 'Vendor' : 'Customer';

  return (
    <div className="auth-container">
      <div className="auth-card dashboard-card">
        <h1 className="auth-title">ZayLink Dashboard</h1>

        <div className="dashboard-section">
          <h2 className="dashboard-subtitle">Account</h2>
          <p>
            <strong>Name:</strong> {user?.firstName} {user?.lastName}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Role:</strong> {user?.role || roleLabel}
          </p>
          {isVendor && (
            <p>
              <strong>Store status:</strong> {user?.vendorStatus || 'PENDING'}
            </p>
          )}
        </div>

        {isVendor && (
          <div className="dashboard-section">
            <h2 className="dashboard-subtitle">Vendor Tools</h2>
            <ul>
              <li>
                <Link href="/vendor/products">My products</Link>
              </li>
              <li>
                <Link href="/vendor/orders">Orders</Link>
              </li>
              <li>Dashboard stats (top-right)</li>
            </ul>
          </div>
        )}

        {isAdmin && (
          <div className="dashboard-section">
            <h2 className="dashboard-subtitle">Admin Tools</h2>
            <ul>
              <li>User management (coming soon)</li>
              <li>Vendor approval (coming soon)</li>
              <li>Category management (coming soon)</li>
            </ul>
          </div>
        )}

        {!isVendor && !isAdmin && (
          <div className="dashboard-section">
            <h2 className="dashboard-subtitle">Shop</h2>
            <ul>
              <li>
                <Link href="/products">Browse products</Link>
              </li>
              <li>
                <Link href="/cart">Cart</Link>
              </li>
              <li>
                <Link href="/orders">My orders</Link>
              </li>
            </ul>
          </div>
        )}

        <div className="dashboard-section">
          <button
            className="btn-primary"
            onClick={async () => {
              await logout();
              router.push('/auth/login');
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}