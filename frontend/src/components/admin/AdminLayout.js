import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import Footer from '../layout/Footer';
import { useAdminGuard } from '../../lib/useAdminGuard';

export default function AdminLayout({ children }) {
  const { ready } = useAdminGuard();
  // Admin panels read as permanent, wide-nav consoles rather than the
  // collapsible rail customer/vendor use — default to expanded to match
  // the admin design reference, while keeping the same toggle behavior.
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!ready) return null;

  return (
    <div className="app-shell">
      <AdminSidebar
        expanded={expanded}
        mobileOpen={mobileOpen}
        onToggleExpand={() => setExpanded((v) => !v)}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="app-main">
        <AdminTopbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <div className="app-content">{children}</div>
        <Footer />
      </div>
    </div>
  );
}
