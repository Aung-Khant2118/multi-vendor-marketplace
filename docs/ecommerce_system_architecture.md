# E-Commerce Multi-Vendor Marketplace — System Architecture

## 1. Purpose

This document is the coding blueprint for the platform. It defines the modules, boundaries, request flow, API responsibilities, and deployment shape so implementation stays consistent and does not drift into guesswork. This version reflects the current state of the codebase: implemented features are listed as **Implemented**, anything still to be built is listed as **Planned**.

## 2. Tech Stack

- **Frontend:** Next.js (Pages Router) with React
  - `axios` for API calls, `react-hook-form` + `yup` for form validation, `react-toastify` for notifications, `react-icons` for icons, `jwt-decode` for JWT parsing
  - Plain CSS with CSS custom properties (no Tailwind, no shadcn/ui, no CSS modules)
- **Backend:** Spring Boot (Java 21), Spring Data JPA, Spring Security
- **Database:** Supabase PostgreSQL
- **File storage:** Supabase Storage (product images)
- **Auth:** Spring Security with JWT (jjwt) + BCrypt password hashing
- **API style:** REST JSON
- **Validation:** Jakarta Validation (`@Valid`) + method security (`@PreAuthorize`)
- **Version control:** GitHub

## 3. System Scope

### In scope
- Customer registration, login, and profile management
- Vendor onboarding and vendor/store management
- Product catalog, categories, variants, images, and stock
- Cart, checkout, and order history
- Vendor order management and dashboard stats

### Out of scope for v1
- Native mobile app
- Real-time chat
- AI recommendations
- Multi-currency checkout
- Delivery partner integration
- Subscription products
- Complex warehouse management

### Planned (in scope but not yet implemented)
- Coupons and discounts
- Reviews and ratings
- Notifications
- Admin management (user management, vendor approval) and audit logs
- Product search and filtering

## 4. High-Level Architecture

The system follows a 3-layer web architecture:

1. **Next.js frontend**
   - Renders pages and forms
   - Calls backend APIs through a shared axios client
   - Stores the JWT access token in `localStorage`
   - Handles route guards by role (client-side redirects)

2. **Spring Boot backend**
   - Exposes REST APIs
   - Handles authentication and authorization
   - Applies validation and business rules
   - Coordinates database access and file uploads
   - Returns consistent API responses and errors

3. **Supabase database/storage**
   - Stores all relational data in PostgreSQL
   - Stores product images in Supabase Storage
   - Uses foreign keys, enums, and indexes to keep data consistent

## 5. Frontend Architecture

### Framework and routing
- **Pages Router** under `src/pages/` (the `src/app/` directory is unused).
- `next.config.js` uses `output: 'export'` (static export) with `images.unoptimized: true`.
- All pages are client-rendered; guards run in `useEffect`.

### Folder structure (complete project version)
Items marked `[planned]` are the target structure for features in the backlog; everything else exists today.

```text
src/
  components/
    Auth/
      LoginForm.js
      RegisterForm.js
      VendorRegisterForm.js
    Layout/                     # shared layout components [planned]
      Navbar.js
      Footer.js
      Sidebar.js
      Layout.js
    ui/                         # reusable UI components [planned]
      Button.js
      Card.js
      Input.js
      Modal.js
      Table.js
      Badge.js
      ...
  features/
    auth/
      AuthContext.js
    catalog/                    # [planned]
    cart/                       # [planned]
    checkout/                   # [planned]
    orders/                     # [planned]
    wishlist/                   # [planned]
    vendor/                     # [planned]
    admin/                      # [planned]
    reviews/                    # [planned]
    notifications/              # [planned]
  hooks/                        # [planned]
  lib/
    validators.js               # placeholder
  pages/
    _app.js
    index.js                    # / -> redirect by auth state
    dashboard.js                # /dashboard
    cart.js                     # /cart
    orders.js                   # /orders
    checkout.js                 # /checkout (implemented)
    wishlist.js                 # /wishlist [planned]
    account.js                  # /account [planned]
    addresses.js                # /addresses [planned]
    auth/
      login.js                  # /auth/login
      register.js               # /auth/register
      vendor-register.js        # /auth/vendor-register
      forgot-password.js        # /auth/forgot-password [planned]
      reset-password.js         # /auth/reset-password [planned]
      verify-email.js           # /auth/verify-email [planned]
    categories/
      [slug].js                 # /categories/[slug] [planned]
    products/
      index.js                  # /products
      [id].js                   # /products/[id]
    vendor/
      dashboard.js              # /vendor/dashboard [planned]
      products.js               # /vendor/products
      orders.js                 # /vendor/orders
      coupons.js                # /vendor/coupons [planned]
      profile.js                # /vendor/profile [planned]
    admin/                      # [planned]
      dashboard.js              # /admin/dashboard
      users.js                  # /admin/users
      vendors.js                # /admin/vendors
      categories.js             # /admin/categories
      orders.js                 # /admin/orders
      audit-logs.js             # /admin/audit-logs
  routes/                       # [planned]
  services/
    api.js                      # axios client + API objects
  store/                        # [planned]
  styles/
    globals.css                 # single global stylesheet + design tokens
  types/                        # [planned]
```

