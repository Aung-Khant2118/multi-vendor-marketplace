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
  FiX,
  FiEdit2,
} from 'react-icons/fi';
import { vendorAPI, categoryAPI } from '../../services/api';
import { useVendorGuard } from '../../lib/useVendorGuard';
import { uploadImage } from '../../lib/supabase';
import { formatCurrency, formatNumber } from '../../lib/format';
import VendorLayout from '../../components/vendor/VendorLayout';

const PAGE_SIZE = 8;

function enrichInventory(product) {
  const variants = product.variants || [];
  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  const lowStock = totalStock > 0 && totalStock <= 20;
  const skuBase = (product.name || 'ITEM')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 4);
  const imgs = Array.isArray(product.images) ? product.images : (product.images ? [...product.images] : []);
  const image = imgs.length > 0 ? imgs[0] : null;
  const displayLabel = variants.length > 0 && variants[0].variantLabel
    ? variants[0].variantLabel
    : variants.length > 0 && variants[0].sku
      ? variants[0].sku
      : `${skuBase || 'SKU'}-${product.id}`;
  return {
    ...product,
    displayStock: totalStock,
    displayActive: true,
    displayLowStock: lowStock,
    displaySku: displayLabel,
    displayImage: image,
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

const EMPTY_FORM = { name: '', slug: '', categoryId: '', price: '', description: '' };

export default function VendorProducts() {
  const { ready } = useVendorGuard();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [variants, setVariants] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [view, setView] = useState('grid');
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const isEditing = editingProduct !== null;

  const loadProducts = () => {
    setLoading(true);
    setError('');
    vendorAPI
      .getProducts()
      .then((res) => {
        const data = res.data?.data || [];
        setProducts(data);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load products';
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!ready) return;
    loadProducts();
    categoryAPI
      .getCategories()
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => {});
  }, [ready]);

  const enriched = useMemo(() => products.map(enrichInventory), [products]);

  const addVariant = () => {
    setVariants([...variants, { sku: '', price: '', stock: '', attributesText: '', attributes: [] }]);
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'attributesText') {
      updated[index].attributes = value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.includes(':'))
        .map((s) => {
          const idx = s.indexOf(':');
          return { name: s.substring(0, idx).trim(), value: s.substring(idx + 1).trim() };
        });
    }
    setVariants(updated);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const startEdit = async (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      slug: product.slug || '',
      categoryId: product.categoryId || '',
      price: product.price != null ? String(product.price) : '',
      description: product.description || '',
    });
    setVariants([]);
    setExistingImages(product.imageObjects || []);
    setPendingFiles([]);
    setShowForm(true);
    try {
      const res = await vendorAPI.getVariants(product.id);
      const data = res.data?.data || [];
      setVariants(
        data.map((v) => {
          let attributesText = '';
          if (Array.isArray(v.attributes) && v.attributes.length > 0) {
            attributesText = v.attributes.map((a) => `${a.name}:${a.value}`).join(',');
          }
          return {
            id: v.id,
            sku: v.sku || '',
            price: v.price != null ? String(v.price) : '',
            stock: v.stock != null ? String(v.stock) : '',
            attributesText,
            attributes: v.attributes || [],
          };
        })
      );
    } catch {
      // variants will stay empty
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM });
    setVariants([]);
    setExistingImages([]);
    setPendingFiles([]);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM });
    setVariants([]);
    setExistingImages([]);
    setPendingFiles([]);
    setShowForm(true);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setPendingFiles((prev) => [...prev, ...files]);
  };

  const removePendingFile = (index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId) => {
    if (!isEditing) return;
    try {
      await vendorAPI.deleteImage(editingProduct.id, imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success('Image removed');
    } catch {
      toast.error('Failed to remove image');
    }
  };

  const uploadPendingImages = async (productId) => {
    for (const file of pendingFiles) {
      try {
        const url = await uploadImage(file);
        await vendorAPI.saveImageUrl(productId, url);
      } catch (err) {
        toast.error(`Failed to upload "${file.name}": ${err.message}`);
      }
    }
  };

  const submitForm = async () => {
    if (!form.name || !form.slug || !form.categoryId) {
      toast.error('Name, slug and category are required');
      return;
    }
    const hasVariants = variants.length > 0;
    if (hasVariants) {
      const invalid = variants.some((v) => !v.price || v.stock === '' || v.stock === null || v.stock === undefined);
      if (invalid) {
        toast.error('Each variant must have a price and stock');
        return;
      }
    }
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        categoryId: Number(form.categoryId),
        price: form.price ? Number(form.price) : null,
        description: form.description,
      };

      if (isEditing) {
        await vendorAPI.updateProduct(editingProduct.id, payload);
        for (const v of variants) {
          const variantPayload = {
            sku: v.sku || null,
            price: Number(v.price),
            stock: Number(v.stock),
            attributes: v.attributes && v.attributes.length > 0 ? v.attributes : null,
          };
          if (v.id) {
            await vendorAPI.updateVariant(v.id, variantPayload);
          } else {
            await vendorAPI.addVariant(editingProduct.id, variantPayload);
          }
        }
        await uploadPendingImages(editingProduct.id);
        toast.success('Product updated');
      } else {
        if (hasVariants) {
          payload.variants = variants.map((v) => ({
            sku: v.sku || null,
            price: Number(v.price),
            stock: Number(v.stock),
            attributes: v.attributes && v.attributes.length > 0 ? v.attributes : null,
          }));
        }
        const res = await vendorAPI.addProduct(payload);
        const newProductId = res.data?.data?.id;
        if (newProductId && pendingFiles.length > 0) {
          await uploadPendingImages(newProductId);
        }
        toast.success('Product created');
      }

      cancelEdit();
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || (isEditing ? 'Update failed' : 'Create failed'));
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
          <button type="button" className="vbtn vbtn-olive" onClick={openCreateForm}>
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

      {error && (
        <div className="vcard" style={{ borderLeft: '4px solid #e74c3c', marginBottom: 16 }}>
          <p className="form-error" style={{ margin: 0, padding: '12px 16px' }}>
            {error}
          </p>
        </div>
      )}

      {showForm && (
        <div className="vcard">
          <div className="vcard-head">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <h2>{isEditing ? 'Edit product' : 'Add product'}</h2>
              {isEditing && (
                <button type="button" className="vbtn vbtn-outline" style={{ fontSize: 12 }} onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
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

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Variants</span>
              <button
                type="button"
                className="vbtn vbtn-outline"
                style={{ fontSize: 12, padding: '4px 10px' }}
                onClick={addVariant}
              >
                <FiPlus size={12} /> Add Variant
              </button>
            </label>
            {variants.length === 0 && (
              <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>
                No variants added. Customers need at least one variant to place an order.
              </p>
            )}
            {variants.map((v, i) => (
              <div
                key={v.id || i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 2fr auto',
                  gap: 8,
                  alignItems: 'end',
                  marginBottom: 8,
                  padding: '10px 12px',
                  background: '#f9f9f9',
                  borderRadius: 6,
                  border: '1px solid #eee',
                }}
              >
                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>SKU</label>
                  <input
                    className="form-input"
                    placeholder="e.g. RED-L"
                    value={v.sku}
                    onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>Price *</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={v.price}
                    onChange={(e) => updateVariant(i, 'price', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>Stock *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={v.stock}
                    onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>Attributes</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Color:Red,Size:L"
                    value={v.attributesText}
                    onChange={(e) => updateVariant(i, 'attributesText', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="vtable-kebab"
                  onClick={() => removeVariant(i)}
                  aria-label="Remove variant"
                  style={{ color: '#e74c3c' }}
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Product Images</label>
            {isEditing && existingImages.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {existingImages.map((img) => (
                  <div key={img.id} style={{ position: 'relative', width: 80, height: 80 }}>
                    <img
                      src={img.url}
                      alt="Product"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      style={{
                        position: 'absolute', top: -6, right: -6, background: '#e74c3c',
                        color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, lineHeight: 1,
                      }}
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {pendingFiles.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {pendingFiles.map((file, idx) => (
                  <div key={idx} style={{ position: 'relative', width: 80, height: 80 }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Pending"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
                    />
                    <button
                      type="button"
                      onClick={() => removePendingFile(idx)}
                      style={{
                        position: 'absolute', top: -6, right: -6, background: '#e74c3c',
                        color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, lineHeight: 1,
                      }}
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                border: '2px dashed #ccc', borderRadius: 8, cursor: 'pointer',
                color: '#666', fontSize: 13, fontWeight: 500,
              }}
            >
              <FiPlus size={14} />
              Add images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <button className="vbtn vbtn-yellow" onClick={submitForm}>
            {isEditing ? 'Save changes' : 'Create product'}
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

      {loading ? (
        <div className="empty-state">
          <FiBox size={32} />
          <div className="empty-state-title">Loading products...</div>
          <p>Please wait while we fetch your products.</p>
        </div>
      ) : pageProducts.length === 0 ? (
        <div className="empty-state">
          <FiBox size={32} />
          <div className="empty-state-title">No products found</div>
          <p>Try a different filter, or add your first product.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="vproduct-grid">
          <button type="button" className="vproduct-add-card" onClick={openCreateForm}>
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
                    <img
                      src={p.images?.[0] || p.displayImage}
                      alt={p.name}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div
                    style={{
                      display: p.displayImage || p.images?.[0] ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      minHeight: 120,
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-muted)',
                      fontSize: 12,
                    }}
                  >
                    No image
                  </div>
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
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button type="button" className="vtable-kebab" onClick={() => startEdit(p)} aria-label="Edit product">
                        <FiEdit2 size={14} />
                      </button>
                      <button type="button" className="vtable-kebab" onClick={() => remove(p.id)} aria-label="Delete product">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
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
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button type="button" className="vtable-kebab" onClick={() => startEdit(p)} aria-label="Edit product">
                            <FiEdit2 size={14} />
                          </button>
                          <button type="button" className="vtable-kebab" onClick={() => remove(p.id)} aria-label="Delete product">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
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
