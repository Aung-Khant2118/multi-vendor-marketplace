import Link from 'next/link';
import { FiHeart, FiCheckCircle, FiHome as FiStoreIcon, FiShoppingCart, FiImage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { enrichProduct } from '../../lib/catalog';
import { useWishlist } from '../../features/wishlist/WishlistContext';
import { useAuth } from '../../features/auth/AuthContext';

/**
 * variant "recommended": image overlay heart + star rating (Frame 05 style)
 * variant "category": price/name row + "By vendor · rating" + Add to Cart button (Frame 06 style)
 * variant "grid" (default): compact card used on the home page / product listing
 */
export default function ProductCard({ product, variant = 'grid', onAddToCart, addToCartLoading }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const p = enrichProduct(product);
  const wishlisted = isWishlisted(p.id);
  const price = Number(p.price || 0).toFixed(2);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your wishlist');
      return;
    }
    toggleWishlist(p.id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart');
      return;
    }
    onAddToCart?.(p);
  };

  return (
    <Link href={`/products/${p.id}`} className="pcard">
      <div className="pcard-media">
        {p.displayImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={p.displayImage}
            alt={p.name}
            loading="lazy"
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
            minHeight: 180,
            background: 'var(--bg-subtle)',
            color: 'var(--text-muted)',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <FiImage size={24} />
          <span style={{ fontSize: 12 }}>No image</span>
        </div>
        {(variant === 'recommended' || variant === 'grid') && (
          <button
            type="button"
            className={`pcard-wishlist ${wishlisted ? 'active' : ''}`}
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FiHeart fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      <div className="pcard-body">
        <span className="pcard-name">{p.name}</span>

        {variant === 'category' ? (
          <div className="pcard-store">
            <span>By: {p.displayStoreName}</span>
            {p.displayVerified && <FiCheckCircle className="verified" />}
          </div>
        ) : (
          <div className="pcard-store">
            <FiStoreIcon />
            <span>{p.displayStoreName}</span>
            {p.displayVerified && <FiCheckCircle className="verified" />}
          </div>
        )}

        <div className="pcard-bottom">
            <span className="pcard-price">MMK {price}</span>
          </div>

        {variant === 'category' && (
          <button type="button" className="pcard-cta" onClick={handleAddToCart} disabled={addToCartLoading}>
            <FiShoppingCart size={14} /> Add to Cart
          </button>
        )}
      </div>
    </Link>
  );
}
