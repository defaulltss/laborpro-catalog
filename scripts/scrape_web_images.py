"""
Scrape product images from hairsera.lv and hairsera.lt for products
that are missing images from the Nextcloud download.

Only targets products that:
1. Have no local images in public/images/products/
2. Have a source URL in the database

Usage:
    python scripts/scrape_web_images.py
"""

import os
import re
import sys
import time
import json
import sqlite3
import requests
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlparse

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Config
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
OUTPUT_DIR = PROJECT_DIR / 'public' / 'images' / 'products'
DB_PATH = Path(r'C:\Users\Ralfs\Desktop\Webpagecopy\data\products.db')
PRODUCTS_JSON = PROJECT_DIR / 'data' / 'products.json'
PROGRESS_FILE = SCRIPT_DIR / 'web_scrape_progress.json'

DELAY = 0.3
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
}

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}


def get_full_size_url(url):
    """Convert thumbnail URL to full-size image URL."""
    url = re.sub(r'-\d+x\d+(\.\w+)$', r'\1', url)
    url = re.sub(r'-scaled-scaled', '-scaled', url)
    return url


def scrape_product_images(url, session):
    """Scrape product images from a hairsera.lv or .lt product page."""
    try:
        response = session.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
    except Exception as e:
        return []

    images = set()

    # Main product image
    main_img = soup.select_one('.woocommerce-product-gallery__image img, .wp-post-image')
    if main_img:
        src = main_img.get('data-large_image') or main_img.get('data-src') or main_img.get('src', '')
        if src and 'placeholder' not in src.lower():
            images.add(get_full_size_url(src))

    # Gallery images
    for img in soup.select('.woocommerce-product-gallery__image img, .product-gallery img'):
        src = img.get('data-large_image') or img.get('data-src') or img.get('src', '')
        if src and 'placeholder' not in src.lower():
            images.add(get_full_size_url(src))

    return list(images)


def download_image(url, filepath, session):
    """Download image to filepath."""
    try:
        response = session.get(url, headers=HEADERS, timeout=30, stream=True)
        response.raise_for_status()

        content_type = response.headers.get('content-type', '')
        if 'image' not in content_type and 'octet' not in content_type:
            return False

        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f'    ERROR: {e}')
        return False


def load_progress():
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'completed': [], 'stats': {'downloaded': 0, 'no_images': 0, 'errors': 0}}


def save_progress(progress):
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)


def main():
    print('=' * 60)
    print('  Hairsera Web Image Scraper')
    print('=' * 60)

    # Load products missing images
    with open(PRODUCTS_JSON, 'r', encoding='utf-8') as f:
        products = json.load(f)

    no_images = {p['sku'].strip().upper(): p for p in products
                 if not any(i.startswith('/') for i in p.get('images', []))}

    # Get source URLs from DB
    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()
    c.execute('SELECT sku, source_url_lv, source_url_lt FROM products')

    targets = []
    for sku, url_lv, url_lt in c.fetchall():
        if not sku:
            continue
        sku_upper = sku.strip().upper()
        if sku_upper in no_images:
            urls = []
            if url_lv and url_lv.strip():
                urls.append(url_lv.strip())
            if url_lt and url_lt.strip():
                urls.append(url_lt.strip())
            if urls:
                targets.append((sku.strip(), urls))
    conn.close()

    print(f'\nProducts missing images: {len(no_images)}')
    print(f'Products with web URLs to scrape: {len(targets)}')

    # Load progress
    progress = load_progress()
    completed = set(progress['completed'])
    stats = progress['stats']
    print(f'Previously completed: {len(completed)}')

    session = requests.Session()

    for i, (sku, urls) in enumerate(targets):
        if sku.upper() in completed:
            continue

        # Try each URL until we find images
        all_image_urls = []
        for url in urls:
            image_urls = scrape_product_images(url, session)
            if image_urls:
                all_image_urls = image_urls
                break
            time.sleep(DELAY)

        if not all_image_urls:
            stats['no_images'] += 1
            completed.add(sku.upper())
            continue

        # Download images
        sku_dir = OUTPUT_DIR / sku
        downloaded = 0
        for j, img_url in enumerate(all_image_urls):
            ext = os.path.splitext(urlparse(img_url).path)[1].lower()
            if ext not in IMAGE_EXTENSIONS:
                ext = '.jpg'

            if len(all_image_urls) == 1:
                filename = f'{sku}{ext}'
            else:
                filename = f'{sku}_{j+1}{ext}'

            filepath = sku_dir / filename
            if filepath.exists():
                downloaded += 1
                continue

            if download_image(img_url, filepath, session):
                downloaded += 1
            time.sleep(DELAY / 2)

        if downloaded:
            stats['downloaded'] += downloaded
            print(f'  [{i+1}/{len(targets)}] {sku}: {downloaded} images')
        else:
            stats['errors'] += 1

        completed.add(sku.upper())

        if len(completed) % 50 == 0:
            progress['completed'] = list(completed)
            progress['stats'] = stats
            save_progress(progress)

    # Save final progress
    progress['completed'] = list(completed)
    progress['stats'] = stats
    save_progress(progress)

    print(f'\n{"=" * 60}')
    print(f'  SCRAPING COMPLETE')
    print(f'{"=" * 60}')
    print(f'  Images downloaded: {stats["downloaded"]}')
    print(f'  Products with no images found: {stats["no_images"]}')
    print(f'  Errors: {stats["errors"]}')


if __name__ == '__main__':
    main()
