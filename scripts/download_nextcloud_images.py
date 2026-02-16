"""
Download product images from Labor Pro Nextcloud file share.

Connects to the Nextcloud WebDAV API, finds product image folders by SKU,
and downloads them into public/images/products/{SKU}/ for the Next.js webapp.

Usage:
    python scripts/download_nextcloud_images.py
"""

import os
import sys
import time
import json
import requests
from xml.etree import ElementTree as ET
from urllib.parse import unquote, quote
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ============================================================================
# CONFIGURATION
# ============================================================================

BASE_URL = 'https://share.laborprosrl.com'
LOGIN_USER = 'kristians.markavs@gmail.com'
LOGIN_PASS = 'client_markavs'
NC_USER = 'Markavs'
WEBDAV_BASE = f'{BASE_URL}/remote.php/dav/files/{NC_USER}/'

# Output: Next.js public directory
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
OUTPUT_DIR = PROJECT_DIR / 'public' / 'images' / 'products'
PROGRESS_FILE = SCRIPT_DIR / 'image_download_progress.json'

# Rate limiting
DELAY = 0.1  # seconds between requests

# Brand image paths on Nextcloud (same as extract_catalog_from_nextcloud.py)
BRAND_IMAGE_PATHS = [
    ("Gettin' Fluo", "All brands/Labor Pro brands/Gettin' Fluo/Images/"),
    ("Gordon", "All brands/Labor Pro brands/Gordon/Images/"),
    ("Labor Life", "All brands/Labor Pro brands/Labor/Labor Life/Images/"),
    ("Labor Pro", "All brands/Labor Pro brands/Labor/Labor Pro/Images/"),
    ("Plum", "All brands/Labor Pro brands/Plum/Images/"),
    ("Tline", "All brands/Labor Pro brands/Tline/Images/"),
    ("Élite", "All brands/Labor Pro brands/Élite/Images/"),
    ("Upgrade Regenesi", "All brands/Upgrade/Upgrade Hair Therapy | Regenesi/Images/"),
    ("Upgrade Hair Tools", "All brands/Upgrade/Upgrade | Hair Tools/images/"),
]

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif'}

# Session
session = requests.Session()
session.auth = (LOGIN_USER, LOGIN_PASS)
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
})


# ============================================================================
# WEBDAV HELPERS
# ============================================================================

def list_folder(path):
    """List contents of a Nextcloud folder via WebDAV PROPFIND."""
    url = WEBDAV_BASE + quote(path, safe='/:@!$&\'()*+,;=')
    try:
        r = session.request('PROPFIND', url, headers={'Depth': '1'}, timeout=120)
    except requests.RequestException as e:
        print(f'  ERROR requesting {path}: {e}')
        return []

    if r.status_code != 207:
        print(f'  WARNING: Got status {r.status_code} for {path}')
        return []

    ns = {'d': 'DAV:'}
    root = ET.fromstring(r.text)
    items = []
    for resp in root.findall('d:response', ns):
        href = resp.find('d:href', ns).text
        restype = resp.find('.//d:resourcetype', ns)
        is_dir = (restype is not None and
                  restype.find('d:collection', ns) is not None)
        name = unquote(href.rstrip('/').split('/')[-1])
        items.append((name, is_dir))

    # Skip first entry (self-reference)
    return items[1:] if items else []


def download_file(remote_path, local_path):
    """Download a file from Nextcloud WebDAV."""
    url = WEBDAV_BASE + quote(remote_path, safe='/:@!$&\'()*+,;=')
    try:
        r = session.get(url, timeout=60, stream=True)
        r.raise_for_status()
        local_path.parent.mkdir(parents=True, exist_ok=True)
        with open(local_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f'    ERROR downloading: {e}')
        return False


# ============================================================================
# MAIN
# ============================================================================

def load_progress():
    """Load download progress from file."""
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'completed_skus': [], 'stats': {'downloaded': 0, 'skipped': 0, 'errors': 0}}


def save_progress(progress):
    """Save download progress to file."""
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)


def main():
    print("=" * 60)
    print("  Nextcloud Product Image Downloader")
    print("=" * 60)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load progress
    progress = load_progress()
    completed = set(progress['completed_skus'])
    stats = progress['stats']

    print(f"Previously completed: {len(completed)} SKUs")
    print(f"Output: {OUTPUT_DIR}\n")

    # Load catalog product SKUs for matching
    products_json = PROJECT_DIR / 'data' / 'products.json'
    if products_json.exists():
        with open(products_json, 'r', encoding='utf-8') as f:
            catalog_products = json.load(f)
        catalog_skus = {p['sku'].strip().upper() for p in catalog_products}
        print(f"Catalog products: {len(catalog_skus)}")
    else:
        catalog_skus = None
        print("WARNING: No products.json found, downloading ALL images")

    # Crawl each brand's image folder
    total_brands = len(BRAND_IMAGE_PATHS)
    for brand_idx, (brand_name, images_path) in enumerate(BRAND_IMAGE_PATHS):
        print(f"\n[{brand_idx+1}/{total_brands}] {brand_name}")
        print(f"  Path: {images_path}")

        items = list_folder(images_path)
        product_folders = [(name, is_dir) for name, is_dir in items if is_dir]
        print(f"  Found {len(product_folders)} product folders")

        for i, (folder_name, _) in enumerate(product_folders):
            sku = folder_name.strip()
            sku_upper = sku.upper()

            # Skip if already done
            if sku_upper in completed:
                continue

            # Skip if not in our catalog (optional)
            if catalog_skus and sku_upper not in catalog_skus:
                continue

            # List images in this product folder
            product_path = images_path + folder_name + '/'
            image_items = list_folder(product_path)
            image_files = []
            for name, is_dir in image_items:
                if not is_dir:
                    ext = os.path.splitext(name)[1].lower()
                    if ext in IMAGE_EXTENSIONS:
                        image_files.append(name)

            if not image_files:
                completed.add(sku_upper)
                continue

            # Download each image
            sku_dir = OUTPUT_DIR / sku
            sku_dir.mkdir(parents=True, exist_ok=True)

            downloaded_any = False
            for img_name in image_files:
                local_file = sku_dir / img_name
                if local_file.exists():
                    stats['skipped'] += 1
                    continue

                remote_path = product_path + img_name
                if download_file(remote_path, local_file):
                    stats['downloaded'] += 1
                    downloaded_any = True
                else:
                    stats['errors'] += 1

                time.sleep(DELAY)

            status = f"  [{i+1}/{len(product_folders)}] {sku}: {len(image_files)} images"
            if downloaded_any:
                print(status)

            completed.add(sku_upper)

            # Save progress periodically
            if len(completed) % 50 == 0:
                progress['completed_skus'] = list(completed)
                progress['stats'] = stats
                save_progress(progress)

        # Save after each brand
        progress['completed_skus'] = list(completed)
        progress['stats'] = stats
        save_progress(progress)

    # Final summary
    print("\n" + "=" * 60)
    print("  DOWNLOAD COMPLETE")
    print("=" * 60)
    print(f"  Downloaded: {stats['downloaded']} images")
    print(f"  Skipped (exists): {stats['skipped']}")
    print(f"  Errors: {stats['errors']}")

    # Count SKUs with images
    sku_dirs = [d for d in OUTPUT_DIR.iterdir() if d.is_dir()]
    total_images = sum(len(list(d.glob('*'))) for d in sku_dirs)
    print(f"  Total: {len(sku_dirs)} SKUs, {total_images} image files")


if __name__ == '__main__':
    main()
