import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Ensure table exists on first use
let tableInitialized = false;
async function ensureTable() {
  if (tableInitialized) return;
  await client.execute(`
    CREATE TABLE IF NOT EXISTS product_visibility (
      product_id INTEGER PRIMARY KEY,
      visible INTEGER NOT NULL DEFAULT 1
    )
  `);
  tableInitialized = true;
}

// Cache hidden product IDs for 60 seconds
let cachedHiddenIds: Set<number> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000;

export async function getHiddenProductIds(): Promise<Set<number>> {
  const now = Date.now();
  if (cachedHiddenIds && now - cacheTimestamp < CACHE_TTL) {
    return cachedHiddenIds;
  }

  try {
    await ensureTable();
    const result = await client.execute(
      'SELECT product_id FROM product_visibility WHERE visible = 0'
    );
    const ids = new Set(result.rows.map((r) => Number(r.product_id)));
    cachedHiddenIds = ids;
    cacheTimestamp = now;
    return ids;
  } catch (error) {
    console.error('Failed to fetch hidden product IDs:', error);
    // Fail-open: if Turso is unreachable, show all products
    return new Set();
  }
}

export async function setProductVisibility(
  productId: number,
  visible: boolean
): Promise<void> {
  await ensureTable();
  await client.execute({
    sql: `INSERT INTO product_visibility (product_id, visible)
          VALUES (?, ?)
          ON CONFLICT(product_id) DO UPDATE SET visible = ?`,
    args: [productId, visible ? 1 : 0, visible ? 1 : 0],
  });
  // Invalidate cache
  cachedHiddenIds = null;
}

export async function getAllVisibilityStates(): Promise<Map<number, boolean>> {
  await ensureTable();
  const result = await client.execute(
    'SELECT product_id, visible FROM product_visibility'
  );
  const map = new Map<number, boolean>();
  for (const row of result.rows) {
    map.set(Number(row.product_id), row.visible === 1);
  }
  return map;
}
