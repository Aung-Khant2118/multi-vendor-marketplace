import { useMemo, useState } from 'react';
import { FiDownload, FiUserCheck, FiShoppingBag, FiTag, FiSlash, FiKey, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import Pagination from '../../components/admin/Pagination';
import { AUDIT_GROUP_TABS, AUDIT_EVENT_META, AUDIT_LOGS } from '../../lib/adminDemoData';

const EVENT_ICON = {
  ROLE_CHANGE: FiUserCheck,
  VENDOR_APPROVE: FiShoppingBag,
  VENDOR_SUSPEND: FiSlash,
  CATEGORY_ADD: FiTag,
  AUTH_RESET: FiKey,
};

const initialsOf = (name) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

function exportCsv(rows) {
  const header = ['Timestamp', 'Actor', 'Role', 'Event', 'Details', 'Status', 'IP Address'];
  const lines = rows.map((r) =>
    [`${r.date} ${r.time}`, r.actor, r.actorRole, r.type, r.details, r.status, r.ip]
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
  const [timeframe, setTimeframe] = useState('Last 7 Days');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    if (group === 'ALL') return AUDIT_LOGS;
    return AUDIT_LOGS.filter((l) => AUDIT_EVENT_META[l.type]?.group === group);
  }, [group]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageLogs = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <AdminLayout searchPlaceholder="Search audit logs by admin, action, IP...">
      <div className="page-heading">
        <div>
          <h1>System Audit Logs</h1>
        </div>
        <button type="button" className="btn-pill btn-pill-outline" onClick={() => exportCsv(filtered)}>
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
        <select
          className="arows-select"
          style={{ marginLeft: 'auto' }}
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option>Last 24 Hours</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>All Time</option>
        </select>
      </div>

      <div className="vcard">
        {pageLogs.length === 0 ? (
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
                  <th>Actor / Admin</th>
                  <th>Action Event</th>
                  <th>Details / Target</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {pageLogs.map((l) => {
                  const meta = AUDIT_EVENT_META[l.type];
                  const Icon = EVENT_ICON[l.type] || FiTag;
                  return (
                    <tr key={l.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {l.date}
                        <div className="vtable-sub">{l.time}</div>
                      </td>
                      <td>
                        <div className="vtable-cell-main">
                          <span className="vtable-avatar" style={{ background: 'var(--navy-950)', color: '#fff' }}>
                            {initialsOf(l.actor)}
                          </span>
                          <div>
                            <div className="vtable-name">{l.actor}</div>
                            <div className="vtable-sub">{l.actorRole}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`vpill ${meta.cls}`}>
                          <Icon size={11} /> {l.type}
                        </span>
                      </td>
                      <td>{l.details}</td>
                      <td>
                        {l.status === 'Success' ? (
                          <span className="vpill vpill-green">
                            <FiCheckCircle size={11} /> Success
                          </span>
                        ) : (
                          <span className="vpill vpill-yellow">
                            <FiAlertTriangle size={11} /> Warning
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: 11.5 }}>{l.ip}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <Pagination
          page={currentPage}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          totalCount={filtered.length}
          itemLabel="total events"
        />
      )}
    </AdminLayout>
  );
}
