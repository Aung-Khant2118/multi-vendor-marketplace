import {
  FiHome,
  FiHeadphones,
  FiBookOpen,
  FiSmile,
  FiGift,
} from 'react-icons/fi';
import { FaTshirt, FaUtensils, FaFootballBall } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';

export function enrichProduct(product) {
  const storeName = product.storeName || 'Marketplace';
  const verified = Boolean(product.vendorId);
  const imgs = Array.isArray(product.images) ? product.images : (product.images ? [...product.images] : []);
  const image = imgs.length > 0 ? imgs[0] : null;

  return {
    ...product,
    displayStoreName: storeName,
    displayVerified: verified,
    displayImage: image,
  };
}

// Sample catalog matching the design mockups, used only as a fallback
// when the live /products call returns nothing (e.g. a fresh dev
// database) so the storefront still resembles the reference designs.
// Each item carries a hand-picked (logo/trademark-free) photo since these
// are the named products shown in the reference frames.
export const FALLBACK_PRODUCTS = [
  { id: -1, name: 'Artisan Coffee Set', slug: 'artisan-coffee-set', description: 'A pour-over glass carafe with two matching stoneware cups.', price: 36, categoryId: 5, vendorId: 1, images: ['https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&q=80&auto=format&fit=crop'] },
  { id: -2, name: 'Minimal Desk Lamp', slug: 'minimal-desk-lamp', description: 'A slim brass-accented desk lamp with a warm, adjustable glow.', price: 58, categoryId: 5, vendorId: 2, images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80&auto=format&fit=crop'] },
  { id: -3, name: 'Natural Linen Throw', slug: 'natural-linen-throw', description: 'A softly striped linen throw, woven for everyday warmth.', price: 52, categoryId: 5, vendorId: 3, images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80&auto=format&fit=crop'] },
  { id: -4, name: 'Everyday Sneakers', slug: 'everyday-sneakers', description: 'Two-tone leather sneakers built for daily wear.', price: 74, categoryId: 4, vendorId: 4, images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80&auto=format&fit=crop'] },
  { id: -5, name: 'Botanical Skin Duo', slug: 'botanical-skin-duo', description: 'A cleanser and moisturizer duo made with plant-based actives.', price: 38, categoryId: 6, vendorId: 5, images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80&auto=format&fit=crop'] },
  { id: -6, name: 'Leather Day Tote', slug: 'leather-day-tote', description: 'A structured everyday tote in full-grain leather.', price: 86, categoryId: 4, vendorId: 4, images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80&auto=format&fit=crop'] },
  { id: -7, name: 'Wireless Earbuds', slug: 'wireless-earbuds', description: 'True-wireless earbuds with active noise cancellation.', price: 64, categoryId: 3, vendorId: 6, images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80&auto=format&fit=crop'] },
  { id: -8, name: 'Ceramic Pour-Over', slug: 'ceramic-pour-over', description: 'A hand-glazed ceramic pour-over dripper.', price: 32, categoryId: 5, vendorId: 1, images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80&auto=format&fit=crop'] },
  { id: -9, name: 'Handcrafted Denim Jacket', slug: 'handcrafted-denim-jacket', description: 'A stonewashed denim jacket, cut for a relaxed fit.', price: 88, categoryId: 4, vendorId: 4, images: ['https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&q=80&auto=format&fit=crop'] },
  { id: -10, name: 'Silk Neck Scarf', slug: 'silk-neck-scarf', description: 'A printed silk scarf finished with hand-rolled edges.', price: 34, categoryId: 4, vendorId: 3, images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80&auto=format&fit=crop'] },
  { id: -11, name: 'Smart Fitness Watch', slug: 'smart-fitness-watch', description: 'A daily fitness watch with heart-rate and sleep tracking.', price: 119, categoryId: 7, vendorId: 6, images: ['https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&q=80&auto=format&fit=crop'] },
  { id: -12, name: 'Compact Bluetooth Speaker', slug: 'compact-bluetooth-speaker', description: 'A pocket-sized speaker with room-filling sound.', price: 64, categoryId: 3, vendorId: 2, images: ['https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?w=600&q=80&auto=format&fit=crop'] },
  { id: -13, name: 'Mechanical Keyboard', slug: 'mechanical-keyboard', description: 'A compact mechanical keyboard with hot-swappable switches.', price: 108, categoryId: 3, vendorId: 6, images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80&auto=format&fit=crop'] },
];

// Icon + pastel color per known category name; anything else the backend
// returns falls back to a neutral chip so the grid stays fully data-driven.
const CATEGORY_STYLE_MAP = {
  'electronics': { icon: FiHeadphones, className: 'cat-tech' },
  'fashion': { icon: FaTshirt, className: 'cat-fashion' },
  'home & living': { icon: FiHome, className: 'cat-home' },
  'home-living': { icon: FiHome, className: 'cat-home' },
  'beauty & personal care': { icon: HiSparkles, className: 'cat-beauty' },
  'beauty-personal-care': { icon: HiSparkles, className: 'cat-beauty' },
  'sports & fitness': { icon: FaFootballBall, className: 'cat-sports' },
  'sports-fitness': { icon: FaFootballBall, className: 'cat-sports' },
  'books & education': { icon: FiBookOpen, className: 'cat-books' },
  'books-education': { icon: FiBookOpen, className: 'cat-books' },
  'toys & hobbies': { icon: FiSmile, className: 'cat-gifts' },
  'toys-hobbies': { icon: FiSmile, className: 'cat-gifts' },
  'food & grocery': { icon: FaUtensils, className: 'cat-food' },
  'food-grocery': { icon: FaUtensils, className: 'cat-food' },
};

const FALLBACK_CATEGORY_STYLE = { icon: FiGift, className: 'cat-gifts' };

export function getCategoryStyle(name) {
  const key = (name || '').trim().toLowerCase();
  return CATEGORY_STYLE_MAP[key] || FALLBACK_CATEGORY_STYLE;
}

export const DEFAULT_CATEGORIES = [
  { id: 3, name: 'Electronics', slug: 'electronics' },
  { id: 4, name: 'Fashion', slug: 'fashion' },
  { id: 5, name: 'Home & Living', slug: 'home-living' },
  { id: 6, name: 'Beauty & Personal Care', slug: 'beauty-personal-care' },
  { id: 7, name: 'Sports & Fitness', slug: 'sports-fitness' },
  { id: 8, name: 'Books & Education', slug: 'books-education' },
  { id: 9, name: 'Toys & Hobbies', slug: 'toys-hobbies' },
  { id: 10, name: 'Food & Grocery', slug: 'food-grocery' },
];
