/* ==========================================================
   Visionneuse de publications – École Saint-Joseph Uccle
   Ce fichier est utilisé par toutes les publications.
   ========================================================== */
(async function(){

  // ===== Réglages : modifiez ici si besoin =====
  const SCHOOL_NAME = 'École Saint-Joseph Uccle';
  const SCHOOL_SITE = 'https://www.stjosephuccle.be';
  const GC_ACCOUNT  = 'apsaintjosephuccle';           // statistiques GoatCounter
  const COLORS = {
    bg: '#f4f1ec',      // fond autour du magazine
    bar: '#1f2a44',     // barre d'outils
    txt: '#ffffff',     // texte de la barre
    accent: '#c8a24a'   // barre de chargement
  };

  // ===== Quelle publication ? =====
  const params = new URLSearchParams(location.search);
  const PUB = window.PUB || null;   // défini par les pages créées automatiquement
  let file = null, name = null, pubTitle = null;
  if (PUB) { file = PUB.pdf; name = PUB.name; pubTitle = PUB.title; }
  else if (params.get('pdf')) { file = params.get('pdf'); name = file.replace(/\.pdf$/i, ''); }
  const startPage = Math.max(1, parseInt(params.get('page'), 10) || 1) - 1;
  const source = params.get('src');

  // ===== Styles =====
  const css = `
  :root{--bg:${COLORS.bg};--bar:${COLORS.bar};--txt:${COLORS.txt};--accent:${COLORS.accent}}
  html,body{margin:0;height:100%;background:var(--bg);font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
  #wrap{display:flex;flex-direction:column;height:100%}
  #stage{flex:1;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:10px;box-sizing:border-box;min-height:0}
  #bookBox{margin:0 auto;touch-action:pan-y}
  .page{background:#fff;overflow:hidden}
  .page img{display:block;width:100%;height:100%;object-fit:fill;user-select:none;-webkit-user-drag:none;pointer-events:none}
  .lnk{position:absolute;display:block;cursor:pointer;border-radius:3px;z-index:3;background:rgba(255,200,0,0);transition:background .15s}
  .lnk:hover,.lnk:focus-visible{background:rgba(255,200,0,.28);outline:none}
  .hl{position:absolute;background:rgba(255,213,0,.45);mix-blend-mode:multiply;pointer-events:none;border-radius:2px;z-index:2}
  #zoom{position:absolute;inset:0;overflow:auto;background:var(--bg);z-index:4;display:flex;cursor:grab;touch-action:pan-x pan-y;-webkit-overflow-scrolling:touch}
  #zoom[hidden]{display:none}
  #zoom.drag{cursor:grabbing}
  #zoomInner{margin:auto;display:flex;padding:10px;flex:none}
  .zpage{position:relative;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.18);flex:none}
  .zpage img{display:block;width:100%;height:100%;user-select:none;-webkit-user-drag:none;pointer-events:none}
  #bar{display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;background:var(--bar);color:var(--txt);padding:8px;position:relative}
  #bar button,#bar a{background:transparent;border:1px solid rgba(255,255,255,.4);color:var(--txt);padding:6px 12px;border-radius:6px;font-size:14px;cursor:pointer;text-decoration:none;font-family:inherit}
  #bar button:hover,#bar a:hover{background:rgba(255,255,255,.15)}
  #counter{min-width:80px;text-align:center;font-size:14px}
  #searchBar{display:flex;gap:6px;align-items:center;background:var(--bar);color:var(--txt);padding:8px 8px 0;flex-wrap:wrap;justify-content:center}
  #searchBar[hidden]{display:none}
  #searchBar input{flex:1;min-width:150px;max-width:340px;padding:7px 10px;border-radius:6px;border:1px solid rgba(255,255,255,.4);background:#fff;color:#222;font-size:15px;font-family:inherit}
  #searchBar button{background:transparent;border:1px solid rgba(255,255,255,.4);color:var(--txt);padding:6px 10px;border-radius:6px;font-size:14px;cursor:pointer}
  #searchInfo{font-size:13px;min-width:120px;text-align:center}
  #shareMenu{position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:#fff;color:#222;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.25);padding:6px;display:flex;flex-direction:column;min-width:210px;z-index:10}
  #shareMenu[hidden]{display:none}
  #shareMenu button,#shareMenu a{all:unset;cursor:pointer;padding:10px 12px;border-radius:6px;font-size:15px;color:#222}
  #shareMenu button:hover,#shareMenu a:hover{background:#f0ede6}
  @media (max-width:640px){
    .lbl{display:none}
    #bar{gap:5px;padding:6px}
    #bar button,#bar a{padding:7px 9px;font-size:15px}
    #counter{min-width:56px;font-size:13px}
    #searchBar{padding:6px 6px 0;gap:5px}
    #searchBar input{min-width:0;flex:1 1 120px}
    #searchInfo{min-width:0;font-size:12px}
  }
  #loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#333;font-size:15px;z-index:5;background:var(--bg)}
  .progress{width:220px;height:6px;background:#ddd;border-radius:3px;overflow:hidden}
  .progress div{height:100%;width:0;background:var(--accent);transition:width .2s}
  #welcome{min-height:100%;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;text-align:center}
  #welcome .card{max-width:440px}
  #welcome .school{font-size:15px;letter-spacing:.08em;text-transform:uppercase;color:#6b6457;margin:0 0 8px}
  #welcome h1{font-size:32px;margin:0 0 12px;color:var(--bar)}
  #welcome p{color:#4a4539;line-height:1.5;margin:0 0 24px}
  #welcome a{display:inline-block;background:var(--bar);color:var(--txt);text-decoration:none;padding:12px 22px;border-radius:8px;font-size:16px}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ===== Page d'accueil (lien principal sans publication) =====
  if (!file) {
    document.body.innerHTML = `
      <div id="welcome"><div class="card">
        <p class="school">${SCHOOL_NAME}</p>
        <h1>Publications</h1>
        <p>Retrouvez notre magazine, Les Échos et toutes nos annonces sur le site de l'école.</p>
        <a href="${SCHOOL_SITE}">Visiter le site de l'école</a>
      </div></div>`;
    return;
  }

  // ===== Mise en page =====
  document.body.innerHTML = `
  <div id="wrap">
    <div id="stage">
      <div id="loading">
        <div id="loadText">Chargement…</div>
        <div class="progress"><div id="progressBar"></div></div>
      </div>
      <div id="bookBox"></div>
      <div id="zoom" hidden><div id="zoomInner"></div></div>
    </div>
    <div id="searchBar" hidden>
      <input id="searchInput" type="search" placeholder="Rechercher un mot…" aria-label="Rechercher">
      <button id="searchPrev" aria-label="Résultat précédent">◀</button>
      <span id="searchInfo"></span>
      <button id="searchNext" aria-label="Résultat suivant">▶</button>
      <button id="searchClose" aria-label="Fermer la recherche">✕</button>
    </div>
    <div id="bar">
      <button id="prev" aria-label="Page précédente">◀</button>
      <span id="counter">–</span>
      <button id="next" aria-label="Page suivante">▶</button>
      <button id="zoomOut" aria-label="Zoom arrière" title="Zoom arrière">🔍−</button>
      <button id="zoomIn" aria-label="Zoom avant" title="Zoom avant">🔍+</button>
      <button id="searchBtn" title="Rechercher" aria-label="Rechercher">🔎<span class="lbl"> Rechercher</span></button>
      <button id="shareBtn" title="Partager" aria-label="Partager">↗<span class="lbl"> Partager</span></button>
      <button id="full" title="Plein écran" aria-label="Plein écran">⛶<span class="lbl"> Plein écran</span></button>
      <a id="download" download title="Télécharger" aria-label="Télécharger">⬇<span class="lbl"> Télécharger</span></a>
      <div id="shareMenu" hidden>
        <a id="shareWa" target="_blank" rel="noopener">💬 WhatsApp</a>
        <a id="shareMail">✉️ E-mail</a>
        <button id="shareCopy">🔗 Copier le lien</button>
        <button id="shareNative" hidden>📤 Autres applications…</button>
      </div>
    </div>
  </div>`;

  const $ = id => document.getElementById(id);
  const stage = $('stage'), bookBox = $('bookBox'), zoomEl = $('zoom'), zoomInner = $('zoomInner');
  const loading = $('loading'), loadText = $('loadText'), progressBar = $('progressBar'), counter = $('counter');
  $('download').href = file;
  if (!pubTitle) pubTitle = name.replace(/[-_]+/g, ' ').replace(/^\w/, c => c.toUpperCase());
  document.title = pubTitle + ' – ' + SCHOOL_NAME;

  // ===== Statistiques (GoatCounter, sans cookies) =====
  // Tableau de bord : https://apsaintjosephuccle.goatcounter.com
  const gcQueue = [];
  function stat(path, title, isEvent, extra){
    const data = Object.assign({ path: path, title: title, event: !!isEvent }, extra || {});
    if (window.goatcounter && window.goatcounter.count) window.goatcounter.count(data);
    else gcQueue.push(data);
  }
  window.goatcounter = { no_onload: true, allow_frame: true };
  const gc = document.createElement('script');
  gc.async = true;
  gc.src = 'https://gc.zgo.at/count.js';
  gc.dataset.goatcounter = 'https://' + GC_ACCOUNT + '.goatcounter.com/count';
  gc.onload = () => { while (gcQueue.length) window.goatcounter.count(gcQueue.shift()); };
  document.head.appendChild(gc);

  // Une ouverture (pas comptée si c'est l'onglet "plein écran").
  // ?src=qr / whatsapp / email… apparaît dans "Referrers" sur GoatCounter.
  if (!params.has('fs')) stat('/' + name, 'Publication – ' + name, false, source ? { referrer: source } : null);

  $('download').addEventListener('click', () => stat(name + ' – téléchargé', 'Téléchargement ' + name, true));

  // ===== Chargement des bibliothèques =====
  function loadScript(src){
    return new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = src; s.onload = ok; s.onerror = ko;
      document.head.appendChild(s);
    });
  }
  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js');
  } catch (e) {
    loadText.textContent = 'Problème de connexion. Veuillez réessayer.';
    return;
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  let pdf;
  try {
    pdf = await pdfjsLib.getDocument(file).promise;
  } catch (e) {
    loadText.textContent = 'Impossible de charger « ' + decodeURIComponent(file.split('/').pop()) + ' ».';
    progressBar.parentNode.style.display = 'none';
    return;
  }

  // ===== Rendu des pages =====
  const dpr = window.devicePixelRatio || 1;
  const longSide = Math.max(screen.width, screen.height);
  const RENDER_WIDTH = Math.min(2200, Math.max(1400, Math.ceil(longSide * dpr * 0.7)));

  async function renderPage(page, width){
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: width / base.width });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.92));
    canvas.width = canvas.height = 0;
    return URL.createObjectURL(blob);
  }

  // ===== Texte (recherche) et liens =====
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const URL_RE = /((?:https?:\/\/|www\.)[^\s<>"«»]+|(?:forms\.gle|bit\.ly|tinyurl\.com|docs\.google\.com)\/[^\s<>"«»]+)/gi;
  const cleanUrl = u => u.replace(/[.,;:!?)\]}'’]+$/, '');
  const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

  // Position d'un morceau de texte sur la page, en fractions (0 à 1).
  // On mesure le texte avec une police proche pour tenir compte des lettres larges/étroites.
  const measureCtx = document.createElement('canvas').getContext('2d');
  measureCtx.font = '100px Helvetica, Arial, sans-serif';
  const mw = t => measureCtx.measureText(t).width;
  function textBox(it, start, len){
    const full = mw(it.str) || 1;
    const x0 = mw(it.str.slice(0, start)) / full * it.w;
    const x1 = mw(it.str.slice(0, start + len)) / full * it.w;
    return { x: it.x + x0, y: it.y, w: x1 - x0, h: it.h };
  }

  async function analysePage(page){
    const out = { links: [], items: [], text: '' };
    const view = page.view, W = view[2] - view[0], H = view[3] - view[1];
    try {
      const annots = await page.getAnnotations();
      for (const a of annots) {
        if (a.subtype !== 'Link' || !a.rect) continue;
        const r = pdfjsLib.Util.normalizeRect(a.rect);
        const box = { x: (r[0] - view[0]) / W, y: (view[3] - r[3]) / H, w: (r[2] - r[0]) / W, h: (r[3] - r[1]) / H };
        const url = a.url || a.unsafeUrl;
        if (url && /^(https?:|mailto:|tel:)/i.test(url)) { out.links.push(Object.assign(box, { url })); continue; }
        if (a.dest) {
          try {
            const dest = typeof a.dest === 'string' ? await pdf.getDestination(a.dest) : a.dest;
            if (dest && dest[0] !== undefined && dest[0] !== null) {
              const idx = typeof dest[0] === 'number' ? dest[0] : await pdf.getPageIndex(dest[0]);
              out.links.push(Object.assign(box, { page: idx }));
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
    try {
      const base = page.getViewport({ scale: 1 });
      const tc = await page.getTextContent();
      const parts = [];
      for (const item of tc.items) {
        const str = item.str;
        if (!str) continue;
        parts.push(str);
        const t = pdfjsLib.Util.transform(base.transform, item.transform);
        if (Math.abs(t[1]) > 0.01 || Math.abs(t[2]) > 0.01) continue; // texte horizontal seulement
        const fontH = Math.hypot(t[2], t[3]);
        const it = {
          str: str, n: norm(str),
          x: t[4] / base.width, y: (t[5] - fontH) / base.height,
          w: item.width / base.width, h: (fontH * 1.25) / base.height
        };
        out.items.push(it);
        if (/(https?:|www\.|forms\.gle|bit\.ly|tinyurl|docs\.google)/i.test(str)) {
          let m; URL_RE.lastIndex = 0;
          while ((m = URL_RE.exec(str))) {
            const txt = cleanUrl(m[0]);
            const box = textBox(it, m.index, txt.length);
            if (out.links.some(o => overlaps(o, box))) continue;
            box.url = /^https?:/i.test(txt) ? txt : 'https://' + txt;
            out.links.push(box);
          }
        }
      }
      out.text = norm(parts.join(' ')).replace(/\s+/g, ' ');
    } catch (e) {}
    return out;
  }

  const urls = [], info = [];
  let ratio = 0.707;
  loadText.textContent = 'Chargement de « ' + pubTitle + ' »…';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    if (i === 1) { const b = page.getViewport({ scale: 1 }); ratio = b.width / b.height; }
    urls.push(await renderPage(page, RENDER_WIDTH));
    info.push(await analysePage(page));
    progressBar.style.width = Math.round(i / pdf.numPages * 100) + '%';
  }

  // ===== Livre =====
  let flip = null, current = Math.min(startPage, pdf.numPages - 1), lastMode = '';
  let pageW = 300, pageH = 424;
  let pageEls = [];
  let highlights = {};   // page -> [boxes]

  function placeBox(el, b){
    el.style.left = (b.x * 100) + '%';
    el.style.top = (b.y * 100) + '%';
    el.style.width = (b.w * 100) + '%';
    el.style.height = (b.h * 100) + '%';
  }

  function addLinks(container, i){
    info[i].links.forEach(l => {
      const a = document.createElement('a');
      a.className = 'lnk';
      placeBox(a, l);
      if (l.url) {
        a.href = l.url; a.target = '_blank'; a.rel = 'noopener'; a.title = l.url;
        a.addEventListener('click', e => {
          e.stopPropagation();
          let host = l.url;
          try { host = new URL(l.url).hostname.replace(/^www\./, ''); } catch (err) {}
          stat(name + ' – lien : ' + host, 'Lien ' + name, true);
        });
      } else {
        a.href = '#'; a.title = 'Aller à la page ' + (l.page + 1);
        a.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); goToPage(l.page); });
      }
      ['mousedown', 'touchstart', 'pointerdown'].forEach(ev =>
        a.addEventListener(ev, e => e.stopPropagation(), { passive: true }));
      container.appendChild(a);
    });
  }

  function addHighlights(container, i){
    container.querySelectorAll('.hl').forEach(h => h.remove());
    (highlights[i] || []).forEach(b => {
      const d = document.createElement('div');
      d.className = 'hl';
      placeBox(d, b);
      container.appendChild(d);
    });
  }

  function fixPrev(f){
    // Contourne un défaut de la bibliothèque : "page précédente" en mode une page
    const orig = f.flipPrev.bind(f);
    f.flipPrev = corner => {
      if (f.getOrientation() !== 'portrait') return orig(corner);
      if (f.getCurrentPageIndex() === 0) return;
      const r = f.getRender().getRect();
      f.getFlipController().flip({ x: r.left + 10, y: corner === 'bottom' ? r.height - 2 : 1 });
    };
  }
  const goPrev = () => { if (flip) flip.flipPrev(); };
  const goNext = () => { if (flip) flip.flipNext(); };
  function goToPage(p){
    closeZoom();
    if (visiblePages().includes(p)) return;
    if (flip.getOrientation() === 'portrait' && p < flip.getCurrentPageIndex()) { flip.turnToPage(p); update(); }
    else flip.flip(p);
  }

  const isMobile = () => { const w = stage.clientWidth, h = stage.clientHeight; return w < 700 || w < h; };

  function build(){
    const w = stage.clientWidth - 20, h = stage.clientHeight - 20;
    const single = isMobile();
    const pages = single ? 1 : 2;
    pageW = Math.max(120, Math.floor(Math.min(w / pages, h * ratio)));
    pageH = Math.floor(pageW / ratio);

    if (flip) { current = flip.getCurrentPageIndex(); flip.destroy(); }
    bookBox.innerHTML = '';
    bookBox.style.width = (pageW * pages) + 'px';
    bookBox.style.height = pageH + 'px';

    const book = document.createElement('div');
    pageEls = urls.map((u, i) => {
      const p = document.createElement('div');
      p.className = 'page';
      if (i === 0 || i === urls.length - 1) p.dataset.density = 'hard';
      const img = document.createElement('img');
      img.src = u; img.alt = 'Page ' + (i + 1);
      p.appendChild(img);
      addLinks(p, i);
      addHighlights(p, i);
      book.appendChild(p);
      return p;
    });
    bookBox.appendChild(book);

    flip = new St.PageFlip(book, {
      width: pageW, height: pageH, size: 'fixed',
      showCover: !single, usePortrait: true,
      maxShadowOpacity: 0.4, mobileScrollSupport: false,
      startPage: current, flippingTime: 700,
      disableFlipByClick: true
    });
    flip.loadFromHTML(book.querySelectorAll('.page'));
    fixPrev(flip);
    flip.on('flip', () => { update(); if (!zoomEl.hidden) renderZoomPages(); });
    lastMode = single ? 'single' : 'double';
    update();
    if (!zoomEl.hidden) renderZoomPages();
  }

  function visiblePages(){
    const i = flip.getCurrentPageIndex(), n = flip.getPageCount();
    return (lastMode === 'double' && i > 0 && i < n - 1) ? [i, i + 1] : [i];
  }

  const reached = {};
  function update(){
    if (!flip) return;
    const i = flip.getCurrentPageIndex(), n = flip.getPageCount();
    const vp = visiblePages();
    counter.textContent = vp.length === 2 ? (i + 1) + '–' + (i + 2) + ' / ' + n : (i + 1) + ' / ' + n;
    const pct = (vp[vp.length - 1] + 1) / n * 100;
    [25, 50, 75, 100].forEach(m => {
      if (pct >= m && !reached[m]) {
        reached[m] = true;
        stat(name + ' – ' + (m === 100 ? 'lu jusqu\'à la fin' : 'lu à ' + m + ' %'), 'Lecture ' + name + ' ' + m + '%', true);
      }
    });
  }

  // ===== ZOOM =====
  const MAX_ZOOM = 4, STEP = 1.5;
  let zoom = 1, zoomStatSent = false;
  const hiRes = {}, hiResOrder = [];

  function renderZoomPages(){
    zoomInner.innerHTML = '';
    visiblePages().forEach(p => {
      const d = document.createElement('div');
      d.className = 'zpage'; d.dataset.page = p;
      const img = document.createElement('img');
      img.src = (hiRes[p] && hiRes[p].url) || urls[p]; img.alt = 'Page ' + (p + 1);
      d.appendChild(img);
      addLinks(d, p);
      addHighlights(d, p);
      zoomInner.appendChild(d);
    });
    sizeZoomPages();
  }
  function sizeZoomPages(){
    zoomInner.querySelectorAll('.zpage').forEach(d => {
      d.style.width = Math.round(pageW * zoom) + 'px';
      d.style.height = Math.round(pageH * zoom) + 'px';
    });
    upgradeSharpness();
  }
  let sharpTimer;
  function upgradeSharpness(){
    clearTimeout(sharpTimer);
    sharpTimer = setTimeout(async () => {
      const need = pageW * zoom * dpr;
      if (need <= RENDER_WIDTH * 1.15) return;
      const target = Math.min(4000, Math.ceil(need / 500) * 500);
      for (const d of zoomInner.querySelectorAll('.zpage')) {
        const p = +d.dataset.page;
        if (!hiRes[p] || hiRes[p].w < target) {
          const url = await renderPage(await pdf.getPage(p + 1), target);
          if (hiRes[p]) URL.revokeObjectURL(hiRes[p].url);
          hiRes[p] = { w: target, url };
          hiResOrder.push(p);
          while (hiResOrder.length > 6) {
            const old = hiResOrder.shift();
            if (hiRes[old] && !hiResOrder.includes(old)) { URL.revokeObjectURL(hiRes[old].url); delete hiRes[old]; }
          }
        }
        const img = d.querySelector('img');
        if (img && hiRes[p]) img.src = hiRes[p].url;
      }
    }, 250);
  }
  function contentFrac(cx, cy){
    const r = zoomInner.getBoundingClientRect(), c = zoomEl.getBoundingClientRect();
    return { u: (c.left + cx - r.left) / r.width, v: (c.top + cy - r.top) / r.height };
  }
  function setZoom(level, cx, cy, u, v){
    level = Math.min(MAX_ZOOM, Math.max(1, level));
    if (zoomEl.hidden) {
      zoomEl.hidden = false;
      renderZoomPages();
      if (!zoomStatSent) { zoomStatSent = true; stat(name + ' – zoom', 'Zoom ' + name, true); }
    }
    if (cx === undefined) { cx = zoomEl.clientWidth / 2; cy = zoomEl.clientHeight / 2; }
    if (u === undefined) { const f = contentFrac(cx, cy); u = f.u; v = f.v; }
    zoom = level;
    sizeZoomPages();
    const r = zoomInner.getBoundingClientRect(), c = zoomEl.getBoundingClientRect();
    zoomEl.scrollLeft += (r.left + u * r.width) - (c.left + cx);
    zoomEl.scrollTop  += (r.top + v * r.height) - (c.top + cy);
  }
  function closeZoom(){
    if (zoomEl.hidden) return;
    zoomEl.hidden = true; zoom = 1; zoomInner.innerHTML = '';
  }
  const zoomIn = () => setZoom(zoomEl.hidden ? STEP : zoom * STEP);
  function zoomOut(){
    if (zoomEl.hidden) return;
    const next = zoom / STEP;
    if (next < 1.05) closeZoom(); else setZoom(next);
  }
  function zoomAtBookPoint(clientX, clientY, level){
    const b = bookBox.getBoundingClientRect();
    let u = (clientX - b.left) / b.width, v = (clientY - b.top) / b.height;
    if (lastMode === 'double' && visiblePages().length === 1) {
      u = flip.getCurrentPageIndex() === 0 ? (u - 0.5) * 2 : u * 2;
    }
    u = Math.min(1, Math.max(0, u)); v = Math.min(1, Math.max(0, v));
    zoomEl.hidden = false; zoom = 1;
    renderZoomPages();
    if (!zoomStatSent) { zoomStatSent = true; stat(name + ' – zoom', 'Zoom ' + name, true); }
    const c = zoomEl.getBoundingClientRect();
    setZoom(level, clientX - c.left, clientY - c.top, u, v);
  }

  // Clic simple = tourner la page ; double clic = zoom (souris)
  let downX = 0, downY = 0, clickTimer = null, lastClick = 0, lastTouch = 0;
  bookBox.addEventListener('pointerdown', e => { downX = e.clientX; downY = e.clientY; });
  bookBox.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    if (Date.now() - lastTouch < 800) return;
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 8) return;
    if (flip.getState() === 'flipping') return;
    const now = Date.now();
    if (clickTimer && now - lastClick < 320) {
      clearTimeout(clickTimer); clickTimer = null;
      zoomAtBookPoint(e.clientX, e.clientY, 2);
      return;
    }
    lastClick = now;
    const x = e.clientX, b = bookBox.getBoundingClientRect();
    clickTimer = setTimeout(() => {
      clickTimer = null;
      if (flip.getState() !== 'read') return;
      if (x < b.left + b.width / 2) goPrev(); else goNext();
    }, 320);
  });

  // Toucher simple = tourner ; double toucher = zoom (téléphone)
  let tapT = 0, tapX = 0, tapY = 0, tapStartX = 0, tapStartY = 0, tapMulti = false, tapTimer = null;
  bookBox.addEventListener('touchstart', e => {
    tapMulti = e.touches.length > 1;
    tapStartX = e.touches[0].clientX; tapStartY = e.touches[0].clientY;
  }, { passive: true });
  bookBox.addEventListener('touchend', e => {
    if (tapMulti || e.target.closest('a')) return;
    const t = e.changedTouches[0];
    if (Math.hypot(t.clientX - tapStartX, t.clientY - tapStartY) > 10) return;
    lastTouch = Date.now();
    if (flip.getState() === 'flipping') return;
    const now = Date.now();
    if (now - tapT < 320 && Math.hypot(t.clientX - tapX, t.clientY - tapY) < 40) {
      tapT = 0; clearTimeout(tapTimer); tapTimer = null;
      e.preventDefault();
      zoomAtBookPoint(t.clientX, t.clientY, 2);
    } else {
      tapT = now; tapX = t.clientX; tapY = t.clientY;
      const x = t.clientX, b = bookBox.getBoundingClientRect();
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => {
        tapTimer = null;
        if (flip.getState() !== 'read') return;
        if (x < b.left + b.width / 2) goPrev(); else goNext();
      }, 320);
    }
  }, { passive: false });

  // Double clic dans le zoom = revenir
  let zLast = 0, dragging = false, dragMoved = false, sx = 0, sy = 0, sl = 0, st = 0;
  zoomEl.addEventListener('click', e => {
    if (e.target.closest('a') || dragMoved) return;
    const now = Date.now();
    if (now - zLast < 320) { zLast = 0; closeZoom(); } else zLast = now;
  });
  zoomEl.addEventListener('mousedown', e => {
    if (e.button !== 0 || e.target.closest('a')) return;
    dragging = true; dragMoved = false;
    sx = e.clientX; sy = e.clientY; sl = zoomEl.scrollLeft; st = zoomEl.scrollTop;
    zoomEl.classList.add('drag'); e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 4) dragMoved = true;
    zoomEl.scrollLeft = sl - (e.clientX - sx);
    zoomEl.scrollTop = st - (e.clientY - sy);
  });
  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false; zoomEl.classList.remove('drag');
    setTimeout(() => { dragMoved = false; }, 0);
  });

  // Ctrl + molette / pincement du pavé tactile
  stage.addEventListener('wheel', e => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.01);
    if (zoomEl.hidden) { if (factor > 1) zoomAtBookPoint(e.clientX, e.clientY, Math.max(1.2, factor)); return; }
    const c = zoomEl.getBoundingClientRect(), next = zoom * factor;
    if (next < 1.02) closeZoom(); else setZoom(next, e.clientX - c.left, e.clientY - c.top);
  }, { passive: false });

  // Pincer avec deux doigts
  let pinch = null;
  const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  stage.addEventListener('touchstart', e => {
    if (e.touches.length !== 2) return;
    e.stopPropagation(); e.preventDefault();
    clearTimeout(tapTimer); tapTimer = null;
    const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    if (zoomEl.hidden) zoomAtBookPoint(mx, my, 1);
    const c = zoomEl.getBoundingClientRect();
    const f = contentFrac(mx - c.left, my - c.top);
    pinch = { d0: dist(e.touches), z0: zoom, u: f.u, v: f.v };
  }, { capture: true, passive: false });
  stage.addEventListener('touchmove', e => {
    if (!pinch || e.touches.length !== 2) return;
    e.stopPropagation(); e.preventDefault();
    const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    const c = zoomEl.getBoundingClientRect();
    setZoom(pinch.z0 * dist(e.touches) / pinch.d0, mx - c.left, my - c.top, pinch.u, pinch.v);
  }, { capture: true, passive: false });
  stage.addEventListener('touchend', e => {
    if (!pinch || e.touches.length >= 2) return;
    pinch = null;
    if (zoom < 1.1) closeZoom();
  }, { capture: true });

  // ===== RECHERCHE =====
  const searchBar = $('searchBar'), searchInput = $('searchInput'), searchInfo = $('searchInfo');
  let results = [], resultIdx = -1, searchStatSent = false, searchTimer;

  function runSearch(){
    const q = norm(searchInput.value.trim()).replace(/\s+/g, ' ');
    highlights = {};
    results = [];
    if (q.length >= 2) {
      let total = 0;
      info.forEach((pg, i) => {
        let count = 0, pos = pg.text.indexOf(q);
        while (pos !== -1) { count++; pos = pg.text.indexOf(q, pos + q.length); }
        if (!count) return;
        total += count;
        results.push(i);
        const boxes = [];
        pg.items.forEach(it => {
          let p = it.n.indexOf(q);
          while (p !== -1) { boxes.push(textBox(it, p, q.length)); p = it.n.indexOf(q, p + q.length); }
        });
        highlights[i] = boxes;
      });
      if (!searchStatSent) { searchStatSent = true; stat(name + ' – recherche', 'Recherche ' + name, true); }
      searchInfo.textContent = total ? total + ' résultat' + (total > 1 ? 's' : '') : 'Aucun résultat';
    } else searchInfo.textContent = '';
    pageEls.forEach((el, i) => addHighlights(el, i));
    zoomInner.querySelectorAll('.zpage').forEach(d => addHighlights(d, +d.dataset.page));
    resultIdx = -1;
    if (results.length) showResult(0);
  }
  function showResult(k){
    if (!results.length) return;
    resultIdx = (k + results.length) % results.length;
    const p = results[resultIdx];
    const total = searchInfo.textContent.split(' · ')[0];
    searchInfo.textContent = total + ' · page ' + (p + 1);
    goToPage(p);
  }
  function nextResultAfterCurrent(dir){
    if (!results.length) return;
    if (resultIdx === -1) return showResult(0);
    showResult(resultIdx + dir);
  }
  $('searchBtn').onclick = () => {
    searchBar.hidden = !searchBar.hidden;
    if (!searchBar.hidden) { searchInput.focus(); } else clearSearch();
    setTimeout(build, 50);
  };
  function clearSearch(){ searchInput.value = ''; runSearch(); }
  $('searchClose').onclick = () => { searchBar.hidden = true; clearSearch(); setTimeout(build, 50); };
  searchInput.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(runSearch, 300); });
  searchInput.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Enter') { clearTimeout(searchTimer); if (!results.length) runSearch(); else nextResultAfterCurrent(e.shiftKey ? -1 : 1); }
    if (e.key === 'Escape') $('searchClose').click();
  });
  $('searchNext').onclick = () => nextResultAfterCurrent(1);
  $('searchPrev').onclick = () => nextResultAfterCurrent(-1);

  // ===== PARTAGE =====
  const shareMenu = $('shareMenu');
  let shareUrl;
  if (PUB) shareUrl = new URL('./', location.href).href;
  else {
    const u = new URL(location.href);
    ['fs', 'src', 'page'].forEach(k => u.searchParams.delete(k));
    shareUrl = u.href;
    // Lien court avec aperçu de couverture, s'il existe
    const slug = name.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
    const short = new URL(slug + '/', new URL('./', location.href)).href;
    fetch(short, { method: 'HEAD' }).then(r => { if (r.ok) { shareUrl = short; setShareLinks(); } }).catch(() => {});
  }
  function setShareLinks(){
    const text = pubTitle + ' – ' + SCHOOL_NAME;
    $('shareWa').href = 'https://wa.me/?text=' + encodeURIComponent(text + '\n' + shareUrl);
    $('shareMail').href = 'mailto:?subject=' + encodeURIComponent(text) + '&body=' + encodeURIComponent(shareUrl);
  }
  setShareLinks();
  const canNative = !!navigator.share;
  if (canNative) $('shareNative').hidden = false;
  const shareStat = how => stat(name + ' – partagé (' + how + ')', 'Partage ' + name, true);
  $('shareBtn').onclick = e => { e.stopPropagation(); shareMenu.hidden = !shareMenu.hidden; };
  document.addEventListener('click', e => { if (!shareMenu.hidden && !e.target.closest('#shareMenu')) shareMenu.hidden = true; });
  $('shareWa').addEventListener('click', () => { shareStat('whatsapp'); shareMenu.hidden = true; });
  $('shareMail').addEventListener('click', () => { shareStat('e-mail'); shareMenu.hidden = true; });
  $('shareCopy').onclick = async () => {
    try { await navigator.clipboard.writeText(shareUrl); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = shareUrl;
      document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e2) {} ta.remove();
    }
    $('shareCopy').textContent = '✓ Lien copié';
    setTimeout(() => { $('shareCopy').textContent = '🔗 Copier le lien'; shareMenu.hidden = true; }, 1200);
    shareStat('lien copié');
  };
  $('shareNative').onclick = async () => {
    shareMenu.hidden = true;
    try { await navigator.share({ title: pubTitle, text: pubTitle + ' – ' + SCHOOL_NAME, url: shareUrl }); shareStat('appli'); } catch (e) {}
  };

  // ===== Démarrage =====
  build();
  loading.style.display = 'none';

  let resizeT;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(build, 250); });

  $('prev').onclick = goPrev;
  $('next').onclick = goNext;
  $('zoomIn').onclick = zoomIn;
  $('zoomOut').onclick = zoomOut;
  document.addEventListener('keydown', e => {
    if (e.target === searchInput) return;
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === '+' || e.key === '=') zoomIn();
    if (e.key === '-') zoomOut();
    if (e.key === 'Escape') { closeZoom(); shareMenu.hidden = true; }
  });

  // Plein écran (si bloqué, ouvre dans un nouvel onglet)
  $('full').onclick = () => {
    const el = document.documentElement;
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    stat(name + ' – plein écran', 'Plein écran ' + name, true);
    const fsUrl = location.href + (location.search ? '&' : '?') + 'fs=1';
    if (el.requestFullscreen && document.fullscreenEnabled) {
      el.requestFullscreen().catch(() => window.open(fsUrl, '_blank'));
    } else window.open(fsUrl, '_blank');
  };
})();