### Frontend responsibilities
- Render public catalog pages
- Render authenticated dashboards
- Send and receive API requests through `src/services/api.js`
- Manage local UI state with React state and the auth context
- Validate form input before submit (`react-hook-form` + `yup`)
- Show role-based navigation and guards
- Display loading, error, and empty states

### API client (`src/services/api.js`)
- Base URL from `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`), with `/api` appended when missing.
- Request interceptor reads `localStorage.getItem('token')` and sets `Authorization: Bearer <token>`.
- Response interceptor redirects to `/auth/login` on `401`.
- Exported objects: `authAPI`, `userAPI`, `vendorAPI`, `categoryAPI`, `customerAPI`.

### Token and auth handling
- JWT stored in `localStorage` under the `"token"` key.
- Session is restored by decoding the stored token (`jwt-decode`) to read `email` (subject) and `role` claim.
- `AuthContext` exposes `user`, `token`, `loading`, `login`, `register`, `registerVendor`, `logout`, `fetchCurrentUser`, `isAuthenticated`, `isVendor`, `isAdmin`.
- Role detection: `isVendor = user.role === 'VENDOR'`, `isAdmin = user.role === 'ADMIN'`.

### Route guards (actual)
- `/` → `/dashboard` if authenticated, otherwise `/auth/login`.
- `/dashboard`, `/cart`, `/orders`, `/products`, `/products/[id]` → `/auth/login` if not authenticated.
- `/vendor/products`, `/vendor/orders` → `/auth/login` if not authenticated; `/dashboard` if not a vendor.

### Route groups (complete project version)
Items marked `[planned]` are not yet implemented.

- **Public**
  - `/`
  - `/auth/login`
  - `/auth/register`
  - `/auth/vendor-register`
  - `/auth/forgot-password` `[planned]`
  - `/auth/reset-password` `[planned]`
  - `/auth/verify-email` `[planned]`
  - `/products`
  - `/products/[id]`
  - `/categories/[slug]` `[planned]`

- **Customer (authenticated)**
  - `/dashboard`
  - `/cart`
  - `/orders`
  - `/orders/[id]` `[planned]`
  - `/checkout` (implemented, see 17.10)
  - `/wishlist` `[planned]`
  - `/account` `[planned]`
  - `/addresses` `[planned]`

- **Vendor**
  - `/vendor/dashboard` `[planned]`
  - `/vendor/products`
  - `/vendor/orders`
  - `/vendor/coupons` `[planned]`
  - `/vendor/profile` `[planned]`

- **Admin** `[planned]`
  - `/admin/dashboard`
  - `/admin/users`
  - `/admin/vendors`
  - `/admin/categories`
  - `/admin/orders`
  - `/admin/audit-logs`

### Theming
- Single global stylesheet `src/styles/globals.css` using CSS custom properties in `:root`.
- Brand palette: Navy `#2F4156` (primary), Teal `#567C8D` (secondary), Sky Blue `#C8D9E6` (accent/borders), Beige `#F5F0EB` (surfaces), White `#FFFFFF` (content background).
- Button variants: `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-soft`, `.btn-google`.
- All pages share a consistent footer (`.auth-footer` with brand, copyright, and links).

## 6. Backend Architecture

