import { useEffect, useMemo, useState } from 'react';
import { customerAPI, categoryAPI } from '../services/api';
import { FALLBACK_PRODUCTS, DEFAULT_CATEGORIES } from '../lib/catalog';
import AppLayout from '../components/layout/AppLayout';
import PromoBanner from '../components/marketplace/PromoBanner';
import SectionPanel from '../components/marketplace/SectionPanel';
import CategoryChip from '../components/marketplace/CategoryChip';
import ProductCard from '../components/marketplace/ProductCard';

const SORTS = ['Category', 'Price', 'Rating', 'Newest'];

export default function Home() {
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [activeSort, setActiveSort] = useState('Price');

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

  const catalog = useMemo(() => {
    const list = products && products.length > 0 ? products : FALLBACK_PRODUCTS;
    return list;
  }, [products]);

  const sorted = useMemo(() => {
    const list = [...catalog];
    if (activeSort === 'Price') list.sort((a, b) => Number(a.price) - Number(b.price));
    if (activeSort === 'Newest') list.reverse();
    return list;
  }, [catalog, activeSort]);

  const loading = products === null;

  return (
    <AppLayout>
      <PromoBanner />

      <SectionPanel
        title="Recommended for you"
        subtitle="Featured items from marketplace vendors"
        linkHref="/recommended"
        linkLabel="Browse more"
      >
        <div className="product-grid">
          {!loading &&
            catalog.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} variant="recommended" />)}
        </div>
      </SectionPanel>

      <SectionPanel
        title="Shop by category"
        subtitle=""
        linkHref="/categories"
        linkLabel="View all categories"
      >
        <div className="category-grid">
          {categories.slice(0, 6).map((c) => (
            <CategoryChip key={c.id} category={c} />
          ))}
        </div>
      </SectionPanel>

      <SectionPanel title="All marketplace items" subtitle={`${catalog.length} products available`}>
        <div className="filter-pills" style={{ marginBottom: 18 }}>
          {SORTS.map((s) => (
            <button
              key={s}
              type="button"
              className={`filter-pill ${activeSort === s ? 'active' : ''}`}
              onClick={() => setActiveSort(s)}
            >
              {s} ▾
            </button>
          ))}
        </div>
        {loading ? (
          <p>Loading products…</p>
        ) : (
          <div className="product-grid">
            {sorted.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        {!loading && sorted.length === 0 && <p>No products yet.</p>}
      </SectionPanel>
    </AppLayout>
  );
}
