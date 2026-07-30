# E-Commerce Multi-Vendor Marketplace — System Architecture

## 1. Purpose

This document is the coding blueprint for the platform. It defines the modules, boundaries, request flow, API responsibilities, and deployment shape so implementation stays consistent and does not drift into guesswork.

## 2. Tech Stack

- **Frontend:** React
- **Backend:** Spring Boot
- **Database:** Supabase PostgreSQL
- **File storage:** Supabase Storage
- **Auth:** Spring Security with JWT
- **API style:** REST JSON
- **Validation:** Jakarta Validation
- **Documentation:** OpenAPI/Swagger
- **Version control:** GitHub

## 3. System Scope

### In scope
- Customer registration, login, and profile management
- Vendor onboarding and vendor/store management
- Product catalog, categories, variants, images, and stock
- Cart, wishlist, checkout, and order history
- Coupons and discounts
- Reviews and ratings
- Notifications
- Admin management and audit logs

### Out of scope for v1
- Native mobile app
- Real-time chat
- AI recommendations
- Multi-currency checkout
- Delivery partner integration
- Subscription products
- Complex warehouse management

## 4. High-Level Architecture

The system follows a 3-layer web architecture:

1. **React frontend**
   - Renders pages and forms
   - Calls backend APIs
   - Stores access token securely in memory or a safe browser strategy chosen by the team
   - Handles route guards by role

2. **Spring Boot backend**
   - Exposes REST APIs
   - Handles authentication and authorization
   - Applies validation and business rules
   - Coordinates database access and file uploads
   - Returns consistent API responses and errors

3. **Supabase database/storage**
   - Stores all relational data in PostgreSQL
   - Stores product and vendor images in Supabase Storage
   - Uses foreign keys, enums, and indexes to keep data consistent

## 5. Frontend Architecture

### Suggested React folder structure
```text
src/
  app/
  components/
  features/
    auth/
    catalog/
    cart/
    checkout/
    orders/
    wishlist/
    vendor/
    admin/
    reviews/
    notifications/
  hooks/
  lib/
  routes/
  services/
  store/
  types/
```

### Frontend responsibilities
- Render public catalog pages
- Render authenticated dashboards
- Send and receive API requests
- Manage local UI state
- Validate form input before submit
- Show role-based navigation
- Display loading, error, and empty states

### Frontend route groups
- **Public**
  - `/`
  - `/products`
  - `/products/:slug`
  - `/categories/:slug`
  - `/vendors/:slug`
  - `/auth/login`
  - `/auth/register`

- **Customer**
  - `/account`
  - `/cart`
  - `/wishlist`
  - `/checkout`
  - `/orders`
  - `/addresses`

- **Vendor**
  - `/vendor/dashboard`
  - `/vendor/products`
  - `/vendor/orders`
  - `/vendor/coupons`
  - `/vendor/profile`

- **Admin**
  - `/admin/dashboard`
  - `/admin/users`
  - `/admin/vendors`
  - `/admin/categories`
  - `/admin/orders`
  - `/admin/audit-logs`

## 6. Backend Architecture

### Suggested Spring Boot package structure
```text
com.marketplace
  config
  controller
  dto
  entity
  exception
  mapper
  repository
  security
  service
  service.impl
  util
```

### Backend responsibilities
- Authentication and authorization
- Request validation
- Business logic
- Database transactions
- File upload metadata handling
- Notification generation
- Audit logging
- API response formatting

### Layer rules
- **Controller:** accept request, validate, call service, return response
- **Service:** contain business rules only
- **Repository:** handle persistence only
- **Entity:** map to database tables only
- **DTO:** carry request/response data only
- **Mapper:** convert entity ↔ DTO

Do not place business rules inside controllers or entities.

## 7. Authentication and Authorization

### Roles
- `CUSTOMER`
- `VENDOR`
- `ADMIN`

### Authentication flow
1. User submits email and password.
2. Backend verifies credentials.
3. Backend returns JWT access token.
4. Frontend stores token and uses it for later requests.
5. Role guard on frontend hides invalid pages.
6. Spring Security on backend protects every endpoint.

### Rules
- Email must be unique.
- Passwords must be hashed with BCrypt.
- Admin-only routes must be blocked on the backend, not only the frontend.
- Vendor users may only edit their own store and products.
- Customers may only manage their own cart, wishlist, addresses, and orders.

## 8. Core Domain Modules

### 8.1 User Module
Responsible for:
- registration
- login
- profile update
- password change
- role handling
- account status handling

### 8.2 Vendor Module
Responsible for:
- vendor application
- store profile
- approval workflow
- logo/banner upload
- store metadata

### 8.3 Catalog Module
Responsible for:
- categories
- products
- product variants
- product attributes
- product images
- stock information
- search and filter

