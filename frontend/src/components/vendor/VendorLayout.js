import { useState } from 'react';
import VendorSidebar from './VendorSidebar';
import Topbar from '../layout/Topbar';
import VendorFooter from './VendorFooter';

export default function VendorLayout({ children }) {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="vendor-shell">
      <VendorSidebar
        expanded={expanded}
        mobileOpen={mobileOpen}
        onToggleExpand={() => setExpanded((v) => !v)}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="vendor-main">
        <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <div className="vendor-content">{children}</div>
        <VendorFooter />
      </div>
    </div>
  );
}
