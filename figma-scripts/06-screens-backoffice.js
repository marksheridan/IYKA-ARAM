/* ════════════════════════════════════════════════════════════════════════════
   IYKA-ARAM · 06 — Commerce backoffice screens
   Page: 03 · Screens

   Dashboard, Products, Orders, Customers, Blog List, Post Editor.
   Chrome from src/app/admin/(protected)/layout.tsx — a 224px white sidebar on
   neutral-50, deliberately plainer than the MIS. It is a tool, not a product
   surface.

   Run AFTER 03-components-mis-admin.js.

   Standard Figma Plugin API only. Safe to re-run.
   ════════════════════════════════════════════════════════════════════════════ */

(async () => {

  const HASH = {
    hairOil: '74bac57e95fdd528a5c42cb724d195b2a5f9e59f',
    soap:    'd252ae4968886a64e6a33579861a56cb58fc596e',
    aloe:    '9dd03b23851e3cb43cecc1dbdc75d4a795f1f2a1',
    yogaMat: '3e3bd0f86e494886075d706e59af154f5bd0247c',
    giftBox: '3ce4747694f4a265341ff3b320d6900d2914964c',
    g1:      'f739e93911c83a8c9c2889dc62ed6ad82ccc4d3d',
  };

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
  const IMGFILL = (h, m) => ({ type: 'IMAGE', imageHash: h, scaleMode: m || 'FILL' });
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

  const W = 1440, H = 1024, SIDEBAR = 224;

  await boot();
  const page = figma.root.children.find(p => p.name === '03 · Screens');
  if (!page) throw new Error('page "03 · Screens" not found');
  await figma.setCurrentPageAsync(page);

  const OWNED = ['Admin — Dashboard', 'Admin — Products', 'Admin — Orders',
                 'Admin — Customers', 'Admin — Blog', 'Admin — Post Editor'];
  for (const child of [...page.children]) {
    if (OWNED.indexOf(child.name) !== -1) child.remove();
  }

  const ROW_Y = 24000;

  /* ── admin shell ─────────────────────────────────────────────────────── */
  /* ── Which screens to build ──────────────────────────────────────────────
     Names listed in SKIP are not drawn: each is a near-duplicate of a screen
     already in the set, and a designer would not redraw the same layout twice.
     Remove a name from SKIP to build it. Kept screens are laid out
     contiguously, so skipping never leaves a gap on the canvas.
     ─────────────────────────────────────────────────────────────────────── */
  const SKIP = new Set([
    'Admin — Orders',      // same table archetype as Products
    'Admin — Customers',   // same table archetype as Products
    'Admin — Blog'         // same table archetype as Products
  ]);

  const _trash = [];
  let _slot = 0;
  function _place(name, node) {
    if (SKIP.has(name)) { node.x = -99999; _trash.push(node); }
    else { node.x = (_slot++) * 1600; }
  }

  async function shell(name, x, activeNav) {
    const sc = AL('HORIZONTAL', { name: name, itemSpacing: 0 });
    page.appendChild(sc);
    sc.resize(W, H);
    sc.layoutSizingHorizontal = 'FIXED';
    sc.primaryAxisSizingMode = 'FIXED';
    sc.counterAxisSizingMode = 'FIXED';
    _place(name, sc); sc.y = ROW_Y;
    sc.clipsContent = true;
    sc.fills = [P('admin/bg-page')];

    // Sidebar
    const side = AL('VERTICAL', { name: 'Sidebar', itemSpacing: 0 });
    side.fills = [P('admin/bg-surface')];
    side.strokes = [P('admin/border')];
    side.strokeWeight = 1;
    side.strokeTopWeight = 0; side.strokeLeftWeight = 0; side.strokeBottomWeight = 0;
    side.strokeRightWeight = 1;
    sc.appendChild(side);
    side.resize(SIDEBAR, H);
    side.layoutSizingVertical = 'FILL';
    side.primaryAxisSizingMode = 'FIXED';

    const brand = AL('VERTICAL', { itemSpacing: 2, paddingTop: 20, paddingBottom: 20, paddingLeft: 20, paddingRight: 20 });
    brand.strokes = [P('admin/border-soft')]; brand.strokeWeight = 1;
    brand.strokeTopWeight = 0; brand.strokeLeftWeight = 0; brand.strokeRightWeight = 0;
    brand.strokeBottomWeight = 1;
    side.appendChild(brand);
    brand.layoutSizingHorizontal = 'FILL';
    await T(brand, 'UI/Table Header', 'IYKA-ARAM', 'admin/text-soft', { fill: true });
    await T(brand, 'UI/Section Title', 'Admin', 'admin/text-strong', { fill: true });

    const nav = AL('VERTICAL', { itemSpacing: 2, paddingTop: 12, paddingBottom: 12, paddingLeft: 12, paddingRight: 12 });
    side.appendChild(nav);
    nav.layoutSizingHorizontal = 'FILL';
    for (const label of ['Dashboard', 'Products', 'Orders', 'Customers', 'Blog']) {
      const item = inst('Admin Sidebar Item', label === activeNav ? 'State=Hover' : 'State=Default');
      setProps(item, { Label: label });
      nav.appendChild(item);
      item.layoutSizingHorizontal = 'FILL';
    }

    // Main
    const main = AL('VERTICAL', { name: 'Main', itemSpacing: 24, paddingTop: 32, paddingBottom: 32, paddingLeft: 32, paddingRight: 32 });
    sc.appendChild(main);
    main.layoutSizingHorizontal = 'FILL';
    main.layoutSizingVertical = 'FILL';
    return { sc, main };
  }

  async function pageHead(parent, title, sub, action) {
    const h = AL('HORIZONTAL', { name: 'Page Head', counterAxisAlignItems: 'CENTER' });
    parent.appendChild(h);
    h.layoutSizingHorizontal = 'FILL';
    const l = AL('VERTICAL', { itemSpacing: 3 });
    h.appendChild(l);
    l.layoutSizingHorizontal = 'FILL';
    await T(l, 'UI/Page Title', title, 'admin/text-primary', { fill: true });
    if (sub) await T(l, 'UI/Small', sub, 'admin/text-muted', { fill: true });
    if (action) {
      const b = AL('HORIZONTAL', { paddingTop: 10, paddingBottom: 10, paddingLeft: 16, paddingRight: 16 });
      b.fills = [P('admin/text-primary')];
      radius(b, 'radius/sm');
      h.appendChild(b);
      await T(b, 'UI/Small Medium', action, 'mis/text-on-accent');
    }
    return h;
  }

  // Generic data table
  async function table(parent, cols, rows) {
    const t = AL('VERTICAL', { itemSpacing: 0, name: 'Table' });
    t.fills = [P('admin/bg-surface')];
    t.strokes = [P('admin/border')]; t.strokeWeight = 1;
    radius(t, 'radius/sm');
    t.clipsContent = true;
    parent.appendChild(t);
    t.layoutSizingHorizontal = 'FILL';

    const head = AL('HORIZONTAL', { itemSpacing: 0, paddingTop: 12, paddingBottom: 12, paddingLeft: 20, paddingRight: 20 });
    head.fills = [P('admin/bg-page')];
    head.strokes = [P('admin/border-soft')]; head.strokeWeight = 1;
    head.strokeTopWeight = 0; head.strokeLeftWeight = 0; head.strokeRightWeight = 0;
    head.strokeBottomWeight = 1;
    t.appendChild(head);
    head.layoutSizingHorizontal = 'FILL';
    for (const [label, w] of cols) {
      const c = await T(head, 'UI/Table Header', label, 'admin/text-soft');
      if (w) { c.textAutoResize = 'HEIGHT'; c.resize(w, c.height); }
      else c.layoutSizingHorizontal = 'FILL';
    }

    for (const row of rows) {
      const r = AL('HORIZONTAL', { itemSpacing: 0, counterAxisAlignItems: 'CENTER', paddingTop: 14, paddingBottom: 14, paddingLeft: 20, paddingRight: 20 });
      r.strokes = [P('admin/border-soft')]; r.strokeWeight = 1;
      r.strokeTopWeight = 0; r.strokeLeftWeight = 0; r.strokeRightWeight = 0;
      r.strokeBottomWeight = 1;
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
        } else if (cell && cell.img) {
          const holder = AL('HORIZONTAL', { itemSpacing: 10, counterAxisAlignItems: 'CENTER' });
          r.appendChild(holder);
          if (w) { holder.primaryAxisSizingMode = 'FIXED'; holder.resize(w, 36); }
          else holder.layoutSizingHorizontal = 'FILL';
          const im = AL('VERTICAL', {});
          im.primaryAxisSizingMode = 'FIXED'; im.counterAxisSizingMode = 'FIXED';
          holder.appendChild(im);
          im.resize(36, 36);
          im.fills = [IMGFILL(cell.img)];
          radius(im, 'radius/xs');
          await T(holder, 'UI/Body Medium', cell.label, 'admin/text-primary');
        } else {
          const c = await T(r, i === 0 ? 'UI/Body Medium' : 'UI/Body', String(cell),
                            i === 0 ? 'admin/text-primary' : 'admin/text-muted');
          if (w) { c.textAutoResize = 'HEIGHT'; c.resize(w, c.height); }
          else c.layoutSizingHorizontal = 'FILL';
        }
      }
    }
    return t;
  }

  /* ══ 1 — DASHBOARD ═══════════════════════════════════════════════════ */
  {
    const { main } = await shell('Admin — Dashboard', 0, 'Dashboard');
    await pageHead(main, 'Dashboard', 'Store performance · last 30 days');

    const kpis = AL('HORIZONTAL', { itemSpacing: 16, name: 'KPIs' });
    main.appendChild(kpis);
    kpis.layoutSizingHorizontal = 'FILL';
    const data = [
      ['Revenue', '₹ 1,84,200', '+12% vs last month'],
      ['Orders', '146', '+9 this week'],
      ['Customers', '312', '+24 new'],
      ['Avg. Order', '₹ 1,262', 'Up from ₹ 1,140'],
    ];
    for (const [label, value, sub] of data) {
      const k = inst('KPI Card');
      setProps(k, { Label: label, Metric: value, Sub: sub });
      kpis.appendChild(k);
      k.layoutSizingHorizontal = 'FILL';
    }

    await T(main, 'UI/Section Title', 'Recent Orders', 'admin/text-primary', { fill: true });
    await table(main,
      [['Order', 130], ['Customer', 200], ['Items', 90], ['Total', 130], ['Status', 140], ['Date', 0]],
      [
        ['#IYK-2041', 'Emidaka Kharkongor', '3', '₹ 2,096', { badge: 'Success', label: 'delivered' }, '18 Jul 2026'],
        ['#IYK-2040', 'Banri Phira', '1', '₹ 3,499', { badge: 'Info', label: 'shipped' }, '18 Jul 2026'],
        ['#IYK-2039', 'Priya Dkhar', '2', '₹ 1,148', { badge: 'Accent', label: 'processing' }, '17 Jul 2026'],
        ['#IYK-2038', 'Richfield K.', '5', '₹ 4,890', { badge: 'Success', label: 'delivered' }, '17 Jul 2026'],
        ['#IYK-2037', 'Wanda Syiem', '1', '₹ 849', { badge: 'Danger', label: 'cancelled' }, '16 Jul 2026'],
      ]);
  }

  /* ══ 2 — PRODUCTS ════════════════════════════════════════════════════ */
  {
    const { main } = await shell('Admin — Products', 1600, 'Products');
    await pageHead(main, 'Products', '9 SKUs · 9 in stock', '+ New Product');
    await table(main,
      [['Product', 320], ['Category', 150], ['Price', 110], ['MRP', 110], ['Stock', 120], ['Status', 0]],
      [
        [{ img: HASH.hairOil, label: 'Keshanidhi Hair Oil' }, 'Hair Care', '₹ 849', '₹ 999', 'In stock', { badge: 'Success', label: 'live' }],
        [{ img: HASH.soap, label: 'Herbal Organic Soap' }, 'Skin Care', '₹ 299', '₹ 350', 'In stock', { badge: 'Success', label: 'live' }],
        [{ img: HASH.yogaMat, label: 'Organic Cork Yoga Mat' }, 'Yoga', '₹ 3,499', '₹ 4,200', 'In stock', { badge: 'Success', label: 'live' }],
        [{ img: HASH.aloe, label: 'Pure Aloe Vera Gel' }, 'Skin Care', '₹ 349', '₹ 399', 'In stock', { badge: 'Success', label: 'live' }],
        [{ img: HASH.giftBox, label: 'IYKA Wellness Gift Box' }, 'Gifts', '₹ 2,499', '₹ 3,200', 'Low stock', { badge: 'Warning', label: 'low stock' }],
      ]);
  }

  /* ══ 3 — ORDERS ══════════════════════════════════════════════════════ */
  {
    const { main } = await shell('Admin — Orders', 3200, 'Orders');
    await pageHead(main, 'Orders', '146 orders · 4 need attention');

    const tabs = AL('HORIZONTAL', { itemSpacing: 8 });
    main.appendChild(tabs);
    tabs.layoutSizingHorizontal = 'FILL';
    const tabNames = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    for (let i = 0; i < tabNames.length; i++) {
      const t = AL('HORIZONTAL', { paddingTop: 8, paddingBottom: 8, paddingLeft: 14, paddingRight: 14 });
      t.fills = i === 0 ? [P('admin/text-primary')] : [P('admin/bg-surface')];
      t.strokes = [P('admin/border')]; t.strokeWeight = 1;
      radius(t, 'radius/sm');
      tabs.appendChild(t);
      await T(t, 'UI/Small Medium', tabNames[i], i === 0 ? 'mis/text-on-accent' : 'admin/text-muted');
    }

    await table(main,
      [['Order', 130], ['Customer', 190], ['Phone', 160], ['Total', 120], ['Payment', 130], ['Status', 0]],
      [
        ['#IYK-2041', 'Emidaka Kharkongor', '+91 98765 43210', '₹ 2,096', 'UPI', { badge: 'Success', label: 'delivered' }],
        ['#IYK-2040', 'Banri Phira', '+91 98765 11223', '₹ 3,499', 'Card', { badge: 'Info', label: 'shipped' }],
        ['#IYK-2039', 'Priya Dkhar', '+91 97654 33445', '₹ 1,148', 'COD', { badge: 'Accent', label: 'processing' }],
        ['#IYK-2038', 'Richfield K.', '+91 96543 55667', '₹ 4,890', 'UPI', { badge: 'Success', label: 'delivered' }],
        ['#IYK-2037', 'Wanda Syiem', '+91 95432 77889', '₹ 849', 'COD', { badge: 'Danger', label: 'cancelled' }],
        ['#IYK-2036', 'Kyrsoibor M.', '+91 94321 99001', '₹ 1,498', 'UPI', { badge: 'Warning', label: 'refund pending' }],
      ]);
  }

  /* ══ 4 — CUSTOMERS ═══════════════════════════════════════════════════ */
  {
    const { main } = await shell('Admin — Customers', 4800, 'Customers');
    await pageHead(main, 'Customers', '312 customers · identified by phone number');
    await table(main,
      [['Customer', 240], ['Phone', 180], ['Orders', 100], ['Lifetime Value', 160], ['Last Order', 160], ['Status', 0]],
      [
        ['Emidaka Kharkongor', '+91 98765 43210', '7', '₹ 14,320', '18 Jul 2026', { badge: 'Purple', label: 'vip' }],
        ['Banri Phira', '+91 98765 11223', '4', '₹ 8,940', '18 Jul 2026', { badge: 'Success', label: 'active' }],
        ['Priya Dkhar', '+91 97654 33445', '3', '₹ 3,420', '17 Jul 2026', { badge: 'Success', label: 'active' }],
        ['Richfield K.', '+91 96543 55667', '6', '₹ 11,780', '17 Jul 2026', { badge: 'Purple', label: 'vip' }],
        ['Wanda Syiem', '+91 95432 77889', '1', '₹ 849', '16 Jun 2026', { badge: 'Neutral', label: 'dormant' }],
      ]);
  }

  /* ══ 5 — BLOG LIST ═══════════════════════════════════════════════════ */
  {
    const { main } = await shell('Admin — Blog', 6400, 'Blog');
    await pageHead(main, 'Blog', '12 posts · 9 published, 3 drafts', '+ New Post');
    await table(main,
      [['Title', 380], ['Category', 150], ['Author', 160], ['Published', 150], ['Status', 0]],
      [
        ['Why your gut decides how you feel', 'Gut Health', 'Dr. Emidaka', '12 Jul 2026', { badge: 'Success', label: 'published' }],
        ['Yoga as clinical intervention, not exercise', 'Yoga Therapy', 'Priya Dkhar', '04 Jul 2026', { badge: 'Success', label: 'published' }],
        ['Food as medicine in a Northeast kitchen', 'Nutrition', 'Richfield K.', '28 Jun 2026', { badge: 'Success', label: 'published' }],
        ['Panchakarma: what actually happens', 'Ayurveda', 'Banri Phira', '—', { badge: 'Neutral', label: 'draft' }],
        ['Sleep, cortisol and the 3am wake-up', 'Wellness', 'Dr. Emidaka', '—', { badge: 'Neutral', label: 'draft' }],
      ]);
  }

  /* ══ 6 — POST EDITOR ═════════════════════════════════════════════════ */
  {
    const { main } = await shell('Admin — Post Editor', 8000, 'Blog');
    await pageHead(main, 'Edit Post', 'Draft · last saved 2 minutes ago', 'Publish');

    const grid = AL('HORIZONTAL', { itemSpacing: 24 });
    main.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';
    grid.layoutSizingVertical = 'FILL';

    // Editor column
    const editor = AL('VERTICAL', { itemSpacing: 0 });
    editor.fills = [P('admin/bg-surface')];
    editor.strokes = [P('admin/border')]; editor.strokeWeight = 1;
    radius(editor, 'radius/sm');
    grid.appendChild(editor);
    editor.layoutSizingHorizontal = 'FILL';

    // Toolbar — the rich-editor controls
    const toolbar = AL('HORIZONTAL', { itemSpacing: 4, paddingTop: 10, paddingBottom: 10, paddingLeft: 12, paddingRight: 12 });
    toolbar.fills = [P('admin/bg-page')];
    toolbar.strokes = [P('admin/border-soft')]; toolbar.strokeWeight = 1;
    toolbar.strokeTopWeight = 0; toolbar.strokeLeftWeight = 0; toolbar.strokeRightWeight = 0;
    toolbar.strokeBottomWeight = 1;
    editor.appendChild(toolbar);
    toolbar.layoutSizingHorizontal = 'FILL';
    for (const g of ['H1', 'H2', 'H3', '|', 'B', 'I', 'U', 'S', '|', '“ ”', '• List', '1. List', '|', '🔗', '🖼', '⌗ Code']) {
      if (g === '|') {
        const d = figma.createRectangle();
        d.resize(1, 20);
        d.fills = [P('admin/border')];
        toolbar.appendChild(d);
        continue;
      }
      const b = AL('HORIZONTAL', { paddingTop: 6, paddingBottom: 6, paddingLeft: 10, paddingRight: 10 });
      radius(b, 'radius/xs');
      toolbar.appendChild(b);
      await T(b, 'UI/Small Medium', g, 'admin/text-muted');
    }

    const body = AL('VERTICAL', { itemSpacing: 19, paddingTop: 32, paddingBottom: 32, paddingLeft: 32, paddingRight: 32 });
    editor.appendChild(body);
    body.layoutSizingHorizontal = 'FILL';

    const titleField = await T(body, 'Display/H2', 'Why your gut decides how you feel', 'admin/text-primary', { fill: true });
    titleField.name = 'Post Title';
    await T(body, 'Body/Base',
      'The gut–brain axis explains more about mood, energy and immunity than most people expect. In functional medicine we treat the digestive system as the starting point of almost every chronic presentation.',
      'admin/text-muted', { fill: true });
    await T(body, 'Display/H3', 'What the research actually says', 'admin/text-primary', { fill: true });
    await T(body, 'Body/Base',
      'Roughly seventy percent of immune tissue sits in the gut wall. When the barrier is compromised, the downstream effects are systemic — fatigue, skin presentations, joint pain, and mood changes that look unrelated until you map them back.',
      'admin/text-muted', { fill: true });

    const quote = AL('VERTICAL', { paddingLeft: 20, paddingTop: 8, paddingBottom: 8 });
    quote.strokes = [P('accent/default')]; quote.strokeWeight = 3;
    quote.strokeLeftWeight = 3; quote.strokeRightWeight = 0;
    quote.strokeTopWeight = 0; quote.strokeBottomWeight = 0;
    body.appendChild(quote);
    quote.layoutSizingHorizontal = 'FILL';
    await T(quote, 'Display/Quote', 'We do not treat the symptom where it appears. We treat it where it starts.', 'admin/text-primary', { fill: true });

    const imgBlock = AL('VERTICAL', {});
    imgBlock.primaryAxisSizingMode = 'FIXED'; imgBlock.counterAxisSizingMode = 'FIXED';
    body.appendChild(imgBlock);
    imgBlock.resize(700, 300);
    imgBlock.layoutSizingHorizontal = 'FILL';
    imgBlock.fills = [IMGFILL(HASH.g1)];

    // Settings sidebar
    const settings = AL('VERTICAL', { itemSpacing: 19, paddingTop: 24, paddingBottom: 24, paddingLeft: 20, paddingRight: 20 });
    settings.fills = [P('admin/bg-surface')];
    settings.strokes = [P('admin/border')]; settings.strokeWeight = 1;
    radius(settings, 'radius/sm');
    grid.appendChild(settings);
    settings.resize(320, 100);
    settings.layoutSizingHorizontal = 'FIXED';

    await T(settings, 'UI/Table Header', 'Post Settings', 'admin/text-soft', { fill: true });
    for (const [label, value] of [['Slug', 'why-your-gut-decides'], ['Category', 'Gut Health'], ['Author', 'Dr. Emidaka'], ['Read time', '8 min']]) {
      const f = inst('MIS Input', 'State=Default');
      settings.appendChild(f);
      f.layoutSizingHorizontal = 'FILL';
      const l = f.findOne(n => n.name === 'Label'); if (l) l.characters = label;
      const v = f.findOne(n => n.name === 'Value'); if (v) v.characters = value;
    }
    spacer(settings, 8);
    await T(settings, 'UI/Table Header', 'Cover Image', 'admin/text-soft', { fill: true });
    const cover = AL('VERTICAL', {});
    cover.primaryAxisSizingMode = 'FIXED'; cover.counterAxisSizingMode = 'FIXED';
    settings.appendChild(cover);
    cover.resize(280, 160);
    cover.layoutSizingHorizontal = 'FILL';
    cover.fills = [IMGFILL(HASH.g1)];
    radius(cover, 'radius/xs');
    spacer(settings, 8);
    const statusRow = AL('HORIZONTAL', { itemSpacing: 8, counterAxisAlignItems: 'CENTER' });
    settings.appendChild(statusRow);
    await T(statusRow, 'UI/Small', 'Status', 'admin/text-muted');
    const badge = inst('Status Badge', 'Tone=Neutral');
    setProps(badge, { Label: 'draft' });
    statusRow.appendChild(badge);
  }

  for (const t of _trash) t.remove();

  const summary = 'IYKA 06 — backoffice screens built: Dashboard, Products, Orders, Customers, Blog, Post Editor';
  console.log(summary);
  figma.currentPage.selection = [];
  return summary;

})();
