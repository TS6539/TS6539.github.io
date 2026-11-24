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
      H = 290; const L = 6, R = W - 6, yA = 238, yB = 150;
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
    // milestone labels with simple collision avoidance
    const placed = [];
    beads.filter(b => b.d.m).forEach(b => {
      const lab = b.d.m, sub = b.d.ms || '', w = Math.max(lab.length * 6.6, sub.length * 5.6) + 8;
      let level = 0, box;
      for (; level < 6; level++) {
        if (!vertical) { const lead = 30 + level * 42, top = b.y - lead - 30; const right = b.x + w > W; box = { x1: right ? b.x - w : b.x, x2: right ? b.x : b.x + w, y1: top, y2: top + 34, lead, right }; }
        else { const top = b.y - 8 + level * 40; box = { x1: b.x + 22, x2: W, y1: top, y2: top + 34, lead: 0 }; }
        const clearsLine = vertical || (() => { const u = Math.min(1, Math.max(0, (box.x2 - 6) / (W - 12))); return box.y2 + 10 < pt(u)[1]; })();
        if (clearsLine && !placed.some(p => box.x1 < p.x2 + 6 && box.x2 > p.x1 - 6 && box.y1 < p.y2 + 4 && box.y2 > p.y1 - 4)) break;
      }
      placed.push(box); ms.push({ b, lab, sub, box, vertical });
    });
    if (vertical) H = Math.max(H, ...placed.map(p => p.y2 + 6));
    geo = { W, H, vertical, total, nowLen, dNow: dPath(nowEnd), futD, pt };
  }

  function draw() {
    layout();
    const { W, H, vertical, dNow, futD } = geo;
    let out = `<path class="trail" d="${dNow}"/>${futD ? `<path class="trail" d="${futD}" stroke-dasharray="2 4" data-fut/>` : ''}<path class="path" d="${dNow}" data-path/>`;
    yrs.forEach((y, i) => {
      out += vertical ? `<text class="yr${y.fut ? ' fut' : ''}" data-yr="${i}" x="0" y="${y.yy + 4}">${y.y}</text>`
        : `<text class="yr${y.fut ? ' fut' : ''}" data-yr="${i}" x="${y.x}" y="${y.yy + 26}" text-anchor="middle">${y.y}</text>`;
    });
    ms.forEach((m, i) => {
      const { b, box } = m;
      if (!vertical) {
        const tx = box.right ? b.x - 4 : b.x + 4, anchor = box.right ? 'end' : 'start';
        out += `<g class="ms" data-ms="${i}"><line x1="${b.x}" y1="${b.y - 7}" x2="${b.x}" y2="${b.y - box.lead}"/><text class="yrs" x="${tx}" y="${b.y - box.lead - 22}" text-anchor="${anchor}">${b.d.y}${kind(b.d.t) === 'a' ? ' · ACCEPTED' : ''}</text><text class="lab" x="${tx}" y="${b.y - box.lead - 8}" text-anchor="${anchor}">${esc(m.lab)}</text>${m.sub ? `<text class="sub" x="${tx}" y="${b.y - box.lead + 6}" text-anchor="${anchor}">${esc(m.sub)}</text>` : ''}</g>`;
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
    try { sessionStorage.setItem('ptl-played', '1'); } catch (e) {}
  }
  skipBtn.addEventListener('click', finalState);
  replayBtn.addEventListener('click', play);

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let played = false; try { played = sessionStorage.getItem('ptl-played') === '1'; } catch (e) {}
  draw();
  if (reduce || played) finalState();
  else if ('IntersectionObserver' in window) { setProgress(0); const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: .3 }); io.observe(root); }
  else play();
  let lastW = host.clientWidth;
  window.addEventListener('resize', () => { const w = host.clientWidth; if (Math.abs(w - lastW) > 30 && !playing) { lastW = w; draw(); finalState(); } });
})();
