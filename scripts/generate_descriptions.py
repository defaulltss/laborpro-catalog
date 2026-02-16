"""
Generate product descriptions for the catalog.

Strategy:
1. Keep existing description_lv from the database (143 products)
2. For the rest, build a description from:
   - Translate English product name to Latvian via Google Translate
   - Add brand and category context

Usage:
    python scripts/generate_descriptions.py
"""

import json
import sys
import os
import time
import re

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from deep_translator import GoogleTranslator

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
PRODUCTS_FILE = os.path.join(PROJECT_DIR, 'data', 'products.json')
OUTPUT_FILE = os.path.join(PROJECT_DIR, 'data', 'products.json')
CACHE_FILE = os.path.join(SCRIPT_DIR, 'translation_cache_desc.json')

# Translation cache
def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_cache(cache):
    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

def translate_en_to_lv(text, cache, translator):
    """Translate English text to Latvian with caching."""
    if not text or not text.strip():
        return ''
    text = text.strip()
    if text in cache:
        return cache[text]
    try:
        result = translator.translate(text)
        cache[text] = result
        time.sleep(0.15)  # Rate limiting
        return result
    except Exception as e:
        print(f'    Translation error: {e}')
        cache[text] = text  # Cache original to avoid retrying
        return text


def clean_name(name):
    """Clean up product name for description use."""
    if not name:
        return ''
    # Remove SKU-like prefixes
    name = re.sub(r'^[A-Z]\d{3,}[A-Z]*\s*[-–]\s*', '', name)
    # Remove trailing dimensions/sizes that look like specs
    name = name.strip(' ,-–')
    return name


def build_description(product, translated_name, categories_map):
    """Build a product description from available data."""
    parts = []

    # Main description line - translated name
    if translated_name and translated_name != product.get('name_lv', ''):
        parts.append(translated_name + '.')

    # Brand line
    brand = product.get('brand', '')
    if brand:
        parts.append(f'Zīmols: {brand}.')

    # Category
    cat_id = product.get('categoryId')
    if cat_id and cat_id in categories_map:
        cat_name = categories_map[cat_id]
        parts.append(f'Kategorija: {cat_name}.')

    # EAN
    ean = product.get('ean', '')
    if ean and ean != 'None' and len(ean) > 5:
        parts.append(f'EAN: {ean}.')

    return '\n'.join(parts) if parts else ''


def main():
    print('=' * 60)
    print('  Product Description Generator')
    print('=' * 60)

    # Load products
    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)

    # Load categories for context
    cats_file = os.path.join(PROJECT_DIR, 'data', 'categories.json')
    with open(cats_file, 'r', encoding='utf-8') as f:
        categories = json.load(f)
    categories_map = {c['id']: c['name_lv'] for c in categories}

    # Split into has/needs description
    has_desc = [p for p in products if p.get('description_lv') and len(p['description_lv'].strip()) > 10]
    needs_desc = [p for p in products if not p.get('description_lv') or len(p['description_lv'].strip()) <= 10]

    print(f'\nTotal products: {len(products)}')
    print(f'Already have descriptions: {len(has_desc)}')
    print(f'Need descriptions: {len(needs_desc)}')

    # Load translation cache
    cache = load_cache()
    print(f'Translation cache entries: {len(cache)}')

    # Setup translator
    translator = GoogleTranslator(source='en', target='lv')

    # Generate descriptions for products that need them
    generated = 0
    errors = 0

    for i, product in enumerate(products):
        # Skip products that already have descriptions
        if product.get('description_lv') and len(product['description_lv'].strip()) > 10:
            continue

        name_en = clean_name(product.get('name_en', ''))

        # Translate English name to Latvian
        translated = ''
        if name_en and len(name_en) > 3:
            translated = translate_en_to_lv(name_en, cache, translator)

        # Build description
        desc = build_description(product, translated, categories_map)
        if desc:
            product['description_lv'] = desc
            generated += 1
        else:
            errors += 1

        if (generated + errors) % 100 == 0:
            print(f'  Progress: {generated + errors}/{len(needs_desc)} (generated: {generated})')
            save_cache(cache)

    # Save
    save_cache(cache)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f'\n{"=" * 60}')
    print(f'  DONE')
    print(f'{"=" * 60}')
    print(f'  Descriptions generated: {generated}')
    print(f'  Kept existing: {len(has_desc)}')
    print(f'  Errors/skipped: {errors}')
    print(f'  Translation cache: {len(cache)} entries')


if __name__ == '__main__':
    main()
