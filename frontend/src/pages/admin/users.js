import { useEffect, useMemo, useState } from 'react';
import {
  FiSearch,
  FiChevronDown,
  FiEye,
  FiShield,
  FiUser,
  FiShoppingBag,
} from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import Pagination from '../../components/admin/Pagination';
import UserDetailModal from '../../components/admin/UserDetailModal';
import { adminAPI } from '../../services/api';

const ROLE_TABS = [
  { key: 'ALL', label: 'All Roles', icon: FiShield },
  { key: 'CUSTOMER', label: 'Customer', icon: FiUser },
  { key: 'VENDOR', label: 'Vendor', icon: FiShoppingBag },
  { key: 'ADMIN', label: 'Admin', icon: FiShield },
];

const ROLE_PILL = {
  ADMIN: { cls: 'vpill-pink', label: 'Admin' },
  VENDOR: { cls: 'vpill-purple', label: 'Vendor' },
  CUSTOMER: { cls: 'vpill-blue', label: 'Customer' },
};

const initialsOf = (first, last) => {
  const a = (first || '')[0] || '';
  const b = (last || '')[0] || '';
  return (a + b || '?').toUpperCase();
};

const fullName = (u) => `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminUsers() {
  const [roleTab, setRoleTab] = useState('ALL');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [viewUser, setViewUser] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = { page: page - 1, size: pageSize };
    if (roleTab !== 'ALL') params.role = roleTab;
    adminAPI
      .getUsers(params)
      .then((res) => {
        setUsers(res.data?.data || []);
        setTotalCount(res.data?.totalElements || 0);
      })
      .catch(() => {
        setUsers([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, [roleTab, page, pageSize]);

  const filtered = useMemo(() => {
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter((u) => {
      const name = fullName(u).toLowerCase();
      return name.includes(q) || (u.email || '').toLowerCase().includes(q) || (u.phoneNumber || '').includes(q);
    });
  }, [users, query]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);

  const changeTab = (key) => {
    setRoleTab(key);
    setQuery('');
    setPage(1);
  };

  const handleChangeRole = async (id, role) => {
    try {
      await adminAPI.updateUserRole(id, role);
      setUsers((list) => list.map((u) => (u.id === id ? { ...u, role } : u)));
      setViewUser((prev) => (prev && prev.id === id ? { ...prev, role } : prev));
    } catch {
      /* handled by interceptor */
    }
  };

  return (
    <AdminLayout>
      <div className="page-heading">
        <div>
          <h1>User Management</h1>
        </div>
      </div>

      <div className="vtab-row">
        {ROLE_TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              className={`vtab ${roleTab === t.key ? 'active' : ''}`}
              onClick={() => changeTab(t.key)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon size={13} /> {t.label}
              </span>
            </button>
          );
        })}
        <div className="vtab-search">
          <FiSearch size={15} />
          <input
            placeholder="Filter in list..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="vcard">
        {loading ? (
          <p style={{ padding: 20, color: 'var(--text-secondary)', textAlign: 'center' }}>Loading users…</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No results found</div>
            <p>Try a different role tab or search term.</p>
          </div>
        ) : roleTab === 'VENDOR' ? (
          <div className="vtable-wrap">
            <table className="vtable">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const pill = ROLE_PILL[u.role] || ROLE_PILL.CUSTOMER;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="vtable-cell-main">
                          <span className="vtable-avatar">{initialsOf(u.firstName, u.lastName)}</span>
                          <div>
                            <div className="vtable-name">{fullName(u)}</div>
                            <div className="vtable-sub">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`vpill vpill-role ${pill.cls}`}>
                          {pill.label} <FiChevronDown size={11} />
                        </span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <button type="button" className="btn-sm" onClick={() => setViewUser(u)}>
                          <FiEye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="vtable-wrap">
            <table className="vtable">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const pill = ROLE_PILL[u.role] || ROLE_PILL.CUSTOMER;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="vtable-cell-main">
                          <span className="vtable-avatar">{initialsOf(u.firstName, u.lastName)}</span>
                          <div>
                            <div className="vtable-name">{fullName(u)}</div>
                            <div className="vtable-sub">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`vpill vpill-role ${pill.cls}`}>
                          {pill.label} <FiChevronDown size={11} />
                        </span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <button type="button" className="btn-sm" onClick={() => setViewUser(u)}>
                          <FiEye size={13} /> View
                        </button>
                      </td>
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
          page={currentPage}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          totalCount={totalCount}
          itemLabel="users"
        />
      )}

      {viewUser && (
        <UserDetailModal
          user={{
            id: viewUser.id,
            uid: `USR-${viewUser.id}`,
            name: fullName(viewUser),
            email: viewUser.email,
            phone: viewUser.phoneNumber || '',
            role: viewUser.role,
            verified: viewUser.emailVerified,
            joined: formatDate(viewUser.createdAt),
          }}
          onClose={() => setViewUser(null)}
          onChangeRole={handleChangeRole}
          onMarkVerified={(id) => {
            setUsers((list) => list.map((u) => (u.id === id ? { ...u, emailVerified: true } : u)));
            setViewUser((prev) => (prev && prev.id === id ? { ...prev, emailVerified: true } : prev));
          }}
          onDelete={() => setViewUser(null)}
        />
      )}
    </AdminLayout>
  );
}
