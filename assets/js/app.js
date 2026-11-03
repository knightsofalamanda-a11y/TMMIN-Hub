/* =========================================================
   Abnormality Response Hub | TMMIN — client app
   Static site (GitHub Pages ready). No server needed.
   Demo state is kept in the browser (localStorage) and can be reset.
   ========================================================= */
const $ = s => document.querySelector(s);
const h = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ico = k => `<span class="ico">${ICONS[k] || ''}</span>`;
const sevChip = k => `<span class="sev" style="--sc:${SEVERITY[k].color};--st:${SEVERITY[k].tint}">${k} ${SEVERITY[k].name}</span>`;
const fmtMin = m => m == null ? 'n/a' : m >= 60 ? (m % 60 ? (m / 60).toFixed(1) + ' h' : (m / 60) + ' h') : m + ' min';
const C = { red: '#EB0A1E', charcoal: '#202124', blue: '#315A78', green: '#27856B', amber: '#E6A23C', crit: '#D93025', muted: '#5F6368', grid: '#ECEEF0' };

const store = {
  get(k, d) { try { const v = localStorage.getItem('arh_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('arh_' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  clear() { try { Object.keys(localStorage).filter(k => k.startsWith('arh_')).forEach(k => localStorage.removeItem(k)); } catch (e) { } }
};

let ROLE = store.get('role', null);
let PAGE = 'home', charts = {}, afterQ = [];
const STATE = {
  slSev: 'all', slSel: 'T2', libSel: 'QD', libDone: {}, libFilter: 'all',
  wiz: [], quizI: 0, quizAns: [],
  sim: null, simSpeed: 10, timer: null
};
let LOG = store.get('log', null) || seedLog();

const PAGES_DEF = [
  ['home', 'Overview', 'home'],
  ['swimlane', 'SOP Swimlane', 'flow'],
  ['library', 'Manual Book', 'book'],
  ['severity', 'Severity & Response Targets', 'clock'],
  ['alerts', 'Live Alerts (S1)', 'alert'],
  ['sync', 'Line Change Sync (S3)', 'refresh'],
  ['simulator', 'Response Workspace', 'play'],
  ['training', 'Training & Quiz', 'quiz'],
  ['log', 'Response Log & KPIs', 'log']
];

function toast(m) { const t = $('#toast'); t.textContent = m; t.className = 'toast show'; clearTimeout(t._t); t._t = setTimeout(() => { t.className = 'toast'; }, 2400); }

/* ---------- Landing & shell ---------- */
function renderLanding() {
  ROLE = null; store.set('role', null); stopTimer();
  $('#root').innerHTML = `
  <div class="land">
    <div class="land-top"><div class="land-inner">
      <div class="brand"><div class="brand-mark">AR</div>TMMIN Smart Factory</div>
      <div class="hero-title">Abnormality Response Hub</div>
      <div class="hero-sub">One standard way to respond when something goes wrong on the line</div>
      <div class="hero-points">
        <span>${ico('flow')} Swimlane SOP for every role</span>
        <span>${ico('book')} Manual book tutorial per alert code</span>
        <span>${ico('clock')} Response targets by severity</span>
      </div>
      <span class="pill">Solution 2 · receives alerts from Solution 1 (AI + SCADA) · manual book updated by Solution 3 (digital twin)</span>
    </div></div>
    <div class="land-inner land-body">
      <div class="select"><div><h1>Who are you on the line?</h1><p>The hub highlights your lane in the SOP, your tutorials, and your response targets.</p></div><span class="badge b-blue">Demo prototype</span></div>
      <div class="role-grid">
        ${Object.entries(LANES).filter(([, r]) => r.pick).map(([k, r]) => `
          <button class="role-card" style="--rc:${r.color};--tint:${r.tint}" onclick="enter('${k}')">
            <div class="ric">${ICONS[k]}</div>
            <h3>${h(r.name)}</h3>
            <div class="chips">${r.positions.split(', ').map(x => `<span class="chip">${h(x)}</span>`).join('')}</div>
            <div class="role-focus">${h(r.focus)}</div>
            <div class="role-go">Open my response guide</div>
          </button>`).join('')}
      </div>
      <p class="note">Response targets are team-proposed and will be calibrated during the pilot in body welding and sealer. Incident figures are simulated for demonstration and are not actual TMMIN data. Role selection only changes what is highlighted; it is not access control.</p>
    </div>
  </div>`;
  window.scrollTo(0, 0);
}

function enter(role) {
  ROLE = role; store.set('role', role);
  const r = LANES[role];
  $('#root').innerHTML = `
  <div class="shell" style="--rc:${r.color};--tint:${r.tint}">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">AR</div><div>Abnormality Response Hub<span class="brand-sub">PT Toyota Motor Manufacturing Indonesia</span></div></div>
      <div class="side-role"><div class="ric sm">${ICONS[role]}</div><div>${h(r.name)}</div></div>
      <nav class="nav"><div class="nav-label">Response guide</div>${PAGES_DEF.slice(0, 4).map(navLink).join('')}
        <div class="nav-label">Connected solutions</div>${PAGES_DEF.slice(4, 6).map(navLink).join('')}
        <div class="nav-label">Respond, train, monitor</div>${PAGES_DEF.slice(6).map(navLink).join('')}</nav>
      <div class="side-foot">Part of the Integrated Smart Factory Platform<br><a href="#" onclick="resetDemo();return false">Reset demo data</a></div>
    </aside>
    <div>
      <header class="topbar">
        <div><div class="crumb">Solution 2 · Standardized Abnormality Response</div><h1 id="pageTitle"></h1></div>
        <div class="row"><span class="badge b-blue">Proposed targets</span><button class="btn sm" onclick="renderLanding()">Switch role</button></div>
      </header>
      <main class="content" id="content"></main>
    </div>
  </div>`;
  const want = (location.hash || '').replace('#', '');
  go(PAGES_DEF.some(p => p[0] === want) ? want : 'home');
}
function navLink(p) { return `<a data-p="${p[0]}" href="#${p[0]}" onclick="go('${p[0]}');return true">${ico(p[2])}<span>${p[1]}</span><span class="nav-badge" id="nb-${p[0]}"></span></a>`; }

function go(p, keep) {
  if (p !== 'simulator') stopTimer();
  PAGE = p;
  Object.values(charts).forEach(c => c.destroy()); charts = {};
  afterQ = [];
  const y = window.scrollY;
  $('#content').innerHTML = PAGES[p]();
  $('#pageTitle').textContent = PAGES_DEF.find(x => x[0] === p)[1];
  document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('active', a.dataset.p === p));
  if (location.hash !== '#' + p) history.replaceState(null, '', '#' + p);
  const q = afterQ; afterQ = []; q.forEach(f => f());
  window.scrollTo(0, keep ? y : 0);
}
function refresh() { go(PAGE, true); }
function resetDemo() { store.clear(); LOG = seedLog(); initInteg(); STATE.sim = null; STATE.libDone = {}; STATE.quizAns = []; STATE.quizI = 0; toast('Demo data reset'); enter(ROLE); }

/* ---------- Shared bits ---------- */
const card = (title, body, right) => `<div class="card"><div class="card-h"><h3>${title}</h3>${right || ''}</div><div class="card-b">${body}</div></div>`;
const kpi = (l, v, s) => `<div class="kpi"><div class="kpi-label">${l}</div><div class="kpi-value">${v}</div><div class="kpi-sub">${s || ''}</div></div>`;
const pageHead = (title, sub, right) => `<div class="page-head"><div class="ph-left"><div class="ric">${ICONS[ROLE]}</div><div><h2>${title}</h2><p>${sub}</p></div></div>${right || ''}</div>`;
function stats() {
  const closed = LOG.filter(x => x.status === 'Closed');
  const avg = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
  return {
    open: LOG.filter(x => x.status === 'Open').length,
    mtta: avg(LOG.map(x => x.ack)), mttr: avg(closed.map(x => x.restore)),
    within: closed.length ? closed.filter(x => x.within).length / closed.length * 100 : 0,
    n: LOG.length
  };
}

/* ---------- Pages ---------- */
const PAGES = {};

PAGES.home = () => {
  const r = LANES[ROLE], s = stats();
  const mine = STEPS.filter(x => x.lane === ROLE).sort((a, b) => a.col - b.col);
  return pageHead('Your response guide', h(r.focus)) + solutionsCard() +
  `<div class="grid g4">${kpi('Open abnormalities', s.open, 'Across all lines (simulated)')}${kpi('Avg time to acknowledge', s.mtta.toFixed(1) + ' min', 'Target 1 to 5 min by severity')}${kpi('Responses within target', Math.round(s.within) + '%', 'Closed cases, last 7 days')}${kpi('Manual book pages', LIBRARY.length + ' types', 'One per alert code')}</div>
  <div class="grid g21">
    ${card('What the hub fixes', `<div class="flow-mini">
        <div><span class="n">Today</span><b>Alerts often ignored</b>31% of operators often ignore automated alerts, so abnormalities wait.</div>
        <div><span class="n">Today</span><b>Know-how in a few heads</b>48% of critical processes rely on 1 to 2 senior people.</div>
        <div><span class="n">With the hub</span><b>One standard response</b>Every role knows its next step, its time target, and who to call.</div>
      </div>
      <p class="muted small mt">Problem figures are from the team's analysis of the case data. The hub reads alerts and timestamps from the Smart Factory Platform (Solution 1).</p>
      <div class="sub-h mt" style="margin-top:18px">Severity at a glance</div>
      <div class="grid g2 flat">${Object.keys(SEVERITY).map(k => { const v = SEVERITY[k]; return `<div class="callout" style="background:${v.tint};border-color:transparent">${sevChip(k)}<p class="small mt" style="margin-top:6px">${h(v.def)}</p><p class="small" style="margin-top:6px"><b>${fmtMin(v.t.ack)}</b> acknowledge · <b>${fmtMin(v.t.tl)}</b> TL on site · <b>${fmtMin(v.t.restore)}</b> restore</p></div>`; }).join('')}</div>`)}
    ${card('Your steps in the SOP', `<div class="role-do">${mine.length ? mine.map((x, i) => `<div><span class="num">${i + 1}</span><div><b>${h(x.title)}</b><div class="muted small">${h(x.desc)}</div></div></div>`).join('') : '<div class="empty">No steps in this lane.</div>'}</div>
      <div class="mt"><a class="btn sm" href="#swimlane" onclick="go('swimlane')">See the full swimlane</a></div>`)}
  </div>
  ${card('How a response works', `<div class="flow-mini">${PHASES.map((p, i) => `<div><span class="n">Step ${i + 1}</span><b>${p}</b>${h(STEPS.filter(x => x.col === i && !x.track).map(x => LANES[x.lane].short + ': ' + x.title).slice(0, 2).join(' · '))}</div>`).join('')}</div>`)}
`;
};

function solutionsCard() {
  const newA = ALERTS.filter(x => x.status === 'New').length, late = ALERTS.filter(x => x.status === 'New' && ageMin(x) > SEVERITY[x.sev].t.ack).length;
  const pend = PKGS.filter(x => x.stage < 4);
  return card('Connected solutions', `<div class="sol-grid">
    <div class="sol"><span class="n">Solution 1 · Detects</span><b>AI integrated with SCADA</b>
      <span class="small">${newA} new alert${newA === 1 ? '' : 's'} waiting${late ? ` · <span style="color:var(--crit);font-weight:600">${late} past target</span>` : ''}</span>
      <a class="btn sm primary" href="#alerts" onclick="go('alerts')">Open Live Alerts</a></div>
    <div class="sol-arrow" aria-hidden="true"><span>alert code</span>→</div>
    <div class="sol me"><span class="n">Solution 2 · Responds</span><b>Standardized Abnormality Response</b>
      <span class="small">SOP path, manual book, and targets open from the alert code</span>
      <a class="btn sm" href="#simulator" onclick="go('simulator')">Response Workspace</a></div>
    <div class="sol-arrow" aria-hidden="true"><span>line change</span>←</div>
    <div class="sol"><span class="n">Solution 3 · Changes the line</span><b>Digital twin simulation</b>
      <span class="small">${pend.length ? `${pend.length} package${pend.length === 1 ? '' : 's'} in progress: ${pend.map(x => x.id).join(', ')}` : 'All validated changes are in the manual book'}</span>
      <a class="btn sm primary" href="#sync" onclick="go('sync')">Open Line Change Sync</a></div>
  </div>`);
}

/* Swimlane */
const EDGES = [
  ['P1', 'O2', ['S1','S2','S3','S4'], 'alert'], ['O1', 'O2', ['S1','S2','S3','S4']], ['O2', 'T1', ['S1','S2','S3','S4'], 'call'],
  ['T1', 'T2', ['S1','S2','S3','S4']], ['T2', 'T3', ['S1','S2','S3']], ['T2', 'G1', ['S1','S2'], 'No'], ['G1', 'M1', ['S1'], 'S1'],
  ['T3', 'T4', ['S3'], 'S3'], ['G1', 'SP1', ['S1','S2']], ['SP1', 'SP2', ['S1','S2']], ['SP2', 'SP3', ['S1','S2']],
  ['SP3', 'O3', ['S1','S2']], ['T4', 'O3', ['S3']], ['O3', 'T5', ['S1','S2','S3']], ['T2', 'T5', ['S4'], 'S4 label'],
  ['T5', 'P3', ['S1','S2','S3','S4']], ['P3', 'G2', ['S1','S2','S3','S4']], ['G2', 'M2', ['S1','S2']]
];
PAGES.swimlane = () => {
  const sev = STATE.slSev;
  const on = x => sev === 'all' || x.paths.includes(sev);
  const sel = STEPS.find(x => x.id === STATE.slSel) || STEPS[0];
  let grid = `<div class="sl-head">Lane</div>${PHASES.map((p, i) => `<div class="sl-head ph"><b>${i + 1}</b>${p}</div>`).join('')}`;
  LANE_ORDER.forEach((ln, ri) => {
    const L = LANES[ln];
    const row = ri + 2;
    grid += `<div class="sl-lane" style="--lc:${L.color};--lt:${L.tint};grid-row:${row};grid-column:1"><div class="ric" style="--rc:${L.color}">${ICONS[ln]}</div><span>${h(L.name)}${ln === ROLE ? '<br><span class="badge b-red" style="margin-top:4px">You</span>' : ''}</span></div>`;
    for (let c = 0; c < 8; c++) grid += `<div class="sl-cell ${ln === ROLE ? 'mine' : ''}" style="grid-row:${row};grid-column:${c + 2};${ln === ROLE ? 'background:rgba(235,10,30,.04)' : ''}"></div>`;
    STEPS.filter(x => x.lane === ln).forEach(x => {
      const span = x.span || 1;
      grid += `<div style="grid-row:${row};grid-column:${x.col + 2} / span ${span};padding:12px 10px;position:relative;z-index:2;align-self:center">
        <button class="step ${x.decision ? 'dec' : ''} ${x.track ? 'track' : ''} ${on(x) ? '' : 'dim'} ${x.id === sel.id ? 'sel' : ''}" data-id="${x.id}" style="--lc:${L.color}" onclick="STATE.slSel='${x.id}';refresh()">
          <span class="sid">${x.id}${x.decision ? ' · decision' : ''}</span><span class="stt">${h(x.title)}</span>
          ${x.track ? `<span class="tl">${MILESTONES.map(m => `<span>${m[1]}</span>`).join('')}<span>Auto-escalate on breach</span></span>` : ''}
          ${x.decision ? `<span class="q">◆ ${h(x.q)}</span>` : ''}
        </button></div>`;
    });
  });
  afterQ.push(drawEdges);
  window.onresize = () => { if (PAGE === 'swimlane') drawEdges(); };
  const L = LANES[sel.lane];
  return pageHead('Swimlane SOP: who does what, in what order', 'Filter by severity to see the path each level follows. Click any step for details.',
    `<div class="seg">${['all', 'S1', 'S2', 'S3', 'S4'].map(k => `<button class="${sev === k ? 'on' : ''}" onclick="STATE.slSev='${k}';refresh()">${k === 'all' ? 'All paths' : k + ' ' + SEVERITY[k].name}</button>`).join('')}</div>`) +
  `<div class="card"><div class="card-h"><h3>Abnormality response SOP</h3><div class="legend"><span>◆ decision point</span><span>▭ striped bar = platform tracking across steps</span>${sev !== 'all' ? sevChip(sev) : ''}</div></div>
    <div class="sl-wrap"><div class="sl" id="sl">${grid}<svg class="sl-svg" id="slsvg" aria-hidden="true"></svg></div></div></div>
  <div class="grid g21">
    ${card('Step ' + sel.id + ': ' + h(sel.title), `<div class="drawer" style="--lc:${L.color}"><p>${h(sel.desc)}</p>
      <dl class="kv"><dt>Owner</dt><dd>${h(L.name)}</dd><dt>Phase</dt><dd>${PHASES[sel.col]}</dd><dt>Output</dt><dd>${h(sel.out)}</dd><dt>Applies to</dt><dd>${sel.paths.map(sevChip).join(' ')}</dd></dl></div>`)}
    ${card('Rules that hold for every path', `<ul class="clean">
      <li><b>Stop, Call, Wait.</b> The operator never fixes beyond the standard alone.</li>
      <li><b>Every alert is acknowledged,</b> even a suspected false alarm.</li>
      <li><b>The platform escalates,</b> not the person. A missed target moves the case one level up.</li>
      <li><b>No restart before the first-unit check.</b></li>
      <li><b>Every case closes with a label</b> and, if new, an updated tutorial.</li></ul>`)}
  </div>`;
};
function drawEdges() {
  const sl = $('#sl'), svg = $('#slsvg'); if (!sl || !svg) return;
  const base = sl.getBoundingClientRect();
  svg.setAttribute('width', sl.scrollWidth); svg.setAttribute('height', sl.scrollHeight);
  const box = id => { const e = sl.querySelector(`.step[data-id="${id}"]`); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left - base.left, r: r.right - base.left, t: r.top - base.top, b: r.bottom - base.top, cx: (r.left + r.right) / 2 - base.left, cy: (r.top + r.bottom) / 2 - base.top }; };
  const sev = STATE.slSev;
  let out = '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#9AA0A6" stroke="none"/></marker></defs>';
  EDGES.forEach(([a, b, paths, label]) => {
    const A = box(a), B = box(b); if (!A || !B) return;
    if (paths.length === 1 && paths[0] === 'S4' && sev !== 'S4') return;
    const dim = !(sev === 'all' || paths.includes(sev));
    let d, lx, ly;
    if (B.l > A.r + 4) {
      const mx = A.r + Math.min(18, (B.l - A.r) / 2);
      d = `M${A.r},${A.cy} H${mx} V${B.cy} H${B.l - 2}`; lx = mx + 4; ly = (A.cy + B.cy) / 2 - 3;
      if (Math.abs(A.cy - B.cy) < 4) { lx = A.r + 4; ly = A.cy - 5; }
    } else if (Math.abs(A.cx - B.cx) < 40) {
      d = B.t > A.b ? `M${A.cx},${A.b} V${B.t - 2}` : `M${A.cx},${A.t} V${B.b + 2}`; lx = A.cx + 5; ly = B.t > A.b ? A.b + 14 : A.t - 6;
    } else {
      const down = B.t > A.b;
      d = `M${A.cx},${down ? A.b : A.t} V${B.cy} H${B.cx > A.cx ? B.l - 2 : B.r + 2}`; lx = A.cx + 5; ly = down ? A.b + 14 : A.t - 6;
    }
    out += `<path class="${dim ? 'dim' : ''}" d="${d}" marker-end="url(#ah)"/>`;
    if (label && !dim) out += `<text x="${lx}" y="${ly}">${h(label)}</text>`;
  });
  svg.innerHTML = out;
}

/* Library */
PAGES.library = () => {
  const f = STATE.libFilter;
  const list = LIBRARY.filter(x => f === 'all' || x.lanes.includes(ROLE));
  const it = LIBRARY.find(x => x.code === STATE.libSel) || LIBRARY[0];
  const done = STATE.libDone[it.code] || [];
  const cur = it.steps.findIndex((_, i) => !done.includes(i));
  return pageHead('Abnormality tutorials', 'Each alert code links to one tutorial: what you see, what to do first, and what never to do.',
    `<div class="seg"><button class="${f === 'all' ? 'on' : ''}" onclick="STATE.libFilter='all';refresh()">All types</button><button class="${f === 'mine' ? 'on' : ''}" onclick="STATE.libFilter='mine';refresh()">Relevant to my role</button></div>`) +
  `<div class="lib-grid" style="margin-bottom:16px">${list.map(x => `<button class="lib-card ${x.code === it.code ? 'on' : ''}" onclick="STATE.libSel='${x.code}';refresh()">
      <div class="row"><span class="code">${x.code}</span><b style="font-size:14px">${h(x.name)}</b></div>
      <span class="muted small">${h(x.summary)}</span><span class="small">Usual severity: <b>${h(x.sev)}</b></span></button>`).join('')}</div>
  <div class="grid g21">
    <div>
      ${card(`<span class="code">${it.code}</span> ${h(it.name)}: step-by-step`, `${verLine(it)}<div class="tut">${it.steps.map((s, i) => `
        <div class="ts ${done.includes(i) ? 'done' : ''} ${i === cur ? 'cur' : ''}" onclick="toggleStep('${it.code}',${i})" role="checkbox" aria-checked="${done.includes(i)}" tabindex="0" onkeydown="if(event.key===' '||event.key==='Enter'){event.preventDefault();toggleStep('${it.code}',${i})}">
          <div class="tn">${done.includes(i) ? '✓' : i + 1}</div><div><div class="tt">${h(s[0])}${it.changed && it.changed[i] ? ` <span class="badge b-blue">Updated · ${it.changed[i]}</span>` : ''}</div><div class="td">${h(s[1])}</div></div></div>`).join('')}</div>
        <div class="row mt"><span class="muted small">${done.length} of ${it.steps.length} steps checked</span><button class="btn sm" onclick="STATE.libDone['${it.code}']=[];refresh()">Clear</button><button class="btn sm primary" onclick="startSimFrom('${it.code}')">Practice this in the simulator</button></div>`)}
      <div class="do-dont">
        <div class="do"><h4>Do</h4><ul>${it.dos.map(x => `<li>${h(x)}</li>`).join('')}</ul></div>
        <div class="dont"><h4>Never</h4><ul>${it.donts.map(x => `<li>${h(x)}</li>`).join('')}</ul></div>
      </div>
    </div>
    <div>
      ${card('What you will see', `<div class="sign-list">${it.signs.map(x => `<div>${ico('alert')}<span>${h(x)}</span></div>`).join('')}</div>`)}
      ${card('Who to call and how fast', `<p><b>${h(it.call)}</b></p><p class="small muted mt">Usual severity: ${h(it.sev)}. Targets follow the confirmed level.</p>
        <div class="mt">${Object.keys(SEVERITY).map(k => `<div class="row" style="justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--line)">${sevChip(k)}<span class="small">TL on site ${fmtMin(SEVERITY[k].t.tl)}</span></div>`).join('')}</div>`)}
      ${card('Example case', `<p class="small">${h(it.example)}</p>`)}
    </div>
  </div>`;
};
function verLine(it) {
  const u = it.upd ? PKGS.find(x => x.id === it.upd) : null;
  const pending = PKGS.filter(p => p.stage < 2 && p.changes.some(c => c.code === it.code));
  return `<div class="ver"><span class="badge">Manual v${it.ver}</span>${u ? `<span class="small">Last update: <a href="#sync" onclick="STATE.pkgSel='${u.id}';go('sync')">${u.id}</a>, line change validated in Solution 3</span>` : '<span class="small muted">No changes since first release</span>'}
    ${pending.map(p => `<span class="badge b-amber">Change pending: ${p.id}</span>`).join('')}</div>`;
}
function toggleStep(code, i) {
  const d = STATE.libDone[code] = STATE.libDone[code] || [];
  const k = d.indexOf(i); k >= 0 ? d.splice(k, 1) : d.push(i);
  refresh();
}

/* Severity */
PAGES.severity = () => {
  const w = STATE.wiz;
  let result = null, html = '';
  for (let i = 0; i < SEV_CHECK.length; i++) {
    const q = SEV_CHECK[i], a = w[i];
    if (a === undefined) { html += `<div class="wq cur"><span><b>Q${i + 1}.</b> ${h(q.q)}</span><span class="row"><button class="btn sm" onclick="wiz(${i},true)">Yes</button><button class="btn sm" onclick="wiz(${i},false)">No</button></span></div>`; break; }
    html += `<div class="wq done"><span><b>Q${i + 1}.</b> ${h(q.q)}</span><b>${a ? 'Yes' : 'No'}</b></div>`;
    if (a && q.yes) { result = q.yes; break; }
    if (!a && q.no) { result = q.no; break; }
  }
  if (!result && w.length === SEV_CHECK.length) result = 'S4';
  const R = result ? SEVERITY[result] : null;
  return pageHead('Severity levels and response targets', 'Targets count from the first alert. They are team-proposed and will be calibrated in the pilot.') +
  card('Response target matrix (minutes from first alert)', `<div class="tbl-wrap"><table class="mx">
    <thead><tr><th>Level</th><th>When it applies</th><th style="text-align:center">Acknowledge</th><th style="text-align:center">TL on site</th><th style="text-align:center">Support on site</th><th style="text-align:center">Containment</th><th style="text-align:center">Restore</th></tr></thead>
    <tbody>${Object.keys(SEVERITY).map(k => { const v = SEVERITY[k]; return `<tr style="--sc:${v.color};--st:${v.tint}">
      <td style="white-space:nowrap">${sevChip(k)}</td><td>${h(v.def)}</td>
      ${['ack', 'tl', 'support', 'contain', 'restore'].map(m => `<td class="t">${v.t[m] == null ? '<span class="muted">n/a</span>' : '≤ ' + fmtMin(v.t[m])}</td>`).join('')}</tr>`; }).join('')}</tbody></table></div>
    <p class="small muted mt">S4 support and containment are not required; the case is labelled and reviewed in the next daily meeting. Restore for S3 means fixed within the shift, and for S4 means closed with a label by end of shift.</p>`) +
  `<div class="grid g2">
    ${card('Severity check: answer in order', `<div class="wiz">${html}</div>
      ${R ? `<div class="result mt" style="--sc:${R.color};--st:${R.tint}"><div class="big">${result} ${R.name}</div><p class="small">${h(R.def)}</p>
        <div class="targets">${MILESTONES.map(m => `<div>${m[1]}<b>${R.t[m[0]] == null ? 'n/a' : '≤ ' + fmtMin(R.t[m[0]])}</b></div>`).join('')}</div></div>` : ''}
      <div class="row mt"><button class="btn sm" onclick="STATE.wiz=[];refresh()">Start over</button>${R ? `<button class="btn sm primary" onclick="startSimFrom(null,'${result}')">Simulate this response</button>` : ''}</div>`)}
    ${card('Automatic escalation ladder', Object.keys(SEVERITY).map(k => { const v = SEVERITY[k]; return `<div style="--sc:${v.color};margin-bottom:12px">${sevChip(k)}<div class="ladder">${v.escalate.map(e => `<div class="rung"><span class="when">${e[0]}</span><span class="what">${h(e[1])}</span></div>`).join('')}</div></div>`; }).join('') +
      `<div class="callout">Any missed target triggers the next rung automatically through the Smart Factory Platform, so escalation never depends on someone remembering to call.</div>`)}
  </div>
  ${card('Examples per level', `<div class="grid g4 flat">${Object.keys(SEVERITY).map(k => `<div>${sevChip(k)}<ul class="clean small">${SEVERITY[k].examples.map(x => `<li>${h(x)}</li>`).join('')}</ul></div>`).join('')}</div>`)}`;
};
function wiz(i, a) { STATE.wiz = STATE.wiz.slice(0, i); STATE.wiz[i] = a; refresh(); }

/* Simulator */
function newSim(code, sev) {
  return { code: code || 'QD', sev: sev || 'S2', line: 'Sealer', running: false, t: 0, done: {}, feed: [], escalated: {} };
}
function startSimFrom(code, sev) { STATE.sim = newSim(code || (STATE.sim && STATE.sim.code), sev); go('simulator'); }
function stopTimer() { if (STATE.timer) { clearInterval(STATE.timer); STATE.timer = null; } if (STATE.sim) STATE.sim.running = false; }
function simTick() {
  const s = STATE.sim; if (!s || !s.running) return;
  s.t += 0.25 * STATE.simSpeed / 60; // minutes
  checkEscalation();
  renderSimLive();
}
function checkEscalation() {
  const s = STATE.sim, T = SEVERITY[s.sev].t;
  MILESTONES.forEach(([k, label]) => {
    if (T[k] == null || s.done[k] != null || s.escalated[k]) return;
    if (s.t > T[k]) { s.escalated[k] = true; s.feed.unshift({ t: s.t, m: `Target missed: ${label} (≤ ${fmtMin(T[k])}). Escalated one level up.`, esc: true }); }
  });
}
const clock = m => { const sec = Math.floor(m * 60); return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); };
PAGES.simulator = () => {
  if (!STATE.sim) STATE.sim = newSim();
  const s = STATE.sim;
  const A = s.alert;
  return pageHead(A ? 'Response workspace · live case ' + A.id : 'Response workspace · practice', A ? 'This case was opened from a Solution 1 alert. The clock started when the AI raised it.' : 'No live case open. Run a practice case, or open one from Live Alerts.', A ? '' : `<a class="btn sm primary" href="#alerts" onclick="go('alerts')">Open Live Alerts</a>`) +
  `<div class="grid g12">
    <div>
      ${A ? alertEvidence(A, s) : card('Set up a practice case', `
        <div class="field"><label for="sCode">Abnormality type</label><select id="sCode" ${s.running || s.t ? 'disabled' : ''} onchange="STATE.sim.code=this.value">${LIBRARY.map(x => `<option value="${x.code}" ${x.code === s.code ? 'selected' : ''}>${x.code} · ${h(x.name)}</option>`).join('')}</select></div>
        <div class="field"><label for="sSev">Confirmed severity</label><select id="sSev" ${s.running || s.t ? 'disabled' : ''} onchange="STATE.sim.sev=this.value;refresh()">${Object.keys(SEVERITY).map(k => `<option value="${k}" ${k === s.sev ? 'selected' : ''}>${k} ${SEVERITY[k].name}</option>`).join('')}</select></div>
        <div class="field"><label for="sLine">Line</label><select id="sLine" ${s.running || s.t ? 'disabled' : ''} onchange="STATE.sim.line=this.value">${['Body Welding 1', 'Body Welding 2', 'Sealer', 'Paint', 'Assembly 1', 'Assembly 2'].map(x => `<option ${x === s.line ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
        <div class="field"><label>Clock speed</label><div class="seg">${[1, 10, 60].map(v => `<button class="${STATE.simSpeed === v ? 'on' : ''}" onclick="STATE.simSpeed=${v};refresh()">${v === 1 ? 'Real time' : v + '× faster'}</button>`).join('')}</div></div>
        <div class="row">${s.running ? `<button class="btn" onclick="pauseSim()">Pause</button>` : `<button class="btn primary" onclick="runSim()">${s.t ? 'Resume' : 'Raise alert and start'}</button>`}<button class="btn" onclick="STATE.sim=newSim(STATE.sim.code,STATE.sim.sev);stopTimer();refresh()">Reset</button></div>`)}
      ${card('Event feed', `<div class="feed" id="simFeed"></div>`)}
    </div>
    <div>
      ${card('Live response', `<div class="row" style="justify-content:space-between"><div><div class="muted small">Time since first alert</div><div class="timer" id="simClock">${clock(s.t)}</div></div>
        <div style="text-align:right">${sevChip(s.sev)}<div class="small muted mt">${h(s.code)} · ${h(s.line)}${A ? ' · ' + A.id : ''}</div></div></div>
        <div id="simMs" class="mt"></div>
        <div class="row mt"><button class="btn primary" id="simFinish" onclick="finishSim()">Close case and add to log</button><span class="small muted">Tap each milestone when it happens. Steps can be marked in any order.</span></div>`)}
      ${card('Manual book for this case · ' + h(s.code) + ' v' + (LIBRARY.find(x => x.code === s.code) || LIBRARY[0]).ver, `<div class="tut">${(LIBRARY.find(x => x.code === s.code) || LIBRARY[0]).steps.map((st, i) => `<div class="ts" style="cursor:default"><div class="tn">${i + 1}</div><div><div class="tt">${h(st[0])}</div><div class="td">${h(st[1])}</div></div></div>`).join('')}</div>`)}
    </div>
  </div>`;
};
function renderSimLive() {
  const s = STATE.sim; if (!s || PAGE !== 'simulator') return;
  const T = SEVERITY[s.sev].t;
  const c = $('#simClock'); if (c) c.textContent = clock(s.t);
  const box = $('#simMs');
  if (box) box.innerHTML = MILESTONES.map(([k, label, lane]) => {
    const tgt = T[k], at = s.done[k];
    if (tgt == null) return `<div class="ms"><div class="st"></div><div><b>${label}</b><div class="small muted">Not required for ${s.sev}</div></div><span></span><span></span></div>`;
    const elapsed = at != null ? at : s.t;
    const ratio = Math.min(1, elapsed / tgt);
    let cls = '', note = '';
    if (at != null) { cls = at <= tgt ? 'ok' : 'late'; note = at <= tgt ? 'Met at ' + clock(at) : 'Late at ' + clock(at); }
    else if (s.t > tgt) { cls = 'breach'; note = 'Target missed, escalated'; }
    else if (s.t > tgt * 0.8) { cls = 'risk'; note = 'At risk'; }
    else note = 'Due in ' + clock(tgt - s.t);
    const col = cls === 'ok' ? C.green : cls === 'late' || cls === 'breach' ? C.crit : cls === 'risk' ? C.amber : '#9AA0A6';
    return `<div class="ms ${cls}"><div class="st">${at != null ? ICONS.check : ''}</div>
      <div><b>${label}</b> <span class="small muted">· ${h(LANES[lane].short)} · target ≤ ${fmtMin(tgt)}</span><div class="bar-t"><span style="width:${ratio * 100}%;background:${col}"></span></div></div>
      <span class="small" style="color:${col};font-weight:500;white-space:nowrap">${note}</span>
      <button class="btn sm" ${at != null || (!s.running && !s.t) ? 'disabled' : ''} onclick="markMs('${k}')">${at != null ? 'Done' : 'Mark done'}</button></div>`;
  }).join('');
  const f = $('#simFeed');
  if (f) f.innerHTML = s.feed.length ? s.feed.map(x => `<div class="fi ${x.esc ? 'esc' : ''}"><time>${clock(x.t)}</time><span>${h(x.m)}</span></div>`).join('') : '<div class="empty">Start the case to see events.</div>';
}
function runSim() {
  const s = STATE.sim;
  if (!s.t && !s.feed.length) s.feed.unshift({ t: 0, m: `Alert raised: ${s.code} on ${s.line}. Severity ${s.sev} targets applied.` });
  s.running = true; clearInterval(STATE.timer); STATE.timer = setInterval(simTick, 250); refresh();
}
function pauseSim() { stopTimer(); refresh(); }
function markMs(k) {
  const s = STATE.sim; if (s.done[k] != null) return;
  s.done[k] = s.t;
  const m = MILESTONES.find(x => x[0] === k), T = SEVERITY[s.sev].t[k];
  s.feed.unshift({ t: s.t, m: `${m[1]} (${T != null && s.t <= T ? 'within target' : 'late'}).` });
  renderSimLive();
}
function finishSim() {
  const s = STATE.sim;
  if (!s.t) { toast('Start the case first'); return; }
  const T = SEVERITY[s.sev].t;
  const ack = s.done.ack != null ? s.done.ack : s.t, restore = s.done.restore != null ? s.done.restore : s.t;
  const within = MILESTONES.every(([k]) => T[k] == null || (s.done[k] != null && s.done[k] <= T[k]));
  LOG.unshift({ id: s.alert ? s.alert.id : 'AB-' + (1241 + LOG.filter(x => x.sim).length), time: new Date().toISOString(), line: s.line, code: s.code, sev: s.sev, ack: +ack.toFixed(1), restore: Math.round(restore), within, status: 'Closed', sim: !s.alert, live: !!s.alert });
  if (s.alert) { const al = ALERTS.find(x => x.id === s.alert.id); if (al) { al.status = 'Closed'; al.label = 'Confirmed ' + s.sev; } LABELS.push({ id: s.alert.id, label: 'Confirmed defect', at: Date.now() }); saveInteg(); }
  store.set('log', LOG);
  stopTimer();
  toast(within ? 'Closed within all targets. Added to the log.' : 'Closed with missed targets. Added to the log.');
  STATE.sim = newSim(s.code, s.sev);
  go('log');
}

/* Training */
PAGES.training = () => {
  const i = STATE.quizI, ans = STATE.quizAns;
  const best = store.get('best_' + ROLE, null);
  if (i >= QUIZ.length) {
    const score = ans.filter((a, k) => a === QUIZ[k].a).length, pass = score >= 6;
    if (best == null || score > best) store.set('best_' + ROLE, score);
    if (pass && !STATE.quizCounted) { const pk = PKGS.find(x => x.stage === 3 && x.trained < x.people); if (pk) { pk.trained++; saveInteg(); } STATE.quizCounted = true; }
    return pageHead('Training & quiz', 'Scenario questions based on the SOP, tutorials, and targets.') +
    card('Your result', `<div class="row" style="gap:24px;align-items:center"><div class="score">${score}/${QUIZ.length}</div><div>${pass ? 'You passed. You know the standard response.' : 'Not yet. Review the tutorials and the target matrix, then try again.'}</div></div>
      ${pass ? `<div class="cert mt"><b>Abnormality Response, Level 1</b><div class="small muted">${h(LANES[ROLE].name)} · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div><div class="small mt">Pass mark 6 of 8. Refresher every 6 months, or after a tutorial changes.</div></div>` : ''}
      <div class="mt">${QUIZ.map((q, k) => `<div class="small" style="padding:6px 0;border-bottom:1px solid var(--line)">${ans[k] === q.a ? '✓' : '✗'} ${h(q.q)} <span class="muted">${h(q.e)}</span></div>`).join('')}</div>
      <div class="row mt"><button class="btn primary" onclick="STATE.quizI=0;STATE.quizAns=[];STATE.quizCounted=false;refresh()">Try again</button></div>`);
  }
  const q = QUIZ[i], a = ans[i];
  return pageHead('Training & quiz', 'Eight scenario questions. Pass mark 6 of 8.', best != null ? `<span class="badge b-green">Best score ${best}/${QUIZ.length}</span>` : '') +
  `<div class="grid g21">${card(`Question ${i + 1} of ${QUIZ.length}`, `<p style="font-size:15px;font-weight:500;margin-bottom:12px">${h(q.q)}</p>
    ${q.o.map((o, k) => `<button class="qopt ${a != null && k === q.a ? 'right' : ''} ${a === k && k !== q.a ? 'wrong' : ''}" ${a != null ? 'disabled' : ''} onclick="answer(${k})">${String.fromCharCode(65 + k)}. ${h(o)}</button>`).join('')}
    ${a != null ? `<div class="callout mt">${a === q.a ? '<b>Correct.</b> ' : '<b>Not quite.</b> '}${h(q.e)}</div><div class="row mt"><button class="btn primary" onclick="STATE.quizI++;refresh()">${i + 1 < QUIZ.length ? 'Next question' : 'See result'}</button></div>` : ''}
    <div class="progress mt"><span style="width:${i / QUIZ.length * 100}%;background:var(--red)"></span></div>`)}
    ${card('How training works', `<ul class="clean small"><li><b>Onboarding:</b> every new operator and TL completes the tutorials for their area and passes this quiz before working alone.</li>
      <li><b>On the line:</b> the tutorial for each alert code opens from the station screen when the alert appears.</li>
      <li><b>Refresher:</b> every 6 months, or when a tutorial is updated after a new case.</li>
      <li><b>Drills:</b> TLs run one simulator drill per shift team each month during the pilot.</li></ul>`)}</div>`;
};
function answer(k) { STATE.quizAns[STATE.quizI] = k; refresh(); }

/* Log */
PAGES.log = () => {
  const s = stats();
  afterQ.push(drawCharts);
  return pageHead('Response log & KPIs', 'Every case is timestamped by the platform. Simulator runs are added here too.', `<button class="btn sm" onclick="downloadCSV()">Download CSV</button>`) +
  `<div class="grid g4">${kpi('Cases logged', s.n, 'Last 7 days, simulated')}${kpi('Mean time to acknowledge', s.mtta.toFixed(1) + ' min', 'All severities')}${kpi('Mean time to restore', Math.round(s.mttr) + ' min', 'Closed cases')}${kpi('Within all targets', Math.round(s.within) + '%', 'Proposed pilot goal: 90% or more')}</div>
  <div class="grid g2">
    ${card('Share of cases within target, by severity', '<div style="height:240px"><canvas id="cSev" role="img" aria-label="Bar chart of the share of cases within target for each severity level"></canvas></div>')}
    ${card('Cases by abnormality type', '<div style="height:240px"><canvas id="cType" role="img" aria-label="Bar chart of the number of cases for each abnormality type"></canvas></div>')}
  </div>
  ${card('Case log', `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>ID</th><th>Time</th><th>Line</th><th>Type</th><th>Severity</th><th class="r">Acknowledge</th><th class="r">Restore</th><th>Target</th><th>Status</th></tr></thead>
    <tbody>${LOG.slice(0, 40).map(x => `<tr><td>${h(x.id)}${x.sim ? ' <span class="badge">drill</span>' : ''}${x.live ? ' <span class="badge b-blue">from Solution 1</span>' : ''}</td><td>${new Date(x.time).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td><td>${h(x.line)}</td><td><span class="code">${x.code}</span></td><td>${sevChip(x.sev)}</td>
      <td class="r">${x.ack} min</td><td class="r">${x.status === 'Open' ? '<span class="muted">open</span>' : fmtMin(x.restore)}</td><td>${x.status === 'Open' ? '<span class="badge b-amber">In progress</span>' : x.within ? '<span class="badge b-green">Met</span>' : '<span class="badge b-red">Missed</span>'}</td><td>${h(x.status)}</td></tr>`).join('')}</tbody></table></div>`)}`;
};
function drawCharts() {
  if (!window.Chart) return;
  Chart.defaults.font.family = "'Inter', Arial, sans-serif"; Chart.defaults.color = C.muted;
  const sevs = Object.keys(SEVERITY);
  const pct = sevs.map(k => { const c = LOG.filter(x => x.sev === k && x.status === 'Closed'); return c.length ? Math.round(c.filter(x => x.within).length / c.length * 100) : 0; });
  const opts = (max, suf) => ({ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.parsed.y + suf } } },
    scales: { y: { beginAtZero: true, max, grid: { color: C.grid }, border: { display: false }, ticks: { callback: v => v + suf } }, x: { grid: { display: false } } } });
  charts.sev = new Chart($('#cSev'), { type: 'bar', data: { labels: sevs.map(k => k + ' ' + SEVERITY[k].name), datasets: [{ data: pct, backgroundColor: C.blue, borderRadius: 4, maxBarThickness: 46 }] }, options: opts(100, '%') });
  const codes = LIBRARY.map(x => x.code);
  charts.type = new Chart($('#cType'), { type: 'bar', data: { labels: codes.map(c => c + ' · ' + LIBRARY.find(x => x.code === c).name.split(' ')[0]), datasets: [{ data: codes.map(c => LOG.filter(x => x.code === c).length), backgroundColor: C.blue, borderRadius: 4, maxBarThickness: 46 }] }, options: opts(undefined, '') });
}
function downloadCSV() {
  const rows = [['id', 'time', 'line', 'type', 'severity', 'ack_min', 'restore_min', 'within_target', 'status']].concat(LOG.map(x => [x.id, x.time, x.line, x.code, x.sev, x.ack, x.restore, x.within, x.status]));
  const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'abnormality-response-log.csv'; a.click();
}

/* =========================================================
   Integration: Solution 1 → 2 (alert stream) and Solution 3 → 2 (line change packages)
   In production these arrive through the platform API; here they are simulated.
   ========================================================= */
let ALERTS = [], LABELS = [], PKGS = [], alertSeq = 5121, genTimer = null;
const BASE_LIB = JSON.parse(JSON.stringify(LIBRARY));
const ageMin = a => (Date.now() - a.raised) / 60000;
function saveInteg() { store.set('alerts', ALERTS); store.set('labels', LABELS); store.set('pkgs', PKGS.map(p => ({ id: p.id, stage: p.stage, trained: p.trained, order: p.order, extra: p.extra ? p : null }))); store.set('alertSeq', alertSeq); updateBadges(); }
function makeAlert(tplIdx, minsAgo) {
  const t = AI_ALERT_TEMPLATES[tplIdx % AI_ALERT_TEMPLATES.length];
  return Object.assign({ id: 'AL-' + (alertSeq++), raised: Date.now() - (minsAgo || 0) * 60000, status: 'New', tpl: tplIdx % AI_ALERT_TEMPLATES.length }, t);
}
function initInteg() {
  ALERTS = store.get('alerts', null); LABELS = store.get('labels', []); alertSeq = store.get('alertSeq', 5121);
  if (!ALERTS) { ALERTS = [makeAlert(0, 0.4), makeAlert(1, 1.6), makeAlert(3, 7)]; }
  const saved = store.get('pkgs', null);
  PKGS = PKG_BASE.map((p, i) => Object.assign(JSON.parse(JSON.stringify(p)), { order: 100 - i }));
  if (saved) saved.forEach(sv => {
    let p = PKGS.find(x => x.id === sv.id);
    if (!p && sv.extra) { p = sv.extra; PKGS.push(p); }
    if (p) { p.stage = sv.stage; p.trained = sv.trained; p.order = sv.order; }
  });
  rebuildLibrary();
  clearInterval(genTimer);
  genTimer = setInterval(() => {
    if (!ROLE) return;
    if (ALERTS.filter(x => x.status === 'New').length >= 6) return;
    const a = makeAlert(Math.floor(Math.random() * AI_ALERT_TEMPLATES.length), 0);
    ALERTS.unshift(a); saveInteg();
    toast('New alert from Solution 1: ' + a.code + ' · ' + a.station);
    if (PAGE === 'alerts' || PAGE === 'home') refresh();
  }, 45000);
  setInterval(() => { if (ROLE) { updateBadges(); if (PAGE === 'alerts') tickAlerts(); } }, 1000);
}
/* Apply every published package to the manual book, oldest first */
function rebuildLibrary() {
  BASE_LIB.forEach((b, i) => { const L = LIBRARY[i]; L.steps = b.steps.map(x => x.slice()); L.signs = b.signs.slice(); L.ver = b.ver; L.upd = null; L.changed = {}; });
  PKGS.filter(p => p.stage >= 2).sort((a, b) => a.order - b.order).forEach(p => {
    const touched = new Set();
    p.changes.forEach(c => {
      const L = LIBRARY.find(x => x.code === c.code); if (!L) return;
      if (c.type === 'step') { L.steps[c.idx] = [c.title, c.text]; L.changed[c.idx] = p.id; }
      if (c.type === 'sign' && !L.signs.includes(c.text)) L.signs.push(c.text);
      touched.add(L);
    });
    touched.forEach(L => { const [M, m] = L.ver.split('.').map(Number); L.ver = M + '.' + (m + 1); L.upd = p.id; });
  });
}
function updateBadges() {
  const n = ALERTS.filter(x => x.status === 'New').length, late = ALERTS.some(x => x.status === 'New' && ageMin(x) > SEVERITY[x.sev].t.ack);
  const e = document.getElementById('nb-alerts'); if (e) { e.textContent = n || ''; e.className = 'nav-badge' + (late ? ' late' : ''); }
  const k = PKGS.filter(x => x.stage < 4).length, f = document.getElementById('nb-sync'); if (f) f.textContent = k || '';
}

/* ---------- Live Alerts page (Solution 1 → 2) ---------- */
PAGES.alerts = () => {
  const open = ALERTS.filter(x => x.status === 'New'), inResp = ALERTS.filter(x => x.status === 'In response'), done = ALERTS.filter(x => x.status === 'Closed' || x.status === 'False alarm');
  const acks = ALERTS.filter(x => x.ackMin != null).map(x => x.ackMin);
  return pageHead('Live alerts from Solution 1', 'Every detection from the AI on SCADA data lands here with its alert code. Respond opens the SOP path, manual book page, and targets for that code.',
    `<button class="btn sm" onclick="ALERTS.unshift(makeAlert(Math.floor(Math.random()*AI_ALERT_TEMPLATES.length),0));saveInteg();refresh()">Simulate a new detection</button>`) +
  `<div class="grid g4">${kpi('Waiting for acknowledgement', open.length, 'Clock runs from the AI detection')}${kpi('Past acknowledge target', `<span id="kLate">${open.filter(x => ageMin(x) > SEVERITY[x.sev].t.ack).length}</span>`, 'Escalated one level up automatically')}${kpi('Avg time to acknowledge', acks.length ? (acks.reduce((a, b) => a + b, 0) / acks.length).toFixed(1) + ' min' : 'n/a', 'Alerts handled in this demo')}${kpi('Labels sent to Solution 1', LABELS.length, 'Confirmed defects and false alarms retrain the AI')}</div>` +
  card('Incoming alerts', open.length ? open.map(alertRow).join('') : '<div class="empty">No alerts waiting. New detections arrive about every 45 seconds, or use Simulate a new detection.</div>', `<span class="small muted">Live · newest first</span>`) +
  (inResp.length ? card('In response', inResp.map(a => `<div class="al"><div class="al-l"><span class="code">${a.code}</span><div><b>${h(a.msg)}</b><div class="small muted">${a.id} · ${h(a.station)}</div></div></div><div class="row">${sevChip(a.sev)}<button class="btn sm" onclick="resumeAlert('${a.id}')">Open workspace</button></div></div>`).join('')) : '') +
  (done.length ? card('Closed and labelled', `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Alert</th><th>Detection</th><th>Station</th><th>Label sent to Solution 1</th></tr></thead><tbody>${done.slice(0, 12).map(a => `<tr><td>${a.id}</td><td><span class="code">${a.code}</span> ${h(a.msg)}</td><td>${h(a.station)}</td><td>${a.status === 'False alarm' ? '<span class="badge">False alarm · ' + h(a.reason || '') + '</span>' : '<span class="badge b-green">' + h(a.label || 'Confirmed') + '</span>'}</td></tr>`).join('')}</tbody></table></div>`) : '');
};
function alertRow(a) {
  const T = SEVERITY[a.sev].t, L = LIBRARY.find(x => x.code === a.code);
  return `<div class="al" id="al-${a.id}">
    <div class="al-l"><span class="code">${a.code}</span><div>
      <b>${h(a.msg)}</b>
      <div class="small muted">${a.id} · ${h(a.station)} · ${h(a.src)}</div>
      <div class="small" style="margin-top:3px">${h(a.metric)} · AI confidence <b>${a.conf}%</b></div>
      <div class="small muted" style="margin-top:3px">Opens: SOP path ${a.sev} · Manual book ${a.code} v${L ? L.ver : ''} · targets ack ≤ ${fmtMin(T.ack)}, TL ≤ ${fmtMin(T.tl)}</div>
    </div></div>
    <div class="al-r">
      <div class="row" style="justify-content:flex-end"><span class="small muted">AI suggests</span>${sevChip(a.sev)}</div>
      <div class="al-clock" data-raised="${a.raised}" data-ack="${T.ack}">${clock(ageMin(a))}</div>
      <div class="row" style="justify-content:flex-end">
        <button class="btn sm" onclick="falseAlarm('${a.id}')">False alarm</button>
        <button class="btn sm primary" onclick="respondAlert('${a.id}')">Acknowledge and respond</button></div>
    </div></div>`;
}
function tickAlerts() {
  let late = 0;
  document.querySelectorAll('.al-clock').forEach(el => {
    const m = (Date.now() - +el.dataset.raised) / 60000, t = +el.dataset.ack;
    el.textContent = clock(m) + (m > t ? ' · past target, escalated' : '');
    el.className = 'al-clock' + (m > t ? ' late' : m > t * 0.8 ? ' risk' : '');
    if (m > t) late++;
  });
  const k = document.getElementById('kLate'); if (k) k.textContent = late;
}
function respondAlert(id) {
  const a = ALERTS.find(x => x.id === id); if (!a) return;
  const m = ageMin(a);
  a.status = 'In response'; a.ackMin = +m.toFixed(1);
  stopTimer();
  STATE.sim = newSim(a.code, a.sev); STATE.sim.line = a.line; STATE.sim.t = m;
  STATE.sim.alert = { id: a.id, msg: a.msg, station: a.station, src: a.src, metric: a.metric, conf: a.conf, aiSev: a.sev };
  STATE.sim.feed = [{ t: 0, m: `Solution 1 raised ${a.id}: ${a.msg} (${a.station}).` }];
  STATE.sim.done.ack = m;
  STATE.sim.feed.unshift({ t: m, m: `Alert acknowledged (${m <= SEVERITY[a.sev].t.ack ? 'within target' : 'late'}). Manual book ${a.code} and SOP path ${a.sev} opened.` });
  saveInteg(); go('simulator'); runSim();
}
function resumeAlert(id) { if (STATE.sim && STATE.sim.alert && STATE.sim.alert.id === id) return go('simulator'); const a = ALERTS.find(x => x.id === id); if (a) { a.status = 'New'; respondAlert(id); } }
function falseAlarm(id) {
  const a = ALERTS.find(x => x.id === id); if (!a) return;
  const reasons = ['Lighting reflection', 'Sensor noise', 'Part within standard', 'Camera angle'];
  a.status = 'False alarm'; a.reason = reasons[a.tpl % reasons.length]; a.ackMin = +ageMin(a).toFixed(1);
  LABELS.push({ id: a.id, label: 'False alarm', at: Date.now() });
  saveInteg(); toast(a.id + ' labelled as false alarm and sent back to Solution 1'); refresh();
}
function alertEvidence(A, s) {
  return card('Alert from Solution 1 · ' + A.id, `<div class="ev">
      <div class="ev-row"><span>Detection</span><b>${h(A.msg)}</b></div>
      <div class="ev-row"><span>Station</span><b>${h(A.station)}</b></div>
      <div class="ev-row"><span>Source</span><b>${h(A.src)}</b></div>
      <div class="ev-row"><span>Evidence</span><b>${h(A.metric)}</b></div>
      <div class="ev-row"><span>AI confidence</span><b>${A.conf}%</b></div>
      <div class="ev-row"><span>AI suggested</span>${sevChip(A.aiSev)}</div></div>
    <div class="field mt"><label for="sSev">Severity confirmed by the TL</label><select id="sSev" onchange="STATE.sim.sev=this.value;STATE.sim.feed.unshift({t:STATE.sim.t,m:'TL changed severity to '+this.value+'. Targets updated.'});refresh()">${Object.keys(SEVERITY).map(k => `<option value="${k}" ${k === s.sev ? 'selected' : ''}>${k} ${SEVERITY[k].name}</option>`).join('')}</select></div>
    <div class="field"><label>Clock speed</label><div class="seg">${[1, 10, 60].map(v => `<button class="${STATE.simSpeed === v ? 'on' : ''}" onclick="STATE.simSpeed=${v};refresh()">${v === 1 ? 'Real time' : v + '× faster'}</button>`).join('')}</div></div>
    <div class="row">${s.running ? `<button class="btn" onclick="pauseSim()">Pause</button>` : `<button class="btn primary" onclick="runSim()">Resume</button>`}<a class="btn" href="#swimlane" onclick="STATE.slSev='${s.sev}';go('swimlane')">See SOP path ${s.sev}</a></div>
    <p class="small muted mt">Closing the case sends the label “Confirmed defect” back to Solution 1.</p>`);
}

/* ---------- Line Change Sync page (Solution 3 → 2) ---------- */
PAGES.sync = () => {
  const list = PKGS.slice().sort((a, b) => b.order - a.order);
  const sel = list.find(x => x.id === STATE.pkgSel) || list.find(x => x.stage < 4) || list[0];
  STATE.pkgSel = sel.id;
  const next = PKG_NEXT.find(n => !PKGS.some(p => p.id === n.id));
  return pageHead('Line change sync from Solution 3', 'When the digital twin validates a line change, Solution 3 sends a change package here. The manual book is updated and people are retrained before the change goes live.',
    next ? `<button class="btn sm" onclick="receivePkg()">Receive next package from Solution 3</button>` : '') +
  `<div class="grid g12">
    ${card('Change packages', list.map(p => `<button class="pk ${p.id === sel.id ? 'on' : ''}" onclick="STATE.pkgSel='${p.id}';refresh()">
        <div class="row" style="justify-content:space-between"><span class="code">${p.id}</span>${stageBadge(p)}</div>
        <b>${h(p.title)}</b><span class="small muted">${h(p.area)} · ${p.daysAgo === 0 ? 'today' : p.daysAgo + ' days ago'}</span></button>`).join(''))}
    <div>${pkgDetail(sel)}</div>
  </div>`;
};
function stageBadge(p) { const c = p.stage >= 4 ? 'b-green' : p.stage >= 2 ? 'b-blue' : 'b-amber'; return `<span class="badge ${c}">${PKG_STAGES[p.stage]}</span>`; }
function pkgDetail(p) {
  const pct = Math.round(p.trained / p.people * 100), gate = pct >= 90;
  const steps = `<div class="stages">${PKG_STAGES.map((st, i) => `<div class="stg ${i < p.stage ? 'done' : i === p.stage ? 'cur' : ''}"><span>${i < p.stage || p.stage === 4 ? '✓' : i + 1}</span>${st}</div>`).join('')}</div>`;
  const diff = p.changes.map(c => {
    const L = BASE_LIB.find(x => x.code === c.code), cur = LIBRARY.find(x => x.code === c.code);
    const oldTxt = c.type === 'step' ? (p.stage >= 2 ? '' : cur.steps[c.idx][1]) : '';
    return `<div class="df"><div class="row"><span class="code">${c.code}</span><b>${c.type === 'step' ? 'Step ' + (c.idx + 1) + ': ' + h(c.title) : 'New warning sign'}</b><span class="small muted">${h(L.name)}</span></div>
      ${c.type === 'step' && oldTxt ? `<div class="df-old">− ${h(oldTxt)}</div>` : ''}<div class="df-new">+ ${h(c.text)}</div></div>`;
  }).join('');
  let action = '';
  if (p.stage === 0) action = `<button class="btn primary" onclick="pkgNext('${p.id}')">Review impact on the manual book</button>`;
  else if (p.stage === 1) action = `<button class="btn primary" onclick="pkgNext('${p.id}')">Approve and publish manual update</button><span class="small muted">Group Leader approval</span>`;
  else if (p.stage === 2) action = `<button class="btn primary" onclick="pkgNext('${p.id}')">Assign refresher to ${p.people} people</button>`;
  else if (p.stage === 3) action = `<button class="btn" onclick="pkgTrain('${p.id}')">Record 4 completions</button><a class="btn" href="#training" onclick="go('training')">Take the refresher quiz</a><button class="btn primary" ${gate ? '' : 'disabled'} onclick="pkgNext('${p.id}')">Release go-live to Solution 3</button><span class="small muted">${gate ? 'Gate passed' : 'Needs 90% trained'}</span>`;
  else action = `<span class="badge b-green">Solution 3 notified: ${p.id} cleared for go-live</span>`;
  return card(`<span class="code">${p.id}</span> ${h(p.title)}`, `${steps}
    <div class="grid g2 flat mt">
      <div><div class="sub-h">Digital twin result (Solution 3)</div><table class="tbl"><thead><tr><th>Measure</th><th>Before</th><th>After</th></tr></thead><tbody>${p.sim.map(r => `<tr><td>${h(r[0])}</td><td>${h(r[1])}</td><td><b>${h(r[2])}</b></td></tr>`).join('')}</tbody></table><p class="small muted mt">${h(p.note)}</p></div>
      <div><div class="sub-h">Refresher</div><div class="cell-bar"><div class="progress lg"><span style="width:${p.stage >= 3 ? pct : 0}%;background:${gate ? C.green : C.amber}"></span></div><b>${p.stage >= 3 ? p.trained + '/' + p.people : 'Not assigned'}</b></div>
        <p class="small muted mt">Affected operators and TLs in ${h(p.area)}. Go-live opens at 90% trained. Passing the quiz counts as one completion.</p></div>
    </div>
    <div class="sub-h mt" style="margin-top:16px">Manual book changes ${p.stage >= 2 ? '(published)' : p.stage === 1 ? '(proposed, review below)' : '(open after impact review)'}</div>
    ${p.stage >= 1 ? diff : `<div class="callout">${p.changes.length} change${p.changes.length > 1 ? 's' : ''} detected in ${[...new Set(p.changes.map(c => c.code))].join(', ')}. Review the impact to see the exact edits.</div>`}
    <div class="row mt">${action}</div>`);
}
function pkgNext(id) {
  const p = PKGS.find(x => x.id === id); if (!p || p.stage >= 4) return;
  p.stage++;
  if (p.stage === 2) { p.order = Math.max(...PKGS.map(x => x.order)) + 1; rebuildLibrary(); toast('Manual book updated: ' + [...new Set(p.changes.map(c => c.code))].map(c => c + ' v' + LIBRARY.find(x => x.code === c).ver).join(', ')); }
  if (p.stage === 4) toast('Go-live released. Solution 3 notified.');
  saveInteg(); refresh();
}
function pkgTrain(id) { const p = PKGS.find(x => x.id === id); p.trained = Math.min(p.people, p.trained + 4); saveInteg(); refresh(); }
function receivePkg() {
  const n = PKG_NEXT.find(n => !PKGS.some(p => p.id === n.id)); if (!n) return;
  const p = Object.assign(JSON.parse(JSON.stringify(n)), { daysAgo: 0, stage: 0, trained: 0, order: 0, extra: true });
  PKGS.push(p); STATE.pkgSel = p.id; saveInteg(); toast('Package ' + p.id + ' received from Solution 3'); refresh();
}

/* ---------- Boot ---------- */
window.addEventListener('hashchange', () => { const p = location.hash.replace('#', ''); if (ROLE && p !== PAGE && PAGES[p]) go(p); });
afterQ = [];
const _go = go;
go = function (p, keep) { _go(p, keep); if (p === 'simulator') renderSimLive(); if (p === 'alerts') tickAlerts(); updateBadges(); };
initInteg();
if (ROLE && LANES[ROLE]) enter(ROLE); else renderLanding();
