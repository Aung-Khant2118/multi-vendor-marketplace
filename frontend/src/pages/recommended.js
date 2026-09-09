import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiChevronDown } from 'react-icons/fi';
import { customerAPI } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import ProductCard from '../components/marketplace/ProductCard';

const TABS = [
  { label: 'For You', value: 'for_you' },
  { label: 'Trending', value: 'trending' },
  { label: 'Top Rated', value: 'top_rated' },
  { label: 'New Arrivals', value: 'new_arrivals' },
];
const PAGE_SIZE = 8;

export default function Recommended() {
  const router = useRouter();
  const [products, setProducts] = useState(null);
  const [tab, setTab] = useState('for_you');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setProducts(null);
    setVisible(PAGE_SIZE);
    customerAPI
      .getRecommendations({ tab, limit: 50 })
      .then((res) => setProducts(res.data?.data || []))
      .catch((err) => { console.error('Failed to load recommendations:', err); setProducts([]); })
      .finally(() => setLoading(false));
  }, [tab]);

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
            <h1>Recommended for You</h1>
            <p>Personalized product picks curated from top verified vendors</p>
          </div>
        </div>
      </div>

      <div className="tab-row">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            className={`tab-pill ${tab === t.value ? 'active' : ''}`}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading recommendations…</p>
      ) : (
        <>
          <div className="product-grid">
            {products.slice(0, visible).map((p) => (
              <ProductCard key={p.id} product={p} variant="recommended" />
            ))}
          </div>

          {visible < products.length && (
            <div className="load-more-wrap">
              <button type="button" className="btn-load-more" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Load More Recommendations <FiChevronDown />
              </button>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
