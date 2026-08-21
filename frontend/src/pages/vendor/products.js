import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiGrid,
  FiList,
  FiSearch,
  FiSliders,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiBox,
} from 'react-icons/fi';
import { vendorAPI, categoryAPI } from '../../services/api';
import { useVendorGuard } from '../../lib/useVendorGuard';
import { formatCurrency, formatNumber } from '../../lib/format';
import VendorLayout from '../../components/vendor/VendorLayout';

const PAGE_SIZE = 8;

// The backend's ProductResponse only carries id/name/slug/price/categoryId/
// vendorId/images — no SKU, stock level, or active/inactive flag. Those
// display-only fields are derived deterministically per product id (same
// approach as src/lib/catalog.js's enrichProduct) so the Inventory Center
// cards can show the stock bars/badges from the design without inventing
// data that changes on every render.
function seededRandom(seed) {
  const x = Math.sin(seed * 999331 + 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function enrichInventory(product) {
  const seed = Number(product.id) || 1;
  const stock = Math.floor(seededRandom(seed) * 400);
  const active = seededRandom(seed + 1) > 0.15;
  const lowStock = stock > 0 && stock <= 20;
  const skuBase = (product.name || 'ITEM')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 4);
  return {
    ...product,
    displayStock: stock,
    displayActive: active,
    displayLowStock: lowStock,
    displaySku: `${skuBase || 'SKU'}-${100 + (seed % 900)}`,
  };
}

function pageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('...');
    out.push(p);
  });
  return out;
}

