/* Makes the watermarked preview copy of each uploaded video with ffmpeg:
   lower resolution (short side 480 px), "PREVIEW" stamped in the middle and
   "JACKIE'S STUDIO · PREVIEW · PAY TO DOWNLOAD" drifting across, so a screen recording is useless.
   The watermarks are transparent PNGs in ./watermark, so this works with any ffmpeg build. */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const store = require('./store');

let FFMPEG = 'ffmpeg';
try { FFMPEG = require('ffmpeg-static') || 'ffmpeg'; } catch { /* fall back to system ffmpeg */ }

const WM_CENTER = path.join(__dirname, 'watermark', 'center.png'); // 2018 x 398
const WM_LINE = path.join(__dirname, 'watermark', 'line.png');     // 3123 x 135
const SHORT_SIDE = 480;

const queue = [];
let busy = false;

function enqueue(id) { queue.push(id); pump(); }
function resume() { for (const j of store.all()) if (j.previewStatus === 'processing') enqueue(j.id); }

function pump() {
  if (busy || !queue.length) return;
  const id = queue.shift();
  const job = store.get(id);
  if (!job) return pump();
  busy = true;
  make(job).then(
    ({ file, duration }) => store.update(id, { preview: file, duration, previewStatus: 'ready', previewError: '' }),
    (err) => { console.error('[preview]', id, err.message); store.update(id, { previewStatus: 'failed', previewError: err.message.slice(0, 300) }); },
  ).finally(() => { busy = false; pump(); });
}

function run(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let head = '', tail = '';
    p.stderr.on('data', (d) => { if (head.length < 20000) head += d; tail = (tail + d).slice(-4000); });
    p.on('error', (e) => reject(new Error('Could not start ffmpeg: ' + e.message)));
    p.on('close', (code) => resolve({ code, head, tail }));
  });
}

// Size, rotation and length of the upload, read from ffmpeg's own report.
async function probe(src) {
  const { head } = await run(['-hide_banner', '-i', src]);
  const v = /Stream #[^\n]*Video:[^\n]*?\b(\d{2,5})x(\d{2,5})\b/.exec(head);
  if (!v) throw new Error('This file has no video stream ffmpeg can read.');
  let w = +v[1], h = +v[2];
  const rot = /rotation of (-?\d+(?:\.\d+)?) degrees/.exec(head) || /rotate\s*:\s*(-?\d+)/.exec(head);
  if (rot && Math.abs(Math.round(+rot[1])) % 180 === 90) [w, h] = [h, w];
  const d = /Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/.exec(head);
  return { w, h, duration: d ? +d[1] * 3600 + +d[2] * 60 + +d[3] : 0 };
}

const even = (n) => Math.max(2, Math.round(n / 2) * 2);

async function make(job) {
  const src = path.join(store.dirs.originals, job.original);
  const name = job.id + '.mp4';
  const out = path.join(store.dirs.previews, name);
  const part = path.join(store.dirs.tmp, name);

  const { w, h, duration } = await probe(src);
  const k = Math.min(1, SHORT_SIDE / Math.min(w, h));
  const W = even(w * k), H = even(h * k);
  const cw = even(W * 0.82), ch = even(cw * 398 / 2018);            // big PREVIEW stamp
  const lh = even(Math.max(14, Math.min(W, H) / 16)), lw = even(lh * 3123 / 135); // drifting line

  const graph = [
    `[0:v]scale=${W}:${H},setsar=1[v]`,
    `[1:v]scale=${cw}:${ch}[c]`,
    `[2:v]scale=${lw}:${lh},split[l1][l2]`,
    `[v][c]overlay=(W-w)/2:(H-h)/2[a]`,
    `[a][l1]overlay=x='W-mod(t*70\\,W+w)':y=H*0.80:eval=frame[b]`,
    `[b][l2]overlay=x='mod(t*45\\,W+w)-w':y=H*0.10:eval=frame,format=yuv420p[out]`,
  ].join(';');

  const { code, tail } = await run(['-hide_banner', '-y', '-i', src, '-i', WM_CENTER, '-i', WM_LINE,
    '-filter_complex', graph, '-map', '[out]', '-map', '0:a:0?',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '30',
    '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', part]);
  if (code !== 0) {
    fs.rm(part, { force: true }, () => {});
    throw new Error('ffmpeg failed: ' + tail.split('\n').filter(Boolean).slice(-3).join(' | '));
  }
  fs.renameSync(part, out);
  return { file: name, duration };
}

module.exports = { enqueue, resume };