### 8.4 Cart and Wishlist Module
Responsible for:
- cart creation
- cart item update
- wishlist creation
- wishlist item update

### 8.5 Order Module
Responsible for:
- checkout
- order creation
- order items
- address snapshot usage
- order status tracking
- payment record creation

### 8.6 Promotion Module
Responsible for:
- coupons
- discount validation
- coupon usage limits
- date window checks

### 8.7 Review Module
Responsible for:
- review submission
- rating storage
- verification checks
- admin moderation if needed

### 8.8 Notification Module
Responsible for:
- order updates
- vendor approval updates
- coupon or system alerts
- read/unread state

### 8.9 Audit Module
Responsible for:
- critical action logging
- entity change history
- troubleshooting and traceability

## 9. Request Flow by Feature

### 9.1 Product browsing
React page -> GET catalog API -> Spring service -> repository -> database -> response -> render list

### 9.2 Add to cart
React form -> POST cart item API -> verify variant availability -> update cart tables -> return updated cart

### 9.3 Checkout
React checkout page -> POST order API -> validate addresses and cart -> create order + order items + payment row -> clear cart -> return order summary

### 9.4 Vendor product creation
Vendor dashboard -> create product form -> POST product API -> validate vendor ownership -> insert product and variants -> upload images -> return product ID

### 9.5 Admin approval
Admin dashboard -> approve vendor API -> set vendor status -> record audit log -> notify vendor

## 10. API Design Rules

### General rules
- Use plural nouns for resources.
- Use REST semantics.
- Keep endpoint names stable.
- Return one consistent response format.
- Never expose raw database entities to the frontend.

### Suggested response shape
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": { }
}
```

### Error response shape
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [ ]
}
```

## 11. Suggested API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Users
- `GET /api/users/me`
- `PATCH /api/users/me`
- `PATCH /api/users/me/password`

### Categories
- `GET /api/categories`
- `GET /api/categories/{slug}`
- `POST /api/admin/categories`
- `PATCH /api/admin/categories/{id}`

### Products
- `GET /api/products`
- `GET /api/products/{slug}`
- `POST /api/vendor/products`
- `PATCH /api/vendor/products/{id}`
- `POST /api/vendor/products/{id}/images`

### Carts
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/{id}`
- `DELETE /api/cart/items/{id}`

### Wishlist
- `GET /api/wishlist`
- `POST /api/wishlist/items`
- `DELETE /api/wishlist/items/{id}`

### Orders
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/{id}`
- `PATCH /api/vendor/orders/{id}/status`
- `PATCH /api/admin/orders/{id}/status`

### Coupons
- `GET /api/coupons`
- `POST /api/vendor/coupons`
- `PATCH /api/vendor/coupons/{id}`

### Reviews
- `POST /api/reviews`
- `GET /api/products/{id}/reviews`

### Notifications
- `GET /api/notifications`
- `PATCH /api/notifications/{id}/read`

### Admin
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `GET /api/admin/vendors`
- `PATCH /api/admin/vendors/{id}/approve`
- `PATCH /api/admin/vendors/{id}/reject`
- `GET /api/admin/audit-logs`

## 12. File Upload Architecture

### Use case
- Vendor logo
- Vendor banner
- Product images
- Optional profile picture

### Rules
- Store binary files in Supabase Storage
- Store only metadata and paths in the `images` table
- Never store large files directly in the database
- Every image row must belong to an uploader

## 13. Security Rules

- Use BCrypt for password hashing
- Protect every write endpoint with authentication
- Restrict vendor endpoints to vendor owners
- Restrict admin endpoints to admin role
- Validate input on backend even if frontend already validates
- Use soft delete where the database design expects it
- Record sensitive actions in `audit_logs`

## 14. Coding Rules for AI Assistance

To reduce hallucination while coding with AI, follow these rules:

1. Only implement features that exist in this document.
2. Do not invent tables, columns, or APIs.
3. Do not invent business logic outside the listed rules.
4. If a feature is missing here, add it to this document first.
5. Keep DTO names aligned with the resource names in this file.
6. Keep entity names aligned with the database document.
7. Do not rename tables casually after code is written.
8. Use one source of truth for enums and status values.

## 15. Recommended Build Order

1. Authentication and roles
2. Categories and products
3. Images and file upload
4. Cart and wishlist
5. Orders and payments
6. Vendor dashboard
7. Reviews and notifications
8. Admin dashboard
9. Audit logs and cleanup
10. Testing and deployment

## 16. Non-Functional Targets

- Common pages should load quickly on normal connections
- APIs should return predictable errors
- Tables should remain queryable with proper indexes
- Backend code should be modular and testable
- The system should be safe to extend later without breaking core flows
