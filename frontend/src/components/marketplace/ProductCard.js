import Link from 'next/link';
import { FiHeart, FiStar, FiCheckCircle, FiHome as FiStoreIcon, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { enrichProduct } from '../../lib/catalog';
import { useWishlist } from '../../features/wishlist/WishlistContext';

/**
 * variant "recommended": image overlay heart + star rating (Frame 05 style)
 * variant "category": price/name row + "By vendor · rating · Visit Store" + Add to Cart button (Frame 06 style)
 * variant "grid" (default): compact card used on the home page / product listing
 */
export default function ProductCard({ product, variant = 'grid', onAddToCart, addToCartLoading }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const p = enrichProduct(product);
  const wishlisted = isWishlisted(p.id);
  const price = Number(p.price || 0).toFixed(2);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(p.id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(p);
  };

  return (
    <Link href={`/products/${p.id}`} className="pcard">
      <div className="pcard-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.displayImage} alt={p.name} loading="lazy" />
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
            <FiStar className="verified" />
            <span>{p.displayRating}</span>
          </div>
        ) : (
          <div className="pcard-store">
            <FiStoreIcon />
            <span>{p.displayStoreName}</span>
            {p.displayVerified && <FiCheckCircle className="verified" />}
          </div>
        )}

        {variant === 'category' ? (
          <div className="pcard-bottom">
            <span className="pcard-price">${price}</span>
            <span className="pcard-visit">
              Visit Store <FiArrowRight size={12} />
            </span>
          </div>
        ) : (
          <div className="pcard-bottom">
            <span className="pcard-price">${price}</span>
            {variant === 'recommended' && (
              <span className="pcard-rating">
                <FiStar /> {p.displayRating} ({p.displayReviewCount})
              </span>
            )}
          </div>
        )}

        {variant === 'category' && (
          <button type="button" className="pcard-cta" onClick={handleAddToCart} disabled={addToCartLoading}>
            <FiShoppingCart size={14} /> Add to Cart
          </button>
        )}
      </div>
    </Link>
  );
}
