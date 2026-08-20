import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { customerAPI, categoryAPI } from '../../services/api';
import { FALLBACK_PRODUCTS, DEFAULT_CATEGORIES } from '../../lib/catalog';
import { useQuickAddToCart } from '../../lib/useQuickAddToCart';
import AppLayout from '../../components/layout/AppLayout';
import ProductCard from '../../components/marketplace/ProductCard';

const SORTS = ['Price: Low to High', 'Price: High to Low', 'Newest'];

export default function Products() {
  const router = useRouter();
  const { q, category } = router.query;
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [sort, setSort] = useState(SORTS[0]);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const { addToCart, loadingId } = useQuickAddToCart();

  useEffect(() => {
    customerAPI
      .getProducts()
      .then((res) => setProducts(res.data?.data || []))
      .catch(() => setProducts([]));

    categoryAPI
      .getCategories()
      .then((res) => {
        const data = res.data?.data || [];
        if (data.length > 0) setCategories(data);
      })
      .catch(() => {});
  }, []);

  const catalog = useMemo(
    () => (products && products.length > 0 ? products : FALLBACK_PRODUCTS),
    [products]
  );

  const filtered = useMemo(() => {
    let list = [...catalog];
    if (category) list = list.filter((p) => String(p.categoryId) === String(category));
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(needle) || p.description?.toLowerCase().includes(needle)
      );
    }
    if (sort === 'Price: Low to High') list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'Price: High to Low') list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === 'Newest') list.reverse();
    return list;
  }, [catalog, category, q, sort]);

  const activeCategoryName = categories.find((c) => String(c.id) === String(category))?.name;
  const loading = products === null;

  return (
    <AppLayout>
      <div className="page-heading">
        <div>
          <h1>{activeCategoryName ? activeCategoryName : 'All Marketplace Items'}</h1>
          <p>
            {q ? `Results for "${q}" — ` : ''}
            {filtered.length} product{filtered.length === 1 ? '' : 's'} available
          </p>
        </div>

        <div className="filter-pills">
          <div className="filter-pill-menu">
            <button type="button" className="filter-pill" onClick={() => setCatMenuOpen((v) => !v)}>
              {activeCategoryName || 'Category'} ▾
            </button>
            {catMenuOpen && (
              <div className="filter-pill-dropdown" onMouseLeave={() => setCatMenuOpen(false)}>
                <button
                  type="button"
                  className={!category ? 'active' : ''}
                  onClick={() => {
                    router.push('/products');
                    setCatMenuOpen(false);
                  }}
                >
                  All categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={String(category) === String(c.id) ? 'active' : ''}
                    onClick={() => {
                      router.push(`/products?category=${c.id}`);
                      setCatMenuOpen(false);
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {SORTS.map((s) => (
            <button
              key={s}
              type="button"
              className={`filter-pill ${sort === s ? 'active' : ''}`}
              onClick={() => setSort(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p>Loading products…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No products found</div>
          <p>Try a different search term or category.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              variant="category"
              onAddToCart={addToCart}
              addToCartLoading={loadingId === p.id}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
