// The backend has no admin endpoints yet (no user directory, vendor
// approval queue, category CRUD, or audit-log API). These constants back
// the Admin pages, whose designs (see `admin design/Admin`) call for data
// the API doesn't expose. They're static placeholders, not derived from
// real state, and should be swapped for real API data once those
// endpoints exist.

export const DASHBOARD_STATS = {
  totalUsers: 4850,
  totalVendors: 142,
  totalProducts: 3400,
  totalOrders: 1240,
  totalRevenue: 124500.0,
  actionNeeded: 5,
};

export const VISIT_SALES_STATS = {
  months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'],
  visits: [42, 58, 46, 62, 60, 70, 68, 82],
  sales: [15, 18, 16, 20, 19, 23, 25, 27],
};

export const RECENT_ADMIN_ACTIVITY = [
  { id: 1, type: 'ROLE_CHANGE', tone: 'purple', desc: "Promoted Priya Shah to Moderator", time: '2 hours ago' },
  { id: 2, type: 'CATEGORY_ADD', tone: 'green', desc: "Added new category 'Smart Home'", time: '5 hours ago' },
  { id: 3, type: 'CATEGORY_ADD', tone: 'green', desc: "Added new category 'Outdoor Gear'", time: '1 day ago' },
  { id: 4, type: 'CATEGORY_ADD', tone: 'green', desc: "Added new category 'Pet Supplies'", time: '2 days ago' },
];

/* ---------------------------- Users (All Roles) --------------------------- */

export const TOTAL_USERS_COUNT = 4850;

export const USERS = [
  { id: 1, uid: 'USR-84920', name: 'Priya Shah', email: 'priya.shah@zaylink.com', phone: '+1 (555) 214-9080', role: 'ADMIN', verified: true, joined: 'Aug 24, 2026' },
  { id: 2, uid: 'USR-84921', name: 'Marcus Bell', email: 'marcus.bell@gmail.com', phone: '+1 (555) 762-3311', role: 'VENDOR', verified: true, joined: 'Aug 22, 2026' },
  { id: 3, uid: 'USR-84922', name: 'Elena Cruz', email: 'elena.cruz99@gmail.com', phone: '+1 (555) 908-4471', role: 'CUSTOMER', verified: true, joined: 'Aug 20, 2026' },
  { id: 4, uid: 'USR-84923', name: 'Jordan Lee', email: 'jordan.lee.biz@gmail.com', phone: '+1 (555) 340-2287', role: 'VENDOR', verified: false, joined: 'Aug 18, 2026' },
  { id: 5, uid: 'USR-84924', name: 'Sofia Ahmed', email: 'sofia.ahmed@gmail.com', phone: '+1 (555) 661-9924', role: 'CUSTOMER', verified: true, joined: 'Aug 15, 2026' },
  { id: 6, uid: 'USR-84925', name: 'Diego Ramirez', email: 'diego.ramirez@gmail.com', phone: '+1 (555) 448-1120', role: 'CUSTOMER', verified: true, joined: 'Aug 12, 2026' },
  { id: 7, uid: 'USR-84926', name: 'Aiko Tanaka', email: 'aiko.tanaka@outlook.com', phone: '+1 (555) 772-6650', role: 'VENDOR', verified: true, joined: 'Aug 09, 2026' },
  { id: 8, uid: 'USR-84927', name: 'Noah Williams', email: 'noah.williams@gmail.com', phone: '+1 (555) 390-8817', role: 'CUSTOMER', verified: false, joined: 'Aug 05, 2026' },
  { id: 9, uid: 'USR-84928', name: 'Sarah Smith', email: 'sara@email.com', phone: '(555) 123-4567', role: 'CUSTOMER', verified: false, joined: 'Aug 24, 2026' },
];

export const ROLE_PILL = {
  ADMIN: { cls: 'vpill-pink', label: 'Admin' },
  VENDOR: { cls: 'vpill-purple', label: 'Vendor' },
  CUSTOMER: { cls: 'vpill-blue', label: 'Customer' },
};

/* -------------------------- Users -> Customer tab -------------------------- */

export const TOTAL_CUSTOMERS_COUNT = 3240;

