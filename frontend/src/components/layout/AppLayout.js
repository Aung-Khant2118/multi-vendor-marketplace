import { useState, useCallback, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';

const STORAGE_KEY = 'sidebar-expanded';

export default function AppLayout({ children }) {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setExpanded(localStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  const toggleExpand = useCallback(() => {
    setExpanded((v) => {
      const next = !v;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <div className="app-shell">
      <Sidebar
        expanded={expanded}
        mobileOpen={mobileOpen}
        onToggleExpand={toggleExpand}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="app-main">
        <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <div className="app-content">{children}</div>
        <Footer />
      </div>
    </div>
  );
}
