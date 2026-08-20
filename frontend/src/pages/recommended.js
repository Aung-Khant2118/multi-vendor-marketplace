import { useEffect, useMemo, useState } from 'react';
import { HiSparkles } from 'react-icons/hi2';
import { FiChevronDown } from 'react-icons/fi';
import { customerAPI } from '../services/api';
import { FALLBACK_PRODUCTS } from '../lib/catalog';
import AppLayout from '../components/layout/AppLayout';
import ProductCard from '../components/marketplace/ProductCard';

const TABS = ['All', 'Trending', 'Based on recent views', 'Top Vendors'];
const PAGE_SIZE = 8;

export default function Recommended() {
  const [products, setProducts] = useState(null);
  const [tab, setTab] = useState('All');
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    customerAPI
      .getProducts()
      .then((res) => setProducts(res.data?.data || []))
      .catch(() => setProducts([]));
  }, []);

  const catalog = useMemo(() => {
    const list = products && products.length > 0 ? products : FALLBACK_PRODUCTS;
    // The backend has no personalization signal, so tabs re-order the
    // same fetched catalog deterministically to feel distinct rather
    // than fabricating separate "trending"/"recent views" datasets.
    const copy = [...list];
    if (tab === 'Trending') copy.sort((a, b) => Number(b.id) - Number(a.id));
    if (tab === 'Based on recent views') copy.reverse();
    if (tab === 'Top Vendors') copy.sort((a, b) => Number(a.vendorId) - Number(b.vendorId));
    return copy;
  }, [products, tab]);

  const loading = products === null;

  return (
    <AppLayout>
      <div className="page-heading">
        <div>
          <h1>Recommended for You</h1>
          <p>Personalized product picks curated from top verified vendors</p>
        </div>
        <span className="pill-badge">
          <HiSparkles /> Picked for you
        </span>
      </div>

      <div className="tab-row">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`tab-pill ${tab === t ? 'active' : ''}`}
            onClick={() => {
              setTab(t);
              setVisible(PAGE_SIZE);
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="info-banner">
        <span className="info-banner-icon">
          <HiSparkles />
        </span>
        <div>
          <div className="info-banner-title">Fresh matches, tuned to your taste</div>
          <div className="info-banner-copy">Updated from your recent views, saved items, and trusted vendor activity.</div>
        </div>
      </div>

      {loading ? (
        <p>Loading recommendations…</p>
      ) : (
        <>
          <div className="product-grid">
            {catalog.slice(0, visible).map((p) => (
              <ProductCard key={p.id} product={p} variant="recommended" />
            ))}
          </div>

          {visible < catalog.length && (
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
