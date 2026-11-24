/* Publication line (ptl). Reads <script type="application/json" id="ptl-data"> (array of {g,t,y,title,href,venue,first,m?}).
   One hairline is drawn from the first year to today. Every work is a bead on the line, and works with an "m" label are named.
   Plays once per browser session, about four seconds, then rests. No libraries, no network calls. */
(function () {
  const root = document.getElementById('ptl'), src = document.getElementById('ptl-data');
  if (!root || !src) return;
  let data; try { data = JSON.parse(src.textContent).filter(d => d && d.y && d.title); } catch (e) { return; }
  if (!data.length) return;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const kind = t => /journal/i.test(t) ? 'j' : /book|dissertation/i.test(t) ? 'k' : /accepted|forthcoming/i.test(t) ? 'a' : 'c';
  const RANK = { k: 0, j: 1, c: 2, a: 3 };
  const WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const NOW = new Date().getFullYear();
  const y0 = Math.min(...data.map(d => d.y)), y1 = Math.max(...data.map(d => d.y));
  const years = []; for (let y = y0; y <= y1; y++) years.push(y);
  const byYear = {}; years.forEach(y => byYear[y] = data.filter(d => d.y === y).sort((a, b) => RANK[kind(a.t)] - RANK[kind(b.t)]));
  const n = { all: data.length, j: data.filter(d => kind(d.t) === 'j').length, c: data.filter(d => /[ca]/.test(kind(d.t))).length,
    book: data.filter(d => /book/i.test(d.t)).length, diss: data.filter(d => /dissertation/i.test(d.t)).length, first: data.filter(d => d.first).length };
  const span = Math.min(NOW, y1) - y0;

  root.innerHTML = `
    <p class="ptl-kicker">Publications at a glance <span class="ptl-ctl"><button type="button" data-skip>Skip</button><button type="button" data-replay hidden>Replay</button></span></p>
    <h2 class="ptl-title"><em data-c>${n.all}</em> works across ${WORDS[span] || span} years, since ${y0}</h2>
    <div class="ptl-stage"><div data-svg></div><div class="ptl-tip" role="status"></div></div>
    <div class="ptl-foot">
      <p class="ptl-sum"><b>${n.j}</b> journal articles · <b>${n.c}</b> conference papers, talks, and posters${n.book ? ` · <b>${n.book}</b> book` : ''}${n.diss ? ` · <b>${n.diss}</b> dissertation` : ''} · first author on <b>${n.first}</b></p>
      <span class="ptl-key" aria-hidden="true"><span><i></i>journal article</span><span><i class="c"></i>conference or talk</span>${n.book || n.diss ? '<span><i class="k"></i>book or dissertation</span>' : ''}</span>
    </div>
    <div class="ptl-cta"><p>Working on something close to one of these? I am glad to hear about it.</p><a href="${esc(root.dataset.cta || '/speaking/#research-collaboration')}">Discuss a research idea →</a></div>`;
  const host = root.querySelector('[data-svg]'), tip = root.querySelector('.ptl-tip'), counter = root.querySelector('[data-c]');
  const skipBtn = root.querySelector('[data-skip]'), replayBtn = root.querySelector('[data-replay]');
  const foot = root.querySelector('.ptl-foot'), cta = root.querySelector('.ptl-cta');

  let beads = [], ms = [], yrs = [], geo = null, raf = 0, playing = false, timers = [];
  const smooth = u => u * u * (3 - 2 * u);

  function layout() {
    const W = Math.round(host.clientWidth) || 700, vertical = W < 560;
    // Busy years get more room, so the line breathes where the work is dense.
    const wts = years.map(y => 0.9 + 0.42 * byYear[y].length), tot = wts.reduce((a, b) => a + b, 0);
    const bands = []; let acc = 0; years.forEach((y, i) => { bands.push({ y, a: acc / tot, b: (acc + wts[i]) / tot }); acc += wts[i]; });
    const nowEnd = (bands.find(b => b.y === Math.min(NOW, y1)) || bands[bands.length - 1]).b;
    let H, pt;
    if (!vertical) {
      H = 340; const L = 6, R = W - 6, yA = 226, yB = 150;
      pt = u => [L + u * (R - L), yA - (yA - yB) * smooth(u)];
    } else {
      H = Math.max(520, 34 * years.length + 12 * data.length); const T = 6, B = H - 10, xA = 56, xB = 88;
      pt = u => [xA + (xB - xA) * smooth(u), T + u * (B - T)];
    }
    // sample the curve
    const N = 240, S = [], cum = [0];
    for (let i = 0; i <= N; i++) S.push(pt(i / N));
    for (let i = 1; i <= N; i++) cum.push(cum[i - 1] + Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]));
    const lenAt = u => { const f = u * N, i = Math.floor(f); return i >= N ? cum[N] : cum[i] + (cum[i + 1] - cum[i]) * (f - i); };
    const total = cum[N], nowLen = lenAt(nowEnd);
    const dPath = u1 => { let d = ''; for (let i = 0; i <= N; i++) { const u = i / N; if (u > u1 + 1e-9) break; d += (i ? 'L' : 'M') + S[i][0].toFixed(1) + ' ' + S[i][1].toFixed(1); } return d; };
    let futD = ''; for (let i = 0; i <= N; i++) { const u = i / N; if (u + 1e-9 < nowEnd) continue; futD += (futD ? 'L' : 'M') + S[i][0].toFixed(1) + ' ' + S[i][1].toFixed(1); }

    beads = []; yrs = []; ms = [];
    bands.forEach(b => {
      const items = byYear[b.y], k = items.length;
      items.forEach((d, i) => { const u = b.a + (b.b - b.a) * (i + 1) / (k + 1); const [x, y] = pt(u); beads.push({ d, u, x, y, at: lenAt(u) / nowLen }); });
      const um = b.a + 0.04 * (b.b - b.a); const [x, y] = pt(vertical ? b.a + 0.02 : (b.a + b.b) / 2);
      yrs.push({ y: b.y, x, yy: y, at: lenAt(b.a) / nowLen, fut: b.y > NOW });
    });
    // Milestone labels. A label may not touch another label, any leader line, the main line, or a year label,
    // and its own leader may not pass through any other label. Candidates are tried from the shortest leader outwards.
    const cv = document.createElement('canvas').getContext('2d');
    const tw = (txt, font) => { cv.font = font; return cv.measureText(txt).width * 1.06 + 4; };
    const FL = 'italic 14px Newsreader, Georgia, serif', FS = '11.5px "Source Serif 4", Georgia, serif', FY = '600 10.5px "Source Serif 4", Georgia, serif';
    const boxes = [], leaders = [];
    const hit = (a, b, pad) => a.x1 < b.x2 + pad && a.x2 > b.x1 - pad && a.y1 < b.y2 + pad && a.y2 > b.y1 - pad;
    const curveY = x => pt(Math.min(1, Math.max(0, (x - 6) / (W - 12))))[1];
    const msBeads = beads.filter(b => b.d.m);
    // Placement order: widest label first. (v3 as delivered sorted by x, rightmost first,
    // which left the widest label, the 2026 ETS milestone, no room beside its 2026/2027
    // neighbours and silently dropped it on desktop. Widest-first places all seven.)
    if (!vertical) { const wOf = b => Math.max(tw(b.d.m, FL), b.d.ms ? tw(b.d.ms, FS) : 0, tw(b.d.y + (kind(b.d.t) === 'a' ? ' \u00b7 ACCEPTED' : ''), FY)); msBeads.sort((p, q) => wOf(q) - wOf(p)); }
    msBeads.forEach(b => {
      const yrsTxt = b.d.y + (kind(b.d.t) === 'a' ? ' · ACCEPTED' : '');
      let chosen = null;
      for (const withSub of [true, false]) {
        const sub = withSub ? (b.d.ms || '') : '';
        const w = Math.max(tw(b.d.m, FL), sub ? tw(sub, FS) : 0, tw(yrsTxt, FY));
        const h = sub ? 42 : 28;
        if (vertical) {
          let top = b.y - 10;
          for (let k = 0; k < 40 && !chosen; k++, top += 6) { const box = { x1: b.x + 22, x2: b.x + 22 + w, y1: top, y2: top + h }; if (!boxes.some(p => hit(box, p, 4))) chosen = { box, sub, vertical: true }; }
          break;
        }
        for (let level = 0; level < 7 && !chosen; level++) {
          for (const side of ['up', 'down']) {
            const lead = 24 + level * 26;
            for (const anchor of ['start', 'end']) {
              const x1 = anchor === 'start' ? b.x - 3 : b.x + 3 - w, x2 = x1 + w;
              const y1 = side === 'up' ? b.y - lead - h : b.y + lead, y2 = y1 + h;
              const box = { x1, x2, y1, y2 };
              if (x1 < 0 || x2 > W || y1 < 0 || y2 > H) continue;
              if (side === 'up' ? y2 + 6 > curveY(x2) : y1 - 6 < curveY(x1)) continue;
              const ld = side === 'up' ? { x1: b.x, x2: b.x, y1: b.y - lead, y2: b.y - 6 } : { x1: b.x, x2: b.x, y1: b.y + 6, y2: b.y + lead };
              if (boxes.some(p => hit(box, p, 6))) continue;
              if (leaders.some(l => hit(box, l, 5))) continue;
              if (boxes.some(p => hit(ld, p, 3))) continue;
              chosen = { box, sub, side, anchor, lead, ld }; break;
            }
            if (chosen) break;
          }
        }
        if (chosen) break;
      }
      if (!chosen) return;
      boxes.push(chosen.box); if (chosen.ld) leaders.push(chosen.ld);
      ms.push(Object.assign({ b, lab: b.d.m, yrsTxt, vertical }, chosen));
    });
    const placed = ms.map(m => m.box);
    // A year label that sits under a milestone label or leader is hidden; the milestone already names its year.
    if (!vertical) yrs.forEach(y => { const yb = { x1: y.x - 16, x2: y.x + 16, y1: y.yy + 14, y2: y.yy + 30 }; y.hidden = boxes.some(p => hit(yb, p, 2)) || leaders.some(l => hit(yb, l, 2)); });
    if (vertical) H = Math.max(H, ...placed.map(p => p.y2 + 6));
    geo = { W, H, vertical, total, nowLen, dNow: dPath(nowEnd), futD, pt };
  }

  function draw() {
    layout();
    const { W, H, vertical, dNow, futD } = geo;
    let out = `<path class="trail" d="${dNow}"/>${futD ? `<path class="trail" d="${futD}" stroke-dasharray="2 4" data-fut/>` : ''}<path class="path" d="${dNow}" data-path/>`;
    yrs.forEach((y, i) => {
      out += vertical ? `<text class="yr${y.fut ? ' fut' : ''}" data-yr="${i}" x="0" y="${y.yy + 4}">${y.y}</text>`
        : (y.hidden ? `<text class="yr" data-yr="${i}" x="0" y="0" visibility="hidden"></text>` : `<text class="yr${y.fut ? ' fut' : ''}" data-yr="${i}" x="${y.x}" y="${y.yy + 26}" text-anchor="middle">${y.y}</text>`);
    });
    ms.forEach((m, i) => {
      const { b, box } = m;
      if (!vertical) {
        const tx = m.anchor === 'start' ? box.x1 + 2 : box.x2 - 2, an = m.anchor;
        const ty = box.y1;
        out += `<g class="ms" data-ms="${i}"><line x1="${m.ld.x1}" y1="${m.ld.y1}" x2="${m.ld.x2}" y2="${m.ld.y2}"/><text class="yrs" x="${tx}" y="${ty + 10}" text-anchor="${an}">${esc(m.yrsTxt)}</text><text class="lab" x="${tx}" y="${ty + 26}" text-anchor="${an}">${esc(m.lab)}</text>${m.sub ? `<text class="sub" x="${tx}" y="${ty + 40}" text-anchor="${an}">${esc(m.sub)}</text>` : ''}</g>`;
      } else {
        out += `<g class="ms" data-ms="${i}"><line x1="${b.x + 7}" y1="${b.y}" x2="${box.x1 - 4}" y2="${box.y1 + 12}"/><text class="lab" x="${box.x1}" y="${box.y1 + 14}">${esc(m.lab)}</text>${m.sub ? `<text class="sub" x="${box.x1}" y="${box.y1 + 29}">${esc(m.sub)}</text>` : ''}</g>`;
      }
    });
    beads.forEach((b, i) => {
      const k = kind(b.d.t), r = b.d.m ? 4.2 : (k === 'j' || k === 'k' ? 3.1 : 2.8);
      out += `<a class="bead" href="${esc(b.d.href || '#')}" data-i="${i}" tabindex="-1" aria-label="${esc(b.d.title)}"><circle class="b ${k}" cx="${b.x}" cy="${b.y}" r="${r}"/><circle cx="${b.x}" cy="${b.y}" r="8" fill="transparent"/></a>`;
    });
    out += `<circle class="halo" data-halo r="0" cx="0" cy="0"/><circle class="tipdot" data-tip r="2.6" cx="0" cy="0" opacity="0"/>`;
    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${n.all} works from ${y0} to ${y1} on one timeline. The full list follows below.">${out}</svg>`;
  }

  // tooltip
  let tipFor = -1;
  function showTip(i) {
    const b = beads[i]; if (!b) return; const d = b.d;
    tip.innerHTML = `<b>${esc(d.title)}</b><span>${esc(d.venue || '')}${d.venue ? ' · ' : ''}${d.y} · ${esc(d.t)}</span>`;
    const box = host.getBoundingClientRect(), s = box.width / geo.W;
    tip.classList.add('show');
    let left = b.x * s + 14, top = b.y * s + 12; const tw = tip.offsetWidth;
    if (left + tw > box.width) left = b.x * s - tw - 14;
    tip.style.left = Math.max(0, left) + 'px'; tip.style.top = Math.max(0, top) + 'px'; tipFor = i;
    host.querySelectorAll('.bead.hl').forEach(x => x.classList.remove('hl')); host.querySelector(`.bead[data-i="${i}"]`)?.classList.add('hl');
  }
  function hideTip() { tip.classList.remove('show'); tipFor = -1; host.querySelectorAll('.bead.hl').forEach(x => x.classList.remove('hl')); }
  host.addEventListener('pointerover', e => { const a = e.target.closest('.bead'); if (a && e.pointerType === 'mouse') showTip(+a.dataset.i); });
  host.addEventListener('pointerout', e => { const a = e.target.closest('.bead'); if (a && e.pointerType === 'mouse') hideTip(); });
  host.addEventListener('click', e => { const a = e.target.closest('.bead'); if (!a) { hideTip(); return; } const i = +a.dataset.i; if (window.matchMedia('(hover: none)').matches && tipFor !== i) { e.preventDefault(); showTip(i); } });
  document.addEventListener('click', e => { if (!root.contains(e.target)) hideTip(); });

  // play
  const D = 4200, ease = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  function setProgress(p) {
    const path = host.querySelector('[data-path]'), L = geo.nowLen;
    path.style.strokeDasharray = `${L} ${L}`; path.style.strokeDashoffset = String(L * (1 - p));
    let pos = null; try { pos = path.getPointAtLength(L * p); } catch (e) {}
    const td = host.querySelector('[data-tip]'), halo = host.querySelector('[data-halo]');
    if (pos) { td.setAttribute('cx', pos.x); td.setAttribute('cy', pos.y); halo.setAttribute('cx', pos.x); halo.setAttribute('cy', pos.y); }
    td.setAttribute('opacity', p > 0 && p < 1 ? '1' : '0'); halo.setAttribute('r', p > 0 && p < 1 ? '7' : '0');
    let c = 0;
    beads.forEach((b, i) => { const on = b.at <= p + 1e-6 || (p >= 1); if (on) c++; host.querySelector(`.bead[data-i="${i}"]`).classList.toggle('on', on); });
    ms.forEach((m, i) => host.querySelector(`.ms[data-ms="${i}"]`).classList.toggle('on', m.b.at <= p - 0.02 || p >= 1));
    yrs.forEach((y, i) => host.querySelector(`[data-yr="${i}"]`).classList.toggle('on', y.at <= p + 0.01 || p >= 1));
    const fut = host.querySelector('[data-fut]'); if (fut) fut.style.opacity = p >= 1 ? '1' : '0';
    counter.textContent = c;
  }
  function finalState() {
    playing = false; cancelAnimationFrame(raf); timers.forEach(clearTimeout); timers = [];
    setProgress(1); foot.classList.add('on'); cta.classList.add('on'); skipBtn.hidden = true; replayBtn.hidden = false;
  }
  function play() {
    draw(); hideTip(); playing = true; skipBtn.hidden = false; replayBtn.hidden = true; foot.classList.remove('on'); cta.classList.remove('on');
    setProgress(0);
    const t0 = performance.now();
    const tick = now => { if (!playing) return; const p = Math.min(1, (now - t0) / D); setProgress(ease(p)); if (p < 1) raf = requestAnimationFrame(tick); else timers.push(setTimeout(finalState, 250)); };
    raf = requestAnimationFrame(tick);
    try { sessionStorage.setItem('ptl2-played', '1'); } catch (e) {}
  }
  skipBtn.addEventListener('click', finalState);
  window.ptlReplay = play;
  replayBtn.addEventListener('click', play);

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let played = false; try { played = sessionStorage.getItem('ptl2-played') === '1'; } catch (e) {}
  draw();
  if (reduce || played) finalState();
  else if ('IntersectionObserver' in window) { setProgress(0); const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: .3 }); io.observe(root); }
  else play();
  let lastW = host.clientWidth;
  window.addEventListener('resize', () => { const w = host.clientWidth; if (Math.abs(w - lastW) > 30 && !playing) { lastW = w; draw(); finalState(); } });
})();
