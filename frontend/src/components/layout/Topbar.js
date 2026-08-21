import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiSearch, FiSliders, FiMenu, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../features/auth/AuthContext';
import { useHasMounted } from '../../lib/useHasMounted';

const initialsOf = (user) => {
  if (!user) return '';
  const a = user.firstName?.[0] || '';
  const b = user.lastName?.[0] || '';
  return (a + b || user.email?.[0] || '?').toUpperCase();
};

export default function Topbar({ onOpenMobileMenu }) {
  const { isAuthenticated: authState, user, isVendor: vendorState, logout } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState(router.query.q || '');
  const [menuOpen, setMenuOpen] = useState(false);
  // See Sidebar.js: avoids a hydration mismatch against the statically
  // exported "guest" HTML by rendering as guest until after mount.
  const mounted = useHasMounted();
  const isAuthenticated = mounted && authState;
  const isVendor = mounted && vendorState;
  const onVendorPages = router.pathname.startsWith('/vendor');

  const submitSearch = (e) => {
    e.preventDefault();
    const base = onVendorPages ? '/vendor/products' : '/products';
    router.push(query ? `${base}?q=${encodeURIComponent(query)}` : base);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="app-topbar">
      <button type="button" className="topbar-menu-btn" onClick={onOpenMobileMenu} aria-label="Open menu">
        <FiMenu size={20} />
      </button>

      <form className="search-bar" onSubmit={submitSearch}>
        <FiSearch size={18} />
        <input
          type="text"
          placeholder="Search products, stores, or categories"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <FiSliders size={16} />
      </form>

      <div className="topbar-actions">
        {!isAuthenticated ? (
          <>
            <Link href="/auth/login" className="btn-pill btn-pill-yellow">
              Login
            </Link>
            <Link href="/auth/register" className="btn-pill btn-pill-outline">
              Create Account
            </Link>
          </>
        ) : (
          <>
            {onVendorPages ? (
              <Link href="/" className="btn-pill btn-pill-yellow">
                Switch to Customer
              </Link>
            ) : isVendor ? (
              <Link href="/vendor/dashboard" className="btn-pill btn-pill-yellow">
                Switch to Vendor
              </Link>
            ) : (
              <Link href="/auth/vendor-register" className="btn-pill btn-pill-yellow">
                Become a Vendor
              </Link>
            )}

            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="topbar-user-chip"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span className="sidebar-avatar">{initialsOf(user)}</span>
                <span className="topbar-user-chip-text">
                  <div className="topbar-user-chip-name">
                    {user?.firstName ? `${user.firstName}${user.lastName || ''}` : 'Account'}
                  </div>
                  <div className="topbar-user-chip-role">{isVendor ? 'Vendor' : 'Customer'}</div>
                </span>
              </button>

              {menuOpen && (
                <div className="user-menu" onMouseLeave={() => setMenuOpen(false)}>
                  <Link href="/profile" onClick={() => setMenuOpen(false)}>
                    <FiSettings /> Profile settings
                  </Link>
                  <button type="button" onClick={handleLogout}>
                    <FiLogOut /> Log out
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
