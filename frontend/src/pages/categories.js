import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FiHome as FiStoreIcon, FiArrowRight } from 'react-icons/fi';
import { customerAPI, categoryAPI } from '../services/api';
import { useQuickAddToCart } from '../lib/useQuickAddToCart';
import AppLayout from '../components/layout/AppLayout';
import CategoryChip from '../components/marketplace/CategoryChip';
import ProductCard from '../components/marketplace/ProductCard';

export default function Categories() {
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const { addToCart, loadingId } = useQuickAddToCart();

  useEffect(() => {
    customerAPI
      .getProducts()
      .then((res) => setProducts(res.data?.data || []))
      .catch((err) => { console.error('Failed to load products:', err); setProducts([]); });

    categoryAPI
      .getCategories()
      .then((res) => {
        const data = res.data?.data || [];
        setCategories(data);
      })
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const catalog = useMemo(() => products || [], [products]);

  const byCategory = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(c.id, []));
    catalog.forEach((p) => {
      const list = map.get(p.categoryId);
      if (list) list.push(p);
    });
    return map;
  }, [catalog, categories]);

  const loading = products === null || categoriesLoading;

  return (
    <AppLayout>
      <div className="page-heading">
        <div>
          <h1>Shop by Category</h1>
          <p>Explore items across all departments and discover independent vendors</p>
        </div>
        <span className="pill-badge">
          <FiStoreIcon /> Independent vendors
        </span>
      </div>

      {loading ? (
        <p>Loading categories...</p>
      ) : categories.length === 0 ? (
        <p>No categories found. Categories will appear once they are added to the database.</p>
      ) : (
        <>
          <div className="category-grid">
            {categories.map((c) => (
              <CategoryChip key={c.id} category={c} />
            ))}
          </div>

          {categories.map((c) => {
            const items = (byCategory.get(c.id) || []).slice(0, 4);
            if (items.length === 0) return null;
            return (
              <div key={c.id}>
                <div className="section-panel-head" style={{ marginBottom: 14 }}>
                  <div>
                    <h2 style={{ fontSize: 18 }}>{c.name}</h2>
                  </div>
                  <Link href={`/products?category=${c.id}`} className="section-link">
                    View all <FiArrowRight size={14} />
                  </Link>
                </div>
                <div className="product-grid" style={{ marginBottom: 8 }}>
                  {items.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      variant="category"
                      onAddToCart={addToCart}
                      addToCartLoading={loadingId === p.id}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </AppLayout>
  );
}
