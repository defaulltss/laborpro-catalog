# Admin Panel — Feature Documentation

## Context
The Labor Pro catalog (2,137 products) has a password-protected admin panel for managing product visibility and editing product data. Uses Turso (hosted SQLite) for persistence, with base product data in JSON files remaining untouched.

## Dependencies
```
npm install @libsql/client bcryptjs jose
npm install -D @types/bcryptjs
```
- `@libsql/client` — Turso database client
- `bcryptjs` — Password hash verification (pure JS, no native deps)
- `jose` — JWT sign/verify (Edge-compatible, works in middleware)

## Environment Variables (`.env.local` + Vercel settings)
```
TURSO_DATABASE_URL=libsql://laborpro-....turso.io
TURSO_AUTH_TOKEN=<token>
ADMIN_PASSWORD_HASH=<bcrypt hash of admin password>
ADMIN_JWT_SECRET=<random 64-char hex string>
```

## Database Tables

### `product_visibility`
Stores products that have been explicitly toggled. Products with no row = visible by default.
```sql
CREATE TABLE IF NOT EXISTS product_visibility (
  product_id INTEGER PRIMARY KEY,
  visible INTEGER NOT NULL DEFAULT 1
);
```

### `product_overrides`
Stores per-field edits as JSON. Only changed fields are stored (space-efficient). Original values are always recoverable.
```sql
CREATE TABLE IF NOT EXISTS product_overrides (
  product_id INTEGER PRIMARY KEY,
  overrides TEXT NOT NULL  -- JSON object with only changed fields
);
```
Example row: `product_id=3, overrides='{"name_lv":"Jauns nosaukums","price":249.99}'`

## Architecture: Override Pattern
```
Base JSON (products.json)  +  Turso overrides  →  Final product data
```
- Only changed fields are stored in Turso
- Original values are always recoverable (reset to original)
- 60-second cache TTL for both visibility and overrides
- Fail-open: if Turso is unreachable, base JSON data is served

## Files

### Core Libraries
1. **`src/lib/db.ts`** — Turso client + cached queries (60s TTL)
   - `getHiddenProductIds()` → cached `Set<number>`
   - `setProductVisibility(id, visible)` → upsert + invalidate cache
   - `getAllVisibilityStates()` → `Map<number, boolean>` for admin panel
   - `getProductOverrides()` → cached `Map<number, Record<string, unknown>>` (all overrides)
   - `setProductOverrides(productId, overrides)` → upsert JSON + invalidate cache
   - `deleteProductOverrides(productId)` → remove row + invalidate cache

2. **`src/lib/data.ts`** — Product data layer
   - `getAllProducts()` → **async**, returns products with overrides merged
   - `getAllBaseProducts()` → sync, returns raw JSON products (no overrides, for admin original values)
   - `getProductsByCategory()` → async, applies overrides + filters hidden
   - `getProductById()` → async, applies overrides + hides hidden
   - `searchProducts()` → async, applies overrides + filters hidden
   - `getCategoriesWithCounts()` → async, accounts for overrides + hidden products
   - Internal `applyOverrides()` helper merges override fields on top of base products

3. **`src/lib/auth.ts`** — Auth utilities
   - `verifyPassword(password)` — bcryptjs compare against env hash
   - `createSession()` / `verifySession(token)` — JWT via jose
   - Cookie config (HttpOnly, Secure, SameSite=Lax, 7-day expiry)

### Middleware
4. **`middleware.ts`** (project root) — Protect `/admin/*` and `/api/admin/*` routes (except login). Verify JWT cookie, redirect to `/admin/login` if invalid.

### Admin Pages
5. **`src/app/admin/layout.tsx`** — Admin layout (noindex, brand-cream bg)
6. **`src/app/admin/page.tsx`** — Server component: loads base products, overrides, visibility states, and categories
7. **`src/app/admin/AdminDashboard.tsx`** — Client component: product table with search, filter, toggle switches, edit buttons, edited indicators, pagination (50/page), logout
8. **`src/app/admin/AdminEditModal.tsx`** — Client component: per-field editing modal with reset buttons, override indicators, category dropdown
9. **`src/app/admin/AdminToggle.tsx`** — Reusable toggle switch component
10. **`src/app/admin/login/page.tsx`** — Login page (server component)
11. **`src/app/admin/login/AdminLoginForm.tsx`** — Login form (client component)

### API Routes
12. **`src/app/api/admin/login/route.ts`** — POST: verify password, set session cookie
13. **`src/app/api/admin/logout/route.ts`** — POST: clear session cookie
14. **`src/app/api/admin/visibility/route.ts`** — GET: all states, PATCH: toggle one product
15. **`src/app/api/admin/products/[id]/route.ts`** — PATCH: upsert product overrides, DELETE: reset product to original

## Auth Flow
1. Admin visits `/admin` → middleware checks JWT cookie → redirects to `/admin/login`
2. Admin enters password → POST `/api/admin/login` → bcrypt verify → JWT cookie set
3. Admin redirected to `/admin` dashboard → middleware passes
4. JWT expires after 7 days → re-login required

## Admin Panel Features

### Product Visibility
- Toggle switches to show/hide products from the public catalog
- Filter: All / Visible / Hidden
- Hidden products return 404 on direct URL access

### Product Editing
- Edit button on each product row opens the edit modal
- Editable fields: Name (LV/EN), Description (LV/EN), Price, Brand, EAN, Category
- SKU is read-only (changing it would break image URLs)
- Per-field reset buttons restore original JSON values
- Fields with overrides show amber "edited" indicator
- Category dropdown populated from categories.json
- Textarea for descriptions, number input for price
- "Edited" badge on product rows that have overrides
- Stats card showing total edited product count

### General
- Search by product name or SKU
- Stats bar: total, visible, hidden, edited counts
- Table: thumbnail, name, SKU, category, status badge, actions (edit + toggle)
- 50 products per page with pagination
- Logout button
- Matches existing brand theme (pink/cream/peach)

## Verification
1. `npm run build` — confirm no type errors
2. `npm run dev` → `/admin` → toggle products, edit fields, reset overrides → check public pages
3. Deploy to Vercel with env vars set → test live
