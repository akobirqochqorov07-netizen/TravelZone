#!/usr/bin/env node
/**
 * Downloads wanderhotels.com homepage assets for local 1:1 clone.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const BASE = 'https://www.wanderhotels.com';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

const downloaded = new Set();
const failed = [];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': UA } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchBuffer(new URL(res.headers.location, url).href).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`${url} => ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.setTimeout(120000, () => {
      req.destroy(new Error('timeout'));
    });
  });
}

async function downloadAsset(assetPath) {
  const normalized = assetPath.split('?')[0];
  if (downloaded.has(normalized)) return;
  downloaded.add(normalized);

  const localPath = path.join(PUBLIC, normalized.replace(/^\//, ''));
  if (fs.existsSync(localPath)) return;

  const url = `${BASE}${normalized}`;
  try {
    ensureDir(localPath);
    const buf = await fetchBuffer(url);
    fs.writeFileSync(localPath, buf);
    process.stdout.write('.');
  } catch (e) {
    failed.push({ path: normalized, error: e.message });
    process.stdout.write('x');
  }
}

function extractPaths(html) {
  const paths = new Set();
  const re = /(?:href|src|srcset|poster|content)=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(html))) {
    const val = m[1];
    if (val.startsWith('/') && !val.startsWith('//')) {
      paths.add(val.split(/\s+/)[0].split(',')[0]);
    } else if (val.startsWith('files/')) {
      paths.add('/' + val.split(/\s+/)[0].split(',')[0].split('?')[0]);
    }
    if (val.includes('/assets/') || val.includes('/files/')) {
      val.split(',').forEach((part) => {
        const p = part.trim().split(/\s+/)[0];
        if (p.startsWith('/')) paths.add(p.split('?')[0]);
        else if (p.startsWith('files/')) paths.add('/' + p.split('?')[0]);
      });
    }
  }
  return paths;
}

function extractCssUrls(css) {
  const paths = new Set();
  const re = /url\(["']?([^"')]+)["']?\)/g;
  let m;
  while ((m = re.exec(css))) {
    let u = m[1];
    if (u.startsWith('data:') || u.startsWith('http')) continue;
    if (u.startsWith('../../')) u = u.replace(/^\.\.\/\.\.\//, '/bundles/');
    if (u.startsWith('/')) paths.add(u.split('?')[0]);
  }
  return paths;
}

function processHtml(html) {
  let out = html;
  out = out.replace(/<base href="[^"]*">/, '<base href="/">');
  out = out.replace(/<!-- Google Tag Manager -->\s*<script>[\s\S]*?<\/script>\s*<!-- End Google Tag Manager -->/g, '');
  out = out.replace(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/g, '');
  out = out.replace(/<script id="Cookiebot"[^>]*><\/script>/g, '');
  out = out.replace(/<link rel="preconnect" href="https:\/\/consent[^"]*"[^>]*>/g, '');
  out = out.replace(/<link rel="preconnect" href="https:\/\/privacy-analytics[^"]*"[^>]*>/g, '');
  return out;
}

async function main() {
  console.log('Fetching homepage HTML...');
  const htmlBuf = await fetchBuffer(`${BASE}/en/?season=summer`);
  let html = htmlBuf.toString('utf8');

  const paths = extractPaths(html);

  // Extra known assets from JS/CSS references
  const extra = [
    '/files/theme/js/ajax-startseite.js',
    '/files/theme/js/season.js',
    '/files/theme/js/custom-slider.js',
    '/files/theme/js/quick-nav.js',
    '/files/theme/js/fixed-navbar.js',
    '/files/theme/js/watchlist-core.js',
    '/files/theme/js/watchlist-overlay.js',
    '/files/theme/js/buchungsleiste-adapt.js',
    '/files/theme/js/buchungsleiste-dialog.js',
    '/bundles/contaowowjs/wow.min.js',
    '/bundles/contaousernameinserttag/css/username.css',
    '/bundles/contaousernameinserttag/js/username.js',
    '/bundles/plentacontaofriendlycaptcha/webpack/friendlyCaptcha.fac30225.js',
    '/bundles/terminal42conditionalformfields/conditionalformfields.js',
    '/bundles/daesigncalendarfield/flatpickr/flatpickr.min.css',
    '/bundles/daesigncalendarfield/flatpickr/flatpickr.min.js',
    '/bundles/daesigncalendarfield/flatpickr/l10n/en.js',
    '/bundles/contaowowjs/animate.min.css',
    '/assets/js/jquery.min.js,rocksolid-slider.min.js-49acb026.js',
    '/assets/js/nav-accordion.js,text-animation.js,hammer.min.js,images-compare....-d57c18ca.js',
    '/assets/css/layout.min.css,responsive.min.css,rocksolid-slider.min.css,defau...-222f0dd8.css',
    '/files/content/media/video/HD/thevisualvein-wanderhotels-sommer-video-morgen-CUT_1.mp4',
    '/files/content/media/video/mobile/thevisualvein-wanderhotels-sommer-video-morgen-CUT_1_mobile.mp4',
    '/files/content/media/video/HD/thevisualvein-wanderhotels-winter-video-morgen_1.mp4',
    '/files/content/media/video/mobile/thevisualvein-wanderhotels-winter-video-morgen_1_mobile.mp4',
    '/assets/images/a/thumb_sommer_morgen-7eft52c7hmp4j6s.webp',
    '/assets/images/y/thumb_winter_morgen-47zqazy5z9jgmbz.webp',
  ];
  extra.forEach((p) => paths.add(p));

  console.log(`\nDownloading ${paths.size} assets...`);
  const sorted = [...paths].sort();
  const batchSize = 8;
  for (let i = 0; i < sorted.length; i += batchSize) {
    await Promise.all(sorted.slice(i, i + batchSize).map(downloadAsset));
  }

  // Parse CSS for additional assets
  const cssPath = path.join(PUBLIC, 'assets/css/layout.min.css,responsive.min.css,rocksolid-slider.min.css,defau...-222f0dd8.css');
  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, 'utf8');
    const cssPaths = extractCssUrls(css);
    console.log(`\nDownloading ${cssPaths.size} CSS-referenced assets...`);
    for (const p of cssPaths) {
      await downloadAsset(p);
    }
  }

  // Fetch API data
  console.log('\nFetching API data...');
  fs.mkdirSync(path.join(PUBLIC, 'api'), { recursive: true });
  try {
    const hotels = await fetchBuffer(`${BASE}/api/hotels?lang=en&limit=50`);
    fs.writeFileSync(path.join(PUBLIC, 'api/hotels.json'), hotels);
  } catch (e) {
    console.warn('Hotels API failed:', e.message);
  }
  try {
    const icons = await fetchBuffer(`${BASE}/api/icons`);
    fs.writeFileSync(path.join(PUBLIC, 'api/icons.json'), icons);
    const iconsJson = JSON.parse(icons.toString());
    for (const group of Object.values(iconsJson)) {
      if (Array.isArray(group)) {
        for (const item of group) {
          if (item.icon) await downloadAsset('/' + item.icon.replace(/^\//, ''));
        }
      }
    }
  } catch (e) {
    console.warn('Icons API failed:', e.message);
  }

  // Re-fetch hotels API images from JSON
  try {
    const hotelsJson = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'api/hotels.json'), 'utf8'));
    const hotelPaths = new Set();
    for (const hotel of hotelsJson.results || []) {
      for (const img of hotel.hauptbild || []) {
        if (img.img?.src) hotelPaths.add(img.img.src.split('?')[0]);
        for (const s of img.sources || []) {
          if (s.srcset) hotelPaths.add(s.srcset.split('?')[0]);
          if (s.src) hotelPaths.add(s.src.split('?')[0]);
        }
      }
    }
    console.log(`\nDownloading ${hotelPaths.size} hotel card images...`);
    for (const p of hotelPaths) await downloadAsset(p);
  } catch (_) {}

  // Save processed HTML at project root for Vite
  html = processHtml(html);
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
  fs.mkdirSync(path.join(PUBLIC, 'en'), { recursive: true });
  fs.writeFileSync(path.join(PUBLIC, 'en', 'index.html'), html);

  console.log(`\n\nDone. Downloaded: ${downloaded.size}, Failed: ${failed.length}`);
  if (failed.length) {
    console.log('Failed assets:');
    failed.slice(0, 20).forEach((f) => console.log(`  ${f.path}: ${f.error}`));
  }
}

main().catch(console.error);
