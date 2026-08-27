import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiGrid, FiClipboard, FiBox, FiTrendingUp, FiX } from 'react-icons/fi';
import { HiMegaphone } from 'react-icons/hi2';
import { useAuth } from '../../features/auth/AuthContext';
import { useHasMounted } from '../../lib/useHasMounted';

const NAV_ITEMS = [
  { href: '/vendor/dashboard', label: 'Overview', icon: FiGrid },
  { href: '/vendor/orders', label: 'Orders', icon: FiClipboard },
  { href: '/vendor/products', label: 'Products', icon: FiBox },
  { href: '/vendor/promos', label: 'Promos', icon: HiMegaphone },
  { href: '/vendor/analytics', label: 'Analytics', icon: FiTrendingUp },
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

export default function VendorSidebar({ expanded, mobileOpen, onCloseMobile, onToggleExpand }) {
  const router = useRouter();
  const { isAuthenticated: authState, user } = useAuth();
  const mounted = useHasMounted();
  const isAuthenticated = mounted && authState;
  const showLabels = expanded || mobileOpen;

  return (
    <>
      <aside className={`vendor-sidebar ${expanded ? 'expanded' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <button
          type="button"
          className="vendor-sidebar-mobile-close"
          onClick={onCloseMobile}
          aria-label="Close menu"
        >
          <FiX size={20} />
        </button>

        <button
          type="button"
          className="vendor-sidebar-brand"
          onClick={onToggleExpand}
          aria-label={expanded ? 'Collapse menu' : 'Expand menu'}
        >
          <span className="vendor-sidebar-mark">Z</span>
          {showLabels && <span className="vendor-sidebar-name">ZAYLINK</span>}
        </button>

        {showLabels && isAuthenticated && (
          <div className="vendor-user-card">
            <span className="vendor-avatar">{initialsOf(user)}</span>
            <span className="vendor-user-name">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
            </span>
            <span className="vendor-user-sub">{roleLabel(user)}</span>
          </div>
        )}

        <nav className="vendor-nav">
          {NAV_ITEMS.map((item) => {
            const active = router.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`vendor-nav-item ${active ? 'active' : ''}`}
                title={item.label}
              >
                <Icon />
                {showLabels && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className={`vendor-sidebar-scrim ${mobileOpen ? 'open' : ''}`} onClick={onCloseMobile} />
    </>
  );
}
