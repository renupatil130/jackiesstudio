/* Jackie's Studio server
   Serves the portfolio as-is, plus client video delivery:
   - /delivery   public page where clients type the 6-character code Jackie sent them
   - ADMIN_PATH  secret, password-protected page to upload edited videos and confirm payments
                 (no link to it anywhere on the site; /admin does not exist)
   - /v/:id      private client page: one-time watermarked preview, UPI payment, download once paid */
'use strict';

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const QRCode = require('qrcode');
const store = require('./store');
const preview = require('./preview');

const ROOT = path.resolve(__dirname, '..');
const PORT = +process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const UPI_ID = process.env.UPI_ID || '';
const UPI_NAME = process.env.UPI_NAME || "Jackie's Studio";
const WHATSAPP = (process.env.WHATSAPP || '916363692408').replace(/\D/g, '');
const MAX_UPLOAD_MB = +process.env.MAX_UPLOAD_MB || 4096;
// Where the public site lives when it's hosted separately (e.g. Vercel). Comma-separated; first one is used in client links.
const FRONTEND_URLS = String(process.env.FRONTEND_URL || '').split(',').map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean);
const FRONTEND = FRONTEND_URLS[0] || '';

// The admin page lives at a secret address. Set ADMIN_PATH yourself (e.g. "jackie-desk-8341");
// if you don't, one is derived from your password and printed when the server starts.
const ADMIN_PATH = '/' + String(process.env.ADMIN_PATH ||
  'studio-' + crypto.createHash('sha256').update('admin-path:' + ADMIN_PASSWORD).digest('hex').slice(0, 10))
  .replace(/^\/+|\/+$/g, '').replace(/[^A-Za-z0-9_-]/g, '');
if (['/admin', '/admin.html', '/delivery', '/'].includes(ADMIN_PATH.toLowerCase()) || ADMIN_PATH.length < 9) {
  console.error('[error] ADMIN_PATH must be at least 8 letters/digits and not "admin" or "delivery".'); process.exit(1);
}

if (!ADMIN_PASSWORD) console.warn('[warn] ADMIN_PASSWORD is not set: the admin page will refuse every login.');
if (!process.env.SESSION_SECRET) console.warn('[warn] SESSION_SECRET is not set: admin logins reset whenever the server restarts.');
if (!UPI_ID) console.warn('[warn] UPI_ID is not set: clients will not see a payment QR code.');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));

