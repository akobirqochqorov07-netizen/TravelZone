import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');

function apiMiddleware(req, res, next) {
  const url = req.url?.split('?')[0];

  if (url === '/api/icons') {
    const file = path.join(publicDir, 'api/icons.json');
    if (fs.existsSync(file)) {
      res.setHeader('Content-Type', 'application/json');
      res.end(fs.readFileSync(file));
      return;
    }
  }

  if (url === '/api/hotels' || url === '/api/tours') {
    const toursFile = path.join(publicDir, 'data/tours.json');
    const hotelsFile = path.join(publicDir, 'api/hotels.json');
    const file = fs.existsSync(toursFile) ? toursFile : hotelsFile;
    if (fs.existsSync(file)) {
      res.setHeader('Content-Type', 'application/json');
      res.end(fs.readFileSync(file));
      return;
    }
  }

  if (url === '/watchlist/count') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ count: 0, ids: [] }));
    return;
  }

  if (url === '/set-season' && req.method === 'POST') {
    res.statusCode = 204;
    res.end();
    return;
  }

  next();
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    open: '/?season=summer',
  },
  plugins: [
    {
      name: 'wanderhotels-api',
      configureServer(server) {
        server.middlewares.use(apiMiddleware);
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
