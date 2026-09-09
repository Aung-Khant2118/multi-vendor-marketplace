import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { FiHeart, FiStar, FiCheckCircle, FiHome as FiStoreIcon, FiShoppingCart, FiImage } from 'react-icons/fi';
import { customerAPI } from '../../services/api';
import { useAuth } from '../../features/auth/AuthContext';
import { useWishlist } from '../../features/wishlist/WishlistContext';
import { enrichProduct } from '../../lib/catalog';
import AppLayout from '../../components/layout/AppLayout';

export default function ProductDetail() {
  const { isAuthenticated, user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  const [ratingData, setRatingData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewableOrderItems, setReviewableOrderItems] = useState([]);
  const [selectedOrderItemId, setSelectedOrderItemId] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    customerAPI
      .getProduct(id)
      .then((res) => {
        const p = res.data?.data || null;
        setProduct(p);
        if (!p?.id) return;
        const pid = p.id;
        customerAPI.getVariants(pid).then((vres) => {
          const v = vres.data?.data || [];
          setVariants(v);
          if (v.length > 0) setSelectedVariant(v[0].id);
        }).catch(() => {});
        customerAPI.getProductRating(pid).then((rRes) => setRatingData(rRes.data?.data || null)).catch(() => {});
        customerAPI.getProductReviews(pid, { page: 0, size: 20 }).then((rRes) => setReviews(rRes.data?.data || [])).catch(() => {});
        if (isAuthenticated) {
          customerAPI.hasReviewed(pid).then((rRes) => setHasReviewed(rRes.data?.data || false)).catch(() => {});
          customerAPI.getOrders().then((oRes) => {
            const orders = oRes.data?.data || [];
            const items = [];
            for (const order of orders) {
              if (order.status === 'DELIVERED') {
                for (const item of (order.items || [])) {
                  if (String(item.productId) === String(pid)) {
                    items.push({ orderItemId: item.id, orderId: order.id, productName: item.productName });
                  }
                }
              }
            }
            setReviewableOrderItems(items);
            if (items.length > 0) setSelectedOrderItemId(String(items[0].orderItemId));
          }).catch(() => {});
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load product'));
  }, [id, isAuthenticated]);

  const submitReview = async () => {
    if (!selectedOrderItemId) { toast.error('Select an order to review'); return; }
    if (reviewRating < 1 || reviewRating > 5) { toast.error('Select a rating between 1 and 5'); return; }
    setSubmittingReview(true);
    try {
      await customerAPI.submitReview({
        orderItemId: Number(selectedOrderItemId),
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Review submitted!');
      setHasReviewed(true);
      setReviewRating(0);
      setReviewComment('');
      const res = await customerAPI.getProductReviews(id, { page: 0, size: 20 });
      setReviews(res.data?.data || []);
      const rRes = await customerAPI.getProductRating(id);
      setRatingData(rRes.data?.data || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const addToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart');
      return;
    }
    if (!selectedVariant) {
      toast.error('Select a variant first');
      return;
    }
    setAdding(true);
    try {
      await customerAPI.addToCart({ variantId: Number(selectedVariant), quantity: Number(quantity) });
      toast.success('Added to cart');
      router.push('/cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <p className="form-error">{error}</p>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout>
        <p>Loading product…</p>
      </AppLayout>
    );
  }

  const p = enrichProduct(product);
  const wishlisted = isWishlisted(p.id);

  return (
    <AppLayout>
      <div className="page-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => router.back()}
            className="filter-pill"
            style={{ padding: '4px 10px', fontSize: 12 }}
          >
            ← Back
          </button>
        </div>
      </div>
      <div className="content-card" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 380px) 1fr', gap: 32 }} className="pdp-grid">
          <div className="pcard-media" style={{ borderRadius: 'var(--radius-lg)' }}>
            {p.displayImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={p.displayImage}
                alt={p.name}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div
              style={{
                display: p.displayImage ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                minHeight: 300,
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--text-muted)',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <FiImage size={32} />
              <span>No image available</span>
            </div>
            <button
              type="button"
              className={`pcard-wishlist ${wishlisted ? 'active' : ''}`}
              onClick={() => toggleWishlist(p.id)}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <FiHeart fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{p.name}</h1>
            <div className="pcard-store" style={{ margin: '10px 0' }}>
              <FiStoreIcon />
              <span>{p.displayStoreName}</span>
              {p.displayVerified && <FiCheckCircle className="verified" />}
              {ratingData && ratingData.totalReviews > 0 && (
                <span style={{ marginLeft: 10 }}>
                  <FiStar style={{ color: 'var(--yellow-600)' }} /> {Number(ratingData.averageRating).toFixed(1)} ({ratingData.totalReviews})
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{p.description}</p>
            <div className="pcard-price" style={{ fontSize: 26, marginBottom: 20 }}>
              MMK {Number(p.price).toFixed(2)}
            </div>

            <div className="form-group">
              <label className="form-label">Variant</label>
              <select
                className="form-input"
                value={selectedVariant || ''}
                onChange={(e) => setSelectedVariant(e.target.value)}
              >
                {!variants.length && <option value="">No variants</option>}
                {variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={!v.inStock}>
                    {v.variantLabel || v.sku || `Variant #${v.id}`} — MMK {v.price} ({v.inStock ? 'In Stock' : 'Out of Stock'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                className="form-input"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{ maxWidth: 120 }}
              />
            </div>

            <button className="btn-pill btn-pill-yellow" onClick={addToCart} disabled={adding}>
              <FiShoppingCart /> {adding ? 'Adding…' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>

      <div className="content-card" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
          Reviews & Ratings
        </h2>

        {ratingData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, color: 'var(--text-secondary)' }}>
            <FiStar style={{ color: 'var(--yellow-600)', fontSize: 22 }} />
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
              {ratingData.averageRating ? Number(ratingData.averageRating).toFixed(1) : '—'}
            </span>
            <span>({ratingData.totalReviews} review{ratingData.totalReviews !== 1 ? 's' : ''})</span>
          </div>
        )}

        {isAuthenticated && !hasReviewed && reviewableOrderItems.length > 0 && (
          <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Write a Review</h3>
            <div className="form-group">
              <label className="form-label">Select Order</label>
              <select className="form-input" value={selectedOrderItemId} onChange={(e) => setSelectedOrderItemId(e.target.value)}>
                {reviewableOrderItems.map((item) => (
                  <option key={item.orderItemId} value={item.orderItemId}>
                    Order #{item.orderId} — {item.productName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                  >
                    <FiStar
                      size={24}
                      fill={star <= reviewRating ? 'var(--yellow-600)' : 'none'}
                      color={star <= reviewRating ? 'var(--yellow-600)' : 'var(--text-muted)'}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Comment (optional)</label>
              <textarea
                className="form-input"
                rows={3}
                maxLength={2000}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience..."
              />
            </div>
            <button className="btn-pill btn-pill-yellow" onClick={submitReview} disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}

        {isAuthenticated && !hasReviewed && reviewableOrderItems.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
            You can rate this product after you receive a delivered order containing it.
          </p>
        )}

        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No reviews yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{r.userName || 'Anonymous'}</strong>
                  <span style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FiStar key={s} size={14} fill={s <= r.rating ? 'var(--yellow-600)' : 'none'} color={s <= r.rating ? 'var(--yellow-600)' : 'var(--text-muted)'} />
                    ))}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
                {r.comment && <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 700px) {
          .pdp-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}
