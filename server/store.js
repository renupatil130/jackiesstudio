/* A tiny JSON file store. One small business, a few hundred videos at most:
   no database server needed. Writes go to a temp file first, then replace db.json. */
'use strict';

const fs = require('fs');
const path = require('path');

const DATA = path.resolve(process.env.DATA_DIR || path.join(__dirname, '..', 'data'));
const dirs = { root: DATA, originals: path.join(DATA, 'originals'), previews: path.join(DATA, 'previews'), tmp: path.join(DATA, 'tmp') };
for (const d of Object.values(dirs)) fs.mkdirSync(d, { recursive: true });

const FILE = path.join(DATA, 'db.json');
let jobs = {};
try { jobs = JSON.parse(fs.readFileSync(FILE, 'utf8')).jobs || {}; } catch { jobs = {}; }

let timer = null;
function save() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const tmp = FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ jobs }, null, 1));
    fs.renameSync(tmp, FILE);
  }, 50);
}
function flush() { if (timer) { clearTimeout(timer); timer = null; fs.writeFileSync(FILE, JSON.stringify({ jobs }, null, 1)); } }
process.on('exit', flush);
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { flush(); process.exit(0); });

module.exports = {
  dirs,
  all: () => Object.values(jobs),
  get: (id) => (Object.prototype.hasOwnProperty.call(jobs, id) ? jobs[id] : null),
  put: (job) => { jobs[job.id] = job; save(); return job; },
  update: (id, patch) => { if (jobs[id]) { Object.assign(jobs[id], patch); save(); } return jobs[id]; },
  remove: (id) => { delete jobs[id]; save(); },
};
