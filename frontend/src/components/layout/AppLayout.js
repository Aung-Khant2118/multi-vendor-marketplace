import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';

export default function AppLayout({ children }) {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        expanded={expanded}
        mobileOpen={mobileOpen}
        onToggleExpand={() => setExpanded((v) => !v)}
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
