import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", "data", "products.json");

// Reload fresh data (in case previous run partially wrote)
const raw = fs.readFileSync(dataPath, "utf8");
const products = JSON.parse(raw);

// Collect unique descriptions
const uniqueDescs = [...new Set(products.map((p) => p.description_lv).filter(Boolean))];
console.log(`Total products: ${products.length}`);
console.log(`Unique descriptions to translate: ${uniqueDescs.length}`);

async function translateOne(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=lv&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        // Rate limited, wait and retry
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      const data = await res.json();
      return data[0].map((seg) => seg[0]).join("");
    } catch (err) {
      if (attempt === 2) {
        console.error(`Failed: ${text.substring(0, 40)}... -> ${err.message}`);
        return text; // fallback to original
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return text;
}

// Run N concurrent translations
const CONCURRENCY = 10;
const BATCH_SIZE = 50;
const translationMap = new Map();

async function main() {
  let completed = 0;

  for (let batchStart = 0; batchStart < uniqueDescs.length; batchStart += BATCH_SIZE) {
    const batch = uniqueDescs.slice(batchStart, batchStart + BATCH_SIZE);

    // Process batch with concurrency limit
    for (let i = 0; i < batch.length; i += CONCURRENCY) {
      const slice = batch.slice(i, i + CONCURRENCY);
      const results = await Promise.all(slice.map((text) => translateOne(text)));
      slice.forEach((orig, idx) => translationMap.set(orig, results[idx]));
      completed += slice.length;
    }

    console.log(`Translated ${completed}/${uniqueDescs.length} (${Math.round((completed / uniqueDescs.length) * 100)}%)`);

    // Small delay between batches
    if (batchStart + BATCH_SIZE < uniqueDescs.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  // Apply translations to products
  for (const product of products) {
    product.description_en = translationMap.get(product.description_lv) || product.description_lv || "";
  }

  // Write back
  fs.writeFileSync(dataPath, JSON.stringify(products, null, 2), "utf8");
  console.log(`\nDone! Updated ${products.length} products with description_en.`);
}

main().catch(console.error);
