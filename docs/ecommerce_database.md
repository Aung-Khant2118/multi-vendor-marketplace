# E-Commerce Multi-Vendor Marketplace — Database Design

## 1. Purpose

This file is the database source of truth. It lists the tables, columns, relationships, and constraints that the code should follow. Do not add extra tables or columns unless this file is updated first.

## 2. Database Engine

- **Engine:** PostgreSQL through Supabase
- **Primary key style:** UUID for most tables
- **Timestamps:** `created_at`, `updated_at`, `deleted_at` where soft delete is needed
- **Soft delete:** used on core business tables that should not be hard deleted

## 3. Naming Rules

- Table names use plural nouns: `users`, `products`, `orders`
- Foreign keys use the referenced table name with `_id`
- Use snake_case for all columns
- Store user-facing labels in separate fields only when needed
- Keep enum values fixed and documented

## 4. Entity Overview

The database supports these business areas:

- User accounts and roles
- Vendor onboarding and store profiles
- Categories and product catalog
- Product variants, attributes, and images
- Cart and wishlist
- Orders and order items
- Payments
- Coupons and discounts
- Reviews and ratings
- Notifications
- Audit logs
- Address management

## 5. Tables

### 5.1 `users`
Stores all platform accounts.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| email | varchar | unique, required |
| username | varchar | unique, required |
| password_hash | varchar | required |
| display_name | varchar | required |
| phone | varchar | nullable |
| role | user_role enum | required |
| email_verified | boolean | default false |
| status | user_status enum | default active |
| last_login_at | timestamp | nullable |
| created_at | timestamp | required |
| updated_at | timestamp | required |
| deleted_at | timestamp | nullable |

#### Notes
- One row represents one login account.
- Vendor and admin accounts also live here.
- `role` controls access.

---

### 5.2 `addresses`
Stores shipping and billing addresses for users.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK -> `users.id` |
| recipient_name | varchar | required |
| phone | varchar | required |
| line1 | varchar | required |
| line2 | varchar | nullable |
| city | varchar | required |
| region | varchar | nullable |
| postal_code | varchar | nullable |
| country | varchar | required |
| address_type | address_type enum | SHIPPING or BILLING |
| is_default | boolean | default false |
| created_at | timestamp | required |
| updated_at | timestamp | required |
| deleted_at | timestamp | nullable |

#### Notes
- A user can have many addresses.
- Orders should snapshot the address used at checkout through foreign keys and stored order data.

---

### 5.3 `images`
Stores file metadata only. Actual binary files live in Supabase Storage.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| storage_path | varchar | required |
| thumb_path | varchar | nullable |
| mime_type | varchar | required |
| size_bytes | bigint | required |
| width | int | nullable |
| height | int | nullable |
| alt_text | varchar | nullable |
| checksum | varchar | nullable |
| created_at | timestamp | required |
| updated_at | timestamp | required |
| uploaded_by | uuid | FK -> `users.id` |

#### Notes
- Use this table for vendor logos, banners, and product images.
- Do not store image bytes in PostgreSQL.

---

### 5.4 `vendors`
Stores vendor/store profiles.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK -> `users.id`, unique |
| store_name | varchar | required |
| slug | varchar | unique, required |
| logo_image_id | uuid | FK -> `images.id` |
| banner_image_id | uuid | FK -> `images.id` |
| description | text | nullable |
| business_email | varchar | nullable |
| business_phone | varchar | nullable |
| rating | decimal | nullable |
| status | vendor_status enum | PENDING / ACTIVE / REJECTED / SUSPENDED |
| approved_at | timestamp | nullable |
| approved_by | uuid | FK -> `users.id`, nullable |
| created_at | timestamp | required |
| updated_at | timestamp | required |
| deleted_at | timestamp | nullable |

#### Notes
- One vendor profile belongs to one user account.
- Vendors must be approved before selling.
- `slug` is used in public URLs.

---

### 5.5 `categories`
Stores product categories and subcategories.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| parent_id | uuid | FK -> `categories.id`, nullable |
| name | varchar | required |
| slug | varchar | unique, required |
| created_at | timestamp | required |
| updated_at | timestamp | required |
| deleted_at | timestamp | nullable |

