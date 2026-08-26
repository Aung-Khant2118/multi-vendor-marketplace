import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiGrid, FiBox, FiCheckCircle, FiHome, FiShoppingBag, FiCpu, FiDroplet, FiCoffee } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import Modal from '../../components/admin/Modal';
import Pagination from '../../components/admin/Pagination';
import { CATEGORIES, CATEGORY_STATS } from '../../lib/adminDemoData';

const ICONS = { home: FiHome, fashion: FiShoppingBag, tech: FiCpu, beauty: FiDroplet, kitchen: FiCoffee };

const EMPTY_FORM = { name: '', slug: '', desc: '', status: 'Active' };

const slugify = (s) =>
  '/' +
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function AdminCategories() {
  const [categories, setCategories] = useState(CATEGORIES);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const totalPages = Math.max(1, Math.ceil(categories.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageCategories = categories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, desc: cat.desc, status: cat.status });
    setModalOpen(true);
  };

  const handleDelete = (cat) => {
    if (window.confirm(`Are you sure you want to delete '${cat.name}' category? This action cannot be undone.`)) {
      setCategories((list) => list.filter((c) => c.id !== cat.id));
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (editingId) {
      setCategories((list) =>
        list.map((c) => (c.id === editingId ? { ...c, name: form.name, slug: form.slug, desc: form.desc, status: form.status } : c))
      );
    } else {
      const created = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      setCategories((list) => [
        { id: Date.now(), name: form.name, slug: form.slug || slugify(form.name), desc: form.desc, icon: 'home', tone: 'cyan', products: 0, status: form.status, created },
        ...list,
      ]);
    }
    setModalOpen(false);
  };

  return (
    <AdminLayout searchPlaceholder="Search categories, subcategories, tags...">
      <div className="page-heading">
        <div>
          <h1>Category Management</h1>
        </div>
        <button type="button" className="btn-pill btn-pill-yellow" onClick={openAdd}>
          <FiPlus /> Add New Category
        </button>
      </div>

      <div className="astat-grid">
        <div className="astat-card">
          <div className="astat-icon">
            <FiGrid size={18} />
          </div>
          <div className="astat-value">{CATEGORY_STATS.totalCategories} Categories</div>
          <div className="astat-label">Total Categories</div>
        </div>
        <div className="astat-card">
          <div className="astat-icon">
            <FiBox size={18} />
          </div>
          <div className="astat-value">{CATEGORY_STATS.totalProducts.toLocaleString('en-US')} Items</div>
          <div className="astat-label">Total Products Listed</div>
        </div>
        <div className="astat-card">
          <div className="astat-icon">
            <FiCheckCircle size={18} />
          </div>
          <div className="astat-value">{CATEGORY_STATS.activeCount} Active</div>
          <div className="astat-label">Active on Storefront</div>
        </div>
      </div>

      <div className="vcard">
        {pageCategories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No categories yet</div>
            <p>Create your first category to organize the storefront.</p>
          </div>
        ) : (
          <div className="vtable-wrap">
            <table className="vtable">
              <thead>
                <tr>
                  <th>Category Info</th>
                  <th>Slug</th>
                  <th>Products Count</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageCategories.map((c) => {
                  const Icon = ICONS[c.icon] || FiGrid;
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="vtable-cell-main">
                          <span className={`acat-icon tone-${c.tone}`}>
                            <Icon size={16} />
                          </span>
                          <div>
                            <div className="vtable-name">{c.name}</div>
                            <div className="vtable-sub">{c.desc}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 11.5 }}>{c.slug}</td>
                      <td style={{ fontWeight: 700 }}>{c.products.toLocaleString('en-US')} products</td>
                      <td>
                        <span className={`vpill ${c.status === 'Active' ? 'vpill-green' : 'vpill-gray'}`}>{c.status}</span>
                      </td>
                      <td>{c.created}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button type="button" className="btn-sm" onClick={() => openEdit(c)} aria-label="Edit category">
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn-sm btn-sm-danger"
                            onClick={() => handleDelete(c)}
                            aria-label="Delete category"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {categories.length > 0 && (
        <Pagination
          page={currentPage}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          totalCount={categories.length}
          itemLabel="categories"
        />
      )}

      {modalOpen && (
        <Modal title={editingId ? `Edit Category: ${form.name}` : 'Add New Category'} onClose={() => setModalOpen(false)}>
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input
                className="form-input"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Kitchenware"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category URL Slug</label>
              <input
                className="form-input"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="e.g. /kitchenware"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subcategories / Description</label>
              <textarea
                className="form-input"
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                placeholder="e.g. Cookware, Utensils, Dining"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="Active">Active (Visible on Storefront)</option>
                <option value="Inactive">Inactive / Draft</option>
              </select>
            </div>
            <div className="amodal-actions">
              <button type="button" className="btn-sm" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-pill btn-pill-yellow">
                Save Category
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
}
