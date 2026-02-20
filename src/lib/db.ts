import { createClient, type Client } from '@libsql/client';

let _client: Client | null = null;

function getClient(): Client {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

// Ensure tables exist on first use
let tableInitialized = false;
async function ensureTable() {
  if (tableInitialized) return;
  const client = getClient();
  await client.execute(`
    CREATE TABLE IF NOT EXISTS product_visibility (
      product_id INTEGER PRIMARY KEY,
      visible INTEGER NOT NULL DEFAULT 1
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS product_overrides (
      product_id INTEGER PRIMARY KEY,
      overrides TEXT NOT NULL
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
    const result = await getClient().execute(
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
  await getClient().execute({
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
  const result = await getClient().execute(
    'SELECT product_id, visible FROM product_visibility'
  );
  const map = new Map<number, boolean>();
  for (const row of result.rows) {
    map.set(Number(row.product_id), row.visible === 1);
  }
  return map;
}

// --- Product Overrides ---

let cachedOverrides: Map<number, Record<string, unknown>> | null = null;
let overridesCacheTimestamp = 0;

export async function getProductOverrides(): Promise<Map<number, Record<string, unknown>>> {
  const now = Date.now();
  if (cachedOverrides && now - overridesCacheTimestamp < CACHE_TTL) {
    return cachedOverrides;
  }

  try {
    await ensureTable();
    const result = await getClient().execute(
      'SELECT product_id, overrides FROM product_overrides'
    );
    const map = new Map<number, Record<string, unknown>>();
    for (const row of result.rows) {
      try {
        map.set(Number(row.product_id), JSON.parse(row.overrides as string));
      } catch {
        // skip malformed rows
      }
    }
    cachedOverrides = map;
    overridesCacheTimestamp = now;
    return map;
  } catch (error) {
    console.error('Failed to fetch product overrides:', error);
    // Fail-open: return empty map so base JSON data is served
    return new Map();
  }
}

export async function setProductOverrides(
  productId: number,
  overrides: Record<string, unknown>
): Promise<void> {
  await ensureTable();
  const json = JSON.stringify(overrides);
  await getClient().execute({
    sql: `INSERT INTO product_overrides (product_id, overrides)
          VALUES (?, ?)
          ON CONFLICT(product_id) DO UPDATE SET overrides = ?`,
    args: [productId, json, json],
  });
  // Invalidate cache
  cachedOverrides = null;
}

export async function deleteProductOverrides(
  productId: number
): Promise<void> {
  await ensureTable();
  await getClient().execute({
    sql: 'DELETE FROM product_overrides WHERE product_id = ?',
    args: [productId],
  });
  // Invalidate cache
  cachedOverrides = null;
}