#### Notes
- Supports a category tree.
- `parent_id` is null for top-level categories.

---

### 5.6 `products`
Stores the main product record.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| category_id | uuid | FK -> `categories.id` |
| vendor_id | uuid | FK -> `vendors.id` |
| name | varchar | required |
| slug | varchar | unique, required |
| description | text | nullable |
| brand | varchar | nullable |
| weight | decimal | nullable |
| is_active | boolean | default true |
| status | product_status enum | DRAFT / PUBLISHED / ARCHIVED |
| published_at | timestamp | nullable |
| created_at | timestamp | required |
| updated_at | timestamp | required |
| deleted_at | timestamp | nullable |

#### Notes
- One product belongs to one vendor.
- One product belongs to one category.
- Variants are stored in `product_variants`.

---

### 5.7 `product_variants`
Stores sellable SKU-level data.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| product_id | uuid | FK -> `products.id` |
| sku | varchar | unique, required |
| barcode | varchar | nullable |
| price | decimal | required |
| weight | decimal | nullable |
| stock_quantity | int | required |
| reserved_quantity | int | default 0 |
| status | variant_status enum | ACTIVE / INACTIVE / OUT_OF_STOCK |
| created_at | timestamp | required |
| updated_at | timestamp | required |
| deleted_at | timestamp | nullable |

#### Notes
- This is the real inventory row that gets purchased.
- Stock should be checked against `stock_quantity - reserved_quantity`.

---

### 5.8 `product_attributes`
Stores attribute groups for a product.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| product_id | uuid | FK -> `products.id` |
| name | varchar | required |
| display_order | smallint | default 1 |

#### Notes
- Examples: Color, Size, Material.

---

### 5.9 `attribute_values`
Stores possible values for a product attribute.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| product_attribute_id | uuid | FK -> `product_attributes.id` |
| value | varchar | required |
| display_order | smallint | default 1 |
| color_hex | varchar | nullable |

#### Notes
- `color_hex` is useful for color attributes.
- Example values: Red, Blue, XL, Cotton.

---

### 5.10 `variant_attribute_values`
Join table between variants and attribute values.

| Column | Type | Notes |
|---|---|---|
| variant_id | uuid | FK -> `product_variants.id` |
| attribute_value_id | uuid | FK -> `attribute_values.id` |

#### Notes
- Composite primary key: `(variant_id, attribute_value_id)`
- One variant can have multiple attribute values.

---

### 5.11 `product_images`
Join table between products and images.

| Column | Type | Notes |
|---|---|---|
| product_id | uuid | FK -> `products.id` |
| position | smallint | required |
| is_cover | boolean | default false |
| image_id | uuid | FK -> `images.id` |

#### Notes
- Composite primary key can be `(product_id, image_id)` or a surrogate `id` if you prefer, but keep one convention only.
- One product can have many images.

---

### 5.12 `carts`
Stores the active cart for a user.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK -> `users.id`, unique |
| created_at | timestamp | required |
| updated_at | timestamp | required |

#### Notes
- Usually one cart per user.

---

### 5.13 `cart_items`
Stores items in a cart.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| cart_id | uuid | FK -> `carts.id` |
| variant_id | uuid | FK -> `product_variants.id` |
| quantity | int | required |
| created_at | timestamp | required |
| updated_at | timestamp | required |

#### Notes
- Enforce unique `(cart_id, variant_id)` to prevent duplicate lines.
- Quantity must be positive.

---

### 5.14 `wishlists`
Stores a wishlist for a user.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK -> `users.id` |
| name | varchar | required |
| created_at | timestamp | required |
| updated_at | timestamp | required |

#### Notes
- The default implementation can use one wishlist per user even though the table supports naming.

---

### 5.15 `wishlist_items`
Stores product entries in a wishlist.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| product_id | uuid | FK -> `products.id` |
| wishlist_id | uuid | FK -> `wishlists.id` |
| added_at | timestamp | required |

