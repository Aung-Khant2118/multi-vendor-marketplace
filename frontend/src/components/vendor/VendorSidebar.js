import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiGrid, FiClipboard, FiBox, FiTrendingUp, FiShoppingBag, FiX } from 'react-icons/fi';
import { HiMegaphone } from 'react-icons/hi2';

const NAV_ITEMS = [
  { href: '/vendor/dashboard', label: 'Overview', icon: FiGrid },
  { href: '/vendor/orders', label: 'Orders', icon: FiClipboard },
  { href: '/vendor/products', label: 'Products', icon: FiBox },
  { href: '/vendor/promos', label: 'Promos', icon: HiMegaphone },
  { href: '/vendor/analytics', label: 'Analytics', icon: FiTrendingUp },
];

export default function VendorSidebar({ expanded, mobileOpen, onCloseMobile, onToggleExpand, healthPct = 72 }) {
  const router = useRouter();
  // The mobile drawer is always shown in its full "expanded" form, even
  // though the desktop collapse toggle is a separate piece of state.
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
          <span className="vendor-sidebar-mark">
            <FiShoppingBag size={17} />
          </span>
          {showLabels && <span className="vendor-sidebar-name">VENDOR</span>}
        </button>

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

        <div className="vendor-sidebar-spacer" />

        {showLabels && (
          <div className="vendor-health-card">
            <div className="vendor-health-label">Marketplace Health</div>
            <div className="vendor-health-track">
              <div className="vendor-health-fill" style={{ width: `${healthPct}%` }} />
            </div>
          </div>
        )}
      </aside>
      <div className={`vendor-sidebar-scrim ${mobileOpen ? 'open' : ''}`} onClick={onCloseMobile} />
    </>
  );
}
