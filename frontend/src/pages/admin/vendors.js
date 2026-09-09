import { useEffect, useMemo, useState } from 'react';
import { FiMoreVertical, FiCheck, FiX, FiSlash, FiStar, FiShoppingBag } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import Pagination from '../../components/admin/Pagination';
import { adminAPI } from '../../services/api';

const VENDOR_STATUS_PILL = {
  PENDING: 'vpill-yellow',
  ACTIVE: 'vpill-green',
  SUSPENDED: 'vpill-gray',
  REJECTED: 'vpill-red',
};

const STATUS_ICON_TONE = {
  PENDING: 'tone-amber',
  ACTIVE: 'tone-green',
  SUSPENDED: 'tone-gray',
  REJECTED: 'tone-red',
};

const TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'SUSPENDED', label: 'Suspended' },
  { key: 'REJECTED', label: 'Rejected' },
];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const fullName = (u) => `${u || ''}`.trim() || 'Unknown';

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [tab, setTab] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [acting, setActing] = useState(null);

  const counts = useMemo(() => {
    const c = { ALL: totalCount, PENDING: 0, ACTIVE: 0, SUSPENDED: 0, REJECTED: 0 };
    allVendors.forEach((v) => (c[v.status] = (c[v.status] || 0) + 1));
    return c;
  }, [allVendors, totalCount]);

  useEffect(() => {
    setLoading(true);
    const params = { page: page - 1, size: pageSize };
    if (tab !== 'ALL') params.status = tab;
    adminAPI
      .getVendors(params)
      .then((res) => {
        setVendors(res.data?.data || []);
        setTotalCount(res.data?.totalElements || 0);
      })
      .catch(() => {
        setVendors([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, [tab, page, pageSize]);

  useEffect(() => {
    adminAPI
      .getVendors({ page: 0, size: 200 })
      .then((res) => setAllVendors(res.data?.data || []))
      .catch(() => {});
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);

  const changeTab = (key) => {
    setTab(key);
    setPage(1);
  };

  const handleAction = async (id, action) => {
    setActing(id);
    try {
      if (action === 'APPROVE') await adminAPI.approveVendor(id);
      else if (action === 'REJECT') await adminAPI.rejectVendor(id);
      else if (action === 'SUSPEND') await adminAPI.suspendVendor(id);

      setVendors((list) =>
        list.map((v) => {
          if (v.id !== id) return v;
          if (action === 'APPROVE') return { ...v, status: 'ACTIVE' };
          if (action === 'REJECT') return { ...v, status: 'REJECTED' };
          if (action === 'SUSPEND') return { ...v, status: 'SUSPENDED' };
          return v;
        })
      );
      setAllVendors((list) =>
        list.map((v) => {
          if (v.id !== id) return v;
          if (action === 'APPROVE') return { ...v, status: 'ACTIVE' };
          if (action === 'REJECT') return { ...v, status: 'REJECTED' };
          if (action === 'SUSPEND') return { ...v, status: 'SUSPENDED' };
          return v;
        })
      );
    } catch {
      /* handled by interceptor */
    } finally {
      setActing(null);
      setOpenMenuId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="page-heading">
        <div>
          <h1>Vendor Management</h1>
        </div>
      </div>

      <div className="vtab-row">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={`vtab ${tab === t.key ? 'active' : ''}`} onClick={() => changeTab(t.key)}>
            {t.label} <span className="vtab-count">{counts[t.key] || 0}</span>
          </button>
        ))}
      </div>

      <div className="vcard">
        {loading ? (
          <p style={{ padding: 20, color: 'var(--text-secondary)', textAlign: 'center' }}>Loading vendors…</p>
        ) : vendors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No vendors found</div>
            <p>Try a different status tab.</p>
          </div>
        ) : (
          <div className="vtable-wrap">
            <table className="vtable">
              <thead>
                <tr>
                  <th>Store & Owner</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Applied Date</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className="vtable-cell-main">
                        <span className={`aactivity-icon ${STATUS_ICON_TONE[v.status]}`}>
                          <FiShoppingBag size={16} />
                        </span>
                        <div>
                          <div className="vtable-name">{v.storeName}</div>
                          <div className="vtable-sub">
                            {fullName(v.userFirstName)} {v.userLastName} · {v.userEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`vpill ${VENDOR_STATUS_PILL[v.status]}`}>{v.status}</span>
                    </td>
                    <td>
                      {v.rating ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                          <FiStar size={12} style={{ color: '#f3c318' }} /> {Number(v.rating).toFixed(1)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>{formatDate(v.createdAt)}</td>
                    <td style={{ textAlign: 'center' }}>
                      {v.status === 'SUSPENDED' || v.status === 'REJECTED' ? (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      ) : (
                        <div className="filter-pill-menu" style={{ display: 'inline-block' }}>
                          <button
                            type="button"
                            className="vtable-kebab"
                            onClick={() => setOpenMenuId(openMenuId === v.id ? null : v.id)}
                            disabled={acting === v.id}
                            aria-label="Vendor actions"
                          >
                            <FiMoreVertical size={16} />
                          </button>
                          {openMenuId === v.id && (
                            <div className="filter-pill-dropdown" style={{ textAlign: 'left' }}>
                              {v.status === 'PENDING' && (
                                <>
                                  <button type="button" className="tone-green" onClick={() => handleAction(v.id, 'APPROVE')}>
                                    <FiCheck size={12} style={{ marginRight: 6 }} /> Approve
                                  </button>
                                  <button type="button" className="tone-red" onClick={() => handleAction(v.id, 'REJECT')}>
                                    <FiX size={12} style={{ marginRight: 6 }} /> Reject
                                  </button>
                                </>
                              )}
                              {v.status === 'ACTIVE' && (
                                <button type="button" className="tone-gray" onClick={() => handleAction(v.id, 'SUSPEND')}>
                                  <FiSlash size={12} style={{ marginRight: 6 }} /> Suspend
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalCount > 0 && (
        <Pagination
          page={currentPage}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          totalCount={totalCount}
          itemLabel="vendors"
        />
      )}
    </AdminLayout>
  );
}
