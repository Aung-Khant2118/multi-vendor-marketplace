import { useMemo, useState } from 'react';
import {
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiShield,
  FiUser,
  FiShoppingBag,
} from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import Modal from '../../components/admin/Modal';
import Pagination from '../../components/admin/Pagination';
import UserDetailModal from '../../components/admin/UserDetailModal';
import { formatCurrency } from '../../lib/format';
import { USERS, CUSTOMERS, VENDOR_USERS, ROLE_PILL } from '../../lib/adminDemoData';

const ROLE_TABS = [
  { key: 'ALL', label: 'All Roles', icon: FiShield },
  { key: 'CUSTOMER', label: 'Customer', icon: FiUser },
  { key: 'VENDOR', label: 'Vendor', icon: FiShoppingBag },
  { key: 'ADMIN', label: 'Admin', icon: FiShield },
];

const ADD_LABEL = {
  ALL: 'Add New User',
  ADMIN: 'Add New User',
  CUSTOMER: 'Add Customer',
  VENDOR: 'Onboard Vendor',
};

const initialsOf = (name) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const EMPTY_FORM = { name: '', email: '', phone: '', role: 'CUSTOMER' };

function toDetailUser(source, row) {
  if (source === 'CUSTOMER') {
    return {
      id: row.id,
      uid: row.uid,
      name: row.name,
      email: row.email,
      phone: row.phone,
      joined: row.joined,
      role: 'CUSTOMER',
      verified: row.status === 'Verified',
    };
  }
  if (source === 'VENDOR') {
    return {
      id: row.id,
      uid: row.uid,
      name: row.owner,
      email: row.email,
      phone: row.phone,
      joined: row.joined,
      role: 'VENDOR',
      verified: row.kyc === 'Verified',
    };
  }
  return { ...row };
}

