import { useState, useCallback } from 'react';
import VendorSidebar from './VendorSidebar';
import Topbar from '../layout/Topbar';
import VendorFooter from './VendorFooter';

const STORAGE_KEY = 'vendor-sidebar-expanded';

const readExpanded = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true';
};

export default function VendorLayout({ children }) {
  const [expanded, setExpanded] = useState(readExpanded);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleExpand = useCallback(() => {
    setExpanded((v) => {
      const next = !v;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <div className="app-shell">
      <VendorSidebar
        expanded={expanded}
        mobileOpen={mobileOpen}
        onToggleExpand={toggleExpand}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="app-main">
        <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <div className="app-content">{children}</div>
        <VendorFooter />
      </div>
    </div>
  );
}