#### Notes
- Enforce unique `(wishlist_id, product_id)`.

---

### 5.16 `coupons`
Stores vendor coupons.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| vendor_id | uuid | FK -> `vendors.id` |
| code | varchar | unique, required |
| description | text | nullable |
| discount_type | coupon_discount_type enum | PERCENTAGE / FIXED |
| discount_value | decimal | required |
| min_order_amount | decimal | nullable |
| max_uses | int | nullable |
| used_count | int | default 0 |
| starts_at | timestamp | nullable |
| expires_at | timestamp | nullable |
| is_active | boolean | default true |
| created_at | timestamp | required |
| updated_at | timestamp | required |

#### Notes
- Coupons belong to one vendor.
- Coupon validation must check active status, date window, usage count, and minimum order amount.

---

### 5.17 `orders`
Stores the order header.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK -> `users.id` |
| shipping_address_id | uuid | FK -> `addresses.id` |
| billing_address_id | uuid | FK -> `addresses.id` |
| status | order_status enum | PENDING / CONFIRMED / SHIPPED / DELIVERED / CANCELED / REFUNDED |
| subtotal | decimal | required |
| shipping_cost | decimal | required |
| tax | decimal | required |
| total | decimal | required |
| notes | text | nullable |
| created_at | timestamp | required |
| updated_at | timestamp | required |

#### Notes
- One order belongs to one customer.
- Address IDs point to the address selected at checkout.

---

### 5.18 `order_items`
Stores each product line in an order.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| order_id | uuid | FK -> `orders.id` |
| variant_id | uuid | FK -> `product_variants.id` |
| vendor_id | uuid | FK -> `vendors.id` |
| quantity | int | required |
| unit_price | decimal | required |
| subtotal | decimal | required |
| status | order_item_status enum | PENDING / PROCESSING / SHIPPED / DELIVERED / REFUNDED |
| created_at | timestamp | required |
| updated_at | timestamp | required |

#### Notes
- Each item points to the purchased variant and seller.
- The `vendor_id` is useful for vendor dashboards and split fulfillment.

---

### 5.19 `payments`
Stores payment records for orders.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| order_id | uuid | FK -> `orders.id` |
| amount | decimal | required |
| currency | varchar | required |
| method | payment_method enum | CARD / WALLET / BANK_TRANSFER / CASH_ON_DELIVERY |
| status | payment_status enum | PENDING / COMPLETED / FAILED / REFUNDED |
| transaction_id | varchar | nullable |
| paid_at | timestamp | nullable |
| created_at | timestamp | required |
| updated_at | timestamp | required |

#### Notes
- One order may have one or more payment attempts depending on implementation choice.
- Keep the current version simple unless split payments are truly needed.

---

### 5.20 `reviews`
Stores product reviews.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| product_id | uuid | FK -> `products.id` |
| user_id | uuid | FK -> `users.id` |
| order_item_id | uuid | FK -> `order_items.id`, nullable |
| rating | int | required |
| title | varchar | nullable |
| comment | text | nullable |
| is_verified | boolean | default false |
| created_at | timestamp | required |
| updated_at | timestamp | required |
| deleted_at | timestamp | nullable |

#### Notes
- Verification can mean the reviewer bought the product.
- One user should not spam many reviews for the same order item.

---

### 5.21 `notifications`
Stores user notifications.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| recipient_id | uuid | FK -> `users.id` |
| type | varchar | required |
| title | varchar | required |
| message | text | required |
| payload | jsonb | nullable |
| read_at | timestamp | nullable |
| created_at | timestamp | required |

#### Notes
- `payload` can store additional structured data.
- This table is useful for order updates and vendor approvals.

---

### 5.22 `audit_logs`
Stores important action history.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK -> `users.id` |
| action | varchar | required |
| entity_type | varchar | required |
| entity_id | uuid | required |
| old_values | jsonb | nullable |
| new_values | jsonb | nullable |
| ip_address | varchar | nullable |
| user_agent | varchar | nullable |
| created_at | timestamp | required |

#### Notes
- Use this for admin actions, vendor approval, product changes, and critical security events.