### Package structure (complete project version)
Each module follows the standard layout: `controller`, `dto`, `entity`, `mapper`, `repository`, `service` (shown for the full target structure; items marked `[planned]` are not yet implemented).

```text
com.group5.marketplace
  MarketplaceApplication
  address/
    controller/          # AddressController (/api/addresses)
    dto/                 # AddressRequest, AddressResponse
    entity/              # Address, AddressType
    mapper/              # AddressMapper
    repository/          # AddressRepository
    service/             # AddressService
  admin/
    controller/          # [planned] AdminController
    dto/                 # [planned]
    service/             # [planned]
  audit/
    entity/              # [planned] AuditLog
    repository/          # [planned]
    service/             # [planned]
  auth/
    config/              # SecurityConfig
    controller/          # AuthController, PasswordResetController, TestController
    dto/
    security/            # JwtAuthenticationFilter, JwtService, CustomUserDetailsService
    service/             # AuthService, PasswordResetService
  cart/
    entity/              # Cart, CartItem
    repository/
  category/
    controller/          # CategoryController (public + /api/admin/categories)
    dto/
    entity/
    mapper/
    repository/
    service/             # CategoryService, CategoryServiceImpl
  common/                # GlobalExceptionHandler (@RestControllerAdvice), MailService
  notification/
    controller/          # [planned]
    dto/                 # [planned]
    entity/              # [planned] Notification
    mapper/              # [planned]
    repository/          # [planned]
    service/             # [planned]
  order/
    controller/          # CartController, OrderController, VendorOrderController
    dto/
    entity/              # Order, OrderItem, Payment + enums
    mapper/              # [planned]
    repository/
    service/             # OrderService
  product/
    controller/          # ProductController, ProductVariantController
    dto/
    entity/              # Product, ProductVariant, ProductImage
    mapper/
    repository/
    service/             # ProductService, ProductVariantService, ProductImageService
  promotion/
    controller/          # [planned]
    dto/                 # [planned]
    entity/              # [planned] Coupon
    mapper/              # [planned]
    repository/          # [planned]
    service/             # [planned]
  review/
    controller/          # [planned]
    dto/                 # [planned]
    entity/              # [planned] Review
    mapper/              # [planned]
    repository/          # [planned]
    service/             # [planned]
  storage/
    supabase/
      SupabaseStorageClient
  user/
    controller/          # UserController (/api/users/me, /api/users/me/password)
    dto/                 # UpdateProfileRequest, ChangePasswordRequest
    entity/              # User, Role
    mapper/              # UserMapper
    repository/
    service/             # UserService
    util/                # CurrentUserService
  vendor/
    controller/          # [planned]
    dto/
    entity/              # Vendor + VendorStatus
    mapper/              # [planned]
    repository/
    service/             # VendorService
  wishlist/
    controller/          # WishlistController (/api/wishlist)
    dto/                 # WishlistResponse, WishlistItemRequest, WishlistItemResponse
    entity/              # Wishlist, WishlistItem
    mapper/              # WishlistMapper
    repository/          # WishlistRepository, WishlistItemRepository
    service/             # WishlistService
```

### Backend responsibilities
- Authentication and authorization
- Request validation
- Business logic
- Database transactions
- File upload metadata handling and storage delegation
- API response formatting
- Error handling via a global exception handler

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

