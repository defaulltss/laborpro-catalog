# Labor Pro Product Catalog

Internal product catalog webapp for hairsera.lv — professional beauty supply products by Labor Pro.

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000/lv/categories

## Data Pipeline

Product data is merged from 3 sources via `scripts/export_data.py`:

| Source | Records | Provides |
|--------|---------|----------|
| `products.db` (SQLite) | 794 | LV names, descriptions, image URLs, categories |
| `LAB20 CATALOGUE PRICELIST cenu analīze.xlsx` | 1,668 | EN names, catalogue prices, EAN codes |
| `laborpro_nextcloud_catalog.xlsx` | 2,437 | Brand info |

**To regenerate data:**
```bash
python scripts/export_data.py
```

Outputs `data/categories.json` (22 categories) and `data/products.json` (2,137 merged products).

## Project Structure

```
data/                     Static JSON data files
  categories.json         22 product categories
  products.json           2,137 products
scripts/
  export_data.py          Merges DB + Excel -> JSON
src/
  app/
    layout.tsx            Root layout (Inter font, metadata)
    page.tsx              Redirects to /lv/categories
    lv/
      layout.tsx          Locale wrapper (max-width container)
      categories/
        page.tsx           Screen 1: Category grid
        [slug]/page.tsx    Screen 2: Product list
      products/
        [id]/page.tsx      Screen 3: Product detail
  components/
    Header.tsx            Page header with title/subtitle
    SearchBar.tsx         Client-side search input
    CategoryCard.tsx      Gradient category card
    CategoryGrid.tsx      Category grid with search
    ProductList.tsx       Product list with search
    ProductListItem.tsx   Single product row
    ProductDetail.tsx     Full product detail view
    BackButton.tsx        Navigation back button
    PriceDisplay.tsx      Price formatting (EUR)
  lib/
    types.ts              Category & Product interfaces
    data.ts               Data access functions (reads JSON)
```

## Screens

1. **Categories** (`/lv/categories`) — Responsive grid of 22 numbered cards (2 cols mobile, up to 6 cols desktop), pink/peach gradient, search
2. **Product List** (`/lv/categories/[slug]`) — Stacked rows on mobile, multi-column card grid on desktop (2–4 cols), with search
3. **Product Detail** (`/lv/products/[id]`) — Stacked on mobile, side-by-side (image left, info right) on desktop

## Responsive Layout (2026-02-10)

All 3 screens are fully responsive using Tailwind CSS breakpoints (`md:`, `lg:`, `xl:`):

- **Mobile** (<768px): Original compact layout — single column lists, 2-col category grid
- **Tablet** (768px+): Container widens to `max-w-7xl`, category grid expands to 4 cols, product list becomes a 2-col card grid, product detail goes side-by-side
- **Desktop** (1024px+): Category grid 5 cols, product grid 3 cols
- **Wide** (1280px+): Category grid 6 cols, product grid 4 cols

Key changes:
- Layout container: `max-w-lg` on mobile, `md:max-w-7xl` on desktop
- Product list items transform from horizontal rows (mobile) to vertical cards with white background (desktop)
- Product detail: image and info side-by-side with sticky image on desktop
- Search bar constrained to `md:max-w-md` on wide screens

## Theme

- Pink `#F4C6C0`, Peach `#FCEADE`, Cream `#FFF8F5`
- Card gradient: `from-brand-pink to-brand-peach`
- Font: Inter (latin-ext for Latvian diacritics)

## Next Steps

- Add product images (URLs already in data from hairsera.lt/lv)
- Lithuanian locale (`/lt/...`)
- Contact/order form
- Deploy to production