export default function VendorProducts() {
  const { ready } = useVendorGuard();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', slug: '', categoryId: '', price: '', description: '' });
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState('grid');
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const loadProducts = () =>
    vendorAPI
      .getProducts()
      .then((res) => setProducts(res.data?.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load products'));

  useEffect(() => {
    if (!ready) return;
    loadProducts();
    categoryAPI
      .getCategories()
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => {});
  }, [ready]);

  const enriched = useMemo(() => products.map(enrichInventory), [products]);

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
      setShowForm(false);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed');
    }
  };

  const remove = async (id) => {
    try {
      await vendorAPI.deleteProduct(id);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const activeCount = enriched.filter((p) => p.displayActive).length;
  const lowStockCount = enriched.filter((p) => p.displayLowStock).length;

  const filtered = useMemo(() => {
    return enriched.filter((p) => {
      if (filter === 'ACTIVE' && !p.displayActive) return false;
      if (filter === 'LOW_STOCK' && !p.displayLowStock) return false;
      if (query && !p.name?.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [enriched, filter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageProducts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (!ready) return null;

  return (
    <VendorLayout>
      <div className="vendor-heading">
        <div>
          <h1 className="vendor-title">Inventory Center</h1>
          <p className="vendor-subtitle">
            Manage your active catalog, track stock levels, and quickly list new products across the marketplace.
          </p>
        </div>
        <div className="vendor-heading-actions">
          <button type="button" className="vbtn vbtn-olive" onClick={() => setShowForm((v) => !v)}>
            <FiPlus /> New Product
          </button>
          <div className="vview-toggle">
            <button type="button" className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Grid view">
              <FiGrid size={15} />
            </button>
            <button type="button" className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="List view">
              <FiList size={15} />
            </button>
          </div>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      {showForm && (
        <div className="vcard">
          <div className="vcard-head">
            <h2>Add product</h2>
          </div>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Slug (unique url key, e.g. blue-jeans)</label>
            <input className="form-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
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
          <button className="vbtn vbtn-yellow" onClick={create}>
            Create product
          </button>
        </div>
      )}

      <div className="vfilter-row">
        <div className="vfilter-search">
          <FiSearch size={15} />
          <input
            placeholder="Search by name, SKU, or category..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <button type="button" className="vfilter-search-cta">
          Search
        </button>
        <div className="vtab-row" style={{ gap: 8 }}>
          <button type="button" className={`vtab ${filter === 'ALL' ? 'active' : ''}`} onClick={() => { setFilter('ALL'); setPage(1); }}>
            All Products ({enriched.length})
          </button>
          <button type="button" className={`vtab ${filter === 'ACTIVE' ? 'active' : ''}`} onClick={() => { setFilter('ACTIVE'); setPage(1); }}>
            Active ({activeCount})
          </button>
          <button type="button" className={`vtab ${filter === 'LOW_STOCK' ? 'active' : ''}`} onClick={() => { setFilter('LOW_STOCK'); setPage(1); }}>
            Low Stock {lowStockCount > 0 && <span className="vpill vpill-red" style={{ marginLeft: 4 }}>{lowStockCount}</span>}
          </button>
          <button type="button" className="vbtn vbtn-outline">
            <FiSliders /> More Filters
          </button>
        </div>
      </div>

      {pageProducts.length === 0 ? (
        <div className="empty-state">
          <FiBox size={32} />
          <div className="empty-state-title">No products found</div>
          <p>Try a different filter, or add your first product.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="vproduct-grid">
          <button type="button" className="vproduct-add-card" onClick={() => setShowForm(true)}>
            <span className="vproduct-add-icon">
              <FiPlus size={20} />
            </span>
            <span className="vproduct-add-title">Quick Add Product</span>
            <span className="vproduct-add-copy">Draft a new listing in seconds with our AI-assisted tool.</span>
          </button>

          {pageProducts.map((p) => {
            const category = categories.find((c) => c.id === p.categoryId)?.name || 'Uncategorized';
            const stockPct = Math.min(100, Math.round((p.displayStock / 400) * 100));
            return (
              <div key={p.id} className="vproduct-card">
                <div className="vproduct-media">
                  {p.displayImage || p.images?.[0] ? (
                    <img src={p.images?.[0] || p.displayImage} alt={p.name} />
                  ) : null}
                  <div className="vproduct-badges">
                    <span className={`vpill ${p.displayActive ? 'vpill-green' : 'vpill-gray'}`}>
                      {p.displayActive ? 'Active' : 'Inactive'}
                    </span>
                    {p.displayLowStock && <span className="vpill vpill-red">Low Stock</span>}
                  </div>
                </div>
                <div className="vproduct-body">
                  <div className="vproduct-name-row">
                    <span className="vproduct-name">{p.name}</span>
                    <button type="button" className="vtable-kebab" onClick={() => remove(p.id)} aria-label="Delete product">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  <div className="vproduct-price">{formatCurrency(p.price)}</div>
                  <div className="vproduct-meta">SKU: {p.displaySku} · {category}</div>
                  <div className={`vproduct-stock-row ${p.displayLowStock ? 'warn' : ''}`}>
                    <span>{p.displayLowStock ? 'Restock Soon' : 'Stock Level'}</span>
                    <span>{formatNumber(p.displayStock)} units</span>
                  </div>
                  <div className="vproduct-stock-track">
                    <div
                      className={`vproduct-stock-fill ${p.displayLowStock ? 'warn' : ''}`}
                      style={{ width: `${stockPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="vcard">
          <div className="vtable-wrap">
            <table className="vtable">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageProducts.map((p) => {
                  const category = categories.find((c) => c.id === p.categoryId)?.name || 'Uncategorized';
                  return (
                    <tr key={p.id}>
                      <td className="vtable-name">{p.name}</td>
                      <td>{p.displaySku}</td>
                      <td>{category}</td>
                      <td>{formatCurrency(p.price)}</td>
                      <td>{formatNumber(p.displayStock)}</td>
                      <td>
                        <span className={`vpill ${p.displayActive ? 'vpill-green' : 'vpill-gray'}`}>
                          {p.displayActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="vtable-kebab" onClick={() => remove(p.id)} aria-label="Delete product">
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="vpagination" style={{ justifyContent: 'center' }}>
          <div className="vpagination-controls">
            <button className="vpage-btn" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page">
              <FiChevronLeft size={14} />
            </button>
            {pageList(currentPage, totalPages).map((p, i) =>
              p === '...' ? (
                <span key={`e${i}`} className="vpage-ellipsis">…</span>
              ) : (
                <button key={p} className={`vpage-btn ${p === currentPage ? 'active' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              )
            )}
            <button className="vpage-btn" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} aria-label="Next page">
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </VendorLayout>
  );
}
