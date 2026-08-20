import Link from 'next/link';

export default function PromoBanner() {
  return (
    <div className="promo-banner">
      <div>
        <div className="promo-eyebrow">Seasonal promotion</div>
        <div className="promo-title">Fresh finds. Better prices.</div>
        <p className="promo-copy">Swipe through vendor coupons and limited-time marketplace offers.</p>
        <Link href="/products" className="btn-pill btn-pill-yellow promo-cta">
          Shop the offer
        </Link>
      </div>
      <div className="promo-badge">
        <div className="promo-badge-amount">20% OFF</div>
        <div className="promo-badge-code">ZAYLINK20</div>
      </div>
    </div>
  );
}
