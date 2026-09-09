import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiSearch, FiSliders, FiMenu, FiSettings, FiLogOut, FiUser, FiGrid } from 'react-icons/fi';
import { useAuth } from '../../features/auth/AuthContext';
import { useHasMounted } from '../../lib/useHasMounted';
import { customerAPI } from '../../services/api';
import NotificationBell from '../notifications/NotificationBell';

const initialsOf = (user) => {
  if (!user) return '';
  const a = user.firstName?.[0] || '';
  const b = user.lastName?.[0] || '';
  return (a + b || user.email?.[0] || '?').toUpperCase();
};

export default function Topbar({ onOpenMobileMenu }) {
  const { isAuthenticated: authState, user, isVendor: vendorState, isAdmin: adminState, logout } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState(router.query.q || '');
  const [menuOpen, setMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const mounted = useHasMounted();
  const isAuthenticated = mounted && authState;
  const isVendor = mounted && vendorState;
  const isAdmin = mounted && adminState;
  const onVendorPages = router.pathname.startsWith('/vendor') ||
    (router.pathname === '/settings' && user?.role === 'VENDOR');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQueryChange = (value) => {
    setQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        customerAPI
          .autocomplete(value.trim(), 8)
          .then((res) => {
            const data = res.data?.data || [];
            setSuggestions(data);
            setShowSuggestions(data.length > 0);
          })
          .catch(() => setSuggestions([]));
      }, 200);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const navigateToSuggestion = (suggestion) => {
    setShowSuggestions(false);
    setQuery('');
    if (suggestion.type === 'vendor') {
      router.push(`/products?vendor=${suggestion.id}`);
    } else if (suggestion.type === 'category') {
      router.push(`/products?category=${suggestion.id}`);
    } else {
      router.push(`/products/${suggestion.slug}`);
    }
  };

  const submitSearch = (e) => {
    e.preventDefault();
    if (activeIndex >= 0 && activeIndex < suggestions.length) {
      navigateToSuggestion(suggestions[activeIndex]);
      return;
    }
    setShowSuggestions(false);
    const base = onVendorPages ? '/vendor/products' : '/products';
    router.push(query ? `${base}?q=${encodeURIComponent(query)}` : base);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
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

      {!onVendorPages && (
        <div className="search-bar" ref={searchRef} style={{ position: 'relative' }}>
          <FiSearch size={18} />
          <form onSubmit={submitSearch} style={{ display: 'contents' }}>
            <input
              type="text"
              placeholder="Search products, stores, or categories"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
          </form>
          <FiSliders size={16} />

          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              maxHeight: 360,
              overflow: 'auto',
              zIndex: 1000,
            }}>
              {suggestions.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => navigateToSuggestion(s)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '10px 14px',
                    border: 'none',
                    background: i === activeIndex ? '#f3f4f6' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 14,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  {s.imageUrl ? (
                    <img
                      src={s.imageUrl}
                      alt=""
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 6,
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 6,
                      background: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: '#9ca3af',
                    }}>
                      {s.type === 'vendor' ? <FiUser size={16} /> : s.type === 'category' ? <FiGrid size={16} /> : <FiSearch size={16} />}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 500,
                      color: '#111827',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {s.name}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: '#6b7280',
                      textTransform: 'capitalize',
                    }}>
                      {s.type === 'vendor' ? 'Store' : s.type}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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
            {isAdmin ? (
              <Link href="/admin/dashboard" className="btn-pill btn-pill-yellow">
                Admin Panel
              </Link>
            ) : onVendorPages ? (
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

            <NotificationBell audience={onVendorPages ? 'vendor' : 'customer'} />

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
                  <div className="topbar-user-chip-role">
                    {isAdmin ? 'Admin' : isVendor ? 'Vendor' : 'Customer'}
                  </div>
                </span>
              </button>

              {menuOpen && (
                <div className="user-menu" onMouseLeave={() => setMenuOpen(false)}>
                  {isAdmin && (
                    <Link href="/admin/dashboard" onClick={() => setMenuOpen(false)}>
                      <FiGrid /> Admin Dashboard
                    </Link>
                  )}
                  <Link href="/settings" onClick={() => setMenuOpen(false)}>
                    <FiSettings /> Settings
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
