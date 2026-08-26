import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiGrid, FiUsers, FiShoppingBag, FiTag, FiFileText, FiLogOut, FiX } from 'react-icons/fi';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
  { href: '/admin/users', label: 'Users', icon: FiUsers },
  { href: '/admin/vendors', label: 'Vendors', icon: FiShoppingBag },
  { href: '/admin/categories', label: 'Categories', icon: FiTag },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: FiFileText },
];

// Admin's own account here is a static placeholder — there's no admin
// backend/auth wired up yet (out of scope, see admin design.zip task).
const ADMIN_ACCOUNT = { initials: 'AD', name: 'DelinaDD', sub: 'Administrator account' };

export default function AdminSidebar({ expanded, mobileOpen, onCloseMobile, onToggleExpand }) {
  const router = useRouter();
  const showLabels = expanded || mobileOpen;

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

        {showLabels && (
          <div className="sidebar-user-card">
            <span className="sidebar-avatar">{ADMIN_ACCOUNT.initials}</span>
            <span className="sidebar-user-name">{ADMIN_ACCOUNT.name}</span>
            <span className="sidebar-user-sub">{ADMIN_ACCOUNT.sub}</span>
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

          <Link href="/auth/login" className="sidebar-nav-item logout" title="Log out">
            <FiLogOut />
            {showLabels && <span>Log out</span>}
          </Link>
        </nav>
      </aside>
      <div className={`sidebar-scrim ${mobileOpen ? 'open' : ''}`} onClick={onCloseMobile} />
    </>
  );
}
