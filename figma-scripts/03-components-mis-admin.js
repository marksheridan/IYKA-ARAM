/* ════════════════════════════════════════════════════════════════════════════
   IYKA-ARAM · 03 — MIS & Admin components
   Page: 02 · Components

   The two internal tools. Sources:
     · src/components/mis/status-badge.tsx   (the 21 statuses)
     · src/components/mis/sidebar.tsx        (brand-coloured chrome)
     · src/app/mis/page.tsx                  (KPI card, bar chart, table)
     · src/app/admin/(protected)/layout.tsx  (neutral admin chrome)

   Worth knowing: the MIS sidebar uses the BRAND palette (forest/cream/sand),
   while the MIS content area uses clinical blue. That is intentional in the
   code and is preserved here.

   Standard Figma Plugin API only. Safe to re-run.
   ════════════════════════════════════════════════════════════════════════════ */

(async () => {

  /* ── prelude ─────────────────────────────────────────────────────────── */
  const V = {}, S = {}, E = {};

  async function boot() {
    for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
    for (const s of await figma.getLocalTextStylesAsync()) S[s.name] = s;
    for (const s of await figma.getLocalEffectStylesAsync()) E[s.name] = s;
    await Promise.all([
      ['Cormorant Garamond', 'Light'], ['Cormorant Garamond', 'Regular'],
      ['DM Sans', 'Regular'], ['DM Sans', 'Medium'],
      ['Inter', 'Regular'], ['Inter', 'Medium'], ['Inter', 'Semi Bold'], ['Inter', 'Bold'],
    ].map(([family, style]) => figma.loadFontAsync({ family, style })));
  }

  const P = (name) => {
    if (!V[name]) throw new Error('missing var ' + name);
    return figma.variables.setBoundVariableForPaint(
      { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[name]);
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
  function ALC(dir, props) {
    const c = figma.createComponent();
    c.layoutMode = dir;
    c.primaryAxisSizingMode = 'AUTO';
    c.counterAxisSizingMode = 'AUTO';
    c.fills = [];
    if (props) Object.assign(c, props);
    return c;
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

  // 24px stroke icon from an SVG path, tinted to a token.
  function icon(pathD, colorVar, size) {
    size = size || 18;
    const svg =
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" ' +
      'xmlns="http://www.w3.org/2000/svg"><path d="' + pathD + '" stroke="#000000" ' +
      'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const n = figma.createNodeFromSvg(svg);
    n.resize(size, size);
    for (const v of n.findAll(() => true)) {
      if ('strokes' in v && v.strokes.length) v.strokes = [P(colorVar)];
    }
    return n;
  }

  const ICONS = {
    calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
    patients: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    rupee: 'M6 3h12M6 8h12M16 3c0 4-3 5-6 5l7 8',
    message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  };

  /* ── page + cleanup ──────────────────────────────────────────────────── */
  await boot();

  const page = figma.root.children.find(p => p.name === '02 · Components');
  if (!page) throw new Error('page "02 · Components" not found');
  await figma.setCurrentPageAsync(page);

  const OWNED = [
    'Status Badge', 'KPI Card', 'Table Row', 'Table Header', 'MIS Sidebar Item',
    'MIS Input', 'Admin Sidebar Item', '· MIS & Admin components',
  ];
  for (const child of [...page.children]) {
    if (OWNED.indexOf(child.name) !== -1) child.remove();
  }

  const made = {};
  const COL_X = 1700;         // third column
  let cursorY = 240;

  const banner = AL('VERTICAL', { name: '· MIS & Admin components', itemSpacing: 8 });
  page.appendChild(banner);
  banner.x = COL_X; banner.y = 100;
  await T(banner, 'Label/Section', 'Component library', 'accent/on-cream');
  await T(banner, 'Display/H2', 'Internal tools', 'cream/text-primary');

  /* ── 1. Status Badge ──────────────────────────────────────────────────────
     21 statuses in code map onto 7 tones. Modelled as Tone variants + a TEXT
     property rather than 21 variants — see figma-generate-library rule 9.
     ─────────────────────────────────────────────────────────────────────── */
  {
    const tones = [
      ['Success', 'status/success-bg', 'status/success-fg', 'completed'],
      ['Warning', 'status/warning-bg', 'status/warning-fg', 'issued'],
      ['Info',    'status/info-bg',    'status/info-fg',    'checked in'],
      ['Danger',  'status/danger-bg',  'status/danger-fg',  'cancelled'],
      ['Purple',  'status/purple-bg',  'status/purple-fg',  'uploaded'],
      ['Accent',  'mis/accent-subtle', 'mis/accent',        'requested'],
      ['Neutral', 'status/neutral-bg', 'status/neutral-fg', 'draft'],
    ];

    const variants = [];
    for (const [tone, bg, fg, sample] of tones) {
      const c = ALC('HORIZONTAL', {
        name: 'Tone=' + tone,
        paddingTop: 4, paddingBottom: 4, paddingLeft: 10, paddingRight: 10,
      });
      c.fills = [P(bg)];
      radius(c, 'radius/full');
      await T(c, 'UI/Badge', sample, fg, { name: 'Label' });
      page.appendChild(c);
      variants.push(c);
    }

    const set = figma.combineAsVariants(variants, page);
    set.name = 'Status Badge';
    set.description =
      'One badge serves appointments, invoices, enrolments, message delivery and payouts.\n\n' +
      'Success: confirmed, completed, paid, attended, read\n' +
      'Warning: rescheduled, issued, partially paid, pending\n' +
      'Info: checked in, delivered\n' +
      'Danger: cancelled, no show, refunded, failed\n' +
      'Purple: uploaded\n' +
      'Accent: requested, booked, sent\n' +
      'Neutral: draft, queued';
    set.layoutMode = 'VERTICAL';
    set.primaryAxisSizingMode = 'AUTO';
    set.counterAxisSizingMode = 'AUTO';
    set.itemSpacing = 12;
    set.paddingTop = 24; set.paddingBottom = 24; set.paddingLeft = 24; set.paddingRight = 24;
    set.fills = [P('mis/bg-page')];
    set.x = COL_X; set.y = cursorY;

    const propId = set.addComponentProperty('Label', 'TEXT', 'completed');
    for (const v of set.children) {
      const l = v.findOne(n => n.type === 'TEXT' && n.name === 'Label');
      if (l) l.componentPropertyReferences = { characters: propId };
    }
    made['Status Badge'] = set.id;
    cursorY = set.y + set.height + 80;
  }

  /* ── 2. KPI Card — the dashboard metric tile ───────────────────────────── */
  {
    const c = ALC('VERTICAL', {
      name: 'KPI Card', itemSpacing: 20,
      paddingTop: 20, paddingBottom: 20, paddingLeft: 20, paddingRight: 20,
    });
    c.resize(300, 140);
    c.layoutSizingHorizontal = 'FIXED';
    c.fills = [P('mis/bg-surface')];
    radius(c, 'radius/xl');

    // top row — icon + label
    const top = AL('HORIZONTAL', { name: 'Top', itemSpacing: 10, counterAxisAlignItems: 'CENTER' });
    c.appendChild(top);
    top.layoutSizingHorizontal = 'FILL';

    const iconBox = AL('VERTICAL', { name: 'Icon' });
    iconBox.primaryAxisAlignItems = 'CENTER';
    iconBox.counterAxisAlignItems = 'CENTER';
    iconBox.primaryAxisSizingMode = 'FIXED';
    iconBox.counterAxisSizingMode = 'FIXED';
    iconBox.resize(36, 36);
    iconBox.fills = [P('mis/accent-subtle')];
    radius(iconBox, 'radius/lg');
    top.appendChild(iconBox);
    iconBox.appendChild(icon(ICONS.calendar, 'mis/accent', 18));

    await T(top, 'UI/Body Medium', "Today's Appointments", 'mis/text-muted', { name: 'Label', fill: true });

    // bottom row — value + sparkline
    const bottom = AL('HORIZONTAL', { name: 'Bottom', itemSpacing: 12, counterAxisAlignItems: 'MAX' });
    c.appendChild(bottom);
    bottom.layoutSizingHorizontal = 'FILL';

    const valueCol = AL('VERTICAL', { name: 'Value', itemSpacing: 4 });
    bottom.appendChild(valueCol);
    valueCol.layoutSizingHorizontal = 'FILL';
    await T(valueCol, 'UI/Metric', '12', 'mis/text-primary', { name: 'Metric' });
    await T(valueCol, 'UI/Small', 'Scheduled for today', 'mis/text-soft', { name: 'Sub', fill: true });

    const spark = figma.createNodeFromSvg(
      '<svg width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M 0,30 C 12,30 12,18 25,18 C 37,18 37,26 50,26 C 62,26 62,10 75,10 C 87,10 87,16 100,16" ' +
      'stroke="#2563EB" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    );
    spark.name = 'Sparkline';
    spark.resize(100, 40);
    for (const v of spark.findAll(() => true)) {
      if ('strokes' in v && v.strokes.length) v.strokes = [P('mis/accent')];
    }
    bottom.appendChild(spark);

    c.description = 'Dashboard metric. Accent colour varies by metric — blue, purple, green or amber.';
    const pl = c.addComponentProperty('Label', 'TEXT', "Today's Appointments");
    const pm = c.addComponentProperty('Metric', 'TEXT', '12');
    const ps = c.addComponentProperty('Sub', 'TEXT', 'Scheduled for today');
    c.findOne(n => n.name === 'Label').componentPropertyReferences = { characters: pl };
    c.findOne(n => n.name === 'Metric').componentPropertyReferences = { characters: pm };
    c.findOne(n => n.name === 'Sub').componentPropertyReferences = { characters: ps };

    page.appendChild(c);
    c.x = COL_X; c.y = cursorY;
    made['KPI Card'] = c.id;
    cursorY += c.height + 80;
  }

  /* ── 3. Table Header + Table Row ───────────────────────────────────────── */
  {
    const COLS = [
      ['Time', 90], ['Patient', 220], ['Provider', 170], ['Service', 230], ['Status', 130],
    ];

    // Header
    const h = ALC('HORIZONTAL', {
      name: 'Table Header', itemSpacing: 0,
      paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 16,
    });
    h.resize(900, 44);
    h.layoutSizingHorizontal = 'FIXED';
    h.fills = [P('mis/bg-page')];
    for (const [label, w] of COLS) {
      const t = await T(h, 'UI/Table Header', label, 'mis/text-soft');
      t.textAutoResize = 'HEIGHT';
      t.resize(w, t.height);
    }
    h.description = 'Column header strip for every MIS list view.';
    page.appendChild(h);
    h.x = COL_X; h.y = cursorY;
    made['Table Header'] = h.id;
    cursorY += h.height + 40;

    // Row
    const r = ALC('HORIZONTAL', {
      name: 'Table Row', itemSpacing: 0, counterAxisAlignItems: 'CENTER',
      paddingTop: 14, paddingBottom: 14, paddingLeft: 16, paddingRight: 16,
    });
    r.resize(900, 60);
    r.layoutSizingHorizontal = 'FIXED';
    r.fills = [P('mis/bg-surface')];
    r.strokes = [P('mis/border-soft')];
    r.strokeWeight = 1;
    r.strokeTopWeight = 1; r.strokeBottomWeight = 0;
    r.strokeLeftWeight = 0; r.strokeRightWeight = 0;

    const time = await T(r, 'UI/Body Medium', '10:30 AM', 'mis/text-primary', { name: 'Time' });
    time.textAutoResize = 'HEIGHT'; time.resize(90, time.height);

    const patientCell = AL('HORIZONTAL', { name: 'Patient', itemSpacing: 10, counterAxisAlignItems: 'CENTER' });
    r.appendChild(patientCell);
    patientCell.primaryAxisSizingMode = 'FIXED';
    patientCell.resize(220, 28);
    const av = AL('VERTICAL', { name: 'Avatar' });
    av.primaryAxisAlignItems = 'CENTER';
    av.counterAxisAlignItems = 'CENTER';
    av.primaryAxisSizingMode = 'FIXED';
    av.counterAxisSizingMode = 'FIXED';
    av.resize(28, 28);
    av.fills = [P('mis/accent')];
    radius(av, 'radius/full');
    patientCell.appendChild(av);
    await T(av, 'UI/Badge', 'BP', 'mis/text-on-accent');
    await T(patientCell, 'UI/Body Medium', 'Banri Phira', 'mis/text-primary', { name: 'Name' });

    const prov = await T(r, 'UI/Body', 'Dr. Emidaka', 'mis/text-muted', { name: 'Provider' });
    prov.textAutoResize = 'HEIGHT'; prov.resize(170, prov.height);

    const svc = await T(r, 'UI/Body', 'Functional Medicine', 'mis/text-muted', { name: 'Service' });
    svc.textAutoResize = 'HEIGHT'; svc.resize(230, svc.height);

    const statusCell = AL('HORIZONTAL', { name: 'Status' });
    r.appendChild(statusCell);
    statusCell.primaryAxisSizingMode = 'FIXED';
    statusCell.resize(130, 24);
    const badgeSet = page.findOne(n => n.type === 'COMPONENT_SET' && n.name === 'Status Badge');
    if (badgeSet) {
      const success = badgeSet.children.find(v => v.name === 'Tone=Success') || badgeSet.defaultVariant;
      statusCell.appendChild(success.createInstance());
    }

    r.description = 'MIS list row. Status cell instances the shared Status Badge.';
    const pn = r.addComponentProperty('Name', 'TEXT', 'Banri Phira');
    const pt = r.addComponentProperty('Time', 'TEXT', '10:30 AM');
    r.findOne(n => n.name === 'Name').componentPropertyReferences = { characters: pn };
    r.findOne(n => n.name === 'Time').componentPropertyReferences = { characters: pt };

    page.appendChild(r);
    r.x = COL_X; r.y = cursorY;
    made['Table Row'] = r.id;
    cursorY += r.height + 80;
  }

  /* ── 4. MIS Sidebar Item — brand-coloured, not blue ────────────────────── */
  {
    const variants = [];
    for (const state of ['Default', 'Active']) {
      const active = state === 'Active';
      const c = ALC('HORIZONTAL', {
        name: 'State=' + state, itemSpacing: 12, counterAxisAlignItems: 'CENTER',
        paddingTop: 10, paddingBottom: 10, paddingLeft: 12, paddingRight: 12,
      });
      c.resize(216, 42);
      c.layoutSizingHorizontal = 'FIXED';
      c.fills = active ? [P('accent/green')] : [];
      radius(c, 'radius/xl');
      c.appendChild(icon(ICONS.calendar, active ? 'dark/text-primary' : 'mis/text-muted', 18));
      await T(c, 'UI/Body', 'Appointments', active ? 'dark/text-primary' : 'mis/text-muted', { name: 'Label' });
      page.appendChild(c);
      variants.push(c);
    }
    const set = figma.combineAsVariants(variants, page);
    set.name = 'MIS Sidebar Item';
    set.description =
      'Clinic MIS navigation. Active state uses forest green from the BRAND palette, not the ' +
      'clinical blue used in the content area — this is deliberate in sidebar.tsx.';
    set.layoutMode = 'VERTICAL';
    set.primaryAxisSizingMode = 'AUTO';
    set.counterAxisSizingMode = 'AUTO';
    set.itemSpacing = 8;
    set.paddingTop = 24; set.paddingBottom = 24; set.paddingLeft = 24; set.paddingRight = 24;
    set.fills = [P('mis/bg-surface')];
    set.x = COL_X; set.y = cursorY;
    const propId = set.addComponentProperty('Label', 'TEXT', 'Appointments');
    for (const v of set.children) {
      const l = v.findOne(n => n.type === 'TEXT' && n.name === 'Label');
      if (l) l.componentPropertyReferences = { characters: propId };
    }
    made['MIS Sidebar Item'] = set.id;
    cursorY = set.y + set.height + 80;
  }

  /* ── 5. MIS Input — .mis-input ─────────────────────────────────────────── */
  {
    const variants = [];
    for (const state of ['Default', 'Focus']) {
      const c = ALC('VERTICAL', { name: 'State=' + state, itemSpacing: 6 });
      c.resize(300, 100);
      c.layoutSizingHorizontal = 'FIXED';
      await T(c, 'UI/Small Medium', 'Patient name', 'mis/text-muted', { name: 'Label', fill: true });
      const box = AL('HORIZONTAL', {
        name: 'Input', paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12,
      });
      box.fills = [P('mis/bg-page')];
      box.strokes = [P(state === 'Focus' ? 'mis/accent' : 'mis/border')];
      box.strokeWeight = 1;
      radius(box, 'radius/md');
      c.appendChild(box);
      box.layoutSizingHorizontal = 'FILL';
      await T(box, 'UI/Body',
        state === 'Focus' ? 'Banri Phira' : 'Search patients…',
        state === 'Focus' ? 'mis/text-primary' : 'mis/text-soft',
        { name: 'Value', fill: true });
      page.appendChild(c);
      variants.push(c);
    }
    const set = figma.combineAsVariants(variants, page);
    set.name = 'MIS Input';
    set.description = 'Form input for both internal tools. Focus adds a 3px blue ring in code.';
    set.layoutMode = 'HORIZONTAL';
    set.primaryAxisSizingMode = 'AUTO';
    set.counterAxisSizingMode = 'AUTO';
    set.itemSpacing = 24;
    set.paddingTop = 24; set.paddingBottom = 24; set.paddingLeft = 24; set.paddingRight = 24;
    set.fills = [P('mis/bg-surface')];
    set.x = COL_X; set.y = cursorY;
    made['MIS Input'] = set.id;
    cursorY = set.y + set.height + 80;
  }

  /* ── 6. Admin Sidebar Item — neutral chrome ────────────────────────────── */
  {
    const variants = [];
    for (const state of ['Default', 'Hover']) {
      const hover = state === 'Hover';
      const c = ALC('HORIZONTAL', {
        name: 'State=' + state, itemSpacing: 10, counterAxisAlignItems: 'CENTER',
        paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12,
      });
      c.resize(200, 36);
      c.layoutSizingHorizontal = 'FIXED';
      c.fills = hover ? [P('admin/border-soft')] : [];
      radius(c, 'radius/sm');
      await T(c, 'UI/Body Medium', '⬡', 'admin/text-muted');
      await T(c, 'UI/Body Medium', 'Products', hover ? 'admin/text-primary' : 'admin/text-muted', { name: 'Label' });
      page.appendChild(c);
      variants.push(c);
    }
    const set = figma.combineAsVariants(variants, page);
    set.name = 'Admin Sidebar Item';
    set.description = 'Commerce backoffice navigation. Deliberately plainer than the MIS — it is a tool, not a product surface.';
    set.layoutMode = 'VERTICAL';
    set.primaryAxisSizingMode = 'AUTO';
    set.counterAxisSizingMode = 'AUTO';
    set.itemSpacing = 8;
    set.paddingTop = 24; set.paddingBottom = 24; set.paddingLeft = 24; set.paddingRight = 24;
    set.fills = [P('admin/bg-surface')];
    set.x = COL_X; set.y = cursorY;
    const propId = set.addComponentProperty('Label', 'TEXT', 'Products');
    for (const v of set.children) {
      const l = v.findOne(n => n.type === 'TEXT' && n.name === 'Label');
      if (l) l.componentPropertyReferences = { characters: propId };
    }
    made['Admin Sidebar Item'] = set.id;
  }

  const summary = 'IYKA 03 — MIS & admin components built: ' + Object.keys(made).join(', ');
  console.log(summary);
  figma.currentPage.selection = [];
  return summary;

})();
