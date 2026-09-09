import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiGrid, FiCheckCircle } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import Modal from '../../components/admin/Modal';
import Pagination from '../../components/admin/Pagination';
import { adminAPI } from '../../services/api';

const EMPTY_FORM = { name: '', slug: '', description: '', active: true };

const slugify = (s) =>
  '/' +
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminAPI
      .getCategories()
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(categories.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageCategories = categories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeCount = categories.filter((c) => c.active).length;

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', active: cat.active });
    setModalOpen(true);
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete '${cat.name}'? This action cannot be undone.`)) return;
    try {
      await adminAPI.deleteCategory(cat.id);
      setCategories((list) => list.filter((c) => c.id !== cat.id));
      toast.success('Category deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await adminAPI.updateCategory(editingId, form);
        const updated = res.data?.data;
        setCategories((list) => list.map((c) => (c.id === editingId ? { ...c, ...updated } : c)));
        toast.success('Category updated');
      } else {
        const payload = { ...form, slug: form.slug || slugify(form.name) };
        const res = await adminAPI.createCategory(payload);
        const created = res.data?.data;
        if (created) setCategories((list) => [created, ...list]);
        toast.success('Category created');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
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
          <div className="astat-value">{categories.length} Categories</div>
          <div className="astat-label">Total Categories</div>
        </div>
        <div className="astat-card">
          <div className="astat-icon">
            <FiCheckCircle size={18} />
          </div>
          <div className="astat-value">{activeCount} Active</div>
          <div className="astat-label">Active on Storefront</div>
        </div>
        <div className="astat-card">
          <div className="astat-icon">
            <FiGrid size={18} />
          </div>
          <div className="astat-value">{categories.length - activeCount} Inactive</div>
          <div className="astat-label">Inactive / Draft</div>
        </div>
      </div>

      <div className="vcard">
        {loading ? (
          <p style={{ padding: 20, color: 'var(--text-secondary)', textAlign: 'center' }}>Loading categories…</p>
        ) : pageCategories.length === 0 ? (
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
                  <th>Status</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageCategories.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="vtable-cell-main">
                        <span className="acat-icon tone-cyan">
                          <FiGrid size={16} />
                        </span>
                        <div>
                          <div className="vtable-name">{c.name}</div>
                          <div className="vtable-sub">{c.description || 'No description'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11.5 }}>{c.slug}</td>
                    <td>
                      <span className={`vpill ${c.active ? 'vpill-green' : 'vpill-gray'}`}>
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{formatDate(c.createdAt)}</td>
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
                ))}
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
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="e.g. /kitchenware"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Cookware, Utensils, Dining"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.active} onChange={(e) => setForm({ ...form, active: e.target.value === 'true' })}>
                <option value="true">Active (Visible on Storefront)</option>
                <option value="false">Inactive / Draft</option>
              </select>
            </div>
            <div className="amodal-actions">
              <button type="button" className="btn-sm" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-pill btn-pill-yellow" disabled={saving}>
                {saving ? 'Saving…' : 'Save Category'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
}
