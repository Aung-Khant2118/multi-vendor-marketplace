// The backend has no promotions or analytics endpoints yet (only vendor
// products/orders/dashboard-counts exist — see VendorOrderController and
// ProductController#dashboard). These constants back the Promos and
// Analytics pages, whose designs call for marketing/traffic data the API
// doesn't expose. They're static placeholders, not derived from real state,
// and should be swapped for real API data once those endpoints exist.

export const PROMOS_STATS = {
  activePromos: 4,
  promoRevenue: 12450,
  totalConversions: 842,
};

export const ACTIVE_PROMOTIONS = [
  { id: 1, name: 'SUMMER20', type: 'Storewide Discount', kind: '20% Off', status: 'Active', usage: 342, endDate: 'Nov 15, 2023' },
  { id: 2, name: 'WELCOME10', type: 'New Customers Only', kind: '$10 Fixed', status: 'Active', usage: '500+', endDate: 'Ongoing' },
  { id: 3, name: 'BLACKFRIDAY', type: 'Flash Sale Event', kind: '30% Off', status: 'Scheduled', usage: 0, endDate: 'Nov 24, 2023' },
  { id: 4, name: 'BOGO_SHOES', type: 'Footwear Category', kind: 'Buy 1 Get 1', status: 'Ended', usage: 128, endDate: 'Oct 31, 2023' },
];

export const ANALYTICS_STATS = {
  totalRevenue: { value: 124592, deltaLabel: '+14.2% vs last month', direction: 'up' },
  conversionRate: { value: '3.8%', deltaLabel: '+0.4% vs last month', direction: 'up' },
  avgOrderValue: { value: 142.5, deltaLabel: '0.0% vs last month', direction: 'flat' },
  refundRate: { value: '1.2%', deltaLabel: '-0.5% vs last month', direction: 'down' },
};

export const TOP_PRODUCTS_BY_REVENUE = [
  { id: 1, name: 'Lumina Desk Lamp - Matte Black', sales: 1245, revenue: 43575, trend: 'up' },
  { id: 2, name: 'ErgoPro Chair V2', sales: 842, revenue: 25260, trend: 'up' },
  { id: 3, name: 'Mechanical Keyboard - Pastel', sales: 534, revenue: 15486, trend: 'down' },
];

export const TRAFFIC_SOURCES = [
  { label: 'Organic Search', pct: 52, visitors: 42501 },
  { label: 'Direct', pct: 28, visitors: 22885 },
  { label: 'Social Media', pct: 15, visitors: 12259 },
  { label: 'Referral', pct: 5, visitors: 4086 },
];

export const TOTAL_TRAFFIC = 81731;

export const REVENUE_SPARKLINE = [18, 22, 19, 25, 23, 27, 24, 29, 26, 31, 28, 34];
