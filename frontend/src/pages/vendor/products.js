import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { vendorAPI, categoryAPI } from '../../services/api';
import { useAuth } from '../../features/auth/AuthContext';

export default function VendorProducts() {
  const { isAuthenticated, isVendor } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', slug: '', categoryId: '', price: '', description: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    if (!isVendor) {
      router.replace('/dashboard');
      return;
    }
    vendorAPI
      .getProducts()
      .then((res) => setProducts(res.data?.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load products'));
    categoryAPI
      .getCategories()
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => {});
  }, [isAuthenticated, isVendor]);

  const create = async () => {
    if (!form.name || !form.slug || !form.categoryId) {
      toast.error('Name, slug and category are required');
      return;
    }
    try {
      await vendorAPI.addProduct({
        name: form.name,
        slug: form.slug,
        categoryId: Number(form.categoryId),
        price: form.price ? Number(form.price) : null,
        description: form.description,
      });
      toast.success('Product created');
      setForm({ name: '', slug: '', categoryId: '', price: '', description: '' });
      const res = await vendorAPI.getProducts();
      setProducts(res.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed');
    }
  };

  const remove = async (id) => {
    try {
      await vendorAPI.deleteProduct(id);
      toast.success('Product deleted');
      const res = await vendorAPI.getProducts();
      setProducts(res.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (!isAuthenticated || !isVendor) return null;

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '700px' }}>
        <h1 className="auth-title">My Products</h1>
        <p className="auth-link">
          <Link href="/dashboard">Back to dashboard</Link>
        </p>
        {error && <p className="form-error">{error}</p>}

        <div className="dashboard-section">
          <h2 className="dashboard-subtitle">Add product</h2>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Slug (unique url key, e.g. blue-jeans)</label>
            <input
              className="form-input"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-input"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Price</label>
            <input
              className="form-input"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button className="btn-primary" onClick={create}>
            Create product
          </button>
        </div>

        <div className="dashboard-section">
          <h2 className="dashboard-subtitle">Existing products</h2>
          {products.length === 0 && <p>No products yet.</p>}
          {products.map((p) => (
            <div key={p.id} className="info-row">
              <strong>{p.name}</strong> — ${p.price}{' '}
              <button className="btn-outline" onClick={() => remove(p.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - OUTSIDE the card */}
      <div className="auth-footer">
        <p className="brand">ZayLink</p>
        <p className="copyright">© 2026 ZayLink. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </div>
  );
}