export default function AdminUsers() {
  const [roleTab, setRoleTab] = useState('ALL');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [users, setUsers] = useState(USERS);
  const [customers, setCustomers] = useState(CUSTOMERS);
  const [vendorUsers, setVendorUsers] = useState(VENDOR_USERS);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [viewCtx, setViewCtx] = useState(null);

  const changeTab = (key) => {
    setRoleTab(key);
    setQuery('');
    setPage(1);
    setPageSize(10);
  };

  const changePageSize = (size) => {
    setPageSize(size);
    setPage(1);
  };

  const filteredAll = useMemo(() => {
    const source = roleTab === 'ADMIN' ? users.filter((u) => u.role === 'ADMIN') : users;
    if (!query) return source;
    const q = query.toLowerCase();
    return source.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q)
    );
  }, [users, roleTab, query]);

  const filteredCustomers = useMemo(() => {
    if (!query) return customers;
    const q = query.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customers, query]);

  const filteredVendors = useMemo(() => {
    if (!query) return vendorUsers;
    const q = query.toLowerCase();
    return vendorUsers.filter(
      (v) =>
        v.store.toLowerCase().includes(q) || v.owner.toLowerCase().includes(q) || v.email.toLowerCase().includes(q)
    );
  }, [vendorUsers, query]);

  const activeList = roleTab === 'CUSTOMER' ? filteredCustomers : roleTab === 'VENDOR' ? filteredVendors : filteredAll;
  const totalCount = activeList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = activeList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openView = (source, row) => setViewCtx({ source, row });
  const detailUser = viewCtx ? toDetailUser(viewCtx.source, viewCtx.row) : null;

  const handleChangeRole = (id, role) => {
    if (!viewCtx) return;
    if (viewCtx.source === 'ALL') setUsers((list) => list.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  const handleMarkVerified = (id) => {
    if (!viewCtx) return;
    if (viewCtx.source === 'ALL') setUsers((list) => list.map((u) => (u.id === id ? { ...u, verified: true } : u)));
    if (viewCtx.source === 'CUSTOMER')
      setCustomers((list) => list.map((c) => (c.id === id ? { ...c, status: 'Verified' } : c)));
    if (viewCtx.source === 'VENDOR')
      setVendorUsers((list) => list.map((v) => (v.id === id ? { ...v, kyc: 'Verified' } : v)));
  };

  const handleDeleteUser = (id) => {
    if (!viewCtx) return;
    if (viewCtx.source === 'ALL') setUsers((list) => list.filter((u) => u.id !== id));
    if (viewCtx.source === 'CUSTOMER') setCustomers((list) => list.filter((c) => c.id !== id));
    if (viewCtx.source === 'VENDOR') setVendorUsers((list) => list.filter((v) => v.id !== id));
  };

  const submitAdd = (e) => {
    e.preventDefault();
    const nextId = Date.now();
    const uid = `USR-${Math.floor(80000 + Math.random() * 9000)}`;
    const joined = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    if (roleTab === 'CUSTOMER') {
      setCustomers((list) => [
        { id: nextId, uid, name: form.name, email: form.email, phone: form.phone, orders: 0, spent: 0, status: 'Inactive', joined },
        ...list,
      ]);
    } else if (roleTab === 'VENDOR') {
      setVendorUsers((list) => [
        { id: nextId, uid, store: form.name, owner: form.name, email: form.email, phone: form.phone, products: 0, sales: 0, kyc: 'Pending', joined },
        ...list,
      ]);
    } else {
      setUsers((list) => [
        { id: nextId, uid, name: form.name, email: form.email, phone: form.phone, role: form.role, verified: false, joined },
        ...list,
      ]);
    }

    setAddOpen(false);
    setForm(EMPTY_FORM);
    setPage(1);
  };

  return (
    <AdminLayout
      searchPlaceholder={
        roleTab === 'CUSTOMER'
          ? 'Search customers by name, email, phone...'
          : roleTab === 'VENDOR'
          ? 'Search vendors by store name, email...'
          : 'Search users by name, email, phone...'
      }
    >
      <div className="page-heading">
        <div>
          <h1>User Management</h1>
        </div>
        <button type="button" className="btn-pill btn-pill-yellow" onClick={() => setAddOpen(true)}>
          <FiPlus /> {ADD_LABEL[roleTab]}
        </button>
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
        {pageItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No results found</div>
            <p>Try a different role tab or search term.</p>
          </div>
        ) : roleTab === 'CUSTOMER' ? (
          <div className="vtable-wrap">
            <table className="vtable">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Total Orders</th>
                  <th>Total Spent</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="vtable-cell-main">
                        <span className="vtable-avatar">{initialsOf(c.name)}</span>
                        <div>
                          <div className="vtable-name">{c.name}</div>
                          <div className="vtable-sub">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{c.phone}</td>
                    <td>{c.orders} Orders</td>
                    <td>{formatCurrency(c.spent)}</td>
                    <td>
                      {c.status === 'Verified' ? (
                        <span className="vpill vpill-green">
                          <FiCheckCircle size={11} /> Verified
                        </span>
                      ) : (
                        <span className="vpill vpill-red">
                          <FiXCircle size={11} /> Inactive
                        </span>
                      )}
                    </td>
                    <td>{c.joined}</td>
                    <td>
                      <button type="button" className="btn-sm" onClick={() => openView('CUSTOMER', c)}>
                        <FiEye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : roleTab === 'VENDOR' ? (
          <div className="vtable-wrap">
            <table className="vtable">
              <thead>
                <tr>
                  <th>Store & Owner</th>
                  <th>Phone</th>
                  <th>Products</th>
                  <th>Total Sales</th>
                  <th>KYC Status</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className="vtable-cell-main">
                        <span className="vtable-avatar">{initialsOf(v.owner)}</span>
                        <div>
                          <div className="vtable-name">{v.store}</div>
                          <div className="vtable-sub">
                            {v.owner} · {v.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{v.phone}</td>
                    <td>{v.products} Items</td>
                    <td>{formatCurrency(v.sales)}</td>
                    <td>
                      {v.kyc === 'Verified' ? (
                        <span className="vpill vpill-green">
                          <FiCheckCircle size={11} /> Verified
                        </span>
                      ) : (
                        <span className="vpill vpill-yellow">Pending KYC</span>
                      )}
                    </td>
                    <td>{v.joined}</td>
                    <td>
                      <button type="button" className="btn-sm" onClick={() => openView('VENDOR', v)}>
                        {v.kyc === 'Verified' ? (
                          <>
                            <FiEye size={13} /> View Store
                          </>
                        ) : (
                          'Review'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="vtable-wrap">
            <table className="vtable">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((u) => {
                  const pill = ROLE_PILL[u.role];
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="vtable-cell-main">
                          <span className="vtable-avatar">{initialsOf(u.name)}</span>
                          <div>
                            <div className="vtable-name">{u.name}</div>
                            <div className="vtable-sub">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{u.phone}</td>
                      <td>
                        <span className={`vpill vpill-role ${pill.cls}`}>
                          {pill.label} <FiChevronDown size={11} />
                        </span>
                      </td>
                      <td>
                        {u.verified ? (
                          <span className="vpill vpill-green">
                            <FiCheckCircle size={11} /> Verified
                          </span>
                        ) : (
                          <span className="vpill vpill-gray">
                            <FiXCircle size={11} /> Unverified
                          </span>
                        )}
                      </td>
                      <td>{u.joined}</td>
                      <td>
                        <button type="button" className="btn-sm" onClick={() => openView('ALL', u)}>
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
          onPageSizeChange={changePageSize}
          totalCount={totalCount}
          itemLabel={roleTab === 'CUSTOMER' ? 'customers' : roleTab === 'VENDOR' ? 'vendors' : 'users'}
        />
      )}

      {addOpen && (
        <Modal title={ADD_LABEL[roleTab]} onClose={() => setAddOpen(false)}>
          <form onSubmit={submitAdd}>
            <div className="form-group">
              <label className="form-label">{roleTab === 'VENDOR' ? 'Store / Owner Name' : 'Full Name'}</label>
              <input
                className="form-input"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={roleTab === 'VENDOR' ? 'Juniper Market' : 'Jane Doe'}
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
                placeholder="jane.doe@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            {roleTab === 'ALL' && (
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-input"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="VENDOR">Vendor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            )}
            <div className="amodal-actions">
              <button type="button" className="btn-sm" onClick={() => setAddOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-pill btn-pill-yellow">
                {roleTab === 'VENDOR' ? 'Send Invite' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {detailUser && (
        <UserDetailModal
          user={detailUser}
          onClose={() => setViewCtx(null)}
          onChangeRole={handleChangeRole}
          onMarkVerified={handleMarkVerified}
          onDelete={handleDeleteUser}
        />
      )}
    </AdminLayout>
  );
}
