import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiGrid,
  FiPackage,
  FiHeart,
  FiMapPin,
  FiSettings,
  FiShoppingCart,
  FiLogOut,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { useAuth } from '../../features/auth/AuthContext';
import { useHasMounted } from '../../lib/useHasMounted';

const GUEST_NAV = [
  { href: '/', label: 'Overview', icon: FiGrid },
  { href: '/orders', label: 'Orders', icon: FiPackage },
  { href: '/wishlist', label: 'Wishlist', icon: FiHeart },
  { href: '/cart', label: 'Cart', icon: FiShoppingCart },
];

const CUSTOMER_NAV = [
  { href: '/', label: 'Overview', icon: FiGrid },
  { href: '/orders', label: 'Orders', icon: FiPackage },
  { href: '/wishlist', label: 'Wishlist', icon: FiHeart },
  { href: '/addresses', label: 'Addresses', icon: FiMapPin },
  { href: '/profile', label: 'Profile settings', icon: FiSettings },
  { href: '/cart', label: 'Cart', icon: FiShoppingCart },
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

export default function Sidebar({ expanded, mobileOpen, onCloseMobile, onToggleExpand }) {
  const { isAuthenticated: authState, user, logout } = useAuth();
  const router = useRouter();
  // This is a static export with no server-side auth, so the token only
  // exists in localStorage on the client. Trusting it on the very first
  // render would make that render disagree with the statically-built HTML
  // (always "guest"), triggering a hydration mismatch. Rendering as guest
  // until mounted keeps the first paint identical, then the real state
  // takes over immediately after.
  const mounted = useHasMounted();
  const isAuthenticated = mounted && authState;
  const navItems = isAuthenticated ? CUSTOMER_NAV : GUEST_NAV;
  // The mobile drawer is always shown in its full "expanded" form, even
  // though the desktop collapse toggle is a separate piece of state.
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
          <span className="sidebar-brand-mark">Z</span>
          {showLabels && <span className="sidebar-brand-name">ZAYLINK</span>}
        </button>

        {/* The user/guest card only appears once the rail is expanded,
            matching the collapsed-rail reference frames which show icons only. */}
        {showLabels &&
          (isAuthenticated ? (
            <div className="sidebar-user-card">
              <span className="sidebar-avatar">{initialsOf(user)}</span>
              <span className="sidebar-user-name">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
              </span>
              <span className="sidebar-user-sub">{roleLabel(user)}</span>
            </div>
          ) : (
            <Link href="/auth/login" className="sidebar-user-card">
              <span className="sidebar-avatar">
                <FiUser />
              </span>
              <span className="sidebar-user-name">Guest</span>
              <span className="sidebar-user-sub">Login to Personalize</span>
            </Link>
          ))}

        <nav className="sidebar-nav">
          {navItems.map((item) => {
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
