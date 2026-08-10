/* ════════════════════════════════════════════════════════════════════════════
   IYKA-ARAM · 07 — Clinic MIS screens
   Page: 03 · Screens

   Dashboard, Appointments, Patients, Billing, Finance, Yoga, Messages.
   Chrome from src/components/mis/sidebar.tsx — a 256px white sidebar using the
   BRAND palette (forest active pill, sand borders, gold-soft avatar), with a
   clinical-blue content area. That split is intentional in the code.

   Run AFTER 03-components-mis-admin.js.

   Standard Figma Plugin API only. Safe to re-run.
   ════════════════════════════════════════════════════════════════════════════ */

(async () => {

  /* ── prelude ─────────────────────────────────────────────────────────── */
  const V = {}, S = {}, E = {}, C = {};
  async function boot() {
    for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
    for (const s of await figma.getLocalTextStylesAsync()) S[s.name] = s;
    for (const s of await figma.getLocalEffectStylesAsync()) E[s.name] = s;
    const comps = figma.root.children.find(p => p.name === '02 · Components');
    if (comps) {
      await comps.loadAsync();
      for (const n of comps.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })) {
        if (n.parent && n.parent.type === 'COMPONENT_SET') continue;
        C[n.name] = n;
      }
    }
    await Promise.all([
      ['Cormorant Garamond', 'Light'], ['Cormorant Garamond', 'Regular'],
      ['DM Sans', 'Regular'], ['DM Sans', 'Medium'],
      ['Inter', 'Regular'], ['Inter', 'Medium'], ['Inter', 'Semi Bold'], ['Inter', 'Bold'],
    ].map(([family, style]) => figma.loadFontAsync({ family, style })));
  }
  const P = (n) => {
    if (!V[n]) throw new Error('missing var ' + n);
    return figma.variables.setBoundVariableForPaint(
      { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[n]);
  };
  function AL(dir, props) {
    const f = figma.createFrame();
    f.layoutMode = dir;
    f.primaryAxisSizingMode = 'AUTO';
    f.counterAxisSizingMode = 'AUTO';
    f.fills = [];
    if (props) Object.assign(f, props);
    return f;
  }
  function radius(node, name) {
    for (const c of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) {
      node.setBoundVariable(c, V[name]);
    }
  }
  async function T(parent, style, chars, colorVar, opts) {
    opts = opts || {};
    if (!S[style]) throw new Error('missing text style ' + style);
    const t = figma.createText();
    parent.appendChild(t);
    await t.setTextStyleIdAsync(S[style].id);
    t.characters = chars;
    if (colorVar) t.fills = [P(colorVar)];
    if (opts.fill) { t.layoutSizingHorizontal = 'FILL'; t.textAutoResize = 'HEIGHT'; }
    else if (opts.w) { t.textAutoResize = 'HEIGHT'; t.resize(opts.w, t.height); }
    if (opts.name) t.name = opts.name;
    return t;
  }
  function inst(name, variant) {
    const c = C[name];
    if (!c) throw new Error('component "' + name + '" not found — run 03-components-mis-admin.js first');
    if (c.type === 'COMPONENT_SET') {
      const v = (variant && c.children.find(x => x.name === variant)) || c.defaultVariant;
      return v.createInstance();
    }
    return c.createInstance();
  }
  // Figma stores component properties with an ID suffix (e.g. "Label#12:3").
  // setProperties() rejects the bare name, so resolve the real key by prefix.
  function setProps(instance, values) {
    const defs = instance.componentProperties || {};
    const out = {};
    for (const key in values) {
      let target = null;
      if (Object.prototype.hasOwnProperty.call(defs, key)) {
        target = key;
      } else {
        for (const k in defs) {
          if (k.split('#')[0] === key) { target = k; break; }
        }
      }
      if (target) out[target] = values[key];
    }
    if (Object.keys(out).length) instance.setProperties(out);
  }

  function spacer(parent, h) {
    const s = figma.createFrame();
    s.resize(10, h); s.fills = []; s.name = 'spacer';
    parent.appendChild(s);
    s.layoutSizingHorizontal = 'FILL';
    return s;
  }

  const W = 1440, H = 1024, SIDEBAR = 256;
  const NAV = ['Dashboard', 'Appointments', 'Yoga', 'Patients', 'Doctors', 'Billing', 'Finance', 'Messages'];

  await boot();
  const page = figma.root.children.find(p => p.name === '03 · Screens');
  if (!page) throw new Error('page "03 · Screens" not found');
  await figma.setCurrentPageAsync(page);

  const OWNED = ['MIS — Dashboard', 'MIS — Appointments', 'MIS — Patients',
                 'MIS — Billing', 'MIS — Finance', 'MIS — Yoga', 'MIS — Messages'];
  for (const child of [...page.children]) {
    if (OWNED.indexOf(child.name) !== -1) child.remove();
  }

  const ROW_Y = 26000;

  /* ── MIS shell ───────────────────────────────────────────────────────── */
  /* ── Which screens to build ──────────────────────────────────────────────
     Names listed in SKIP are not drawn: each is a near-duplicate of a screen
     already in the set, and a designer would not redraw the same layout twice.
     Remove a name from SKIP to build it. Kept screens are laid out
     contiguously, so skipping never leaves a gap on the canvas.
     ─────────────────────────────────────────────────────────────────────── */
  const SKIP = new Set([
    'MIS — Patients',   // same table archetype as Appointments
    'MIS — Billing',    // same table archetype as Appointments
    'MIS — Messages'    // same table archetype as Appointments
  ]);

  const _trash = [];
  let _slot = 0;
  function _place(name, node) {
    if (SKIP.has(name)) { node.x = -99999; _trash.push(node); }
    else { node.x = (_slot++) * 1600; }
  }

  async function shell(name, x, active) {
    const sc = AL('HORIZONTAL', { name: name, itemSpacing: 0 });
    page.appendChild(sc);
    sc.resize(W, H);
    sc.layoutSizingHorizontal = 'FIXED';
    sc.primaryAxisSizingMode = 'FIXED';
    sc.counterAxisSizingMode = 'FIXED';
    _place(name, sc); sc.y = ROW_Y;
    sc.clipsContent = true;
    sc.fills = [P('mis/bg-page')];

    // Sidebar — brand palette, not clinical blue
    const side = AL('VERTICAL', { name: 'Sidebar', itemSpacing: 0, paddingTop: 24, paddingBottom: 24, paddingLeft: 12, paddingRight: 12 });
    side.fills = [P('mis/bg-surface')];
    side.strokes = [P('cream/border')];
    side.strokeWeight = 1;
    side.strokeTopWeight = 0; side.strokeLeftWeight = 0; side.strokeBottomWeight = 0;
    side.strokeRightWeight = 1;
    sc.appendChild(side);
    side.resize(SIDEBAR, H);
    side.layoutSizingVertical = 'FILL';
    side.primaryAxisSizingMode = 'FIXED';

    const brand = AL('HORIZONTAL', { itemSpacing: 10, counterAxisAlignItems: 'CENTER', paddingLeft: 12, paddingBottom: 32 });
    side.appendChild(brand);
    brand.layoutSizingHorizontal = 'FILL';
    const mark = AL('VERTICAL', {});
    mark.primaryAxisAlignItems = 'CENTER'; mark.counterAxisAlignItems = 'CENTER';
    mark.primaryAxisSizingMode = 'FIXED'; mark.counterAxisSizingMode = 'FIXED';
    mark.resize(36, 36);
    mark.fills = [P('accent/green')];
    radius(mark, 'radius/lg');
    brand.appendChild(mark);
    await T(mark, 'Display/Card Title', 'IA', 'dark/text-primary');
    await T(brand, 'Display/H4', 'IYKA MIS', 'accent/green');

    const nav = AL('VERTICAL', { itemSpacing: 4 });
    side.appendChild(nav);
    nav.layoutSizingHorizontal = 'FILL';
    for (const label of NAV) {
      const item = inst('MIS Sidebar Item', label === active ? 'State=Active' : 'State=Default');
      setProps(item, { Label: label });
      nav.appendChild(item);
      item.layoutSizingHorizontal = 'FILL';
    }

    // user card pinned lower
    spacer(side, 24);
    const user = AL('VERTICAL', { itemSpacing: 12, paddingTop: 12, paddingBottom: 12, paddingLeft: 12, paddingRight: 12 });
    user.fills = [P('cream/bg-alt')];
    radius(user, 'radius/xl');
    side.appendChild(user);
    user.layoutSizingHorizontal = 'FILL';
    const urow = AL('HORIZONTAL', { itemSpacing: 12, counterAxisAlignItems: 'CENTER' });
    user.appendChild(urow);
    urow.layoutSizingHorizontal = 'FILL';
    const uav = AL('VERTICAL', {});
    uav.primaryAxisAlignItems = 'CENTER'; uav.counterAxisAlignItems = 'CENTER';
    uav.primaryAxisSizingMode = 'FIXED'; uav.counterAxisSizingMode = 'FIXED';
    uav.resize(36, 36);
    uav.fills = [P('accent/hover')];
    radius(uav, 'radius/full');
    urow.appendChild(uav);
    await T(uav, 'Display/Card Title', 'E', 'accent/green');
    const ucol = AL('VERTICAL', { itemSpacing: 1 });
    urow.appendChild(ucol);
    ucol.layoutSizingHorizontal = 'FILL';
    await T(ucol, 'UI/Small Medium', 'Dr. Emidaka', 'mis/text-primary', { fill: true });
    await T(ucol, 'UI/Small', 'admin', 'mis/text-muted', { fill: true });
    const out = AL('HORIZONTAL', { paddingTop: 6, paddingBottom: 6 });
    out.primaryAxisAlignItems = 'CENTER';
    out.fills = [P('mis/bg-surface')];
    out.strokes = [P('cream/border')]; out.strokeWeight = 1;
    radius(out, 'radius/sm');
    user.appendChild(out);
    out.layoutSizingHorizontal = 'FILL';
    await T(out, 'UI/Small', 'Sign out', 'mis/text-muted');

    const main = AL('VERTICAL', { name: 'Main', itemSpacing: 24, paddingTop: 32, paddingBottom: 32, paddingLeft: 32, paddingRight: 32 });
    sc.appendChild(main);
    main.layoutSizingHorizontal = 'FILL';
    main.layoutSizingVertical = 'FILL';
    return { sc, main };
  }

  async function pageHead(parent, title, sub, action) {
    const h = AL('HORIZONTAL', { counterAxisAlignItems: 'CENTER' });
    parent.appendChild(h);
    h.layoutSizingHorizontal = 'FILL';
    const l = AL('VERTICAL', { itemSpacing: 3 });
    h.appendChild(l);
    l.layoutSizingHorizontal = 'FILL';
    await T(l, 'UI/Page Title', title, 'mis/text-primary', { fill: true });
    if (sub) await T(l, 'UI/Body', sub, 'mis/text-muted', { fill: true });
    if (action) {
      const b = AL('HORIZONTAL', { paddingTop: 10, paddingBottom: 10, paddingLeft: 16, paddingRight: 16 });
      b.fills = [P('mis/accent')];
      radius(b, 'radius/lg');
      await b.setEffectStyleIdAsync(E['Elevation/UI Subtle'].id);
      h.appendChild(b);
      await T(b, 'UI/Small Medium', action, 'mis/text-on-accent');
    }
    return h;
  }

  function card(parent, pad) {
    const c = AL('VERTICAL', { itemSpacing: 16, name: 'Card' });
    c.fills = [P('mis/bg-surface')];
    c.paddingTop = pad || 20; c.paddingBottom = pad || 20;
    c.paddingLeft = pad || 20; c.paddingRight = pad || 20;
    radius(c, 'radius/xl');
    parent.appendChild(c);
    c.layoutSizingHorizontal = 'FILL';
    return c;
  }

  async function table(parent, cols, rows) {
    const t = AL('VERTICAL', { itemSpacing: 0, name: 'Table' });
    t.fills = [P('mis/bg-surface')];
    radius(t, 'radius/xl');
    t.clipsContent = true;
    parent.appendChild(t);
    t.layoutSizingHorizontal = 'FILL';

    const head = AL('HORIZONTAL', { itemSpacing: 0, paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 16 });
    head.fills = [P('mis/bg-page')];
    head.strokes = [P('mis/border-soft')]; head.strokeWeight = 1;
    head.strokeTopWeight = 0; head.strokeLeftWeight = 0; head.strokeRightWeight = 0;
    head.strokeBottomWeight = 1;
    t.appendChild(head);
    head.layoutSizingHorizontal = 'FILL';
    for (const [label, w] of cols) {
      const c = await T(head, 'UI/Table Header', label, 'mis/text-soft');
      if (w) { c.textAutoResize = 'HEIGHT'; c.resize(w, c.height); }
      else c.layoutSizingHorizontal = 'FILL';
    }

    for (const row of rows) {
      const r = AL('HORIZONTAL', { itemSpacing: 0, counterAxisAlignItems: 'CENTER', paddingTop: 14, paddingBottom: 14, paddingLeft: 16, paddingRight: 16 });
      r.strokes = [P('mis/border-soft')]; r.strokeWeight = 1;
      r.strokeTopWeight = 1; r.strokeLeftWeight = 0; r.strokeRightWeight = 0; r.strokeBottomWeight = 0;
      t.appendChild(r);
      r.layoutSizingHorizontal = 'FILL';
      for (let i = 0; i < row.length; i++) {
        const cell = row[i];
        const w = cols[i][1];
        if (cell && cell.badge) {
          const holder = AL('HORIZONTAL', {});
          r.appendChild(holder);
          if (w) { holder.primaryAxisSizingMode = 'FIXED'; holder.resize(w, 24); }
          else holder.layoutSizingHorizontal = 'FILL';
          const b = inst('Status Badge', 'Tone=' + cell.badge);
          setProps(b, { Label: cell.label });
          holder.appendChild(b);
        } else if (cell && cell.avatar) {
          const holder = AL('HORIZONTAL', { itemSpacing: 10, counterAxisAlignItems: 'CENTER' });
          r.appendChild(holder);
          if (w) { holder.primaryAxisSizingMode = 'FIXED'; holder.resize(w, 28); }
          else holder.layoutSizingHorizontal = 'FILL';
          const av = AL('VERTICAL', {});
          av.primaryAxisAlignItems = 'CENTER'; av.counterAxisAlignItems = 'CENTER';
          av.primaryAxisSizingMode = 'FIXED'; av.counterAxisSizingMode = 'FIXED';
          av.resize(28, 28);
          av.fills = [P('mis/accent')];
          radius(av, 'radius/full');
          holder.appendChild(av);
          await T(av, 'UI/Badge', cell.avatar, 'mis/text-on-accent');
          await T(holder, 'UI/Body Medium', cell.label, 'mis/text-primary');
        } else {
          const c = await T(r, i === 0 ? 'UI/Body Medium' : 'UI/Body', String(cell),
                            i === 0 ? 'mis/text-primary' : 'mis/text-muted');
          if (w) { c.textAutoResize = 'HEIGHT'; c.resize(w, c.height); }
          else c.layoutSizingHorizontal = 'FILL';
        }
      }
    }
    return t;
  }

  // Bar chart matching the dashboard's 7-day chart
  async function barChart(parent, title, values, labels, chipText) {
    const c = card(parent);
    const head = AL('HORIZONTAL', { counterAxisAlignItems: 'CENTER' });
    c.appendChild(head);
    head.layoutSizingHorizontal = 'FILL';
    await T(head, 'UI/Section Title', title, 'mis/text-primary', { fill: true });
    const chip = AL('HORIZONTAL', { paddingTop: 4, paddingBottom: 4, paddingLeft: 10, paddingRight: 10 });
    chip.fills = [P('mis/accent-subtle')];
    radius(chip, 'radius/sm');
    head.appendChild(chip);
    await T(chip, 'UI/Small Medium', chipText || 'This week', 'mis/accent');

    const plot = AL('HORIZONTAL', { itemSpacing: 8, counterAxisAlignItems: 'MAX' });
    c.appendChild(plot);
    plot.layoutSizingHorizontal = 'FILL';
    plot.primaryAxisSizingMode = 'FIXED';
    plot.resize(600, 170);
    const max = Math.max.apply(null, values);
    for (let i = 0; i < values.length; i++) {
      const col = AL('VERTICAL', { itemSpacing: 6 });
      col.counterAxisAlignItems = 'CENTER';
      plot.appendChild(col);
      col.layoutSizingHorizontal = 'FILL';
      const bar = figma.createRectangle();
      const pct = Math.max(values[i] / max, 0.05);
      bar.resize(40, Math.round(140 * pct));
      bar.fills = [P(values[i] === max ? 'mis/accent' : 'mis/accent-light')];
      bar.topLeftRadius = 8; bar.topRightRadius = 8;
      col.appendChild(bar);
      bar.layoutSizingHorizontal = 'FILL';
      await T(col, 'UI/Small', labels[i], 'mis/text-soft');
    }
    return c;
  }

  /* ══ 1 — DASHBOARD ═══════════════════════════════════════════════════ */
  {
    const { main } = await shell('MIS — Dashboard', 0, 'Dashboard');
    await pageHead(main, 'Welcome back, Emidaka', 'Saturday, 26 July 2026', '+ New Appointment');

    const kpis = AL('HORIZONTAL', { itemSpacing: 16 });
    main.appendChild(kpis);
    kpis.layoutSizingHorizontal = 'FILL';
    for (const [label, value, sub] of [
      ["Today's Appointments", '12', 'Scheduled for today'],
      ['Total Patients', '486', '+24 new this month'],
      ['Revenue (this month)', '₹ 3,84,500', 'Net P&L: ₹ 1,92,300'],
      ['New Leads', '18', 'Awaiting follow-up'],
    ]) {
      const k = inst('KPI Card');
      setProps(k, { Label: label, Metric: value, Sub: sub });
      kpis.appendChild(k);
      k.layoutSizingHorizontal = 'FILL';
    }

    const mid = AL('HORIZONTAL', { itemSpacing: 16 });
    main.appendChild(mid);
    mid.layoutSizingHorizontal = 'FILL';
    const chartWrap = AL('VERTICAL', {});
    mid.appendChild(chartWrap);
    chartWrap.layoutSizingHorizontal = 'FILL';
    await barChart(chartWrap, 'Appointments · last 7 days', [8, 12, 9, 14, 11, 16, 12],
                   ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

    const sideCol = AL('VERTICAL', { itemSpacing: 16 });
    mid.appendChild(sideCol);
    sideCol.resize(280, 100);
    sideCol.layoutSizingHorizontal = 'FIXED';
    for (const [label, value, link] of [
      ['Outstanding invoices', '₹ 48,200', 'View billing →'],
      ['Completed this month', '164', 'appointments'],
    ]) {
      const c = card(sideCol, 16);
      await T(c, 'UI/Small Medium', label, 'mis/text-soft', { fill: true });
      await T(c, 'UI/Section Title', value, 'mis/text-primary', { fill: true });
      await T(c, 'UI/Small Medium', link, 'mis/accent', { fill: true });
    }

    await T(main, 'UI/Section Title', "Today's Schedule", 'mis/text-primary', { fill: true });
    await table(main,
      [['Time', 100], ['Patient', 220], ['Provider', 170], ['Service', 240], ['Status', 0]],
      [
        ['9:00 AM',  { avatar: 'BP', label: 'Banri Phira' },  'Dr. Emidaka', 'Functional Medicine', { badge: 'Success', label: 'confirmed' }],
        ['9:45 AM',  { avatar: 'PD', label: 'Priya Dkhar' },  'Dr. Emidaka', 'Clinical Nutrition',  { badge: 'Info',    label: 'checked in' }],
        ['10:30 AM', { avatar: 'RK', label: 'Richfield K.' }, 'Banri Phira', 'Panchakarma',         { badge: 'Success', label: 'completed' }],
        ['11:15 AM', { avatar: 'WS', label: 'Wanda Syiem' },  'Priya Dkhar', 'Yoga Therapy',        { badge: 'Accent',  label: 'requested' }],
        ['12:00 PM', { avatar: 'KM', label: 'Kyrsoibor M.' }, 'Dr. Emidaka', 'Naturopathy',         { badge: 'Warning', label: 'rescheduled' }],
        ['2:30 PM',  { avatar: 'DN', label: 'Daphi Nongrum' },'Banri Phira', 'Hydrotherapy',        { badge: 'Danger',  label: 'cancelled' }],
      ]);
  }

  /* ══ 2 — APPOINTMENTS ════════════════════════════════════════════════ */
  {
    const { main } = await shell('MIS — Appointments', 1600, 'Appointments');
    await pageHead(main, 'Appointments', '12 today · 3 awaiting confirmation', '+ New Appointment');

    const tabs = AL('HORIZONTAL', { itemSpacing: 8 });
    main.appendChild(tabs);
    tabs.layoutSizingHorizontal = 'FILL';
    for (let i = 0; i < 4; i++) {
      const names = ['Calendar', 'List', 'Requests', 'Blocks'];
      const t = AL('HORIZONTAL', { paddingTop: 8, paddingBottom: 8, paddingLeft: 16, paddingRight: 16 });
      t.fills = i === 1 ? [P('mis/accent')] : [P('mis/bg-surface')];
      radius(t, 'radius/sm');
      tabs.appendChild(t);
      await T(t, 'UI/Small Medium', names[i], i === 1 ? 'mis/text-on-accent' : 'mis/text-muted');
    }

    const filters = AL('HORIZONTAL', { itemSpacing: 12 });
    main.appendChild(filters);
    filters.layoutSizingHorizontal = 'FILL';
    for (const [label, value] of [['Search', 'Search patients…'], ['Provider', 'All providers'], ['Status', 'All statuses']]) {
      const f = inst('MIS Input', 'State=Default');
      filters.appendChild(f);
      f.layoutSizingHorizontal = 'FILL';
      const l = f.findOne(n => n.name === 'Label'); if (l) l.characters = label;
      const v = f.findOne(n => n.name === 'Value'); if (v) v.characters = value;
    }

    await table(main,
      [['Date', 130], ['Time', 100], ['Patient', 200], ['Provider', 160], ['Service', 210], ['Status', 0]],
      [
        ['26 Jul 2026', '9:00 AM',  { avatar: 'BP', label: 'Banri Phira' },   'Dr. Emidaka', 'Functional Medicine', { badge: 'Success', label: 'confirmed' }],
        ['26 Jul 2026', '9:45 AM',  { avatar: 'PD', label: 'Priya Dkhar' },   'Dr. Emidaka', 'Clinical Nutrition',  { badge: 'Info',    label: 'checked in' }],
        ['26 Jul 2026', '10:30 AM', { avatar: 'RK', label: 'Richfield K.' },  'Banri Phira', 'Panchakarma',         { badge: 'Success', label: 'completed' }],
        ['26 Jul 2026', '11:15 AM', { avatar: 'WS', label: 'Wanda Syiem' },   'Priya Dkhar', 'Yoga Therapy',        { badge: 'Accent',  label: 'requested' }],
        ['27 Jul 2026', '9:00 AM',  { avatar: 'KM', label: 'Kyrsoibor M.' },  'Dr. Emidaka', 'Naturopathy',         { badge: 'Warning', label: 'rescheduled' }],
        ['27 Jul 2026', '10:00 AM', { avatar: 'DN', label: 'Daphi Nongrum' }, 'Banri Phira', 'Hydrotherapy',        { badge: 'Danger',  label: 'no show' }],
        ['27 Jul 2026', '11:30 AM', { avatar: 'IL', label: 'Ibanri Lyngdoh' },'Dr. Emidaka', 'Online Consultation', { badge: 'Success', label: 'confirmed' }],
      ]);
  }

  /* ══ 3 — PATIENTS ════════════════════════════════════════════════════ */
  {
    const { main } = await shell('MIS — Patients', 3200, 'Patients');
    await pageHead(main, 'Patients', '486 registered', '+ New Patient');
    const search = inst('MIS Input', 'State=Focus');
    main.appendChild(search);
    search.layoutSizingHorizontal = 'FILL';
    const sl = search.findOne(n => n.name === 'Label'); if (sl) sl.characters = 'Search';
    const sv = search.findOne(n => n.name === 'Value'); if (sv) sv.characters = 'Banri';

    await table(main,
      [['Patient', 240], ['Phone', 170], ['Age / Sex', 130], ['Last Visit', 150], ['Visits', 100], ['Status', 0]],
      [
        [{ avatar: 'BP', label: 'Banri Phira' },    '+91 98765 11223', '34 / F', '26 Jul 2026', '12', { badge: 'Success', label: 'active' }],
        [{ avatar: 'PD', label: 'Priya Dkhar' },    '+91 97654 33445', '29 / F', '26 Jul 2026', '8',  { badge: 'Success', label: 'active' }],
        [{ avatar: 'RK', label: 'Richfield K.' },   '+91 96543 55667', '41 / M', '26 Jul 2026', '15', { badge: 'Success', label: 'active' }],
        [{ avatar: 'WS', label: 'Wanda Syiem' },    '+91 95432 77889', '52 / F', '18 Jul 2026', '4',  { badge: 'Success', label: 'active' }],
        [{ avatar: 'KM', label: 'Kyrsoibor M.' },   '+91 94321 99001', '37 / M', '02 Jun 2026', '2',  { badge: 'Neutral', label: 'dormant' }],
        [{ avatar: 'DN', label: 'Daphi Nongrum' },  '+91 93210 22113', '25 / F', '14 May 2026', '1',  { badge: 'Neutral', label: 'dormant' }],
      ]);
  }

  /* ══ 4 — BILLING ═════════════════════════════════════════════════════ */
  {
    const { main } = await shell('MIS — Billing', 4800, 'Billing');
    await pageHead(main, 'Billing', '₹ 48,200 outstanding across 9 invoices', '+ New Invoice');

    const kpis = AL('HORIZONTAL', { itemSpacing: 16 });
    main.appendChild(kpis);
    kpis.layoutSizingHorizontal = 'FILL';
    for (const [label, value, sub] of [
      ['Collected this month', '₹ 3,84,500', 'Across 164 invoices'],
      ['Outstanding', '₹ 48,200', '9 invoices unpaid'],
      ['Overdue', '₹ 12,400', '3 invoices past 30 days'],
    ]) {
      const k = inst('KPI Card');
      setProps(k, { Label: label, Metric: value, Sub: sub });
      kpis.appendChild(k);
      k.layoutSizingHorizontal = 'FILL';
    }

    await table(main,
      [['Invoice', 140], ['Patient', 210], ['Issued', 140], ['Total', 130], ['Paid', 130], ['Status', 0]],
      [
        ['INV-2041', { avatar: 'BP', label: 'Banri Phira' },   '26 Jul 2026', '₹ 4,500', '₹ 4,500', { badge: 'Success', label: 'paid' }],
        ['INV-2040', { avatar: 'PD', label: 'Priya Dkhar' },   '26 Jul 2026', '₹ 2,800', '₹ 1,400', { badge: 'Warning', label: 'partially paid' }],
        ['INV-2039', { avatar: 'RK', label: 'Richfield K.' },  '25 Jul 2026', '₹ 12,000','₹ 0',     { badge: 'Warning', label: 'issued' }],
        ['INV-2038', { avatar: 'WS', label: 'Wanda Syiem' },   '24 Jul 2026', '₹ 3,200', '₹ 3,200', { badge: 'Success', label: 'paid' }],
        ['INV-2037', { avatar: 'KM', label: 'Kyrsoibor M.' },  '22 Jul 2026', '₹ 1,800', '₹ 1,800', { badge: 'Danger',  label: 'refunded' }],
        ['INV-2036', { avatar: 'DN', label: 'Daphi Nongrum' }, '—',           '₹ 900',   '₹ 0',     { badge: 'Neutral', label: 'draft' }],
      ]);
  }

  /* ══ 5 — FINANCE ═════════════════════════════════════════════════════ */
  {
    const { main } = await shell('MIS — Finance', 6400, 'Finance');
    await pageHead(main, 'Finance', 'Revenue, expenses and P&L · July 2026', '+ Add Expense');

    const kpis = AL('HORIZONTAL', { itemSpacing: 16 });
    main.appendChild(kpis);
    kpis.layoutSizingHorizontal = 'FILL';
    for (const [label, value, sub] of [
      ['Revenue', '₹ 3,84,500', 'Month to date'],
      ['Expenses', '₹ 1,92,200', 'Month to date'],
      ['Net P&L', '₹ 1,92,300', '50% margin'],
    ]) {
      const k = inst('KPI Card');
      setProps(k, { Label: label, Metric: value, Sub: sub });
      kpis.appendChild(k);
      k.layoutSizingHorizontal = 'FILL';
    }

    await barChart(main, 'Revenue · last 7 days',
      [28000, 42000, 31000, 55000, 38000, 61000, 44000],
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], 'This week');

    await T(main, 'UI/Section Title', 'Recent Expenses', 'mis/text-primary', { fill: true });
    await table(main,
      [['Date', 140], ['Category', 190], ['Description', 330], ['Amount', 0]],
      [
        ['24 Jul 2026', 'Supplies',  'Ayurvedic herbs — monthly restock', '₹ 42,000'],
        ['22 Jul 2026', 'Salaries',  'Therapist payroll — July',          '₹ 98,000'],
        ['20 Jul 2026', 'Utilities', 'Electricity and water',             '₹ 14,200'],
        ['18 Jul 2026', 'Marketing', 'Community wellness camp',           '₹ 26,000'],
        ['15 Jul 2026', 'Rent',      'Centre lease — July',               '₹ 12,000'],
      ]);
  }

  /* ══ 6 — YOGA ════════════════════════════════════════════════════════ */
  {
    const { main } = await shell('MIS — Yoga', 8000, 'Yoga');
    await pageHead(main, 'Yoga Classes', '6 classes this week · 84 enrolments', '+ New Class');

    const grid = AL('HORIZONTAL', { itemSpacing: 16 });
    main.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';
    for (const [title, when, seats, tone, label] of [
      ['Morning Hatha',        'Mon · Wed · Fri  6:00 AM', '18 / 20 enrolled', 'Warning', 'nearly full'],
      ['Therapeutic Yoga',     'Tue · Thu  7:30 AM',       '12 / 20 enrolled', 'Success', 'open'],
      ['Online Evening Flow',  'Daily  6:30 PM',           '32 / 40 enrolled', 'Success', 'open'],
    ]) {
      const c = card(grid);
      c.layoutSizingHorizontal = 'FILL';
      await T(c, 'UI/Section Title', title, 'mis/text-primary', { fill: true });
      await T(c, 'UI/Body', when, 'mis/text-muted', { fill: true });
      await T(c, 'UI/Body Medium', seats, 'mis/text-primary', { fill: true });
      const b = inst('Status Badge', 'Tone=' + tone);
      setProps(b, { Label: label });
      c.appendChild(b);
    }

    await T(main, 'UI/Section Title', 'Enrolments · Morning Hatha', 'mis/text-primary', { fill: true });
    await table(main,
      [['Member', 240], ['Phone', 180], ['Joined', 150], ['Attendance', 160], ['Status', 0]],
      [
        [{ avatar: 'BP', label: 'Banri Phira' },   '+91 98765 11223', '02 Jul 2026', '11 / 12', { badge: 'Success', label: 'attended' }],
        [{ avatar: 'PD', label: 'Priya Dkhar' },   '+91 97654 33445', '02 Jul 2026', '12 / 12', { badge: 'Success', label: 'attended' }],
        [{ avatar: 'WS', label: 'Wanda Syiem' },   '+91 95432 77889', '10 Jul 2026', '6 / 8',   { badge: 'Accent',  label: 'booked' }],
        [{ avatar: 'KM', label: 'Kyrsoibor M.' },  '+91 94321 99001', '15 Jul 2026', '2 / 5',   { badge: 'Warning', label: 'pending' }],
      ]);
  }

  /* ══ 7 — MESSAGES ════════════════════════════════════════════════════ */
  {
    const { main } = await shell('MIS — Messages', 9600, 'Messages');
    await pageHead(main, 'Messages', 'WhatsApp reminders and campaign delivery', '+ New Campaign');

    const kpis = AL('HORIZONTAL', { itemSpacing: 16 });
    main.appendChild(kpis);
    kpis.layoutSizingHorizontal = 'FILL';
    for (const [label, value, sub] of [
      ['Sent this month', '1,284', 'Across 6 campaigns'],
      ['Delivered', '1,241', '96.6% delivery rate'],
      ['Read', '892', '69.5% read rate'],
      ['Failed', '43', 'Invalid or blocked numbers'],
    ]) {
      const k = inst('KPI Card');
      setProps(k, { Label: label, Metric: value, Sub: sub });
      kpis.appendChild(k);
      k.layoutSizingHorizontal = 'FILL';
    }

    await table(main,
      [['Recipient', 220], ['Template', 250], ['Sent', 160], ['Channel', 130], ['Status', 0]],
      [
        [{ avatar: 'BP', label: 'Banri Phira' },   'appointment_reminder_24h', '25 Jul  6:00 PM', 'WhatsApp', { badge: 'Success', label: 'read' }],
        [{ avatar: 'PD', label: 'Priya Dkhar' },   'appointment_reminder_24h', '25 Jul  6:00 PM', 'WhatsApp', { badge: 'Info',    label: 'delivered' }],
        [{ avatar: 'RK', label: 'Richfield K.' },  'invoice_issued',           '25 Jul  4:12 PM', 'WhatsApp', { badge: 'Success', label: 'read' }],
        [{ avatar: 'WS', label: 'Wanda Syiem' },   'yoga_class_reminder',      '25 Jul  8:00 AM', 'SMS',      { badge: 'Accent',  label: 'sent' }],
        [{ avatar: 'KM', label: 'Kyrsoibor M.' },  'appointment_reminder_24h', '25 Jul  6:00 PM', 'WhatsApp', { badge: 'Danger',  label: 'failed' }],
        [{ avatar: 'DN', label: 'Daphi Nongrum' }, 'wellness_newsletter',      '—',               'WhatsApp', { badge: 'Neutral', label: 'queued' }],
      ]);
  }

  for (const t of _trash) t.remove();

  const summary = 'IYKA 07 — MIS screens built: Dashboard, Appointments, Patients, Billing, Finance, Yoga, Messages';
  console.log(summary);
  figma.currentPage.selection = [];
  return summary;

})();
