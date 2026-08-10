/* ════════════════════════════════════════════════════════════════════════════
   IYKA-ARAM · 05 — IYKA Living Store screens
   Page: 03 · Screens

   Listing, Product Detail, Cart, Checkout, Profile, OTP Modal.
   Catalogue is verbatim from src/data/products.ts (9 SKUs, real prices,
   ratings and badges). Layout follows the .store-* rules in globals.css —
   the store container is max-width 1280 with 32px gutters, on WHITE surfaces.

   Run AFTER 02-components-commerce.js.

   Standard Figma Plugin API only. Safe to re-run.
   ════════════════════════════════════════════════════════════════════════════ */

(async () => {

  const HASH = {
    hairOil:  '74bac57e95fdd528a5c42cb724d195b2a5f9e59f',
    soap:     'd252ae4968886a64e6a33579861a56cb58fc596e',
    aloe:     '9dd03b23851e3cb43cecc1dbdc75d4a795f1f2a1',
    gastro:   'f9b44659649af50cc5b70bfb072d7691be6b261d',
    muscle:   '050ea2d7b4066635e28a74b8a40e6e8a651e5fb4',
    stress:   'a1db725b438088074ae9bbb28e0a829d19221a06',
    aura:     'dbd4fd8b3fb516f1ed6eb9c8bbbcb5c27cc1747f',
    yogaMat:  '3e3bd0f86e494886075d706e59af154f5bd0247c',
    giftBox:  '3ce4747694f4a265341ff3b320d6900d2914964c',
  };

  // Verbatim from src/data/products.ts
  const PRODUCTS = [
    ['Keshanidhi Hair Oil',       'Hair Care', 'Ancient Ayurvedic formula for stronger, lustrous hair',        849, 999,  '100 ml',           4.8, 124, 'Bestseller',     HASH.hairOil],
    ['Herbal Organic Soap',       'Skin Care', 'Cold-process soap with botanical actives, no SLS or parabens', 299, 350,  '100 g',            4.7, 89,  null,             HASH.soap],
    ['Organic Cork Yoga Mat',     'Yoga',      'Anti-microbial, non-slip cork surface with natural rubber base',3499,4200,'183 × 61 cm, 4 mm',4.9, 56,  'Eco Choice',     HASH.yogaMat],
    ['Pure Aloe Vera Gel',        'Skin Care', '99% raw aloe with no alcohol, dyes, or artificial fragrance',  349, 399,  '200 ml',           4.6, 203, null,             HASH.aloe],
    ['Stress Relief Roll-On',     'Wellness',  'Adaptogenic blend to calm the nervous system on contact',      699, 799,  '10 ml',            4.9, 178, 'Dr. Formulated', HASH.stress],
    ['Gastro Wellness Oil',       'Wellness',  'Carminative blend for digestive ease and bloating relief',     649, 749,  '10 ml',            4.7, 91,  null,             HASH.gastro],
    ['Aura Cleansing Bath Salt',  'Skin Care', 'Mineral-rich ritual bath blend for deep relaxation',           799, 950,  '300 g',            4.8, 145, null,             HASH.aura],
    ['Muscle Recovery Oil',       'Wellness',  'Deep-penetrating blend for post-workout soreness',             699, 799,  '50 ml',            4.7, 112, null,             HASH.muscle],
    ['IYKA Wellness Gift Box',    'Gifts',     'A curated ritual — the perfect gift for someone healing',      2499,3200, 'Curated set',      5.0, 67,  'Gift Ready',     HASH.giftBox],
  ];

  const inr = (n) => '₹ ' + n.toLocaleString('en-IN');

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
      ['DM Sans', 'Regular'], ['DM Sans', 'Medium'], ['DM Sans', 'SemiBold'], ['DM Sans', 'Bold'],
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
    if (!c) throw new Error('component "' + name + '" not found — run 02-components-commerce.js first');
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

  const W = 1440, PAD = 80;

  await boot();
  const page = figma.root.children.find(p => p.name === '03 · Screens');
  if (!page) throw new Error('page "03 · Screens" not found');
  await figma.setCurrentPageAsync(page);

  const OWNED = ['Store — Listing', 'Store — Product Detail', 'Store — Cart',
                 'Store — Checkout', 'Store — Profile', 'Store — OTP Modal'];
  for (const child of [...page.children]) {
    if (OWNED.indexOf(child.name) !== -1) child.remove();
  }

  const ROW_Y = 12000;   // store screens sit on their own row below marketing

  /* ── Which screens to build ──────────────────────────────────────────────
     Names listed in SKIP are not drawn: each is a near-duplicate of a screen
     already in the set, and a designer would not redraw the same layout twice.
     Remove a name from SKIP to build it. Kept screens are laid out
     contiguously, so skipping never leaves a gap on the canvas.
     ─────────────────────────────────────────────────────────────────────── */
  const SKIP = new Set([
    'Store — Profile',   // order-history table — same archetype as the admin tables
  ]);

  const _trash = [];
  let _slot = 0;
  function _place(name, node) {
    if (SKIP.has(name)) { node.x = -99999; _trash.push(node); }
    else { node.x = (_slot++) * 1600; }
  }

  function screen(name, x) {
    const f = AL('VERTICAL', { name: name, itemSpacing: 0 });
    page.appendChild(f);
    f.resize(W, 100);
    f.layoutSizingHorizontal = 'FIXED';
    _place(name, f); f.y = ROW_Y;
    f.clipsContent = true;
    f.fills = [P('cream/bg-page')];
    return f;
  }
  function band(parent, bgVar, padY) {
    const b = AL('VERTICAL', { name: 'section', itemSpacing: 0 });
    b.fills = [P(bgVar)];
    b.paddingTop = padY; b.paddingBottom = padY;
    b.paddingLeft = PAD; b.paddingRight = PAD;
    parent.appendChild(b);
    b.layoutSizingHorizontal = 'FILL';
    return b;
  }

  /* ── store nav — .store-nav, white, 64px, sticky ─────────────────────── */
  async function storeNav(parent, cartCount) {
    const nav = AL('HORIZONTAL', {
      name: 'Store Nav', counterAxisAlignItems: 'CENTER', itemSpacing: 32,
      paddingLeft: PAD, paddingRight: PAD, paddingTop: 14, paddingBottom: 14,
    });
    nav.fills = [P('store/bg-surface')];
    nav.strokes = [P('cream/border')];
    nav.strokeWeight = 1;
    nav.strokeTopWeight = 0; nav.strokeLeftWeight = 0; nav.strokeRightWeight = 0;
    nav.strokeBottomWeight = 1;
    parent.appendChild(nav);
    nav.layoutSizingHorizontal = 'FILL';

    const logo = AL('VERTICAL', { itemSpacing: 0, name: 'Logo' });
    nav.appendChild(logo);
    await T(logo, 'Display/H4', 'IYKA LIVING', 'cream/text-primary');
    await T(logo, 'Label/Eyebrow', 'Apothecary', 'accent/on-cream');

    const links = AL('HORIZONTAL', { itemSpacing: 29, counterAxisAlignItems: 'CENTER', name: 'Links' });
    nav.appendChild(links);
    links.layoutSizingHorizontal = 'FILL';
    links.primaryAxisAlignItems = 'MAX';
    for (const l of ['All Products', 'Hair Care', 'Skin Care', 'Wellness', 'Gifts']) {
      await T(links, 'Body/Small', l, 'cream/text-secondary');
    }

    const actions = AL('HORIZONTAL', { itemSpacing: 12, counterAxisAlignItems: 'CENTER', name: 'Actions' });
    nav.appendChild(actions);
    for (const glyph of ['♡', '☺']) {
      const b = AL('VERTICAL', {});
      b.primaryAxisAlignItems = 'CENTER'; b.counterAxisAlignItems = 'CENTER';
      b.primaryAxisSizingMode = 'FIXED'; b.counterAxisSizingMode = 'FIXED';
      b.resize(38, 38);
      b.strokes = [P('accent/default')]; b.strokeWeight = 1.5;
      actions.appendChild(b);
      await T(b, 'Body/Small', glyph, 'accent/on-cream');
    }
    const cart = AL('VERTICAL', { name: 'Cart' });
    cart.primaryAxisAlignItems = 'CENTER'; cart.counterAxisAlignItems = 'CENTER';
    cart.primaryAxisSizingMode = 'FIXED'; cart.counterAxisSizingMode = 'FIXED';
    cart.resize(38, 38);
    cart.strokes = [P('accent/default')]; cart.strokeWeight = 1.5;
    cart.clipsContent = false;
    actions.appendChild(cart);
    await T(cart, 'Body/Small', '⌂', 'accent/on-cream');
    if (cartCount) {
      const badge = AL('VERTICAL', {});
      badge.primaryAxisAlignItems = 'CENTER'; badge.counterAxisAlignItems = 'CENTER';
      badge.primaryAxisSizingMode = 'FIXED'; badge.counterAxisSizingMode = 'FIXED';
      badge.resize(18, 18);
      badge.fills = [P('cream/text-primary')];
      radius(badge, 'radius/full');
      cart.appendChild(badge);
      badge.layoutPositioning = 'ABSOLUTE';
      badge.x = 26; badge.y = -6;
      await T(badge, 'UI/Badge', String(cartCount), 'store/text-on-fill');
    }
    return nav;
  }

  async function breadcrumb(parent, trail) {
    const b = AL('HORIZONTAL', { itemSpacing: 8, paddingTop: 19, paddingBottom: 19, paddingLeft: PAD, paddingRight: PAD });
    b.fills = [P('cream/bg-page')];
    parent.appendChild(b);
    b.layoutSizingHorizontal = 'FILL';
    for (let i = 0; i < trail.length; i++) {
      await T(b, 'Body/Caption', trail[i], i === trail.length - 1 ? 'cream/text-primary' : 'cream/text-muted');
      if (i < trail.length - 1) await T(b, 'Body/Caption', '/', 'cream/text-muted');
    }
    return b;
  }

  async function storeFooter(parent) {
    const f = AL('VERTICAL', { itemSpacing: 24, paddingTop: 48, paddingBottom: 32, paddingLeft: PAD, paddingRight: PAD });
    f.fills = [P('dark/bg-page')];
    parent.appendChild(f);
    f.layoutSizingHorizontal = 'FILL';
    const row = AL('HORIZONTAL', { itemSpacing: 48 });
    f.appendChild(row);
    row.layoutSizingHorizontal = 'FILL';
    const brand = AL('VERTICAL', { itemSpacing: 8 });
    row.appendChild(brand);
    brand.layoutSizingHorizontal = 'FILL';
    await T(brand, 'Display/H3', 'IYKA LIVING', 'dark/text-primary');
    await T(brand, 'Label/Eyebrow', 'Apothecary · Made in Meghalaya', 'dark/text-muted');
    await T(brand, 'Body/Caption', '← Back to IYKA-ARAM Wellness', 'accent/on-dark');
    for (const [h, items] of [['Shop', ['Hair Care', 'Skin Care', 'Wellness', 'Gifts']],
                              ['Help', ['Shipping', 'Returns', 'Track Order', 'Contact']]]) {
      const col = AL('VERTICAL', { itemSpacing: 10 });
      row.appendChild(col);
      col.layoutSizingHorizontal = 'FILL';
      await T(col, 'Label/Eyebrow', h, 'dark/text-primary');
      for (const i of items) await T(col, 'Body/Small', i, 'dark/text-muted', { fill: true });
    }
    const bottom = AL('HORIZONTAL', { paddingTop: 24 });
    bottom.strokes = [P('dark/border')]; bottom.strokeWeight = 1;
    bottom.strokeTopWeight = 1; bottom.strokeBottomWeight = 0;
    bottom.strokeLeftWeight = 0; bottom.strokeRightWeight = 0;
    f.appendChild(bottom);
    bottom.layoutSizingHorizontal = 'FILL';
    await T(bottom, 'Body/Caption', '© 2026 IYKA Living. All products made in Meghalaya.', 'dark/text-muted', { fill: true });
    return f;
  }

  /* ══ SCREEN 1 — LISTING ══════════════════════════════════════════════ */
  {
    const sc = screen('Store — Listing', 0);
    await storeNav(sc, 3);
    await breadcrumb(sc, ['Home', 'Store', 'All Products']);

    const s = band(sc, 'cream/bg-page', 32);
    await T(s, 'Display/H1', 'The Apothecary', 'cream/text-primary', { fill: true });
    spacer(s, 8);
    await T(s, 'Body/Lead', 'Nine formulations, made in small batches in the hills of Meghalaya.', 'cream/text-secondary', { fill: true });
    spacer(s, 40);

    const filters = AL('HORIZONTAL', { itemSpacing: 8, name: 'Filters' });
    s.appendChild(filters);
    filters.layoutSizingHorizontal = 'FILL';
    const cats = ['All', 'Hair Care', 'Skin Care', 'Wellness', 'Yoga', 'Gifts'];
    for (let i = 0; i < cats.length; i++) {
      const chip = inst('Filter Chip', i === 0 ? 'State=Active' : 'State=Default');
      setProps(chip, { Label: cats[i] });
      filters.appendChild(chip);
    }
    spacer(s, 40);

    const grid = AL('VERTICAL', { itemSpacing: 32, name: 'Product Grid' });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';
    for (let i = 0; i < PRODUCTS.length; i += 3) {
      const row = AL('HORIZONTAL', { itemSpacing: 32 });
      grid.appendChild(row);
      row.layoutSizingHorizontal = 'FILL';
      for (const [name, cat, tagline, price, mrp, size, rating, reviews, badge, img] of PRODUCTS.slice(i, i + 3)) {
        const card = inst('Product Card');
        setProps(card, { Name: name, Category: cat, Tagline: tagline, Price: inr(price) });
        row.appendChild(card);
        card.layoutSizingHorizontal = 'FILL';
        const slot = card.findOne(n => n.name === 'Image');
        if (slot) slot.fills = [IMGFILL(img)];
        const b = card.findOne(n => n.name === 'Badge');
        if (b) {
          if (badge) { const bt = b.findOne(n => n.type === 'TEXT'); if (bt) bt.characters = badge; }
          else b.visible = false;
        }
        const mrpNode = card.findOne(n => n.name === 'MRP');
        if (mrpNode) mrpNode.characters = inr(mrp);
        const rt = card.findAll(n => n.type === 'TEXT' && n.characters.indexOf('4.8 (') === 0)[0];
        if (rt) rt.characters = rating.toFixed(1) + ' (' + reviews + ')';
      }
    }
    await storeFooter(sc);
  }

  /* ══ SCREEN 2 — PRODUCT DETAIL ═══════════════════════════════════════ */
  {
    const sc = screen('Store — Product Detail', 1600);
    await storeNav(sc, 3);
    await breadcrumb(sc, ['Home', 'Store', 'Hair Care', 'Keshanidhi Hair Oil']);

    const s = band(sc, 'cream/bg-page', 32);
    const grid = AL('HORIZONTAL', { itemSpacing: 64, name: 'Detail Grid' });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';

    const gallery = AL('VERTICAL', { itemSpacing: 16 });
    grid.appendChild(gallery);
    gallery.layoutSizingHorizontal = 'FILL';
    const main = AL('VERTICAL', {});
    main.primaryAxisSizingMode = 'FIXED'; main.counterAxisSizingMode = 'FIXED';
    gallery.appendChild(main);
    main.resize(608, 608);
    main.layoutSizingHorizontal = 'FILL';
    main.fills = [IMGFILL(HASH.hairOil)];
    main.clipsContent = false;
    const badge = AL('HORIZONTAL', { paddingTop: 5, paddingBottom: 5, paddingLeft: 11, paddingRight: 11 });
    badge.fills = [P('accent/default')];
    main.appendChild(badge);
    badge.layoutPositioning = 'ABSOLUTE';
    badge.x = 16; badge.y = 16;
    await T(badge, 'Label/Eyebrow', 'Bestseller', 'store/text-on-fill');
    const thumbs = AL('HORIZONTAL', { itemSpacing: 12 });
    gallery.appendChild(thumbs);
    thumbs.layoutSizingHorizontal = 'FILL';
    for (const h of [HASH.hairOil, HASH.aloe, HASH.soap, HASH.aura]) {
      const t = AL('VERTICAL', {});
      t.primaryAxisSizingMode = 'FIXED'; t.counterAxisSizingMode = 'FIXED';
      thumbs.appendChild(t);
      t.resize(140, 140);
      t.layoutSizingHorizontal = 'FILL';
      t.fills = [IMGFILL(h)];
    }

    const info = AL('VERTICAL', { itemSpacing: 0 });
    grid.appendChild(info);
    info.layoutSizingHorizontal = 'FILL';
    await T(info, 'Label/Eyebrow', 'Hair Care', 'accent/on-cream', { fill: true });
    spacer(info, 8);
    await T(info, 'Display/H1', 'Keshanidhi Hair Oil', 'cream/text-primary', { fill: true });
    spacer(info, 8);
    await T(info, 'Body/Base', 'Ancient Ayurvedic formula for stronger, lustrous hair', 'cream/text-secondary', { fill: true });
    spacer(info, 16);
    const rate = AL('HORIZONTAL', { itemSpacing: 8, counterAxisAlignItems: 'CENTER' });
    info.appendChild(rate);
    await T(rate, 'Body/Small', '★★★★★', 'accent/on-cream');
    await T(rate, 'Body/Small', '4.8 · 124 reviews', 'cream/text-muted');
    spacer(info, 19);
    const priceRow = AL('HORIZONTAL', { itemSpacing: 13, counterAxisAlignItems: 'BASELINE' });
    info.appendChild(priceRow);
    await T(priceRow, 'Display/H2', '₹ 849', 'cream/text-primary');
    const mrp = await T(priceRow, 'Body/Base', '₹ 999', 'cream/text-muted');
    mrp.textDecoration = 'STRIKETHROUGH';
    const off = AL('HORIZONTAL', { paddingTop: 3, paddingBottom: 3, paddingLeft: 8, paddingRight: 8 });
    off.fills = [P('accent/green')];
    priceRow.appendChild(off);
    await T(off, 'Label/Eyebrow', '15% off', 'store/text-on-fill');
    spacer(info, 8);
    await T(info, 'Body/Caption', 'Size · 100 ml · Inclusive of all taxes', 'cream/text-muted', { fill: true });
    spacer(info, 24);

    const qtyRow = AL('HORIZONTAL', { itemSpacing: 16, counterAxisAlignItems: 'CENTER' });
    info.appendChild(qtyRow);
    await T(qtyRow, 'Body/Small', 'Quantity', 'cream/text-secondary');
    qtyRow.appendChild(inst('Qty Control'));
    spacer(info, 24);
    const acts = AL('HORIZONTAL', { itemSpacing: 16 });
    info.appendChild(acts);
    acts.layoutSizingHorizontal = 'FILL';
    const b1 = inst('Button', 'Style=Store Primary, Size=Default');
    setProps(b1, { Label: 'Add to Cart' });
    acts.appendChild(b1);
    const b2 = inst('Button', 'Style=Gold, Size=Default');
    setProps(b2, { Label: 'Buy Now' });
    acts.appendChild(b2);
    spacer(info, 24);
    const chips = AL('HORIZONTAL', { itemSpacing: 8, paddingTop: 16, paddingBottom: 16, paddingLeft: 16, paddingRight: 16 });
    chips.fills = [P('cream/bg-alt')];
    chips.strokes = [P('cream/border')]; chips.strokeWeight = 1;
    info.appendChild(chips);
    chips.layoutSizingHorizontal = 'FILL';
    for (const c of ['100% Natural', 'No Parabens', 'Cash on Delivery', 'Ships in 48h']) {
      const chip = inst('Trust Chip');
      setProps(chip, { Label: c });
      chips.appendChild(chip);
    }
    spacer(info, 24);
    const tabs = AL('HORIZONTAL', { itemSpacing: 0 });
    tabs.strokes = [P('cream/border')]; tabs.strokeWeight = 1;
    tabs.strokeTopWeight = 0; tabs.strokeLeftWeight = 0; tabs.strokeRightWeight = 0;
    tabs.strokeBottomWeight = 1;
    info.appendChild(tabs);
    tabs.layoutSizingHorizontal = 'FILL';
    const tabNames = ['Description', 'Benefits', 'Ingredients', 'How to Use'];
    for (let i = 0; i < tabNames.length; i++) {
      const tb = AL('HORIZONTAL', { paddingTop: 11, paddingBottom: 11, paddingLeft: 19, paddingRight: 19 });
      if (i === 0) {
        tb.strokes = [P('accent/default')]; tb.strokeWeight = 2;
        tb.strokeTopWeight = 0; tb.strokeLeftWeight = 0; tb.strokeRightWeight = 0;
        tb.strokeBottomWeight = 2;
      }
      tabs.appendChild(tb);
      await T(tb, 'Label/Eyebrow', tabNames[i], i === 0 ? 'cream/text-primary' : 'cream/text-muted');
    }
    spacer(info, 16);
    await T(info, 'Body/Base',
      "A sacred Ayurvedic blend of 21 herbs cold-pressed in pure sesame oil. Nourishes the scalp at the root level, reduces hair fall, and promotes natural hair growth with consistent use.",
      'cream/text-secondary', { fill: true });

    // Related
    spacer(s, 64);
    await T(s, 'Display/H3', 'You may also like', 'cream/text-primary', { fill: true });
    spacer(s, 24);
    const rel = AL('HORIZONTAL', { itemSpacing: 24 });
    s.appendChild(rel);
    rel.layoutSizingHorizontal = 'FILL';
    for (const [name, cat, tagline, price, mrp2, size, rating, reviews, badge2, img] of PRODUCTS.slice(1, 5)) {
      const card = inst('Product Card');
      setProps(card, { Name: name, Category: cat, Tagline: tagline, Price: inr(price) });
      rel.appendChild(card);
      card.layoutSizingHorizontal = 'FILL';
      const slot = card.findOne(n => n.name === 'Image');
      if (slot) slot.fills = [IMGFILL(img)];
      const b = card.findOne(n => n.name === 'Badge');
      if (b && !badge2) b.visible = false;
    }
    await storeFooter(sc);
  }

  /* ══ SCREEN 3 — CART ═════════════════════════════════════════════════ */
  {
    const sc = screen('Store — Cart', 3200);
    await storeNav(sc, 3);
    await breadcrumb(sc, ['Home', 'Store', 'Cart']);
    const s = band(sc, 'cream/bg-page', 32);
    await T(s, 'Display/H1', 'Your Cart', 'cream/text-primary', { fill: true });
    spacer(s, 32);
    const grid = AL('HORIZONTAL', { itemSpacing: 48 });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';

    const items = AL('VERTICAL', { itemSpacing: 0 });
    grid.appendChild(items);
    items.layoutSizingHorizontal = 'FILL';
    const cart = [PRODUCTS[0], PRODUCTS[4], PRODUCTS[3]];
    for (const [name, cat, tagline, price, mrp, size, r, rv, b, img] of cart) {
      const line = inst('Cart Line');
      setProps(line, { Name: name });
      items.appendChild(line);
      line.layoutSizingHorizontal = 'FILL';
      const th = line.findOne(n => n.name === 'Image');
      if (th) th.fills = [IMGFILL(img)];
      const sz = line.findOne(n => n.name === 'Size'); if (sz) sz.characters = size;
      const pr = line.findOne(n => n.name === 'Price'); if (pr) pr.characters = inr(price);
    }

    const summary = AL('VERTICAL', { itemSpacing: 0, paddingTop: 29, paddingBottom: 29, paddingLeft: 29, paddingRight: 29 });
    summary.fills = [P('cream/bg-alt')];
    summary.strokes = [P('cream/border')]; summary.strokeWeight = 1;
    grid.appendChild(summary);
    summary.resize(360, 100);
    summary.layoutSizingHorizontal = 'FIXED';
    await T(summary, 'Label/Eyebrow', 'Order Summary', 'cream/text-primary', { fill: true });
    spacer(summary, 19);
    const subtotal = PRODUCTS[0][3] + PRODUCTS[4][3] + PRODUCTS[3][3];
    for (const [label, value] of [['Subtotal', inr(subtotal)], ['Shipping', 'Free'], ['Tax (5%)', inr(Math.round(subtotal * 0.05))]]) {
      const r = AL('HORIZONTAL', { paddingTop: 10, paddingBottom: 10 });
      r.strokes = [P('cream/border')]; r.strokeWeight = 1;
      r.strokeTopWeight = 0; r.strokeLeftWeight = 0; r.strokeRightWeight = 0; r.strokeBottomWeight = 1;
      summary.appendChild(r);
      r.layoutSizingHorizontal = 'FILL';
      await T(r, 'Body/Small', label, 'cream/text-secondary', { fill: true });
      await T(r, 'Body/Small', value, 'cream/text-primary');
    }
    const tot = AL('HORIZONTAL', { paddingTop: 16, paddingBottom: 19 });
    summary.appendChild(tot);
    tot.layoutSizingHorizontal = 'FILL';
    await T(tot, 'Label/Price', 'Total', 'cream/text-primary', { fill: true });
    await T(tot, 'Label/Price', inr(Math.round(subtotal * 1.05)), 'cream/text-primary');
    const co = inst('Button', 'Style=Store Primary, Size=Default');
    setProps(co, { Label: 'Proceed to Checkout' });
    summary.appendChild(co);
    co.layoutSizingHorizontal = 'FILL';
    await storeFooter(sc);
  }

  /* ══ SCREEN 4 — CHECKOUT ═════════════════════════════════════════════ */
  {
    const sc = screen('Store — Checkout', 4800);
    await storeNav(sc, 3);
    await breadcrumb(sc, ['Home', 'Store', 'Cart', 'Checkout']);
    const s = band(sc, 'cream/bg-page', 32);
    await T(s, 'Display/H1', 'Checkout', 'cream/text-primary', { fill: true });
    spacer(s, 32);
    const grid = AL('HORIZONTAL', { itemSpacing: 48 });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';

    const main = AL('VERTICAL', { itemSpacing: 24 });
    grid.appendChild(main);
    main.layoutSizingHorizontal = 'FILL';

    async function checkoutSection(title, build) {
      const sec = AL('VERTICAL', { itemSpacing: 19, paddingTop: 29, paddingBottom: 29, paddingLeft: 29, paddingRight: 29 });
      sec.fills = [P('cream/bg-alt')];
      sec.strokes = [P('cream/border')]; sec.strokeWeight = 1;
      main.appendChild(sec);
      sec.layoutSizingHorizontal = 'FILL';
      const h = await T(sec, 'Label/Eyebrow', title, 'cream/text-primary', { fill: true });
      await build(sec);
      return sec;
    }

    await checkoutSection('Contact Details', async (sec) => {
      for (const pair of [['Full name', 'Emidaka Kharkongor'], ['Phone', '+91 98765 43210']]) {
        const f = inst('Form Field', 'State=Default');
        sec.appendChild(f);
        f.layoutSizingHorizontal = 'FILL';
        const l = f.findOne(n => n.name === 'Label'); if (l) l.characters = pair[0];
        const v = f.findOne(n => n.name === 'Value'); if (v) v.characters = pair[1];
      }
    });

    await checkoutSection('Delivery Address', async (sec) => {
      for (const pair of [['Address', 'Laitumkhrah, Shillong'], ['City', 'Shillong'], ['PIN Code', '793003'], ['State', 'Meghalaya']]) {
        const f = inst('Form Field', 'State=Default');
        sec.appendChild(f);
        f.layoutSizingHorizontal = 'FILL';
        const l = f.findOne(n => n.name === 'Label'); if (l) l.characters = pair[0];
        const v = f.findOne(n => n.name === 'Value'); if (v) v.characters = pair[1];
      }
    });

    await checkoutSection('Payment Method', async (sec) => {
      const opts = [['UPI', 'Pay via any UPI app', true], ['Card', 'Credit or debit card', false], ['Cash on Delivery', 'Pay when it arrives', false]];
      for (const [name, sub, checked] of opts) {
        const o = AL('HORIZONTAL', { itemSpacing: 13, counterAxisAlignItems: 'CENTER', paddingTop: 16, paddingBottom: 16, paddingLeft: 16, paddingRight: 16 });
        o.fills = [P('store/bg-surface')];
        o.strokes = [P(checked ? 'accent/default' : 'cream/border')];
        o.strokeWeight = 1.5;
        sec.appendChild(o);
        o.layoutSizingHorizontal = 'FILL';
        const dot = AL('VERTICAL', {});
        dot.primaryAxisAlignItems = 'CENTER'; dot.counterAxisAlignItems = 'CENTER';
        dot.primaryAxisSizingMode = 'FIXED'; dot.counterAxisSizingMode = 'FIXED';
        dot.resize(18, 18);
        dot.strokes = [P(checked ? 'accent/default' : 'cream/border')]; dot.strokeWeight = 1.5;
        radius(dot, 'radius/full');
        o.appendChild(dot);
        if (checked) {
          const inner = figma.createEllipse();
          inner.resize(8, 8);
          inner.fills = [P('accent/default')];
          dot.appendChild(inner);
        }
        const col = AL('VERTICAL', { itemSpacing: 2 });
        o.appendChild(col);
        col.layoutSizingHorizontal = 'FILL';
        await T(col, 'Body/Small', name, 'cream/text-primary', { fill: true });
        await T(col, 'Body/Caption', sub, 'cream/text-muted', { fill: true });
      }
    });

    const side = AL('VERTICAL', { itemSpacing: 16, paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 });
    side.fills = [P('cream/bg-alt')];
    side.strokes = [P('cream/border')]; side.strokeWeight = 1;
    grid.appendChild(side);
    side.resize(360, 100);
    side.layoutSizingHorizontal = 'FIXED';
    await T(side, 'Label/Eyebrow', 'Your Order', 'cream/text-primary', { fill: true });
    let sub = 0;
    for (const [name, cat, tag, price, mrp, size, r, rv, b, img] of [PRODUCTS[0], PRODUCTS[4], PRODUCTS[3]]) {
      sub += price;
      const row = AL('HORIZONTAL', { itemSpacing: 13, counterAxisAlignItems: 'CENTER', paddingBottom: 13 });
      row.strokes = [P('cream/border')]; row.strokeWeight = 1;
      row.strokeTopWeight = 0; row.strokeLeftWeight = 0; row.strokeRightWeight = 0; row.strokeBottomWeight = 1;
      side.appendChild(row);
      row.layoutSizingHorizontal = 'FILL';
      const th = AL('VERTICAL', {});
      th.primaryAxisSizingMode = 'FIXED'; th.counterAxisSizingMode = 'FIXED';
      row.appendChild(th);
      th.resize(52, 52);
      th.fills = [IMGFILL(img)];
      const col = AL('VERTICAL', { itemSpacing: 2 });
      row.appendChild(col);
      col.layoutSizingHorizontal = 'FILL';
      await T(col, 'Body/Caption', name, 'cream/text-primary', { fill: true });
      await T(col, 'Body/Caption', size, 'cream/text-muted', { fill: true });
      await T(row, 'Body/Small', inr(price), 'cream/text-primary');
    }
    const t2 = AL('HORIZONTAL', { paddingTop: 8 });
    side.appendChild(t2);
    t2.layoutSizingHorizontal = 'FILL';
    await T(t2, 'Label/Price', 'Total', 'cream/text-primary', { fill: true });
    await T(t2, 'Label/Price', inr(Math.round(sub * 1.05)), 'cream/text-primary');
    const pay = inst('Button', 'Style=Gold, Size=Default');
    setProps(pay, { Label: 'Place Order' });
    side.appendChild(pay);
    pay.layoutSizingHorizontal = 'FILL';
    await storeFooter(sc);
  }

  /* ══ SCREEN 5 — PROFILE ══════════════════════════════════════════════ */
  {
    const sc = screen('Store — Profile', 6400);
    await storeNav(sc, 0);
    await breadcrumb(sc, ['Home', 'Store', 'My Account']);
    const s = band(sc, 'cream/bg-page', 32);
    const head = AL('HORIZONTAL', { itemSpacing: 19, counterAxisAlignItems: 'CENTER' });
    s.appendChild(head);
    head.layoutSizingHorizontal = 'FILL';
    const av = AL('VERTICAL', {});
    av.primaryAxisAlignItems = 'CENTER'; av.counterAxisAlignItems = 'CENTER';
    av.primaryAxisSizingMode = 'FIXED'; av.counterAxisSizingMode = 'FIXED';
    av.resize(64, 64);
    av.fills = [P('accent/default')];
    radius(av, 'radius/full');
    head.appendChild(av);
    await T(av, 'Display/H3', 'EK', 'accent/fg');
    const who = AL('VERTICAL', { itemSpacing: 4 });
    head.appendChild(who);
    who.layoutSizingHorizontal = 'FILL';
    await T(who, 'Display/H2', 'Emidaka Kharkongor', 'cream/text-primary', { fill: true });
    await T(who, 'Body/Small', '+91 98765 43210 · Shillong, Meghalaya', 'cream/text-muted', { fill: true });
    spacer(s, 40);

    await T(s, 'Display/H3', 'Order History', 'cream/text-primary', { fill: true });
    spacer(s, 19);
    const orders = [
      ['#IYK-2041', '18 July 2026', '3 items', '₹ 2,096', 'Delivered'],
      ['#IYK-1987', '02 July 2026', '1 item', '₹ 3,499', 'Delivered'],
      ['#IYK-1902', '21 June 2026', '2 items', '₹ 1,148', 'Delivered'],
    ];
    const tbl = AL('VERTICAL', { itemSpacing: 0 });
    tbl.strokes = [P('cream/border')]; tbl.strokeWeight = 1;
    s.appendChild(tbl);
    tbl.layoutSizingHorizontal = 'FILL';
    for (const [id, date, count, total, status] of orders) {
      const r = AL('HORIZONTAL', { itemSpacing: 24, counterAxisAlignItems: 'CENTER', paddingTop: 19, paddingBottom: 19, paddingLeft: 24, paddingRight: 24 });
      r.fills = [P('store/bg-surface')];
      r.strokes = [P('cream/border')]; r.strokeWeight = 1;
      r.strokeTopWeight = 0; r.strokeLeftWeight = 0; r.strokeRightWeight = 0; r.strokeBottomWeight = 1;
      tbl.appendChild(r);
      r.layoutSizingHorizontal = 'FILL';
      const a = await T(r, 'Body/Small', id, 'cream/text-primary'); a.resize(130, a.height);
      const b = await T(r, 'Body/Small', date, 'cream/text-muted'); b.resize(160, b.height);
      const c = await T(r, 'Body/Small', count, 'cream/text-muted'); c.resize(110, c.height);
      await T(r, 'Body/Small', total, 'cream/text-primary', { fill: true });
      const chip = AL('HORIZONTAL', { paddingTop: 4, paddingBottom: 4, paddingLeft: 10, paddingRight: 10 });
      chip.fills = [P('accent/green')];
      r.appendChild(chip);
      await T(chip, 'Label/Eyebrow', status, 'store/text-on-fill');
    }
    await storeFooter(sc);
  }

  /* ══ SCREEN 6 — OTP MODAL ════════════════════════════════════════════ */
  {
    const sc = screen('Store — OTP Modal', 8000);
    sc.resize(W, 900);
    sc.layoutMode = 'NONE';
    sc.fills = [P('cream/bg-page')];

    const scrim = figma.createRectangle();
    scrim.name = 'Scrim';
    scrim.resize(W, 900);
    scrim.fills = [{ type: 'SOLID', color: { r: 27 / 255, g: 25 / 255, b: 22 / 255 }, opacity: 0.6 }];
    sc.appendChild(scrim);
    scrim.x = 0; scrim.y = 0;

    const card = AL('VERTICAL', {
      name: 'OTP Card', itemSpacing: 19,
      paddingTop: 40, paddingBottom: 32, paddingLeft: 32, paddingRight: 32,
    });
    card.counterAxisAlignItems = 'CENTER';
    card.fills = [P('store/bg-surface')];
    card.strokes = [P('cream/border')]; card.strokeWeight = 1;
    await card.setEffectStyleIdAsync(E['Elevation/Modal'].id);
    sc.appendChild(card);
    card.resize(400, 100);
    card.layoutSizingHorizontal = 'FIXED';
    card.x = (W - 400) / 2; card.y = 240;

    await T(card, 'Display/H2', '☺', 'accent/on-cream');
    await T(card, 'Display/H2', 'Verify your number', 'cream/text-primary');
    const sub = await T(card, 'Body/Small', 'We sent a 6-digit code to +91 98765 43210', 'cream/text-muted', { fill: true });
    sub.textAlignHorizontal = 'CENTER';

    const digits = AL('HORIZONTAL', { itemSpacing: 8, name: 'Digits' });
    card.appendChild(digits);
    for (let i = 0; i < 6; i++) {
      const d = AL('VERTICAL', {});
      d.primaryAxisAlignItems = 'CENTER'; d.counterAxisAlignItems = 'CENTER';
      d.primaryAxisSizingMode = 'FIXED'; d.counterAxisSizingMode = 'FIXED';
      d.resize(45, 51);
      d.fills = [P('store/bg-surface')];
      d.strokes = [P(i < 4 ? 'accent/green' : 'cream/border')];
      d.strokeWeight = 2;
      digits.appendChild(d);
      await T(d, 'Display/H3', i < 4 ? String([4, 8, 2, 1][i]) : '', 'cream/text-primary');
    }
    await T(card, 'Body/Caption', 'Resend code in 0:24', 'cream/text-muted');
    const verify = inst('Button', 'Style=Gold, Size=Default');
    setProps(verify, { Label: 'Verify & Continue' });
    card.appendChild(verify);
    verify.layoutSizingHorizontal = 'FILL';
    await T(card, 'Body/Caption', 'Cancel', 'cream/text-muted');
  }

  for (const t of _trash) t.remove();

  const summary = 'IYKA 05 — store screens built: Listing, Product Detail, Cart, Checkout, Profile, OTP Modal';
  console.log(summary);
  figma.currentPage.selection = [];
  return summary;

})();
