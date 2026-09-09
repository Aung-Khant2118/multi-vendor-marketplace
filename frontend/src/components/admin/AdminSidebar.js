import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiGrid, FiUsers, FiShoppingBag, FiTag, FiFileText, FiSettings, FiLogOut, FiX, FiPackage } from 'react-icons/fi';
import { useAuth } from '../../features/auth/AuthContext';
import { useHasMounted } from '../../lib/useHasMounted';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
  { href: '/admin/users', label: 'Users', icon: FiUsers },
  { href: '/admin/vendors', label: 'Vendors', icon: FiShoppingBag },
  { href: '/admin/orders', label: 'Orders', icon: FiPackage },
  { href: '/admin/categories', label: 'Categories', icon: FiTag },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: FiFileText },
];

const roleLabel = (user) => {
  if (user?.role === 'ADMIN') return 'Administrator account';
  if (user?.role === 'VENDOR') return 'Vendor account';
  return 'Customer account';
};

const initialsOf = (user) => {
  if (!user) return '';
  const a = user.firstName?.[0] || '';
  const b = user.lastName?.[0] || '';
  return (a + b || user.email?.[0] || '?').toUpperCase();
};

export default function AdminSidebar({ expanded, mobileOpen, onCloseMobile, onToggleExpand }) {
  const router = useRouter();
  const { isAuthenticated: authState, user, logout } = useAuth();
  const mounted = useHasMounted();
  const isAuthenticated = mounted && authState;
  const showLabels = expanded || mobileOpen;

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <>
      <aside className={`app-sidebar ${expanded ? 'expanded' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <button type="button" className="sidebar-mobile-close" onClick={onCloseMobile} aria-label="Close menu">
          <FiX size={20} />
        </button>

        <button
          type="button"
          className="sidebar-brand"
          onClick={onToggleExpand}
          aria-label={expanded ? 'Collapse menu' : 'Expand menu'}
        >
          <img src="/logo.jpeg" alt="ZayLink Logo" className="sidebar-brand-mark" />
          {showLabels && <span className="sidebar-brand-name">ZayLink</span>}
        </button>

        {showLabels && isAuthenticated && (
          <div className="sidebar-user-card">
            <span className="sidebar-avatar">{initialsOf(user)}</span>
            <span className="sidebar-user-name">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
            </span>
            <span className="sidebar-user-sub">{roleLabel(user)}</span>
          </div>
        )}

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const active = router.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${active ? 'active' : ''}`}
                title={item.label}
              >
                <Icon />
                {showLabels && <span>{item.label}</span>}
              </Link>
            );
          })}

          <div className="sidebar-nav-spacer" />

          <Link
            href="/settings"
            className={`sidebar-nav-item ${router.pathname === '/settings' ? 'active' : ''}`}
            title="Settings"
          >
            <FiSettings />
            {showLabels && <span>Settings</span>}
          </Link>

          {isAuthenticated && (
            <button type="button" className="sidebar-nav-item logout" onClick={handleLogout} title="Log out">
              <FiLogOut />
              {showLabels && <span>Log out</span>}
            </button>
          )}
        </nav>
      </aside>
      <div className={`sidebar-scrim ${mobileOpen ? 'open' : ''}`} onClick={onCloseMobile} />
    </>
  );
}
