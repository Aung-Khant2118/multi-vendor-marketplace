import { useEffect, useMemo, useState } from 'react';
import { customerAPI, categoryAPI } from '../services/api';
import AppLayout from '../components/layout/AppLayout';

import SectionPanel from '../components/marketplace/SectionPanel';
import CategoryChip from '../components/marketplace/CategoryChip';
import ProductCard from '../components/marketplace/ProductCard';

const SORTS = [
  { key: 'all', label: 'All' },
  { key: 'price_asc', label: 'Price: Low → High' },
  { key: 'price_desc', label: 'Price: High → Low' },
  { key: 'newest', label: 'Newest' },
  { key: 'rating', label: 'Top Rated' },
];

export default function Home() {
  const [products, setProducts] = useState(null);
  const [recommended, setRecommended] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeSort, setActiveSort] = useState('all');

  useEffect(() => {
    customerAPI
      .getProducts({ size: 100 })
      .then((res) => setProducts(res.data?.data || []))
      .catch((err) => { console.error('Failed to load products:', err); setProducts([]); });

    customerAPI
      .getRecommendations({ tab: 'for_you', limit: 4 })
      .then((res) => setRecommended(res.data?.data || []))
      .catch(() => setRecommended([]));

    categoryAPI
      .getCategories()
      .then((res) => {
        const data = res.data?.data || [];
        setCategories(data);
      })
      .catch(() => setCategories([]));
  }, []);

  const catalog = useMemo(() => products || [], [products]);

  const sorted = useMemo(() => {
    const list = [...catalog];
    switch (activeSort) {
      case 'price_asc':
        return list.sort((a, b) => Number(a.price) - Number(b.price));
      case 'price_desc':
        return list.sort((a, b) => Number(b.price) - Number(a.price));
      case 'newest':
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'rating':
        return list.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      default:
        return list;
    }
  }, [catalog, activeSort]);

  const loading = products === null;
  const recLoading = recommended === null;

  return (
    <AppLayout>
      <SectionPanel
        title="Recommended for you"
        subtitle="Personalized picks based on your activity"
        linkHref="/recommended"
        linkLabel="Browse more"
      >
        <div className="product-grid">
          {!recLoading &&
            recommended.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} variant="recommended" />)}
        </div>
      </SectionPanel>

      <SectionPanel
        title="Shop by category"
        subtitle=""
        linkHref="/categories"
        linkLabel="View all categories"
      >
        <div className="category-grid">
          {categories.map((c) => (
            <CategoryChip key={c.id} category={c} />
          ))}
        </div>
      </SectionPanel>

      <SectionPanel title="All marketplace items" subtitle={`${catalog.length} products available`}>
        <div className="filter-pills" style={{ marginBottom: 18 }}>
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`filter-pill ${activeSort === s.key ? 'active' : ''}`}
              onClick={() => setActiveSort(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
        {loading ? (
          <p>Loading products…</p>
        ) : (
          <div className="product-grid">
            {sorted.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        {!loading && sorted.length === 0 && <p>No products yet.</p>}
      </SectionPanel>
    </AppLayout>
  );
}
