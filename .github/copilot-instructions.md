# Copilot / AI Agent Instructions for this repository

Purpose: give AI coding agents the minimal, high-value context needed to be productive in this Next.js app.

- **Project Type:** Next.js (App Router) + TypeScript + Tailwind. Key UI code lives in the `src/app` App Router and reusable UI lives in `src/components`.

- **Routing & i18n:** The app uses locale-based folders under `src/app/[locale]` (e.g. localized routes, pages, and nested routes). See [src/i18n.ts](src/i18n.ts) and message bundles in [src/messages](src/messages) for translation patterns.

- **Data Layer:** Product and category data are static JSON files in the repository (`data/products.json`, `data/categories.json`). The app reads these through `src/lib/data.ts` which centralizes data access and transforms for components. When changing data shape, update both the JSON and `src/lib/data.ts`.

- **Components & Patterns:** Reusable UI components are under [src/components](src/components). Look for components named by feature (e.g. `ProductCard`, `ProductGallery`, `Header`, `Footer`). Components expect product objects shaped by `src/lib/data.ts` and use Tailwind classes for styling.

- **Pages & Examples:** Example routes to inspect when making changes:
  - Localized homepage and layout: [src/app/[locale]/layout.tsx](src/app/[locale]/layout.tsx)
  - Category listing: [src/app/[locale]/categories/page.tsx](src/app/[locale]/categories/page.tsx)
  - Category detail: [src/app/[locale]/categories/[slug]/page.tsx](src/app/[locale]/categories/[slug]/page.tsx)
  - Product detail: [src/app/[locale]/products/[id]/page.tsx](src/app/[locale]/products/[id]/page.tsx)

- **API & Server:** Minimal API route exists at [src/app/api/contact/route.ts](src/app/api/contact/route.ts). Prefer editing server code within `src/app/api` for backend behavior.

- **Static assets & images:** Public assets live in `public/images`. Data extraction / image harvesting helper scripts are in `/scripts` (notably `scripts/extract-images.py` and `scripts/parse-products.py`). Use these scripts to regenerate `data/*` artifacts rather than manual edits when possible.

- **Styling & Config:** Tailwind configuration is at [tailwind.config.ts](tailwind.config.ts) and global styles at [src/app/globals.css](src/app/globals.css). Respect utility-first classes and existing tokens when adding styles.

- **Developer workflows:** Check `package.json` for exact scripts. Typical commands you will likely use are:
  - `npm install` (or the repo's package manager)
  - `npm run dev` — run local dev server
  - `npm run build` — build for production
  - `npm run start` — serve the production build
  Confirm exact script names in [package.json](package.json) before using them.

- **Conventions & expectations:**
  - Data is primarily filesystem JSON; avoid introducing a DB unless requested.
  - Keep UI logic in components under `src/components`; keep route-level loading/params logic in `src/app` pages.
  - Localization keys are in JSON bundles under `src/messages/*` and wired through `src/i18n.ts`.
  - Small scripts that transform data live in `/scripts` and are intended to be run locally by maintainers.

- **Testing & linting:** There are no explicit tests discovered in the repo root. If you add tests follow the repo style (TypeScript, using existing lint/build scripts). Check `package.json` for test/lint script names.

- **Where to make changes:** For UI/UX changes, update `src/components` and the relevant route in `src/app/[locale]/*`. For data shape changes, update both `data/*.json` and `src/lib/data.ts`. For translations, add strings to `src/messages/<lang>.json` and wire via `src/i18n.ts`.

- **When in doubt:** Point PRs at small, focused changes. Run the dev server locally to verify behavior. Refer to the listed files above as primary sources of truth.

- If any part of this summary is missing or you want agent behavior adjusted (verbosity, strictness, or allowed file edits), tell me what to change and I'll iterate.