### Status enums (actual)
- **VendorStatus:** `PENDING`, `ACTIVE`, `REJECTED`, `SUSPENDED`
- **OrderStatus:** `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELED`, `REFUNDED`
- **OrderItemStatus:** `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `REFUNDED`
- **PaymentStatus:** `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`
- **PaymentMethod:** `CARD`, `WALLET`, `BANK_TRANSFER`, `CASH_ON_DELIVERY`
- **AddressType:** `SHIPPING`, `BILLING`

### Authentication flow (actual)
1. User submits email and password.
2. Backend verifies credentials and returns a JWT access token plus a longer-lived refresh token (`LoginResponse.token`, `LoginResponse.refreshToken`).
3. Frontend stores the token in `localStorage` and attaches it as `Authorization: Bearer <token>`.
4. `JwtAuthenticationFilter` validates the token and loads the user (`CustomUserDetailsService` by email).
5. Role guard on the frontend redirects invalid users; Spring Security + `@PreAuthorize` protects the backend.
6. `POST /api/auth/refresh` accepts a valid refresh token and issues a fresh access token + refresh token pair.
7. Logout blacklists the token in memory (`JwtService`) and the frontend clears `localStorage`.

### Registration (actual)
- `POST /api/auth/register` — customer registration (firstName, lastName, email, password); creates the account with `emailVerified = false`, issues a verification token, and emails the verification link.
- `POST /api/auth/register-vendor` — vendor registration (adds storeName, businessAddress, storeDescription); creates a `Vendor` profile with status `PENDING` and emails the verification link.
- `GET /api/auth/verify/{token}` — marks the email verified; the token expires after 24 hours.

### Password reset (actual)
- `POST /api/auth/forgot-password` — generates a UUID reset token with a 1-hour expiry stored on the user and emails a reset link (token is never returned in the response).
- `POST /api/auth/reset-password` — accepts token + new password.
- Emails are delivered by `MailService`: when `spring.mail.host` is configured they are sent via SMTP, otherwise the message (with the link) is logged to the console for local development.

### Profile and password (actual)
- `PATCH /api/users/me` — update firstName, lastName, phoneNumber (authenticated).
- `PATCH /api/users/me/password` — change password after verifying the current password (authenticated).
- `GET /api/auth/me` exposes `username`, `phoneNumber`, and `emailVerified` in addition to the existing fields.

### Rules
- Email must be unique.
- Passwords must be hashed with BCrypt.
- Admin-only routes must be blocked on the backend, not only the frontend.
- Vendor endpoints require the `VENDOR` role (`@PreAuthorize`), and products/orders are scoped to the authenticated vendor's user id.
- Customers may only manage their own cart and orders.

## 8. Core Domain Modules

### 8.1 User Module — Implemented
Responsible for:
- registration
- login
- profile/me retrieval (`GET /api/auth/me`)
- profile update (`PATCH /api/users/me`)
- password change (`PATCH /api/users/me/password`)
- email verification (`GET /api/auth/verify/{token}`)
- token refresh (`POST /api/auth/refresh`)
- role handling
- vendor status exposure in `/api/auth/me`

### 8.2 Vendor Module — Partially implemented
Responsible for:
- vendor application (implemented: `PENDING` on registration)
- store profile creation (implemented)
- approval workflow (planned: vendor approval/rejection endpoints do not exist yet)
- logo/banner upload (planned)
- store metadata (implemented: storeName, slug, description, businessEmail)

### 8.3 Catalog Module — Implemented (search/filter planned)
Responsible for:
- categories (implemented: public list/read + admin create/update/soft-delete)
- products (implemented: public read, vendor create/update/delete)
- product variants (implemented: vendor CRUD + stock delta updates)
- product attributes (implemented as variant `attributes` string)
- product images (implemented via Supabase Storage)
- stock information (implemented on variants)
- search and filter (planned)

### 8.4 Cart Module — Implemented
Responsible for:
- cart creation (implicit, one per user)
- cart item add (`POST /api/cart`)
- cart retrieval (`GET /api/cart`)

### 8.5 Wishlist Module — Implemented
Responsible for:
- wishlist retrieval (`GET /api/wishlist`)
- wishlist item add (`POST /api/wishlist/items`)
- wishlist item removal (`DELETE /api/wishlist/items/{id}`)
- a single wishlist per user, created implicitly on first access

### 8.6 Address Module — Implemented
Responsible for:
- customer address book (list, create, update, delete under `/api/addresses`)
- `SHIPPING`/`BILLING` address types
- a single default address per user (setting one unsets others)
- ownership enforcement (addresses are scoped to the authenticated user)

### 8.7 Order Module — Implemented
Responsible for:
- checkout (implemented: creates Order + OrderItems + Payment, decrements stock, clears cart)
- order creation
- order items
- shipping/billing address snapshots stored on the order (name, phone, line, city, etc.) plus the address ids
- order status tracking (order + per-item status)
- payment record creation (implemented, default `CASH_ON_DELIVERY`)
- vendor order status updates (`PUT /api/vendor/orders/{id}`)

### 8.8 Promotion Module — Planned
Responsible for:
- coupons
- discount validation
- coupon usage limits
- date window checks

### 8.9 Review Module — Planned
Responsible for:
- review submission
- rating storage
- verification checks
- admin moderation if needed

### 8.10 Notification Module — Planned
Responsible for:
- order updates
- vendor approval updates
- coupon or system alerts
- read/unread state

### 8.11 Audit Module — Planned
Responsible for:
- critical action logging
- entity change history
- troubleshooting and traceability

## 9. Request Flow by Feature

### 9.1 Product browsing (implemented)
Next.js page -> `GET /api/products` -> Spring service -> repository -> database -> response -> render list

### 9.2 Add to cart (implemented)
Next.js form -> `POST /api/cart` (variantId + quantity) -> verify variant exists -> upsert cart item -> return updated cart

### 9.3 Checkout (implemented)
Next.js checkout page -> `POST /api/orders` -> validate cart + shipping/billing address -> compute shipping/tax -> create order (with address snapshots) + order items + payment row -> decrement stock -> clear cart -> return order summary

### 9.4 Vendor product creation (implemented)
Vendor dashboard -> create product form -> `POST /api/vendor/products` -> validate vendor ownership -> insert product -> add variants (`POST /api/vendor/products/{productId}/variants`) -> upload images (`POST /api/vendor/products/{id}/images`) -> return product

### 9.5 Vendor order status update (implemented)
Vendor orders page -> `PUT /api/vendor/orders/{id}` (status) -> set order + item status -> return updated order

### 9.6 Admin category management (implemented)
Admin flow (API-ready) -> `POST/PATCH/DELETE /api/admin/categories` -> set category fields / soft-delete

### 9.7 Admin vendor approval (planned)
Admin dashboard -> approve vendor API -> set vendor status -> record audit log -> notify vendor

## 10. API Design Rules

### General rules
- Use plural nouns for resources.
- Use REST semantics.
- Keep endpoint names stable.
- Return one consistent response format.
- Never expose raw database entities to the frontend.

### Success response shape (actual)
```json
{
  "success": true,
  "data": { }
}
```

### Error response shape (actual)
```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [ ]
}
```

## 11. API Endpoints

### Implemented

#### Authentication
- `POST /api/auth/register`
- `POST /api/auth/register-vendor`
- `POST /api/auth/login` (returns access + refresh token)
- `POST /api/auth/refresh`
- `GET /api/auth/verify/{token}` (email verification)
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

#### Users
- `PATCH /api/users/me`
- `PATCH /api/users/me/password`

#### Categories
- `GET /api/categories`
- `GET /api/categories/{slug}`
- `POST /api/admin/categories` (ADMIN)
- `PATCH /api/admin/categories/{id}` (ADMIN)
- `DELETE /api/admin/categories/{id}` (ADMIN, soft delete)

#### Products
- `GET /api/products`
- `GET /api/products/{slug}`
- `GET /api/products/id/{id}`
- `GET /api/products/{productId}/variants`
- `GET /api/variants/{id}`
- `GET /api/vendor/products` (VENDOR)
- `GET /api/vendor/dashboard` (VENDOR)
- `POST /api/vendor/products` (VENDOR)
- `PATCH /api/vendor/products/{id}` (VENDOR)
- `DELETE /api/vendor/products/{id}` (VENDOR)
- `POST /api/vendor/products/{id}/images` (VENDOR, multipart)
- `DELETE /api/vendor/products/{productId}/images/{imageId}` (VENDOR)
- `POST /api/vendor/products/{productId}/variants` (VENDOR)
- `PATCH /api/vendor/variants/{id}` (VENDOR)
- `PATCH /api/vendor/variants/{id}/stock` (VENDOR)
- `DELETE /api/vendor/variants/{id}` (VENDOR)

#### Carts
- `GET /api/cart`
- `POST /api/cart` (add item)

#### Wishlist
- `GET /api/wishlist` (list current user's wishlist)
- `POST /api/wishlist/items` (add a product)
- `DELETE /api/wishlist/items/{id}` (remove an item)

#### Addresses
- `GET /api/addresses` (list current user's addresses)
- `POST /api/addresses` (create)
- `PATCH /api/addresses/{id}` (update; supports partial)
- `DELETE /api/addresses/{id}` (delete)

#### Orders
- `POST /api/orders` (checkout)
- `GET /api/orders`
- `GET /api/orders/{id}`
- `POST /api/orders/{id}/cancel`
- `GET /api/vendor/orders` (VENDOR)
- `PUT /api/vendor/orders/{id}` (VENDOR, update status)

### Planned (not yet implemented)
- `POST /api/reviews`, `GET /api/products/{id}/reviews`
- `GET /api/coupons`, `POST /api/vendor/coupons`, `PATCH /api/vendor/coupons/{id}`
- `GET /api/notifications`, `PATCH /api/notifications/{id}/read`
- `GET /api/admin/dashboard`, `GET /api/admin/users`, `GET /api/admin/vendors`
- `PATCH /api/admin/vendors/{id}/approve`, `PATCH /api/admin/vendors/{id}/reject`
- `GET /api/admin/audit-logs`

## 12. File Upload Architecture

### Use case
- Product images (implemented)
- Vendor logo / banner (planned)
- Optional profile picture (planned)

### Rules
- Store binary files in Supabase Storage via `SupabaseStorageClient`.
- Store only metadata and paths in the `product_images` table (`url`, `uploaderId`, `primaryImage`).
- Never store large files directly in the database.
- Every image row must belong to an uploader (`uploaderId`).
- Object path convention: `products/{productId}/{timestamp}_{filename}`; the client receives the public URL.

## 13. Security Rules

- Use BCrypt for password hashing.
- JWT is signed with HMAC-SHA and validated on every request by `JwtAuthenticationFilter`.
- Public endpoints (`permitAll`): `/api/auth/**`, `/api/test`, `/api/products/**`, `/api/categories/**`, `/api/variants/**`.
- Admin endpoints (`/api/admin/**`) require the `ADMIN` role.
- All other endpoints require authentication.
- Vendor endpoints additionally require the `VENDOR` role via `@PreAuthorize`.
- Logout blacklists the JWT in memory.
- Validate input on the backend even if the frontend already validates (`@Valid`).
- Use soft delete where the database design expects it (categories).
- Record sensitive actions in `audit_logs` (planned).

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
9. A feature marked **Planned** must be moved to **Implemented** in this document only after its code lands.

## 15. Build Order and Status

1. Authentication and roles — **Implemented**
2. Categories — **Implemented**
3. Products and variants — **Implemented**
4. Product images and file upload — **Implemented**
5. Cart — **Implemented**
6. Orders and payments — **Implemented** (checkout computes shipping/tax, stores address snapshots; `POST /api/orders/{id}/cancel`; payment transitions on vendor status update)
7. Vendor dashboard and order management — **Implemented**
8. Auth refinements (refresh tokens, email verification, profile/password endpoints) — **Implemented (backend)**
9. Wishlist — **Implemented**
10. Coupons and promotions — **Planned**
11. Reviews and ratings — **Planned**
12. Notifications — **Planned**
13. Admin module (user management, vendor approval, audit logs) — **Planned**
14. Product search and filtering — **Planned**
15. Testing and deployment — **In progress**

## 16. Non-Functional Targets

- Common pages should load quickly on normal connections.
- APIs should return predictable errors.
- Tables should remain queryable with proper indexes.
- Backend code should be modular and testable.
- The system should be safe to extend later without breaking core flows.

## 17. Remaining Work (Backlog)

This is the complete, prioritized list of work that has not been implemented yet. Each item notes the backend and frontend work required. Items are grouped by feature area and roughly ordered by priority.

### 17.1 Address module — Backend implemented, frontend planned
- **Backend (implemented):**
  - `AddressController` with `GET /api/addresses`, `POST /api/addresses`, `PATCH /api/addresses/{id}`, `DELETE /api/addresses/{id}` (customer-scoped; `Address` entity and `AddressRepository` already existed).
  - `AddressService`, `AddressRequest`/`AddressResponse` DTOs, and a mapper.
  - Supports setting a default address (one per user) and `SHIPPING`/`BILLING` types.
- **Frontend (planned):**
  - `/addresses` page (list, create, edit, delete, set-default).
  - Address picker in checkout.

### 17.2 Wishlist — Backend implemented, frontend planned
- **Backend (implemented):**
  - New `wishlist` module: `Wishlist`/`WishlistItem` entities, repositories, `WishlistController`, `WishlistService`, `WishlistMapper`, and DTOs.
  - One wishlist per user, created implicitly on first access (`name` defaults to "My Wishlist").
  - Endpoints: `GET /api/wishlist`, `POST /api/wishlist/items` (body `{ productId }`), `DELETE /api/wishlist/items/{id}`. Add/remove return the updated wishlist; adding a duplicate product is rejected with 400.
- **Frontend (planned):**
  - `/wishlist` page and add/remove-from-wishlist actions on product cards and product detail.

### 17.3 Coupons and promotions — Planned
- **Backend:**
  - New `promotion` module: `Coupon` entity, repository, controller, service.
  - Coupon codes with discount types (percentage / fixed), usage limits, and date windows.
  - Validation and application during checkout.
  - Endpoints: `GET /api/coupons`, `POST /api/vendor/coupons`, `PATCH /api/vendor/coupons/{id}`, plus apply/validate at checkout.
- **Frontend:**
  - Coupon code input at checkout.
  - Vendor coupon management page (`/vendor/coupons`).

### 17.4 Reviews and ratings — Planned
- **Backend:**
  - New `review` module: `Review` entity, repository, controller, service.
  - Reviews tied to order items to prevent unverified reviews; admin moderation if needed.
  - Endpoints: `POST /api/reviews`, `GET /api/products/{id}/reviews`.
  - Compute and aggregate the `Vendor.rating` field (currently a stored scalar with no aggregation logic).
- **Frontend:**
  - Review submission form on order history.
  - Reviews list on product detail.
  - Rating display on product cards and vendor pages.

### 17.5 Notifications — Planned
- **Backend:**
  - New `notification` module: `Notification` entity, repository, controller, service.
  - Events: order updates, vendor approval updates, coupon/system alerts.
  - Read/unread state.
  - Endpoints: `GET /api/notifications`, `PATCH /api/notifications/{id}/read`.
- **Frontend:**
  - Notification bell/list in the navbar.
  - Read/unread handling and toast on new events.

### 17.6 Admin module — Planned
- **Backend:**
  - New `admin` module: `AdminController` and `AdminService`.
  - User management: list/search users, activate/suspend accounts.
  - Vendor management: list vendors, approve/reject (`PATCH /api/admin/vendors/{id}/approve`, `/reject`), set `VendorStatus`.
  - Dashboard stats: `GET /api/admin/dashboard` (counts, revenue, recent activity).
  - Audit log listing: `GET /api/admin/audit-logs` (needs the audit module first).
  - Category management endpoints already exist under `/api/admin/categories`.
- **Frontend:**
  - Admin layout/sidebar.
  - `/admin/dashboard`, `/admin/users`, `/admin/vendors` (with approve/reject actions), `/admin/categories` (CRUD UI), `/admin/orders`, `/admin/audit-logs`.
  - Admin route guard (`isAdmin`) on all admin pages.

### 17.7 Audit logging — Planned
- **Backend:**
  - New `audit` module: `AuditLog` entity, repository, service.
  - Record sensitive actions (admin approval/rejection, account status changes, destructive operations).
  - Optional entity change history (created/updated values).
  - Wire audit writes into `AuthService`, `AdminService`, and vendor flows.
- **Frontend:**
  - Read-only audit log table in admin area.

### 17.8 Product search, filtering, and pagination — Planned
- **Backend:**
  - Add query params to `GET /api/products` (`q`, `category`, `priceMin`, `priceMax`, `sort`, `page`, `size`).
  - Add `GET /api/categories/{slug}`-scoped product listing.
  - Return paginated responses.
- **Frontend:**
  - Search box in navbar.
  - Filter/sort controls on `/products`.
  - Category browsing (`/categories/[slug]` planned).
  - Pagination component.

### 17.9 Auth refinements — Backend implemented, frontend planned
- **Backend (implemented):**
  - `POST /api/auth/refresh` — issues a fresh access token + refresh token pair from a valid refresh token.
  - `GET /api/auth/verify/{token}` — email verification; registration now creates unverified accounts with a 24h verification token.
  - `PATCH /api/users/me` — profile update (firstName, lastName, phoneNumber).
  - `PATCH /api/users/me/password` — authenticated password change.
  - Password-reset and verification emails are sent via `MailService` (SMTP when `spring.mail.host` is configured, console log otherwise); tokens are no longer returned in responses.
- **Frontend (planned):**
  - Forgot-password and reset-password pages (`/auth/forgot-password`, `/auth/reset-password`).
  - Email verification page (`/auth/verify-email`) wired to `authAPI.verifyEmail`.
  - Account/profile page (`/account`) wired to `userAPI.updateProfile`.
  - Optional refresh-token handling in the axios client to avoid 401 redirects on expiry.

### 17.10 Order and payment enhancements — Backend implemented, frontend done
- **Backend (implemented):**
  - Shipping cost and tax are computed at checkout and configurable via `app.checkout.shipping-flat-rate`, `app.checkout.free-shipping-threshold`, `app.checkout.tax-rate` (defaults: $5 flat, free above $50, 8% tax).
  - Shipping/billing address snapshots (name, phone, line, city, etc.) are stored on the order (`shipping_*` / `billing_*` columns via an `AddressSnapshot` embeddable), not just ids.
  - `PaymentMethod` (`CASH_ON_DELIVERY`, `CARD`, `WALLET`, `BANK_TRANSFER`) is validated strictly; online methods simulate completion with a transaction id and `paidAt`.
  - `POST /api/orders/{id}/cancel` lets the customer cancel PENDING/CONFIRMED orders (restocks quantities, refunds a completed payment).
  - Payment transitions: COD payment completes on vendor `DELIVERED`; `REFUNDED` order status refunds a completed payment.
- **Frontend (implemented):**
  - `/checkout` page: address selection (+ inline add-address form), payment method, order summary with live shipping/tax/total, order notes.
  - `/orders/[id]` order detail page with status/payment tracking and cancel button.

### 17.11 Vendor module enhancements — Planned
- **Backend:**
  - Vendor logo/banner upload endpoints.
  - Vendor profile update endpoint.
  - Approval workflow endpoints (moved under Admin module) and `approvedBy`/`approvedAt` wiring.
- **Frontend:**
  - Vendor profile page (`/vendor/profile`).
  - Vendor dashboard with real stats (currently dashboard shows product/variant/stock counts only).
  - Product editing UI (create exists; edit/delete UI on `/vendor/products` is partial).

### 17.12 Frontend pages still missing — Planned
- `/wishlist` — wishlist page.
- `/addresses` — address book page.
- `/account` — customer profile page.
- `/categories/[slug]` — category listing page.
- `/orders/[id]` — order detail page (implemented, see 17.10).
- `/vendor/dashboard` — vendor dashboard page (route currently not present).
- `/vendor/coupons` — vendor coupon management page.
- `/admin/*` — admin pages (see 17.6).
- Navbar, sidebar, and shared layout components (currently only auth card + footer are shared).

### 17.13 Infrastructure and quality — Planned / In progress
- Add tests for auth, order, product, and vendor modules (only category has tests today).
- Configure Supabase storage credentials (`supabase.url`, `supabase.key`, `supabase.bucket`) via environment variables; remove committed secrets from `application-local.properties`.
- Move schema migrations to Flyway/Liquibase (`db/migration/V1__create_categories_table.sql` is not auto-applied today).
- Optional: OpenAPI/Swagger documentation.
- Deployment pipeline (frontend static export + backend container) and environment-specific config.

### 17.14 Suggested order of execution
1. ~~Auth refinements (verify email, refresh, profile endpoint) and `PATCH /api/users/me`~~ — **Done (backend)**; remaining frontend work listed in 17.9.
2. ~~Address module~~ — **Backend done** (unblocks checkout); remaining frontend work in 17.1.
3. ~~Checkout page + order enhancements~~ — **Done** (backend §17.10; frontend `/checkout`, `/orders/[id]`).
4. ~~Wishlist~~ — **Backend done**; remaining frontend work in 17.2.
5. Admin module (vendor approval, user management) + audit logs.
6. Reviews and ratings.
7. Notifications.
8. Coupons and promotions.
9. Product search/filter/pagination + category pages.
10. Vendor profile, dashboard, and coupon pages.
11. Infrastructure, testing, and deployment.