// The client pages on the frontend host call these routes directly. Admin routes are never opened to other sites.
app.use(['/api/v', '/api/find', '/stream', '/download'], (req, res, next) => {
  const o = req.headers.origin;
  if (o && FRONTEND_URLS.includes(o)) {
    res.setHeader('Access-Control-Allow-Origin', o);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// ---------- small helpers ----------
const ID_RE = /^[A-Za-z0-9_-]{16,64}$/;
const newId = (bytes = 18) => crypto.randomBytes(bytes).toString('base64url');
// short delivery codes for clients to type: no 0/O, 1/I/L, so they're easy to read out
const CODE_ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newCode() {
  for (;;) {
    let c = '';
    for (const b of crypto.randomBytes(6)) c += CODE_ABC[b % CODE_ABC.length];
    if (!store.all().some((j) => j.code === c)) return c;
  }
}
for (const j of store.all()) if (!j.code) store.update(j.id, { code: newCode() });
const sign = (v) => crypto.createHmac('sha256', SESSION_SECRET).update(v).digest('base64url');
const safeEq = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
function cookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
function setCookie(res, name, value, { maxAge, path: p = '/' } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${p}`, 'HttpOnly', 'SameSite=Lax'];
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`);
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  const prev = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', [].concat(prev || [], parts.join('; ')));
}
const noStore = (res) => res.setHeader('Cache-Control', 'no-store');

// ---------- admin auth ----------
const ADMIN_TTL = 12 * 3600; // seconds
function isAdmin(req) {
  const v = cookies(req).adm;
  if (!v) return false;
  const [exp, sig] = v.split('.');
  return !!exp && !!sig && safeEq(sig, sign('adm:' + exp)) && +exp > Date.now() / 1000;
}
function requireAdmin(req, res, next) {
  if (isAdmin(req)) return next();
  res.status(401).json({ error: 'Please log in again.' });
}
const attempts = new Map(); // ip -> { n, until }
function loginLimited(ip) {
  const a = attempts.get(ip);
  return a && a.n >= 8 && a.until > Date.now();
}
function noteFail(ip) {
  const a = attempts.get(ip) || { n: 0, until: 0 };
  if (a.until < Date.now()) { a.n = 0; }
  a.n++; a.until = Date.now() + 15 * 60 * 1000;
  attempts.set(ip, a);
}

// ---------- serving files with Range support (needed for video seeking) ----------
function sendFile(req, res, file, { type = 'video/mp4', download = null } = {}) {
  let stat;
  try { stat = fs.statSync(file); } catch { return res.status(404).end(); }
  const size = stat.size;
  res.setHeader('Content-Type', type);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Disposition', download
    ? `attachment; filename*=UTF-8''${encodeURIComponent(download)}`
    : 'inline');
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (m && (m[1] || m[2])) {
    let start = m[1] ? +m[1] : Math.max(0, size - +m[2]);
    let end = m[1] && m[2] ? Math.min(+m[2], size - 1) : size - 1;
    if (start >= size || start > end) {
      res.setHeader('Content-Range', `bytes */${size}`);
      return res.status(416).end();
    }
    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
    res.setHeader('Content-Length', end - start + 1);
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.setHeader('Content-Length', size);
  fs.createReadStream(file).pipe(res);
}

// ---------- the portfolio, unchanged ----------
app.get('/', (req, res) => res.sendFile(path.join(ROOT, 'index.html')));
for (const dir of ['css', 'js', 'assets', 'app']) {
  app.use('/' + dir, express.static(path.join(ROOT, dir), { fallthrough: false, index: false }));
}

// ---------- pages ----------
app.get(ADMIN_PATH, (req, res) => {
  noStore(res);
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.sendFile(path.join(ROOT, 'app', 'admin.html'));
});
app.get(['/delivery', '/delivery.html'], (req, res) => res.sendFile(path.join(ROOT, 'app', 'delivery.html')));
app.get('/v/:id', (req, res) => {
  if (!ID_RE.test(req.params.id) || !store.get(req.params.id)) return res.status(404).sendFile(path.join(ROOT, 'app', 'notfound.html'));
  noStore(res);
  res.setHeader('X-Robots-Tag', 'noindex');
  res.sendFile(path.join(ROOT, 'app', 'watch.html'));
});

// ---------- admin API ----------
app.get('/api/admin/me', (req, res) => { noStore(res); res.json({ admin: isAdmin(req), upiConfigured: !!UPI_ID }); });

app.post('/api/admin/login', (req, res) => {
  const ip = req.ip;
  if (loginLimited(ip)) return res.status(429).json({ error: 'Too many tries. Wait 15 minutes and try again.' });
  const pw = (req.body && req.body.password) || '';
  if (!ADMIN_PASSWORD || !safeEq(pw, ADMIN_PASSWORD)) {
    noteFail(ip);
    return res.status(401).json({ error: ADMIN_PASSWORD ? 'Wrong password.' : 'ADMIN_PASSWORD is not set on the server.' });
  }
  attempts.delete(ip);
  const exp = Math.floor(Date.now() / 1000) + ADMIN_TTL;
  setCookie(res, 'adm', `${exp}.${sign('adm:' + exp)}`, { maxAge: ADMIN_TTL });
  res.json({ ok: true });
});

app.post('/api/admin/logout', (req, res) => { setCookie(res, 'adm', '', { maxAge: 0 }); res.json({ ok: true }); });

const adminView = (j) => ({
  id: j.id, code: j.code, client: j.client, title: j.title, price: j.price, createdAt: j.createdAt,
  originalName: j.originalName, size: j.size, duration: j.duration,
  previewStatus: j.previewStatus, previewError: j.previewError,
  previewState: j.previewState, previewWatchedAt: j.previewWatchedAt,
  utr: j.utr, utrAt: j.utrAt, paid: j.paid, paidAt: j.paidAt, downloads: j.downloads || 0,
  link: FRONTEND + '/v/' + j.id,
});

app.get('/api/admin/jobs', requireAdmin, (req, res) => {
  noStore(res);
  res.json(store.all().sort((a, b) => b.createdAt - a.createdAt).map(adminView));
});

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, store.dirs.originals),
    filename: (req, file, cb) => {
      const ext = (path.extname(file.originalname) || '.mp4').toLowerCase().replace(/[^.a-z0-9]/g, '').slice(0, 8);
      cb(null, newId(12) + ext);
    },
  }),
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => cb(null, /^video\//.test(file.mimetype) || /\.(mp4|mov|m4v|mkv|webm|avi)$/i.test(file.originalname)),
});

