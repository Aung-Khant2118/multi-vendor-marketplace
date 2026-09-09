import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { FiBell, FiCheck, FiPackage, FiShoppingBag, FiInfo } from 'react-icons/fi';
import { notificationAPI } from '../../services/api';

/** Types relevant to each dashboard audience — keeps role inboxes separate. */
const AUDIENCE_TYPES = {
  customer: new Set(['ORDER_UPDATE', 'SYSTEM']),
  vendor: new Set(['VENDOR_APPROVED', 'VENDOR_REJECTED', 'VENDOR_SUSPENDED', 'SYSTEM']),
  admin: new Set(['SYSTEM', 'VENDOR_APPROVED', 'VENDOR_REJECTED', 'VENDOR_SUSPENDED', 'ORDER_UPDATE']),
};

const POLL_MS = 30000;

function formatRelativeTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffSec = Math.round((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString();
}

function typeIcon(type) {
  if (type === 'ORDER_UPDATE') return <FiPackage size={16} />;
  if (String(type || '').startsWith('VENDOR_')) return <FiShoppingBag size={16} />;
  return <FiInfo size={16} />;
}

function hrefForNotification(n, audience) {
  const refType = (n.referenceType || '').toLowerCase();
  if (refType === 'order' && n.referenceId) {
    if (audience === 'vendor') return '/vendor/orders';
    if (audience === 'admin') return '/admin/dashboard';
    return `/orders/${n.referenceId}`;
  }
  if (String(n.type || '').startsWith('VENDOR_')) {
    if (audience === 'vendor') return '/vendor/dashboard';
    if (audience === 'admin') return '/admin/vendors';
  }
  return null;
}

function normalizeNotification(n) {
  return {
    ...n,
    read: Boolean(n.read ?? n.isRead),
  };
}

function filterForAudience(items, audience) {
  const allowed = AUDIENCE_TYPES[audience] || AUDIENCE_TYPES.customer;
  return (items || [])
    .map(normalizeNotification)
    .filter((n) => allowed.has(n.type));
}

/**
 * Bell + dropdown for the current user's notifications.
 * @param {'customer'|'vendor'|'admin'} audience — dashboard context; filters types & links
 */
export default function NotificationBell({ audience = 'customer' }) {
  const router = useRouter();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const refresh = useCallback(async ({ withLoading = false } = {}) => {
    if (withLoading) setLoading(true);
    try {
      const res = await notificationAPI.list({ page: 0, size: 30 });
      const filtered = filterForAudience(res.data?.data || [], audience);
      setItems(filtered);
      setUnread(filtered.filter((n) => !n.read).length);
    } catch {
      setItems([]);
      setUnread(0);
    } finally {
      if (withLoading) setLoading(false);
    }
  }, [audience]);

  useEffect(() => {
    refresh();
    const id = setInterval(() => refresh(), POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!open) return undefined;
    refresh({ withLoading: true });
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, refresh]);

  const toggle = () => setOpen((v) => !v);

  const handleMarkAll = async () => {
    if (markingAll || unread === 0) return;
    setMarkingAll(true);
    try {
      await notificationAPI.markAllAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {
      // keep previous state
    } finally {
      setMarkingAll(false);
    }
  };

  const handleClickItem = async (n) => {
    if (!n.read) {
      try {
        await notificationAPI.markAsRead(n.id);
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
        setUnread((c) => Math.max(0, c - 1));
      } catch {
        // continue navigation even if mark-read fails
      }
    }
    const href = hrefForNotification(n, audience);
    setOpen(false);
    if (href) router.push(href);
  };

  return (
    <div className="notif-bell-wrap" ref={rootRef}>
      <button
        type="button"
        className="vendor-bell"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={toggle}
      >
        <FiBell size={20} />
        {unread > 0 && (
          <span className="notif-bell-badge" aria-hidden>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown" role="dialog" aria-label="Notifications">
          <div className="notif-dropdown-header">
            <strong>Notifications</strong>
            <button
              type="button"
              className="notif-mark-all"
              onClick={handleMarkAll}
              disabled={markingAll || unread === 0}
            >
              <FiCheck size={14} /> Mark all read
            </button>
          </div>

          <div className="notif-dropdown-body">
            {loading && items.length === 0 ? (
              <div className="notif-empty">Loading…</div>
            ) : items.length === 0 ? (
              <div className="notif-empty">No notifications yet</div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`notif-item${n.read ? '' : ' is-unread'}`}
                  onClick={() => handleClickItem(n)}
                >
                  <span className="notif-item-icon">{typeIcon(n.type)}</span>
                  <span className="notif-item-content">
                    <span className="notif-item-title">{n.title}</span>
                    {n.message && <span className="notif-item-msg">{n.message}</span>}
                    <span className="notif-item-time">{formatRelativeTime(n.createdAt)}</span>
                  </span>
                  {!n.read && <span className="notif-item-dot" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
