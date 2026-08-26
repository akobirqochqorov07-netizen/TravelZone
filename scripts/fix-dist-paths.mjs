import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const basePath = '/TravelZone/';

function visit(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) visit(target);
    else if (target.endsWith('.css')) {
      const source = fs.readFileSync(target, 'utf8');
      const fixed = source.replace(/url\(\/(?!\/)/g, `url(${basePath}`);
      if (fixed !== source) fs.writeFileSync(target, fixed);
    }
  }
}

if (fs.existsSync(distDir)) visit(distDir);

// These are unmodified source-site snapshots, not Travel Zone product pages.
// The live app replaces their links with in-page routes, so excluding them
// prevents old API keys, captcha chunks and server-only requests from shipping.
fs.rmSync(path.join(distDir, 'en'), { recursive: true, force: true });