app.post('/api/admin/jobs', requireAdmin, (req, res) => {
  upload.single('video')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? `That video is bigger than ${MAX_UPLOAD_MB} MB.` : 'Upload failed: ' + err.message;
      return res.status(400).json({ error: msg });
    }
    if (!req.file) return res.status(400).json({ error: 'Choose a video file to upload.' });
    const b = req.body || {};
    const client = String(b.client || '').trim().slice(0, 80);
    const title = String(b.title || '').trim().slice(0, 120) || 'Your edited video';
    const price = Math.round(Number(b.price));
    if (!client || !(price > 0) || price > 10000000) {
      fs.rm(req.file.path, () => {});
      return res.status(400).json({ error: 'Enter the client name and a price in rupees.' });
    }
    const job = {
      id: newId(18), code: newCode(), client, title, price, createdAt: Date.now(),
      original: req.file.filename, originalName: req.file.originalname.slice(0, 160), size: req.file.size,
      duration: 0, preview: null, previewStatus: 'processing', previewError: '',
      previewState: 'unused', previewWatchedAt: 0, ticket: null,
      utr: '', utrAt: 0, paid: false, paidAt: 0, downloads: 0,
    };
    store.put(job);
    preview.enqueue(job.id);
    res.json(adminView(job));
  });
});

app.post('/api/admin/jobs/:id/paid', requireAdmin, (req, res) => {
  const j = store.get(req.params.id);
  if (!j) return res.status(404).json({ error: 'Not found.' });
  const paid = !!(req.body && req.body.paid);
  store.update(j.id, { paid, paidAt: paid ? Date.now() : 0 });
  res.json(adminView(store.get(j.id)));
});

app.post('/api/admin/jobs/:id/reset-preview', requireAdmin, (req, res) => {
  const j = store.get(req.params.id);
  if (!j) return res.status(404).json({ error: 'Not found.' });
  store.update(j.id, { previewState: 'unused', previewWatchedAt: 0, ticket: null });
  res.json(adminView(store.get(j.id)));
});

app.delete('/api/admin/jobs/:id', requireAdmin, (req, res) => {
  const j = store.get(req.params.id);
  if (!j) return res.status(404).json({ error: 'Not found.' });
  store.remove(j.id);
  for (const f of [j.original && path.join(store.dirs.originals, j.original), j.preview && path.join(store.dirs.previews, j.preview)]) {
    if (f) fs.rm(f, { force: true }, () => {});
  }
  res.json({ ok: true });
});

