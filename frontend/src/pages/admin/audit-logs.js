import { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiUserCheck, FiShoppingBag, FiTag, FiSlash, FiKey, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import Pagination from '../../components/admin/Pagination';
import { adminAPI } from '../../services/api';

const EVENT_ICON = {
  UPDATE_ROLE: FiUserCheck,
  APPROVE_VENDOR: FiShoppingBag,
  REJECT_VENDOR: FiSlash,
  SUSPEND_VENDOR: FiSlash,
  CATEGORY_ADD: FiTag,
};

const AUDIT_GROUP_TABS = [
  { key: 'ALL', label: 'All Events' },
  { key: 'ROLES_AUTH', label: 'Roles & Auth' },
  { key: 'VENDOR_APPROVALS', label: 'Vendor Approvals' },
  { key: 'CATALOG', label: 'Catalog / Categories' },
];

const ACTION_GROUP = {
  UPDATE_ROLE: 'ROLES_AUTH',
  APPROVE_VENDOR: 'VENDOR_APPROVALS',
  REJECT_VENDOR: 'VENDOR_APPROVALS',
  SUSPEND_VENDOR: 'VENDOR_APPROVALS',
  CATEGORY_ADD: 'CATALOG',
};

const ACTION_CLS = {
  UPDATE_ROLE: 'vpill-pink',
  APPROVE_VENDOR: 'vpill-purple',
  REJECT_VENDOR: 'vpill-red',
  SUSPEND_VENDOR: 'vpill-red',
  CATEGORY_ADD: 'vpill-yellow',
};

function formatTimestamp(dateStr) {
  if (!dateStr) return { date: '', time: '' };
  const d = new Date(dateStr);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  return { date, time };
}

function exportCsv(rows) {
  const header = ['Timestamp', 'Actor Email', 'Action', 'Entity', 'Details', 'IP Address'];
  const lines = rows.map((r) =>
    [r.createdAt, r.actorEmail || '', r.action, r.entityType || '', r.details || '', r.ipAddress || '']
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'zaylink-audit-logs.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminAuditLogs() {
  const [group, setGroup] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminAPI
      .getAuditLogs({ page: page - 1, size: pageSize })
      .then((res) => {
        setLogs(res.data?.data || []);
        setTotalCount(res.data?.totalElements || 0);
      })
      .catch(() => {
        setLogs([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  const filtered = useMemo(() => {
    if (group === 'ALL') return logs;
    return logs.filter((l) => ACTION_GROUP[l.action] === group);
  }, [logs, group]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <AdminLayout>
      <div className="page-heading">
        <div>
          <h1>System Audit Logs</h1>
        </div>
        <button type="button" className="btn-pill btn-pill-outline" onClick={() => exportCsv(logs)}>
          <FiDownload /> Export Logs (CSV)
        </button>
      </div>

      <div className="vtab-row">
        {AUDIT_GROUP_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`vtab ${group === t.key ? 'active' : ''}`}
            onClick={() => {
              setGroup(t.key);
              setPage(1);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="vcard">
        {loading ? (
          <p style={{ padding: 20, color: 'var(--text-secondary)', textAlign: 'center' }}>Loading audit logs…</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No events in this category</div>
            <p>Try a different filter tab.</p>
          </div>
        ) : (
          <div className="vtable-wrap">
            <table className="vtable">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action Event</th>
                  <th>Details / Target</th>
                  <th style={{ textAlign: 'center' }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const { date, time } = formatTimestamp(l.createdAt);
                  const Icon = EVENT_ICON[l.action] || FiTag;
                  const cls = ACTION_CLS[l.action] || 'vpill-blue';
                  const email = l.actorEmail || 'system';
                  const initials = email.slice(0, 2).toUpperCase();
                  return (
                    <tr key={l.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {date}
                        <div className="vtable-sub">{time}</div>
                      </td>
                      <td>
                        <div className="vtable-cell-main">
                          <span className="vtable-avatar" style={{ background: 'var(--navy-950)', color: '#fff' }}>
                            {initials}
                          </span>
                          <div>
                            <div className="vtable-name">{email}</div>
                            {l.entityType && <div className="vtable-sub">{l.entityType} #{l.entityId}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`vpill ${cls}`}>
                          <Icon size={11} /> {(l.action || '').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>{l.details || '—'}</td>
                      <td style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: 11.5 }}>{l.ipAddress || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalCount > 0 && (
        <Pagination
          page={page}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          totalCount={totalCount}
          itemLabel="total events"
        />
      )}
    </AdminLayout>
  );
}
