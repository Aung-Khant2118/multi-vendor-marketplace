import { useMemo, useState } from 'react';
import { FiPlus, FiMoreVertical, FiCheck, FiX, FiSlash, FiStar, FiShoppingBag } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import Modal from '../../components/admin/Modal';
import Pagination from '../../components/admin/Pagination';
import { VENDORS, VENDOR_STATUS_PILL } from '../../lib/adminDemoData';

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

const EMPTY_FORM = { store: '', owner: '', email: '' };

export default function AdminVendors() {
  const [vendors, setVendors] = useState(VENDORS);
  const [tab, setTab] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const counts = useMemo(() => {
    const c = { ALL: vendors.length, PENDING: 0, ACTIVE: 0, SUSPENDED: 0, REJECTED: 0 };
    vendors.forEach((v) => (c[v.status] = (c[v.status] || 0) + 1));
    return c;
  }, [vendors]);

  const filtered = tab === 'ALL' ? vendors : vendors.filter((v) => v.status === tab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageVendors = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const changeTab = (key) => {
    setTab(key);
    setPage(1);
  };

  const setStatus = (id, status) => {
    setVendors((list) => list.map((v) => (v.id === id ? { ...v, status } : v)));
    setOpenMenuId(null);
  };

  const submitRegister = (e) => {
    e.preventDefault();
    const nextId = Date.now();
    const applied = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    setVendors((list) => [
      { id: nextId, store: form.store, owner: form.owner, status: 'PENDING', rating: null, applied },
      ...list,
    ]);
    setRegisterOpen(false);
    setForm(EMPTY_FORM);
    setTab('PENDING');
    setPage(1);
  };

  return (
    <AdminLayout searchPlaceholder="Search vendors, stores, owners...">
      <div className="page-heading">
        <div>
          <h1>Vendor Management</h1>
        </div>
        <button type="button" className="btn-pill btn-pill-yellow" onClick={() => setRegisterOpen(true)}>
          <FiPlus /> Register Vendor
        </button>
      </div>

      <div className="vtab-row">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={`vtab ${tab === t.key ? 'active' : ''}`} onClick={() => changeTab(t.key)}>
            {t.label} <span className="vtab-count">{counts[t.key] || 0}</span>
          </button>
        ))}
      </div>

      <div className="vcard">
        {pageVendors.length === 0 ? (
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
                {pageVendors.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className="vtable-cell-main">
                        <span className={`aactivity-icon ${STATUS_ICON_TONE[v.status]}`}>
                          <FiShoppingBag size={16} />
                        </span>
                        <div>
                          <div className="vtable-name">{v.store}</div>
                          <div className="vtable-sub">{v.owner}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`vpill ${VENDOR_STATUS_PILL[v.status]}`}>{v.status}</span>
                    </td>
                    <td>
                      {v.rating ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                          <FiStar size={12} style={{ color: '#f3c318' }} /> {v.rating}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>{v.applied}</td>
                    <td style={{ textAlign: 'center' }}>
                      {v.status === 'SUSPENDED' || v.status === 'REJECTED' ? (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      ) : (
                        <div className="filter-pill-menu" style={{ display: 'inline-block' }}>
                          <button
                            type="button"
                            className="vtable-kebab"
                            onClick={() => setOpenMenuId(openMenuId === v.id ? null : v.id)}
                            aria-label="Vendor actions"
                          >
                            <FiMoreVertical size={16} />
                          </button>
                          {openMenuId === v.id && (
                            <div className="filter-pill-dropdown" style={{ textAlign: 'left' }}>
                              {v.status === 'PENDING' && (
                                <>
                                  <button type="button" className="tone-green" onClick={() => setStatus(v.id, 'ACTIVE')}>
                                    <FiCheck size={12} style={{ marginRight: 6 }} /> Approve
                                  </button>
                                  <button type="button" className="tone-red" onClick={() => setStatus(v.id, 'REJECTED')}>
                                    <FiX size={12} style={{ marginRight: 6 }} /> Reject
                                  </button>
                                </>
                              )}
                              {v.status === 'ACTIVE' && (
                                <button type="button" className="tone-gray" onClick={() => setStatus(v.id, 'SUSPENDED')}>
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
          itemLabel="vendors"
        />
      )}

      {registerOpen && (
        <Modal title="Register Vendor" onClose={() => setRegisterOpen(false)}>
          <form onSubmit={submitRegister}>
            <div className="form-group">
              <label className="form-label">Store Name</label>
              <input
                className="form-input"
                required
                value={form.store}
                onChange={(e) => setForm({ ...form, store: e.target.value })}
                placeholder="Juniper Market"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Owner Name</label>
              <input
                className="form-input"
                required
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                placeholder="Sarah Smith"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="owner@store.com"
              />
            </div>
            <div className="amodal-actions">
              <button type="button" className="btn-sm" onClick={() => setRegisterOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-pill btn-pill-yellow">
                Submit for Review
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
}
