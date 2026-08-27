import { useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiBell, FiMenu, FiSettings, FiLogOut } from 'react-icons/fi';

export default function AdminTopbar({ onOpenMobileMenu, searchPlaceholder = 'Search dashboard data...' }) {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-topbar">
      <button type="button" className="topbar-menu-btn" onClick={onOpenMobileMenu} aria-label="Open menu">
        <FiMenu size={20} />
      </button>

      <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
        <FiSearch size={18} />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <div className="topbar-actions">
        <button type="button" className="vendor-bell" aria-label="Notifications">
          <FiBell size={20} />
          <span className="vendor-bell-dot" />
        </button>

        <div style={{ position: 'relative' }}>
          <button type="button" className="topbar-user-chip" onClick={() => setMenuOpen((v) => !v)}>
            <span className="sidebar-avatar">AM</span>
          </button>

          {menuOpen && (
            <div className="user-menu" onMouseLeave={() => setMenuOpen(false)}>
              <Link href="/settings" onClick={() => setMenuOpen(false)}>
                <FiSettings /> Settings
              </Link>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                <FiLogOut /> Log out
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
