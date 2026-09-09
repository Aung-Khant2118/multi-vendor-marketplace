import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { customerAPI, categoryAPI } from '../../services/api';
import { useQuickAddToCart } from '../../lib/useQuickAddToCart';
import AppLayout from '../../components/layout/AppLayout';
import ProductCard from '../../components/marketplace/ProductCard';

const SORTS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Name A-Z', value: 'name' },
];

export default function Products() {
  const router = useRouter();
  const { q, category, vendor, sort: sortParam, page: pageParam, inStock: inStockParam, priceMin: priceMinParam, priceMax: priceMaxParam } = router.query;
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [sort, setSort] = useState(sortParam || 'newest');
  const [currentPage, setCurrentPage] = useState(Number(pageParam) || 0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const { addToCart, loadingId } = useQuickAddToCart();

  const fetchProducts = useCallback(() => {
    const params = {
      q: q || undefined,
      category: category || undefined,
      vendor: vendor || undefined,
      priceMin: priceMin || undefined,
      priceMax: priceMax || undefined,
      inStock: inStockOnly || undefined,
      sort: sort || undefined,
      page: currentPage,
      size: 20,
    };
    customerAPI
      .getProducts(params)
      .then((res) => {
        setProducts(res.data?.data || []);
        setTotalPages(res.data?.totalPages || 0);
        setTotalElements(res.data?.totalElements || 0);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please try again later.');
        setProducts([]);
      });
  }, [q, category, vendor, priceMin, priceMax, inStockOnly, sort, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    categoryAPI
      .getCategories()
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (sortParam) setSort(sortParam);
    if (pageParam) setCurrentPage(Number(pageParam));
    if (inStockParam !== undefined) setInStockOnly(inStockParam === 'true');
    if (priceMinParam !== undefined) setPriceMin(priceMinParam);
    if (priceMaxParam !== undefined) setPriceMax(priceMaxParam);
  }, [sortParam, pageParam, inStockParam, priceMinParam, priceMaxParam]);

  useEffect(() => {
    setCurrentPage(0);
  }, [q, category, vendor, priceMin, priceMax, inStockOnly, sort]);

  const handleFilterChange = (updates) => {
    const params = new URLSearchParams(router.asPath.split('?')[1] || '');
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') params.delete(k);
      else params.set(k, v);
    });
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    handleFilterChange({
      priceMin: priceMin || undefined,
      priceMax: priceMax || undefined,
    });
  };

  const activeCategoryName = categories.find((c) => String(c.id) === String(category))?.name;
  const loading = products === null;

  return (
    <AppLayout>
      <div className="page-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="filter-pill"
            style={{ padding: '4px 10px', fontSize: 12 }}
          >
            ← Back
          </button>
          <div>
            <h1>{vendor ? 'Store Products' : activeCategoryName ? activeCategoryName : 'All Marketplace Items'}</h1>
            <p>
              {q ? `Results for "${q}" — ` : ''}
              {totalElements} product{totalElements === 1 ? '' : 's'} available
            </p>
          </div>
        </div>

        <div className="filter-pills" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div className="filter-pill-menu">
            <button type="button" className="filter-pill" onClick={() => setCatMenuOpen((v) => !v)}>
              {activeCategoryName || 'Category'} ▾
            </button>
            {catMenuOpen && (
              <div className="filter-pill-dropdown" onMouseLeave={() => setCatMenuOpen(false)}>
                <button
                  type="button"
                  className={!category ? 'active' : ''}
                  onClick={() => { handleFilterChange({ category: undefined }); setCatMenuOpen(false); }}
                >
                  All categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={String(category) === String(c.id) ? 'active' : ''}
                    onClick={() => { handleFilterChange({ category: c.id }); setCatMenuOpen(false); }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {SORTS.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`filter-pill ${sort === s.value ? 'active' : ''}`}
              onClick={() => handleFilterChange({ sort: s.value })}
            >
              {s.label}
            </button>
          ))}

          <button
            type="button"
            className={`filter-pill ${inStockOnly ? 'active' : ''}`}
            onClick={() => { setInStockOnly(!inStockOnly); handleFilterChange({ inStock: !inStockOnly ? 'true' : undefined }); }}
          >
            In Stock Only
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              className="form-input"
              type="number"
              placeholder="Min price"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              onBlur={applyPriceFilter}
              onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
              style={{ width: 100, fontSize: 13, padding: '4px 8px' }}
            />
            <span style={{ color: '#888' }}>—</span>
            <input
              className="form-input"
              type="number"
              placeholder="Max price"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              onBlur={applyPriceFilter}
              onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
              style={{ width: 100, fontSize: 13, padding: '4px 8px' }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', marginBottom: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#991b1b' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading products…</p>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No products found</div>
          <p>Try a different search term, category, or filter.</p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                variant="category"
                onAddToCart={addToCart}
                addToCartLoading={loadingId === p.id}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="vpagination" style={{ justifyContent: 'center', marginTop: 24 }}>
              <div className="vpagination-controls">
                <button
                  className="vpage-btn"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  ← Prev
                </button>
                <span style={{ padding: '0 12px', fontSize: 13, color: '#666' }}>
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  className="vpage-btn"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
