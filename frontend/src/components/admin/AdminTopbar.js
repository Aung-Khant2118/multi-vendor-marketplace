import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiMenu, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../features/auth/AuthContext';
import NotificationBell from '../notifications/NotificationBell';

const initialsOf = (user) => {
  if (!user) return 'AD';
  const a = user.firstName?.[0] || '';
  const b = user.lastName?.[0] || '';
  return (a + b || user.email?.[0] || 'AD').toUpperCase();
};

export default function AdminTopbar({ onOpenMobileMenu }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

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

      <div className="topbar-actions">
        <NotificationBell audience="admin" />

        <div style={{ position: 'relative' }}>
          <button type="button" className="topbar-user-chip" onClick={() => setMenuOpen((v) => !v)}>
            <span className="sidebar-avatar">{initialsOf(user)}</span>
          </button>

          {menuOpen && (
            <div className="user-menu" onMouseLeave={() => setMenuOpen(false)}>
              <Link href="/settings" onClick={() => setMenuOpen(false)}>
                <FiSettings /> Settings
              </Link>
              <button type="button" onClick={handleLogout}>
                <FiLogOut /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
