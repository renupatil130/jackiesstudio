/* Builds the public site for Vercel into ./public.
   Only the portfolio and the client pages are copied; the admin page and the server stay on Render.
   Set BACKEND_URL in Vercel (e.g. https://jackies-studio.onrender.com) so the client pages know where the backend is. */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public');
const BACKEND = String(process.env.BACKEND_URL || '').trim().replace(/\/+$/, '');

if (!/^https?:\/\/[^\s'"]+$/.test(BACKEND)) {
  console.error('\n[build] BACKEND_URL is missing or not a web address.');
  console.error('        In Vercel: Project > Settings > Environment Variables > add BACKEND_URL = your Render address,');
  console.error('        e.g. https://jackies-studio.onrender.com, then redeploy.\n');
  process.exit(1);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const copy = (rel, to = rel) => {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) return;
  fs.cpSync(src, path.join(OUT, to), { recursive: true });
};

copy('index.html');
copy('css');
copy('js');
copy('assets');
for (const f of ['app.css', 'watch.html', 'watch.js', 'delivery.html', 'notfound.html']) copy(path.join('app', f));
copy(path.join('app', 'notfound.html'), '404.html');
fs.writeFileSync(path.join(OUT, 'app', 'config.js'), `/* generated at build time from BACKEND_URL */\nwindow.API_BASE = ${JSON.stringify(BACKEND)};\n`);

console.log(`[build] public site ready in ./public, talking to ${BACKEND}`);
