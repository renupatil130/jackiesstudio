/* Admin: upload edits, copy client links, confirm UPI payments. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const when = (t) => (t ? new Date(t).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '');
  const mb = (b) => (b / 1048576).toFixed(b > 1e9 ? 0 : 1) + ' MB';
  async function call(path, opt = {}) {
    const r = await fetch(path, { cache: 'no-store', ...opt });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401 && path !== '/api/admin/login') { showLogin(); throw new Error(j.error || 'Please log in.'); }
    if (!r.ok) throw new Error(j.error || 'Something went wrong.');
    return j;
  }
  const post = (path, body) => call(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });

  let timer = null;
  function showLogin() { $('#loginView').hidden = false; $('#appView').hidden = true; $('#logout').hidden = true; clearTimeout(timer); setTimeout(() => $('#pw').focus(), 50); }
  function showApp(me) { $('#loginView').hidden = true; $('#appView').hidden = false; $('#logout').hidden = false; $('#upiWarn').hidden = !!me.upiConfigured; load(); }

  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const m = $('#loginMsg'); m.className = 'msg'; m.textContent = '';
    try { await post('/api/admin/login', { password: $('#pw').value }); $('#pw').value = ''; showApp(await call('/api/admin/me')); }
    catch (err) { m.className = 'msg err'; m.textContent = err.message; }
  });
  $('#logout').addEventListener('click', async () => { await post('/api/admin/logout').catch(() => {}); showLogin(); });

  // ---------- list ----------
  function chips(j) {
    const c = [];
    if (j.previewStatus === 'processing') c.push(['on', 'Making preview…']);
    else if (j.previewStatus === 'failed') c.push(['bad', 'Preview failed']);
    else c.push(j.previewState === 'used' ? ['on', 'Preview watched ' + when(j.previewWatchedAt)] : ['', 'Preview not watched yet']);
    if (j.paid) c.push(['good', 'Paid ' + when(j.paidAt)]);
    else if (j.utr) c.push(['on', 'Client says paid · UTR ' + j.utr]);
    else c.push(['', 'Not paid']);
    if (j.downloads) c.push(['good', `Downloaded ${j.downloads}×`]);
    return c.map(([k, t]) => `<span class="chip ui ${k}">${esc(t)}</span>`).join('');
  }
  function card(j) {
    const url = new URL(j.link, location.href).href;
    return `<article class="panel job" data-id="${esc(j.id)}">
      <div>
        <p class="ui" style="color:var(--ash)">${esc(j.client)} · ${inr(j.price)} · ${esc(mb(j.size))} · Code <b style="color:var(--molten);letter-spacing:.14em">${esc(j.code || '')}</b></p>
        <h3 style="margin-top:8px">${esc(j.title)}</h3>
        <div class="chips">${chips(j)}</div>
        ${j.previewStatus === 'failed' ? `<p class="msg err" style="margin-top:10px">${esc(j.previewError)}</p>` : ''}
      </div>
      <div class="btns">
        ${j.paid
          ? '<button class="btn btn--small ui" data-act="unpaid">Mark as unpaid</button>'
          : '<button class="btn btn--small btn--solid ui" data-act="paid">Mark as paid</button>'}
        ${j.previewState === 'used' ? '<button class="btn btn--small ui" data-act="reset">Allow one more preview</button>' : ''}
        <button class="btn btn--small btn--danger ui" data-act="delete">Delete</button>
      </div>
      <div class="link">
        <input class="input" readonly value="${esc(url)}" aria-label="Client link">
        <button class="btn btn--small ui" data-act="copy" data-url="${esc(url)}">Copy link</button>
        <a class="btn btn--small ui" href="${esc(j.link)}" target="_blank" rel="noopener">Open</a>
        <a class="btn btn--small ui" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`Hi ${j.client}, your video "${j.title}" is ready! Watch the preview here: ${url}  (or go to ${new URL('/delivery', url).href} and enter code ${j.code})`)}">Send on WhatsApp</a>
      </div>
    </article>`;
  }
  async function load() {
    clearTimeout(timer);
    try {
      const jobs = await call('/api/admin/jobs');
      const list = $('#list');
      const focused = document.activeElement && list.contains(document.activeElement);
      if (!focused) list.innerHTML = jobs.map(card).join('');
      $('#empty').hidden = jobs.length > 0;
      timer = setTimeout(load, jobs.some((j) => j.previewStatus === 'processing') ? 3000 : 15000);
    } catch (err) { if (!$('#loginView').hidden) return; alertMsg('Could not load deliveries: ' + err.message); }
  }
  $('#list').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const id = b.closest('.job').dataset.id;
    const act = b.dataset.act;
    try {
      if (act === 'copy') {
        try { await navigator.clipboard.writeText(b.dataset.url); b.textContent = 'Copied'; } catch { b.previousElementSibling.select(); b.textContent = 'Press Ctrl+C'; }
        setTimeout(() => { b.textContent = 'Copy link'; }, 2000);
        return;
      }
      if (act === 'delete' && b.dataset.sure !== '1') {
        b.dataset.sure = '1'; b.textContent = 'Tap again to delete';
        setTimeout(() => { b.dataset.sure = ''; b.textContent = 'Delete'; }, 3500);
        return;
      }
      b.disabled = true;
      if (act === 'paid' || act === 'unpaid') await post(`/api/admin/jobs/${id}/paid`, { paid: act === 'paid' });
      if (act === 'reset') await post(`/api/admin/jobs/${id}/reset-preview`);
      if (act === 'delete') await call(`/api/admin/jobs/${id}`, { method: 'DELETE' });
      b.blur(); load();
    } catch (err) { b.disabled = false; alertMsg(err.message); }
  });
  function alertMsg(t) { const m = $('#upMsg'); m.className = 'msg err'; m.textContent = t; }

  // ---------- upload ----------
  const file = $('#file'), drop = $('#drop');
  file.addEventListener('change', () => { $('#fileName').textContent = file.files[0] ? `${file.files[0].name} · ${mb(file.files[0].size)}` : 'Drop the edited video here'; });
  ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, () => drop.classList.remove('is-over')));
  drop.addEventListener('drop', (e) => { e.preventDefault(); if (e.dataTransfer.files[0]) { file.files = e.dataTransfer.files; file.dispatchEvent(new Event('change')); } });

  $('#upForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.currentTarget, m = $('#upMsg'), prog = $('#prog'), bar = $('#prog i'), btn = $('#upBtn');
    if (!file.files[0]) { m.className = 'msg err'; m.textContent = 'Choose a video file first.'; return; }
    const fd = new FormData(form);
    fd.delete('video'); fd.append('video', file.files[0]); // file last, so the text fields arrive first
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/jobs');
    prog.hidden = false; bar.style.width = '0'; btn.disabled = true; m.className = 'msg'; m.textContent = 'Uploading…';
    xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) { const p = ev.loaded / ev.total; bar.style.width = (p * 100).toFixed(1) + '%'; m.textContent = `Uploading… ${Math.round(p * 100)}%`; } };
    xhr.onload = () => {
      btn.disabled = false; prog.hidden = true;
      let j = {}; try { j = JSON.parse(xhr.responseText); } catch { /* */ }
      if (xhr.status === 401) return showLogin();
      if (xhr.status >= 400) { m.className = 'msg err'; m.textContent = j.error || 'Upload failed.'; return; }
      m.className = 'msg ok'; m.textContent = 'Uploaded. The preview is being made; copy the link below and send it to your client.';
      form.reset(); file.dispatchEvent(new Event('change'));
      load();
    };
    xhr.onerror = () => { btn.disabled = false; prog.hidden = true; m.className = 'msg err'; m.textContent = 'Upload failed. Check your connection and try again.'; };
    xhr.send(fd);
  });

  call('/api/admin/me').then((me) => (me.admin ? showApp(me) : showLogin())).catch(showLogin);
})();