// ---------- client API ----------
// a client types their code on /delivery; wrong guesses are rate-limited per IP
const finds = new Map();
app.post('/api/find', (req, res) => {
  noStore(res);
  const a = finds.get(req.ip) || { n: 0, until: 0 };
  if (a.until < Date.now()) { a.n = 0; a.until = Date.now() + 15 * 60 * 1000; }
  if (a.n >= 20) return res.status(429).json({ error: 'Too many tries. Wait 15 minutes, or open the link Jackie sent you.' });
  const code = String((req.body && req.body.code) || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const j = /^[A-Z0-9]{6}$/.test(code) && store.all().find((x) => x.code === code);
  if (!j) { a.n++; finds.set(req.ip, a); return res.status(404).json({ error: 'No video found for that code. Check the message from Jackie and try again.' }); }
  res.json({ link: '/v/' + j.id });
});

function jobFor(req, res) {
  const id = req.params.id;
  const j = ID_RE.test(id) && store.get(id);
  if (!j) { res.status(404).json({ error: 'This link is not valid.' }); return null; }
  noStore(res);
  return j;
}
const qrCache = new Map();
async function upiFor(j) {
  if (!UPI_ID) return null;
  const note = `Jackie's Studio - ${j.title}`.slice(0, 50);
  const link = `upi://pay?pa=${encodeURIComponent(UPI_ID).replace(/%40/g, "@")}&pn=${encodeURIComponent(UPI_NAME)}&am=${j.price}&cu=INR&tn=${encodeURIComponent(note)}`;
  if (!qrCache.has(link)) {
    qrCache.set(link, await QRCode.toDataURL(link, { margin: 1, width: 360, color: { dark: '#000000', light: '#efe7da' } }));
  }
  return { id: UPI_ID, name: UPI_NAME, link, qr: qrCache.get(link) };
}

app.get('/api/v/:id', async (req, res) => {
  const j = jobFor(req, res);
  if (!j) return;
  res.json({
    client: j.client, title: j.title, price: j.price,
    previewReady: j.previewStatus === 'ready',
    previewFailed: j.previewStatus === 'failed',
    previewUsed: j.previewState === 'used',
    utrSubmitted: !!j.utr, paid: j.paid,
    upi: await upiFor(j), whatsapp: WHATSAPP,
  });
});

// The one view: hands out a single stream ticket, tied to this browser, and marks the preview as used.
app.post('/api/v/:id/preview', (req, res) => {
  const j = jobFor(req, res);
  if (!j) return;
  if (j.previewStatus !== 'ready') return res.status(409).json({ error: 'The preview is still being prepared. Try again in a minute.' });
  if (j.previewState === 'used') return res.status(410).json({ error: 'This preview has already been watched.' });
  const life = Math.min(4 * 3600, Math.max(30 * 60, Math.round((j.duration || 0) * 3) + 600));
  const ticket = { id: newId(18), key: newId(18), expires: Date.now() + life * 1000 };
  store.update(j.id, { previewState: 'used', previewWatchedAt: Date.now(), ticket });
  // the key rides in the URL (not a cookie) so this also works when the page is on another domain
  res.json({ src: `/stream/${ticket.id}?k=${ticket.key}` });
});

app.get('/stream/:ticket', (req, res) => {
  const tid = req.params.ticket;
  const j = ID_RE.test(tid) && store.all().find((x) => x.ticket && x.ticket.id === tid);
  if (!j || j.ticket.expires < Date.now() || !safeEq(String(req.query.k || ''), j.ticket.key) || !j.preview) {
    return res.status(403).end();
  }
  noStore(res);
  sendFile(req, res, path.join(store.dirs.previews, j.preview));
});

app.post('/api/v/:id/ended', (req, res) => {
  const j = jobFor(req, res);
  if (!j) return;
  if (j.ticket) store.update(j.id, { ticket: null });
  res.json({ ok: true });
});

app.post('/api/v/:id/utr', (req, res) => {
  const j = jobFor(req, res);
  if (!j) return;
  if (j.paid) return res.json({ ok: true });
  const utr = String((req.body && req.body.utr) || '').replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z0-9]{6,30}$/.test(utr)) return res.status(400).json({ error: 'Enter the UPI reference / UTR number from your payment app (6 to 30 letters or digits).' });
  store.update(j.id, { utr, utrAt: Date.now() });
  res.json({ ok: true });
});

app.get('/download/:id', (req, res) => {
  const j = ID_RE.test(req.params.id) && store.get(req.params.id);
  if (!j) return res.status(404).send('This link is not valid.');
  if (!j.paid) return res.status(402).send('This video unlocks after payment is confirmed.');
  noStore(res);
  if (!req.headers.range) store.update(j.id, { downloads: (j.downloads || 0) + 1 });
  const ext = path.extname(j.original) || '.mp4';
  const name = j.originalName || `${j.title}${ext}`;
  const type = { '.mov': 'video/quicktime', '.webm': 'video/webm', '.mkv': 'video/x-matroska' }[ext] || 'video/mp4';
  sendFile(req, res, path.join(store.dirs.originals, j.original), { type, download: name });
});

app.use((req, res) => res.status(404).sendFile(path.join(ROOT, 'app', 'notfound.html')));

preview.resume();
app.listen(PORT, () => {
  console.log(`Jackie's Studio running on http://localhost:${PORT}`);
  console.log(`Client delivery page: /delivery   Secret admin page: ${ADMIN_PATH}  (keep this address private)`);
  if (FRONTEND) console.log(`Client links point to ${FRONTEND}`);
});