export const CUSTOMERS = [
  { id: 3, uid: 'USR-84922', name: 'Elena Cruz', email: 'elena.cruz99@gmail.com', phone: '+1 (555) 908-4471', orders: 14, spent: 1240.0, status: 'Verified', joined: 'Aug 20, 2026' },
  { id: 5, uid: 'USR-84924', name: 'Sofia Ahmed', email: 'sofia.ahmed@gmail.com', phone: '+1 (555) 661-9924', orders: 3, spent: 210.5, status: 'Verified', joined: 'Aug 15, 2026' },
  { id: 10, uid: 'USR-84929', name: 'Liam Walker', email: 'liam.w@outlook.com', phone: '+1 (555) 412-8833', orders: 0, spent: 0, status: 'Inactive', joined: 'Aug 10, 2026' },
  { id: 6, uid: 'USR-84925', name: 'Diego Ramirez', email: 'diego.ramirez@gmail.com', phone: '+1 (555) 448-1120', orders: 8, spent: 640.2, status: 'Verified', joined: 'Aug 12, 2026' },
  { id: 8, uid: 'USR-84927', name: 'Noah Williams', email: 'noah.williams@gmail.com', phone: '+1 (555) 390-8817', orders: 1, spent: 42.0, status: 'Inactive', joined: 'Aug 05, 2026' },
];

/* --------------------------- Users -> Vendor tab --------------------------- */

export const TOTAL_VENDOR_USERS_COUNT = 420;

export const VENDOR_USERS = [
  { id: 2, uid: 'USR-84921', store: 'Bell Tech Supplies', owner: 'Marcus Bell', email: 'marcus.bell@gmail.com', phone: '+1 (555) 762-3311', products: 48, sales: 18450.0, kyc: 'Verified', joined: 'Aug 22, 2026' },
  { id: 4, uid: 'USR-84923', store: 'Jordan Apparel', owner: 'Jordan Lee', email: 'jordan.lee.biz@gmail.com', phone: '+1 (555) 340-2287', products: 12, sales: 3120.0, kyc: 'Pending', joined: 'Aug 18, 2026' },
  { id: 11, uid: 'USR-84930', store: 'K-Cosmetics Co.', owner: 'Kara Chen', email: 'k.beauty@store.com', phone: '+1 (555) 882-1904', products: 120, sales: 45890.0, kyc: 'Verified', joined: 'Jul 30, 2026' },
  { id: 7, uid: 'USR-84926', store: 'Tanaka Home Goods', owner: 'Aiko Tanaka', email: 'aiko.tanaka@outlook.com', phone: '+1 (555) 772-6650', products: 76, sales: 22140.0, kyc: 'Verified', joined: 'Aug 09, 2026' },
];

/* ------------------------------ User details ------------------------------ */
// Extra fields only the dark "User Details" modal needs, keyed by user id.
export const USER_DETAILS_EXTRA = {
  9: { online: true },
};

/* --------------------------------- Vendors --------------------------------- */

export const VENDOR_STATUS_TABS = [
  { key: 'ALL', label: 'All', count: 142 },
  { key: 'PENDING', label: 'Pending', count: 5 },
  { key: 'ACTIVE', label: 'Active', count: 130 },
  { key: 'SUSPENDED', label: 'Suspended', count: 4 },
  { key: 'REJECTED', label: 'Rejected', count: 3 },
];

export const VENDOR_STATUS_PILL = {
  PENDING: 'vpill-yellow',
  ACTIVE: 'vpill-green',
  SUSPENDED: 'vpill-gray',
  REJECTED: 'vpill-red',
};

export const VENDORS = [
  { id: 1, store: 'Juniper Market', owner: 'Sarah Smith', status: 'PENDING', rating: null, applied: 'Aug 25, 2026' },
  { id: 2, store: 'Volt District', owner: 'John Doe', status: 'ACTIVE', rating: 4.8, applied: 'Aug 10, 2026' },
  { id: 3, store: 'Northline Goods', owner: 'Alex Mercer', status: 'ACTIVE', rating: 4.2, applied: 'Jul 15, 2026' },
  { id: 4, store: 'Field Ritual', owner: 'Emma Frost', status: 'SUSPENDED', rating: 2.1, applied: 'Jan 05, 2026' },
  { id: 5, store: 'Oak & Loom', owner: 'Michael Chang', status: 'REJECTED', rating: null, applied: 'Dec 12, 2025' },
];

