# Labor Pro Catalog — Next Steps

## Current State (Feb 11, 2026)
- **2,137 products** across 22 categories
- **1,483 products** (69%) have images
- **654 products** (31%) have NO images (pricelist-only, no web presence)

---

## 1. Fix Product Names (Priority: HIGH)

### Problem
- **375 products** have NO name at all (only generic "Kategorija: ..." description)
- **1,144 products** have ALL-CAPS English names from pricelist (e.g. "HAIR BONNET DRYER WITH TRIPOD")
- **618 products** have proper Latvian names (e.g. "Profesionāls matu fēns LABOR PRO 'ELITE ZEPHYR'")

### Solution: Scrape names from hairsera.lv/lt
- Database has **339 hairsera.lv URLs** and **578 hairsera.lt URLs**
- Scrape proper product names from those pages (~580 products fixable)
- For remaining ~900 without URLs: translate ALL-CAPS English names to proper Latvian format

### Implementation
1. Create `scripts/scrape_product_names.py`
2. Read source URLs from `data/products.db` (columns: `source_url_lv`, `source_url_lt`)
3. Scrape product title from each page (WooCommerce `.product_title` selector)
4. Update `products.json` with scraped names
5. For products without URLs, use Google Translate (EN->LV) with proper formatting

---

## 2. Handle Missing Images (Priority: MEDIUM)

### 654 products have no images at all

### Options (pick one):

**Option A: Hide imageless products (Recommended)**
- Filter out products without images from the catalog
- Cleanest user experience
- Add filter in `export_data.py` or in the Next.js data loading

**Option B: Show with placeholder**
- Keep all products visible with a "Nav attēla" (No image) placeholder
- Complete catalog but less polished

**Option C: Flag/separate them**
- Show imageless products in a different section or with reduced visibility
- Middle ground approach

---

## 3. Other Pending Items

### Lithuanian locale
- Add `/lt/` routes alongside `/lv/`
- Products already have `name_en` field; need `name_lt` translations

### Contact form
- Currently using `mailto:info@hairsera.lv` links
- Could add a proper contact form page

### Deployment
- Production build works: `npm run build`
- All 22 category pages pre-render via SSG
- Ready to deploy to Vercel, Netlify, or similar

### 7 failed Nextcloud image downloads
- From initial disk space issue
- Can be retried with `scripts/download_nextcloud_images.py`

---

## Technical Reference

### Key files
- `scripts/export_data.py` — Main data pipeline (DB + Excel -> JSON)
- `scripts/download_nextcloud_images.py` — Nextcloud WebDAV image downloader
- `scripts/scrape_web_images.py` — hairsera.lv/lt image scraper
- `scripts/generate_descriptions.py` — Product description generator
- `data/products.json` — 2,137 products (generated)
- `data/categories.json` — 22 categories (generated)
- `public/images/products/{SKU}/` — Local product images

### Data sources
- `C:\Users\Ralfs\Desktop\Webpagecopy\data\products.db` — 794 products with LV names, descriptions, source URLs
- `C:\Users\Ralfs\Desktop\Webpagecopy\data\LAB20 CATALOGUE PRICELIST cenu analīze.xlsx` — 1,668 products with EN names, prices, EAN
- `C:\Users\Ralfs\Desktop\Webpagecopy\data\laborpro_nextcloud_catalog.xlsx` — Brand info

### Dev server
- `cd laborpro-catalog && npm run dev`
- http://localhost:3000/lv/categories
- If port conflict: `npx kill-port 3000` then restart
- After data changes: restart dev server to clear SSG cache