## 6. Enum Definitions

### `user_role`
- `CUSTOMER`
- `VENDOR`
- `ADMIN`

### `user_status`
- `ACTIVE`
- `SUSPENDED`
- `DELETED`

### `vendor_status`
- `PENDING`
- `ACTIVE`
- `REJECTED`
- `SUSPENDED`

### `product_status`
- `DRAFT`
- `PUBLISHED`
- `ARCHIVED`

### `variant_status`
- `ACTIVE`
- `INACTIVE`
- `OUT_OF_STOCK`

### `coupon_discount_type`
- `PERCENTAGE`
- `FIXED`

### `order_status`
- `PENDING`
- `CONFIRMED`
- `SHIPPED`
- `DELIVERED`
- `CANCELED`
- `REFUNDED`

### `order_item_status`
- `PENDING`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`
- `REFUNDED`

### `payment_method`
- `CARD`
- `WALLET`
- `BANK_TRANSFER`
- `CASH_ON_DELIVERY`

### `payment_status`
- `PENDING`
- `COMPLETED`
- `FAILED`
- `REFUNDED`

### `address_type`
- `SHIPPING`
- `BILLING`

## 7. Relationship Summary

- `users` 1-to-many `addresses`
- `users` 1-to-1 `carts`
- `users` 1-to-1 `wishlists` in the default setup
- `users` 1-to-1 `vendors` for vendor accounts
- `vendors` 1-to-many `products`
- `vendors` 1-to-many `coupons`
- `categories` 1-to-many `products`
- `products` 1-to-many `product_variants`
- `products` 1-to-many `product_attributes`
- `product_attributes` 1-to-many `attribute_values`
- `product_variants` many-to-many `attribute_values` through `variant_attribute_values`
- `products` many-to-many `images` through `product_images`
- `carts` 1-to-many `cart_items`
- `wishlists` 1-to-many `wishlist_items`
- `orders` 1-to-many `order_items`
- `orders` 1-to-many `payments` if multiple attempts are allowed
- `products` 1-to-many `reviews`
- `users` 1-to-many `notifications`
- `users` 1-to-many `audit_logs`

## 8. Indexes to Add

Add indexes for:
- all foreign keys
- `users.email`
- `users.username`
- `vendors.slug`
- `categories.slug`
- `products.slug`
- `product_variants.sku`
- `coupons.code`
- `orders.user_id`
- `order_items.order_id`
- `reviews.product_id`
- `notifications.recipient_id`

## 9. Data Integrity Rules

- Email, username, slug, and SKU must be unique where stated.
- Quantity values must never be negative.
- `reserved_quantity` must not exceed `stock_quantity`.
- Coupon usage count must never exceed `max_uses`.
- Review rating should stay in the valid numeric range chosen by the team, usually 1 to 5.
- Orders must not be created without valid addresses and at least one cart item.
- Vendor products must belong to the vendor who owns them.

## 10. Implementation Notes

### Recommended entity classes
- `User`
- `Address`
- `Image`
- `Vendor`
- `Category`
- `Product`
- `ProductVariant`
- `ProductAttribute`
- `AttributeValue`
- `Cart`
- `CartItem`
- `Wishlist`
- `WishlistItem`
- `Coupon`
- `Order`
- `OrderItem`
- `Payment`
- `Review`
- `Notification`
- `AuditLog`

### Recommended DTO groups
- Auth DTOs
- User DTOs
- Vendor DTOs
- Catalog DTOs
- Cart DTOs
- Wishlist DTOs
- Checkout DTOs
- Order DTOs
- Coupon DTOs
- Review DTOs
- Admin DTOs

## 11. Coding Safety Rules

When using AI to generate code, follow these constraints:

1. Do not create a table that is not listed here.
2. Do not rename a column unless this file is updated first.
3. Do not add random fields because they seem useful.
4. Do not assume a relationship that is not defined here.
5. If a feature needs new data, update this document and the architecture document together.
6. Keep database enums and Java enums synchronized.
7. Use migrations only if the team agrees on them; otherwise keep schema changes controlled and documented.