/* -------------------------------- Categories -------------------------------- */

export const CATEGORY_STATS = {
  totalCategories: 8,
  totalProducts: 3400,
  activeCount: 6,
};

// tone keys match the .acat-icon.tone-* classes added in admin.css
export const CATEGORIES = [
  { id: 1, name: 'Home & Living', desc: 'Furniture, Decor, Lighting', slug: '/home-living', icon: 'home', tone: 'cyan', products: 840, status: 'Active', created: 'Jan 10, 2026' },
  { id: 2, name: 'Fashion & Apparel', desc: 'Clothing, Footwear, Accessories', slug: '/fashion', icon: 'fashion', tone: 'pink', products: 1120, status: 'Active', created: 'Jan 12, 2026' },
  { id: 3, name: 'Tech & Gadgets', desc: 'Audio, Smart Devices, Accessories', slug: '/tech', icon: 'tech', tone: 'teal', products: 650, status: 'Active', created: 'Jan 15, 2026' },
  { id: 4, name: 'Beauty & Skincare', desc: 'Cosmetics, Organic, Serums', slug: '/beauty', icon: 'beauty', tone: 'purple', products: 420, status: 'Active', created: 'Feb 01, 2026' },
  { id: 5, name: 'Kitchenware', desc: 'Cookware, Utensils, Dining', slug: '/kitchenware', icon: 'kitchen', tone: 'amber', products: 120, status: 'Inactive', created: 'Aug 24, 2026' },
];

/* ------------------------------- Audit logs -------------------------------- */

export const AUDIT_GROUP_TABS = [
  { key: 'ALL', label: 'All Events' },
  { key: 'ROLES_AUTH', label: 'Roles & Auth' },
  { key: 'VENDOR_APPROVALS', label: 'Vendor Approvals' },
  { key: 'CATALOG', label: 'Catalog / Categories' },
];

export const AUDIT_EVENT_META = {
  ROLE_CHANGE: { group: 'ROLES_AUTH', cls: 'vpill-pink' },
  AUTH_RESET: { group: 'ROLES_AUTH', cls: 'vpill-blue' },
  VENDOR_APPROVE: { group: 'VENDOR_APPROVALS', cls: 'vpill-purple' },
  VENDOR_SUSPEND: { group: 'VENDOR_APPROVALS', cls: 'vpill-red' },
  CATEGORY_ADD: { group: 'CATALOG', cls: 'vpill-yellow' },
};

export const AUDIT_LOGS = [
  {
    id: 1,
    date: 'Aug 26, 2026',
    time: '18:42:10',
    actor: 'DelinaDD',
    actorRole: 'Super Admin',
    type: 'ROLE_CHANGE',
    details: "User #USR-84920 (Sarah Smith) elevated to VENDOR",
    status: 'Success',
    ip: '192.168.1.45',
  },
  {
    id: 2,
    date: 'Aug 25, 2026',
    time: '14:15:22',
    actor: 'Admin Mike',
    actorRole: 'Admin',
    type: 'VENDOR_APPROVE',
    details: "Approved store application for 'Juniper Market'",
    status: 'Success',
    ip: '103.24.112.5',
  },
  {
    id: 3,
    date: 'Aug 24, 2026',
    time: '11:02:48',
    actor: 'DelinaDD',
    actorRole: 'Super Admin',
    type: 'CATEGORY_ADD',
    details: "Created new marketplace category 'Kitchenware'",
    status: 'Success',
    ip: '192.168.1.45',
  },
  {
    id: 4,
    date: 'Aug 23, 2026',
    time: '09:30:15',
    actor: 'Admin Mike',
    actorRole: 'Admin',
    type: 'VENDOR_SUSPEND',
    details: "Suspended vendor 'Field Ritual' (Reason: Policy Violation)",
    status: 'Warning',
    ip: '103.24.112.5',
  },
  {
    id: 5,
    date: 'Aug 22, 2026',
    time: '16:11:04',
    actor: 'DelinaDD',
    actorRole: 'Super Admin',
    type: 'AUTH_RESET',
    details: 'Triggered password reset email for user #USR-10294',
    status: 'Success',
    ip: '192.168.1.45',
  },
];

export const TOTAL_AUDIT_EVENTS = 842;
