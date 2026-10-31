/* Client delivery page: one-time preview, UPI payment, download once Jackie confirms. */
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const id = location.pathname.split('/').filter(Boolean).pop();
  const API = (window.API_BASE || '').replace(/\/+$/, '');
  const api = (p, opt) => fetch(`${API}/api/v/${id}${p}`, { cache: 'no-store', ...opt }).then(async (r) => {
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || 'Something went wrong.'), { status: r.status });
    return j;
  });
  const post = (p, body) => api(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
  const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

  const video = $('#video');
  const covers = ['#cvStart', '#cvWait', '#cvUsed', '#cvPaid', '#cvFail'].map((s) => $(s));
  const show = (sel) => covers.forEach((c) => { c.hidden = sel !== '#' + c.id; });
  let state = null, playing = false, timer = null;

  function render(s) {
    state = s;
    $('#loading').hidden = true; $('#page').hidden = false;
    document.title = `${s.title} — Jackie’s Studio`;
    $('#client').textContent = s.client;
    $('#title').textContent = s.title;
    $('#price').textContent = inr(s.price);
    const dl = `${API}/download/${id}`;
    $('#dl').href = dl; $('#dl2').href = dl;
    const wa = `https://wa.me/${s.whatsapp}`;
    $('#wa').href = wa;
    $('#waPaid').href = `${wa}?text=${encodeURIComponent(`Hi Jackie, I've paid ${inr(s.price)} for "${s.title}" (${s.client}). Here is my payment screenshot.`)}`;

    if (s.upi) {
      $('#upiBox').hidden = false; $('#noUpi').hidden = true;
      $('#qr').src = s.upi.qr; $('#upiId').textContent = s.upi.id; $('#upiLink').href = s.upi.link;
    } else { $('#upiBox').hidden = true; $('#noUpi').hidden = false; }

    $('#payUnpaid').hidden = s.paid || s.utrSubmitted;
    $('#payPending').hidden = s.paid || !s.utrSubmitted;
    $('#payDone').hidden = !s.paid;

    if (!playing) {
      if (s.paid) show('#cvPaid');
      else if (s.previewFailed) show('#cvFail');
      else if (!s.previewReady) show('#cvWait');
      else if (s.previewUsed) show('#cvUsed');
      else show('#cvStart');
    }
    clearTimeout(timer);
    if (!s.paid) timer = setTimeout(refresh, s.previewReady ? 10000 : 5000);
  }
  function refresh() { api('').then(render).catch((e) => { if (e.status === 404) gone(); else timer = setTimeout(refresh, 15000); }); }
  function gone() { $('#loading').hidden = true; $('#page').hidden = true; $('#bad').hidden = false; }

  // ---------- the one view ----------
  let ended = false;
  function finish() {
    if (ended || !playing) return;
    ended = true; playing = false;
    navigator.sendBeacon ? navigator.sendBeacon(`${API}/api/v/${id}/ended`) : post('/ended').catch(() => {});
    video.pause(); video.removeAttribute('src'); video.load(); video.controls = false;
    $('#live').hidden = true;
    state.previewUsed = true;
    render(state);
  }
  $('#playBtn').addEventListener('click', async () => {
    $('#playMsg').textContent = ''; $('#playMsg').className = 'msg';
    $('#playBtn').disabled = true;
    try {
      const { src } = await post('/preview');
      playing = true;
      covers.forEach((c) => { c.hidden = true; });
      $('#live').hidden = false;
      video.controls = true;
      video.src = API + src;
      await video.play().catch(() => {});
    } catch (e) {
      $('#playMsg').textContent = e.message; $('#playMsg').className = 'msg err';
      refresh();
    } finally { $('#playBtn').disabled = false; }
  });
  // one view means no rewinding: going back snaps to the furthest point watched
  let furthest = 0;
  video.addEventListener('timeupdate', () => { if (!video.seeking) furthest = Math.max(furthest, video.currentTime); });
  video.addEventListener('seeking', () => { if (video.currentTime < furthest - 0.3) video.currentTime = furthest; });
  video.addEventListener('loadedmetadata', () => { $('#player').classList.toggle('is-tall', video.videoHeight > video.videoWidth); });
  video.addEventListener('ended', finish);
  video.addEventListener('error', () => { if (playing && video.getAttribute('src')) { $('#playMsg').textContent = 'The preview stopped loading. Message Jackie on WhatsApp if you need another view.'; $('#playMsg').className = 'msg err'; finish(); } });
  video.addEventListener('contextmenu', (e) => e.preventDefault());
  addEventListener('pagehide', finish);

  // ---------- payment ----------
  $('#copyUpi').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(state.upi.id); $('#copyUpi').textContent = 'Copied'; } catch { $('#copyUpi').textContent = state.upi.id; }
    setTimeout(() => { $('#copyUpi').textContent = 'Copy'; }, 2000);
  });
  $('#utrForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const m = $('#utrMsg');
    m.className = 'msg'; m.textContent = 'Sending…';
    try { await post('/utr', { utr: $('#utr').value }); m.textContent = ''; refresh(); }
    catch (err) { m.className = 'msg err'; m.textContent = err.message; }
  });

  refresh();
})();
