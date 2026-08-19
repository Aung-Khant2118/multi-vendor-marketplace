import {
  FiHome,
  FiMonitor,
  FiGift,
} from 'react-icons/fi';
import { FaTshirt, FaUtensils } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';

// Deterministic pseudo-random in [0, 1), seeded by an integer id so the
// same product always displays the same mock rating/store on every render.
function seededRandom(seed) {
  const x = Math.sin(seed * 999331 + 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const STORE_NAME_POOL = [
  'Juniper Market',
  'Northline Goods',
  'Oak & Loom',
  'Harbor Studio',
  'Field Ritual',
  'Volt District',
  'Cedar & Co.',
  'Wren Supply',
];

// Real product data has no rating/review/store fields yet (backend
// ProductResponse only exposes id/name/price/categoryId/vendorId/images).
// These display-only values are derived deterministically per product id
// so the UI can show the star ratings / store lines seen in the design
// without pretending they came from the server.
export function enrichProduct(product) {
  const seed = Number(product.id) || 1;
  const rating = (4.5 + seededRandom(seed) * 0.5).toFixed(1);
  const reviewCount = 40 + Math.floor(seededRandom(seed + 1) * 280);
  const storeName = STORE_NAME_POOL[Number(product.vendorId || seed) % STORE_NAME_POOL.length];
  const verified = seededRandom(seed + 2) > 0.15;
  const image =
    (product.images && product.images.length > 0 && product.images[0]) ||
    pickImage(product);

  return {
    ...product,
    displayRating: rating,
    displayReviewCount: reviewCount,
    displayStoreName: storeName,
    displayVerified: verified,
    displayImage: image,
  };
}

// Generic pool used only for real backend products that come back with an
// empty images[] array (unknown name, so images are picked by id hash
// rather than matched to content).
const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&q=80&auto=format&fit=crop',
];

function pickImage(product) {
  const seed = Math.abs(Number(product.id) || 1);
  return IMAGE_POOL[seed % IMAGE_POOL.length];
}

// Sample catalog matching the design mockups, used only as a fallback
// when the live /products call returns nothing (e.g. a fresh dev
// database) so the storefront still resembles the reference designs.
// Each item carries a hand-picked (logo/trademark-free) photo since these
// are the named products shown in the reference frames.
export const FALLBACK_PRODUCTS = [
  { id: -1, name: 'Artisan Coffee Set', slug: 'artisan-coffee-set', description: 'A pour-over glass carafe with two matching stoneware cups.', price: 36, categoryId: 'home', vendorId: 1, images: ['https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&q=80&auto=format&fit=crop'] },
  { id: -2, name: 'Minimal Desk Lamp', slug: 'minimal-desk-lamp', description: 'A slim brass-accented desk lamp with a warm, adjustable glow.', price: 58, categoryId: 'home', vendorId: 2, images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80&auto=format&fit=crop'] },
  { id: -3, name: 'Natural Linen Throw', slug: 'natural-linen-throw', description: 'A softly striped linen throw, woven for everyday warmth.', price: 52, categoryId: 'home', vendorId: 3, images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80&auto=format&fit=crop'] },
  { id: -4, name: 'Everyday Sneakers', slug: 'everyday-sneakers', description: 'Two-tone leather sneakers built for daily wear.', price: 74, categoryId: 'fashion', vendorId: 4, images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80&auto=format&fit=crop'] },
  { id: -5, name: 'Botanical Skin Duo', slug: 'botanical-skin-duo', description: 'A cleanser and moisturizer duo made with plant-based actives.', price: 38, categoryId: 'beauty', vendorId: 5, images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80&auto=format&fit=crop'] },
  { id: -6, name: 'Leather Day Tote', slug: 'leather-day-tote', description: 'A structured everyday tote in full-grain leather.', price: 86, categoryId: 'fashion', vendorId: 4, images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80&auto=format&fit=crop'] },
  { id: -7, name: 'Wireless Earbuds', slug: 'wireless-earbuds', description: 'True-wireless earbuds with active noise cancellation.', price: 64, categoryId: 'tech', vendorId: 6, images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80&auto=format&fit=crop'] },
  { id: -8, name: 'Ceramic Pour-Over', slug: 'ceramic-pour-over', description: 'A hand-glazed ceramic pour-over dripper.', price: 32, categoryId: 'home', vendorId: 1, images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80&auto=format&fit=crop'] },
  { id: -9, name: 'Handcrafted Denim Jacket', slug: 'handcrafted-denim-jacket', description: 'A stonewashed denim jacket, cut for a relaxed fit.', price: 88, categoryId: 'fashion', vendorId: 4, images: ['https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&q=80&auto=format&fit=crop'] },
  { id: -10, name: 'Silk Neck Scarf', slug: 'silk-neck-scarf', description: 'A printed silk scarf finished with hand-rolled edges.', price: 34, categoryId: 'fashion', vendorId: 3, images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80&auto=format&fit=crop'] },
  { id: -11, name: 'Smart Fitness Watch', slug: 'smart-fitness-watch', description: 'A daily fitness watch with heart-rate and sleep tracking.', price: 119, categoryId: 'tech', vendorId: 6, images: ['https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&q=80&auto=format&fit=crop'] },
  { id: -12, name: 'Compact Bluetooth Speaker', slug: 'compact-bluetooth-speaker', description: 'A pocket-sized speaker with room-filling sound.', price: 64, categoryId: 'tech', vendorId: 2, images: ['https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?w=600&q=80&auto=format&fit=crop'] },
  { id: -13, name: 'Mechanical Keyboard', slug: 'mechanical-keyboard', description: 'A compact mechanical keyboard with hot-swappable switches.', price: 108, categoryId: 'tech', vendorId: 6, images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80&auto=format&fit=crop'] },
];

// Icon + pastel color per known category name; anything else the backend
// returns falls back to a neutral chip so the grid stays fully data-driven.
const CATEGORY_STYLE_MAP = {
  home: { icon: FiHome, className: 'cat-home' },
  fashion: { icon: FaTshirt, className: 'cat-fashion' },
  tech: { icon: FiMonitor, className: 'cat-tech' },
  electronics: { icon: FiMonitor, className: 'cat-tech' },
  beauty: { icon: HiSparkles, className: 'cat-beauty' },
  food: { icon: FaUtensils, className: 'cat-food' },
  gifts: { icon: FiGift, className: 'cat-gifts' },
};

const FALLBACK_CATEGORY_STYLE = { icon: FiGift, className: 'cat-gifts' };

export function getCategoryStyle(name) {
  const key = (name || '').trim().toLowerCase();
  return CATEGORY_STYLE_MAP[key] || FALLBACK_CATEGORY_STYLE;
}

export const DEFAULT_CATEGORIES = [
  { id: 'home', name: 'Home' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'tech', name: 'Tech' },
  { id: 'beauty', name: 'Beauty' },
  { id: 'food', name: 'Food' },
  { id: 'gifts', name: 'Gifts' },
];
