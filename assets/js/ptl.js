/* Publication line (ptl), version 3 (2026-11-25). Reads
   <script type="application/json" id="ptl-data"> (array of
   {g,t,y,title,href,venue,first,ln,sl,...}) and draws the
   deck-style diagram: three parallel straight lines on one
   density-stretched year scale (main line, leadership branch
   below, collaborations branch above, branches from 2022), every
   work a dot with a leader to its short label (sl). Leaders
   route through one shared gutter per line and side, sized by
   the tallest stack there, so no leader crosses a label. Plays
   once per browser session, slowed to about seven seconds at
   Hao's request, then rests. No libraries, no network calls. */
(function () {
  const root = document.getElementById('ptl'), src = document.getElementById('ptl-data');
  if (!root || !src) return;
  let data; try { data = JSON.parse(src.textContent).filter(d => d && d.y && d.title); } catch (e) { return; }
  if (!data.length) return;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const kindOf = t => /journal/i.test(t) ? 'j' : /book|dissertation/i.test(t) ? 'k' : /accepted|forthcoming/i.test(t) ? 'a' : 'c';
  const RANK = { k: 0, j: 1, c: 2, a: 3 };
  const ITEMS = data.map((d, i) => ({
    i, y: d.y, line: ['main', 'lead', 'collab'].includes(d.ln) ? d.ln : 'main',
    label: d.sl || null, kind: kindOf(d.t), title: d.title, venue: d.venue || '', t: d.t, href: d.href || '#'
  }));
  const LINES = {
    collab: { theme: 'Collaborations and other topics' },
    main: { theme: 'ICT (Immersive Technology; virtual space; Game-based learning; Generative AI) on language learning' },
    lead: { theme: 'ICT and leadership education or development' }
  };
  const NOW = new Date().getFullYear();
  const y0 = Math.min(...ITEMS.map(d => d.y)), y1 = Math.max(...ITEMS.map(d => d.y));
  const YEARS = []; for (let y = y0; y <= y1; y++) YEARS.push(y);
  const NOWY = Math.min(NOW, y1);
  const SPLITY = YEARS.includes(2022) ? 2022 : y0;
  /* Playback speed: the approved preview settled in about 4.3 s;
     Hao asked for slower, so every phase is scaled by this factor,
     bringing the settle to about seven seconds. */
  const SCALE = 1.55;

  root.innerHTML = `
    <div class="ptl-ctlrow"><span class="ptl-ctl"><button type="button" data-skip>Skip</button><button type="button" data-replay hidden>Replay</button></span></div>
    <div class="ptl-stage"><div data-svg></div><div class="ptl-tip" role="status"></div></div>`;
  const host = root.querySelector('[data-svg]'), tip = root.querySelector('.ptl-tip');
  const skipBtn = root.querySelector('[data-skip]'), replayBtn = root.querySelector('[data-replay]');

  const cv = document.createElement('canvas').getContext('2d');
  const tw = (t, font) => { cv.font = font; return cv.measureText(t).width; };
  const LABFONT = '13px "Source Serif 4", Georgia, serif';
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const smooth = p => p * p * (3 - 2 * p);
  const easeIO = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const invEase = u => { let lo = 0, hi = 1; for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (easeIO(mid) < u) lo = mid; else hi = mid; } return (lo + hi) / 2; };

  /* Shared scale: density-stretched year bands (busy years get more room). */
  function buildBands(W, L, R) {
    const counts = {}; YEARS.forEach(yy => counts[yy] = 0);
    ITEMS.forEach(d => counts[d.y]++);
    const wts = YEARS.map(yy => 0.9 + 0.42 * counts[yy]);
    const tot = wts.reduce((a, b) => a + b, 0);
    let acc = 0; const bands = {};
    YEARS.forEach((yy, i) => { const a = L + (R - L) * acc / tot; acc += wts[i]; bands[yy] = { x0: a, x1: L + (R - L) * acc / tot, y: yy }; });
    return bands;
  }
  const byBand = (line, yy) => ITEMS.filter(d => d.line === line && d.y === yy)
    .sort((a, b) => (RANK[a.kind] - RANK[b.kind]) || (((a.label || a.title) < (b.label || b.title)) ? -1 : 1));
  const bead = (d, r) => `<circle class="bd bd-${d.kind}" r="${r}"/>`;

  const deskPos = {}, mobPos = {};
  let GEO = null;

  /* ================= DESKTOP ================= */
  const VW = 1160, DL = 10, DR = 1150;
  const Y_COL = 176, Y_MAIN = 284, Y_LEAD = 396, HGT = 534;
  let deskUp = 0, deskDn = 0;

  function buildDesktop() {
    const bands = buildBands(VW, DL, DR);
    const splitX = bands[SPLITY].x0, nowEndX = bands[NOWY].x1;
    const g = {};
    ['collab', 'main', 'lead'].forEach(ln => {
      YEARS.forEach(yy => {
        const items = byBand(ln, yy);
        items.forEach((d, i) => { g[d.i] = { x: bands[yy].x0 + (bands[yy].x1 - bands[yy].x0) * (i + 1) / (items.length + 1), band: bands[yy] }; });
      });
    });
    /* Main-line labels split above and below the axis, balanced. */
    YEARS.forEach(yy => {
      byBand('main', yy).forEach(d => { if (!d.label) return; d._side = (deskUp <= deskDn) ? 'up' : 'down'; if (d._side === 'up') deskUp++; else deskDn++; });
    });
    function stacksFor(line, side, maxRows) {
      const groups = [];
      YEARS.forEach(yy => {
        let items = byBand(line, yy).filter(d => d.label);
        if (line === 'main') items = items.filter(d => d._side === side);
        if (items.length) groups.push({ year: yy, items });
      });
      const merged = [];
      groups.forEach(gr => {
        const prev = merged[merged.length - 1];
        let gapOk = false;
        if (prev) {
          const prevLast = Math.max(...prev.items.map(d => g[d.i].x));
          const grFirst = Math.min(...gr.items.map(d => g[d.i].x));
          gapOk = (grFirst - prevLast) <= 170;
        }
        if (prev && gapOk && prev.items.length + gr.items.length <= maxRows && gr.items.length <= 2) { prev.items = prev.items.concat(gr.items); prev.years.push(gr.year); }
        else merged.push({ years: [gr.year], items: gr.items.slice() });
      });
      merged.forEach(st => st.items.sort((a, b) => g[a.i].x - g[b.i].x));
      return merged;
    }
    function layoutStacks(line, side, maxRows) {
      const stacks = stacksFor(line, side, maxRows);
      const placed = []; let prevRight = DL - 14;
      stacks.forEach(st => {
        let maxW = 0; st.items.forEach(d => maxW = Math.max(maxW, tw(d.label, LABFONT)));
        const firstBand = bands[st.years[0]];
        const pref = Math.min(firstBand.x0 + 2, g[st.items[0].i].x - 2);
        const spine = Math.max(pref, prevRight + 14);
        st.spine = spine; st.w = maxW; st.right = spine + 9 + maxW; prevRight = st.right; placed.push(st);
      });
      if (placed.length && placed[placed.length - 1].right > DR) {
        const shift = placed[placed.length - 1].right - DR;
        placed.forEach(st => { st.spine -= shift; st.right -= shift; });
      }
      return placed;
    }
    const MAIN_DRAW = 3400, BR_DRAW = 1150;
    const uOf = x => (x - DL) / (nowEndX - DL);
    const tMain = x => invEase(clamp01(uOf(x))) * MAIN_DRAW;
    const tSplit = tMain(splitX);
    const tBranch = x => { const u = (x - splitX) / (DR - splitX); return tSplit + invEase(clamp01(u)) * BR_DRAW; };
    const tOf = (ln, d, x) => d.y > NOWY ? MAIN_DRAW + 50 : (ln === 'main' ? tMain(x) : tBranch(x));

    const out = { collab: '', main: '', lead: '' };
    function drawStacks(line, side, lineY, maxRows) {
      const stacks = layoutStacks(line, side, maxRows);
      /* One shared gutter per line and side, sized by the tallest
         stack on that side: every leader's horizontal lane runs
         inside this band next to the axis, and every label stack
         starts beyond it, so a lane or a dot-drop can never reach
         another stack's label text. (With per-stack gutters, a
         short stack's label sat inside a tall neighbour's lane
         band and its lanes struck through the text.) */
      const step = 2.6;
      const maxK = stacks.reduce((m, st) => Math.max(m, st.items.length), 1);
      const gutter = lineY + (side === 'up' ? -1 : 1) * (6 + maxK * step + 3 + ((line === 'main' && side === 'up') ? 4 : 0) + ((line === 'main' && side === 'down') ? 14 : 0));
      stacks.forEach(st => {
        st.items.forEach((d, r) => {
          const gx = g[d.i].x;
          const laneY = lineY + (side === 'up' ? -1 : 1) * (6 + r * step);
          const base = side === 'up' ? gutter - 4 - r * 17 : gutter + 13 + r * 17;
          const tickY = base - 4;
          const dpath = 'M' + gx.toFixed(1) + ' ' + (lineY + (side === 'up' ? -5.5 : 5.5)).toFixed(1)
            + ' L' + gx.toFixed(1) + ' ' + laneY.toFixed(1)
            + ' L' + st.spine.toFixed(1) + ' ' + laneY.toFixed(1)
            + ' L' + st.spine.toFixed(1) + ' ' + tickY.toFixed(1)
            + ' L' + (st.spine + 5).toFixed(1) + ' ' + tickY.toFixed(1);
          const t0 = tOf(line, d, gx);
          out[line] += `<path class="lead-path" pathLength="1" data-line="${line}" d="${dpath}" data-anim="leader" data-t0="${Math.round(t0 + 70)}"/>`;
          out[line] += `<text class="lab" data-i="${d.i}" data-line="${line}" x="${(st.spine + 9).toFixed(1)}" y="${base.toFixed(1)}" data-anim="fade" data-t0="${Math.round(t0 + 250)}" data-dur="300">${esc(d.label)}</text>`;
          d._dotT0 = t0;
        });
      });
    }
    const linePath = (x0, x1, y) => 'M' + x0 + ' ' + y + ' L' + x1 + ' ' + y;
    const arrow = (y, t0, dur, o) => `<path class="arrowhead" d="M${DR - 6} ${y - 3.4} L${DR + 1} ${y} L${DR - 6} ${y + 3.4}" data-anim="fade"${o ? ` data-o="${o}"` : ''} data-t0="${Math.round(t0)}" data-dur="${dur}"/>`;
    /* Branch lines first, main line over them. */
    out.collab += `<path class="axis" d="${linePath(splitX, DR, Y_COL)}" data-anim="line" data-t0="${Math.round(tSplit)}" data-dur="${BR_DRAW}"/>`;
    out.collab += arrow(Y_COL, tSplit + BR_DRAW - 150, 300);
    out.collab += `<text class="theme" x="${(splitX + 2).toFixed(1)}" y="${Y_COL + 16}" data-anim="fade" data-t0="${Math.round(tSplit + 600)}" data-dur="500">${esc(LINES.collab.theme)}</text>`;
    out.lead += `<path class="axis" d="${linePath(splitX, DR, Y_LEAD)}" data-anim="line" data-t0="${Math.round(tSplit)}" data-dur="${BR_DRAW}"/>`;
    out.lead += arrow(Y_LEAD, tSplit + BR_DRAW - 150, 300);
    out.lead += `<text class="theme" x="${(splitX + 2).toFixed(1)}" y="${Y_LEAD - 8}" data-anim="fade" data-t0="${Math.round(tSplit + 600)}" data-dur="500">${esc(LINES.lead.theme)}</text>`;
    out.main += `<path class="axis" d="${linePath(DL, nowEndX, Y_MAIN)}" data-anim="line" data-t0="0" data-dur="${MAIN_DRAW}"/>`;
    out.main += `<path class="futseg" d="${linePath(nowEndX, DR, Y_MAIN)}" data-anim="fade" data-o="0.55" data-t0="${MAIN_DRAW + 100}" data-dur="500"/>`;
    out.main += arrow(Y_MAIN, MAIN_DRAW + 500, 400, '0.55');
    out.main += `<text class="theme" x="${DL}" y="206" data-anim="fade" data-t0="300" data-dur="500">${esc(LINES.main.theme)}</text>`;
    /* Year strip on the main axis: rules under the leaders, year texts over them. */
    let stripOut = '';
    YEARS.forEach(yy => {
      const b = bands[yy], fut = yy > NOWY;
      out.main += `<line class="strip" x1="${(b.x0 + 3).toFixed(1)}" y1="${Y_MAIN + 10}" x2="${(b.x1 - 3).toFixed(1)}" y2="${Y_MAIN + 10}"${fut ? ' stroke-dasharray="2 3"' : ''} data-anim="fade" data-t0="${Math.round(tMain(b.x0))}" data-dur="350" opacity="0"/>`;
      stripOut += `<text class="yr${fut ? ' fut' : ''}" x="${((b.x0 + b.x1) / 2).toFixed(1)}" y="${Y_MAIN + 24}" text-anchor="middle" data-anim="fade" data-t0="${Math.round(tMain(b.x0) + 60)}" data-dur="350">${yy}</text>`;
    });
    drawStacks('collab', 'up', Y_COL, 8);
    drawStacks('main', 'up', Y_MAIN, 3);
    drawStacks('main', 'down', Y_MAIN, 3);
    drawStacks('lead', 'down', Y_LEAD, 6);
    out.main += stripOut;
    /* Dots on top, with generous invisible hit targets. */
    ['collab', 'main', 'lead'].forEach(ln => {
      const ly = ln === 'collab' ? Y_COL : ln === 'main' ? Y_MAIN : Y_LEAD;
      YEARS.forEach(yy => {
        byBand(ln, yy).forEach(d => {
          const gx = g[d.i].x, t0 = d._dotT0 != null ? d._dotT0 : tOf(ln, d, gx);
          const r = (d.kind === 'j' || d.kind === 'k') ? 4 : 3.6;
          deskPos[d.i] = { x: gx, y: ly };
          out[ln] += `<a class="bead" href="${esc(d.href)}" data-i="${d.i}" data-line="${ln}" tabindex="-1" aria-label="${esc(d.title)}" data-anim="dot" data-t0="${Math.round(t0)}" transform="translate(${gx.toFixed(1)} ${ly})">${bead(d, r)}<circle r="9" fill="transparent"/></a>`;
        });
      });
    });
    const tips =
      `<g class="ln-main" id="ptl-tip-main" opacity="0"><circle class="tiphalo" r="7"/><circle class="tipdot" r="2.7"/></g>` +
      `<g class="ln-collab" id="ptl-tip-col" opacity="0"><circle class="tiphalo" r="7"/><circle class="tipdot" r="2.7"/></g>` +
      `<g class="ln-lead" id="ptl-tip-lead" opacity="0"><circle class="tiphalo" r="7"/><circle class="tipdot" r="2.7"/></g>`;
    const grp = ln => `<g class="ln-${ln}">${out[ln]}</g>`;
    return {
      svg: `<svg viewBox="0 0 ${VW} ${HGT}" role="img" aria-label="${ITEMS.length} works from ${y0} to ${y1} on three lines: a main line for ICT on language learning, a leadership branch below, and a collaborations branch above. The full list follows below.">${grp('collab')}${grp('lead')}${grp('main')}${tips}</svg>`,
      geo: { easeIO, MAIN_DRAW: MAIN_DRAW * SCALE, BR_DRAW: BR_DRAW * SCALE, tSplit: tSplit * SCALE, splitX, nowEndX }
    };
  }

  /* ================= PHONE ================= */
  function buildPhone() {
    const W = 390, railM = 36, railC = 70, railL = 104, labX = 120, labW = W - labX - 8;
    const order = { main: 0, collab: 1, lead: 2 };
    const rows = ITEMS.slice().sort((a, b) => (a.y - b.y) || (order[a.line] - order[b.line]) || (RANK[a.kind] - RANK[b.kind]) || ((a.label || a.title) < (b.label || b.title) ? -1 : 1));
    function wrap(t) {
      const words = t.split(' '), lines = []; let cur = '';
      words.forEach(w => { const test = cur ? cur + ' ' + w : w; if (tw(test, '12px "Source Serif 4", Georgia, serif') > labW && cur) { lines.push(cur); cur = w; } else cur = test; });
      if (cur) lines.push(cur); return lines;
    }
    let out = '', y = 6; const items = [];
    out += `<g class="ln-main"><text class="theme" x="44" y="${y + 11}" font-size="11.5">ICT on language learning</text></g>`; y += 22;
    const branchStart = {};
    rows.forEach(d => {
      if ((d.line === 'collab' || d.line === 'lead') && !branchStart[d.line]) {
        branchStart[d.line] = true;
        out += `<g class="ln-${d.line}"><text class="theme ptheme" x="44" y="${y + 11}" font-size="11.5">${esc(LINES[d.line].theme)}</text></g>`;
        y += 22;
      }
      const lines = d.label ? wrap(d.label) : [d.title];
      const rh = lines.length * 14 + 12;
      items.push({ d, cy: y + rh / 2, lines, y, rh });
      y += rh;
    });
    const H = y + 8;
    const railX = line => line === 'main' ? railM : line === 'collab' ? railC : railL;
    ['main', 'collab', 'lead'].forEach(ln => {
      const mine = items.filter(it => it.d.line === ln);
      if (!mine.length) return;
      if (ln === 'main') {
        const lastNow = mine.filter(it => it.d.y <= NOWY).pop();
        const firstFut = mine.filter(it => it.d.y > NOWY)[0];
        out += `<g class="ln-main"><line x1="${railM}" y1="${items[0].cy}" x2="${railM}" y2="${lastNow.cy}" stroke-width="1.6" class="axis"/></g>`;
        if (firstFut) out += `<g class="ln-main"><line x1="${railM}" y1="${lastNow.cy}" x2="${railM}" y2="${firstFut.cy}" stroke-width="2" stroke-linecap="round" stroke-dasharray=".1 5" opacity=".55" class="futseg"/></g>`;
      } else {
        const yA = mine[0].cy, yB = mine[mine.length - 1].cy;
        out += `<g class="ln-${ln}"><line x1="${railX(ln)}" y1="${yA}" x2="${railX(ln)}" y2="${yB}" stroke-width="1.6" class="axis"/><line x1="${railM}" y1="${yA}" x2="${railX(ln)}" y2="${yA}" stroke-width="1.2" class="axis"/></g>`;
      }
    });
    const seenYear = {};
    items.forEach(it => {
      const d = it.d, rx = railX(d.line);
      mobPos[d.i] = { x: rx, y: it.cy };
      if (!seenYear[d.y]) { seenYear[d.y] = true; out += `<text class="yr" x="${railM - 8}" y="${it.cy + 3.5}" text-anchor="end" font-size="10.5">${d.y}</text>`; }
      const r = (d.kind === 'j' || d.kind === 'k') ? 3.8 : 3.4;
      out += `<g class="ln-${d.line}"><a class="bead" href="${esc(d.href)}" data-i="${d.i}" data-line="${d.line}" tabindex="-1" aria-label="${esc(d.title)}" transform="translate(${rx} ${it.cy.toFixed(1)})">${bead(d, r)}<circle r="10" fill="transparent"/></a></g>`;
      it.lines.forEach((ln2, li) => {
        out += `<text class="lab" data-i="${d.i}" data-line="${d.line}" font-size="12" x="${labX}" y="${(it.y + 16 + li * 14).toFixed(1)}">${esc(ln2)}</text>`;
      });
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${ITEMS.length} works from ${y0} to ${y1} listed along a vertical line, with leadership and collaboration branches.">${out}</svg>`;
  }

  /* ================= ANIMATION ================= */
  let T = null, raf = 0, playing = false;
  function collectAnim(deskSvg) {
    T = { els: [] };
    deskSvg.querySelectorAll('[data-anim]').forEach(el => {
      const rec = { el, kind: el.getAttribute('data-anim'), t0: (+el.getAttribute('data-t0') || 0) * SCALE, dur: (+el.getAttribute('data-dur') || 300) * SCALE };
      if (rec.kind === 'line') { rec.len = el.getTotalLength(); el.style.strokeDasharray = rec.len; el.style.strokeDashoffset = rec.len; }
      if (rec.kind === 'leader') { el.style.strokeDasharray = 1; el.style.strokeDashoffset = 1; }
      if (rec.kind === 'dot') { const m = /translate\(([\d.]+) ([\d.]+)\)/.exec(el.getAttribute('transform')); rec.x = +m[1]; rec.y = +m[2]; }
      T.els.push(rec);
    });
  }
  function setTime(t) {
    if (!T || !GEO) return;
    T.els.forEach(r => {
      const p = clamp01((t - r.t0) / r.dur);
      if (r.kind === 'fade') { const o = r.el.getAttribute('data-o'); r.el.style.opacity = smooth(p) * (o ? +o : 1); }
      else if (r.kind === 'line') { r.el.style.strokeDashoffset = r.len * (1 - GEO.easeIO(clamp01((t - r.t0) / r.dur))); }
      else if (r.kind === 'leader') { r.el.style.strokeDashoffset = 1 - smooth(p); }
      else if (r.kind === 'dot') { const s = 0.5 + 0.5 * smooth(p); r.el.style.opacity = p <= 0 ? 0 : 1; r.el.style.transform = 'translate(' + r.x + 'px ' + r.y + 'px) scale(' + s.toFixed(3) + ')'; }
    });
    function tip(id, t0, dur, x0, x1, yy) {
      const el = document.getElementById(id); if (!el) return;
      const p = (t - t0) / dur;
      if (p <= 0 || p >= 1) { el.setAttribute('opacity', '0'); return; }
      const x = x0 + (x1 - x0) * GEO.easeIO(p);
      el.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + yy + ')');
      el.setAttribute('opacity', p > 0.97 ? String((1 - p) / 0.03) : '1');
    }
    tip('ptl-tip-main', 0, GEO.MAIN_DRAW, DL, GEO.nowEndX, Y_MAIN);
    tip('ptl-tip-col', GEO.tSplit, GEO.BR_DRAW, GEO.splitX, DR, Y_COL);
    tip('ptl-tip-lead', GEO.tSplit, GEO.BR_DRAW, GEO.splitX, DR, Y_LEAD);
  }
  function settle() {
    playing = false; cancelAnimationFrame(raf);
    setTime(1e9);
    skipBtn.hidden = true; replayBtn.hidden = false;
  }
  function play() {
    if (window.matchMedia('(max-width: 640px)').matches) { settle(); return; }
    hideTip(); playing = true; skipBtn.hidden = false; replayBtn.hidden = true;
    setTime(0);
    try { sessionStorage.setItem('ptl3-played', '1'); } catch (e) {}
    const start = performance.now() + 300, TOTAL = 4400 * SCALE;
    const frame = now => {
      if (!playing) return;
      const t = now - start;
      if (t < 0) { raf = requestAnimationFrame(frame); return; }
      setTime(t);
      if (t < TOTAL) raf = requestAnimationFrame(frame); else settle();
    };
    raf = requestAnimationFrame(frame);
  }
  skipBtn.addEventListener('click', settle);
  replayBtn.addEventListener('click', play);
  window.ptlReplay = play;

  /* ================= TOOLTIP ================= */
  let tipFor = -1;
  const phoneNow = () => window.matchMedia('(max-width: 640px)').matches;
  function showTip(i) {
    const d = ITEMS[i]; if (!d) return;
    const pos = phoneNow() ? mobPos[i] : deskPos[i]; if (!pos) return;
    tip.innerHTML = `<b>${esc(d.title)}</b><span>${esc(d.venue)}${d.venue ? ' · ' : ''}${d.y} · ${esc(d.t)}</span>`;
    const stage = root.querySelector('.ptl-stage').getBoundingClientRect();
    const svg = host.querySelector(phoneNow() ? '.ptl-mob svg' : '.ptl-desk svg');
    if (!svg) return;
    const sr = svg.getBoundingClientRect(), s = sr.width / (phoneNow() ? 390 : VW);
    tip.classList.add('show');
    let left = (sr.left - stage.left) + pos.x * s + 14, top = (sr.top - stage.top) + pos.y * s + 12;
    const twd = tip.offsetWidth;
    if (left + twd > stage.width) left = (sr.left - stage.left) + pos.x * s - twd - 14;
    tip.style.left = Math.max(0, left) + 'px'; tip.style.top = Math.max(0, top) + 'px';
    tipFor = i;
    host.querySelectorAll('.bead.hl').forEach(x => x.classList.remove('hl'));
    host.querySelectorAll(`.bead[data-i="${i}"]`).forEach(x => x.classList.add('hl'));
  }
  function hideTip() { tip.classList.remove('show'); tipFor = -1; host.querySelectorAll('.bead.hl').forEach(x => x.classList.remove('hl')); }
  const hitEl = e => e.target.closest ? e.target.closest('.bead, .lab[data-i]') : null;
  host.addEventListener('pointerover', e => { const a = hitEl(e); if (a && e.pointerType === 'mouse') showTip(+a.dataset.i); });
  host.addEventListener('pointerout', e => { const a = hitEl(e); if (a && e.pointerType === 'mouse') hideTip(); });
  host.addEventListener('click', e => {
    const a = hitEl(e);
    if (!a) { hideTip(); return; }
    const i = +a.dataset.i, noHover = window.matchMedia('(hover: none)').matches;
    if (a.classList.contains('bead')) {
      if (noHover && tipFor !== i) { e.preventDefault(); showTip(i); }
    } else {
      if (noHover && tipFor !== i) showTip(i);
      else window.location.href = ITEMS[i].href;
    }
  });
  document.addEventListener('click', e => { if (!root.contains(e.target)) hideTip(); });

  /* ================= INIT ================= */
  function init() {
    const desk = buildDesktop();
    GEO = desk.geo;
    host.innerHTML = `<div class="ptl-desk">${desk.svg}</div><div class="ptl-mob">${buildPhone()}</div>`;
    collectAnim(host.querySelector('.ptl-desk svg'));
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let played = false; try { played = sessionStorage.getItem('ptl3-played') === '1'; } catch (e) {}
    if (reduce || played || phoneNow()) settle();
    else if ('IntersectionObserver' in window) {
      setTime(0);
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: .3 });
      io.observe(root);
    } else play();
  }
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]).then(() => setTimeout(init, 30));
  } else window.addEventListener('load', init);
})();
