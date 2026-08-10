/* ════════════════════════════════════════════════════════════════════════════
   IYKA-ARAM · 02 — Commerce components
   Page: 02 · Components

   The IYKA Living Store, from the .store-* rules in src/app/globals.css.
   Note the store sits on WHITE surfaces, not cream — this script adds the two
   missing store tokens to the Brand collection before building.

   Standard Figma Plugin API only. Safe to re-run.
   ════════════════════════════════════════════════════════════════════════════ */

(async () => {

  /* ── prelude ─────────────────────────────────────────────────────────── */
  const V = {}, S = {}, E = {};

  async function reindex() {
    for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
  }
  async function boot() {
    await reindex();
    for (const s of await figma.getLocalTextStylesAsync()) S[s.name] = s;
    for (const s of await figma.getLocalEffectStylesAsync()) E[s.name] = s;
    await Promise.all([
      ['Cormorant Garamond', 'Light'], ['Cormorant Garamond', 'Regular'],
      ['DM Sans', 'Regular'], ['DM Sans', 'Medium'], ['DM Sans', 'SemiBold'], ['DM Sans', 'Bold'],
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

  await boot();

  /* ── token top-up ─────────────────────────────────────────────────────────
     The store renders on #fff, which the brand semantic layer did not cover.
     Added here rather than hardcoded, so the store stays token-driven.
     ─────────────────────────────────────────────────────────────────────── */
  {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const brand = collections.find(c => c.name === 'Brand');
    if (!brand) throw new Error('collection "Brand" not found');
    const mode = brand.modes[0].modeId;

    const additions = [
      ['store/bg-surface', 'brand/neutral/white', ['FRAME_FILL', 'SHAPE_FILL'], 'var(--store-bg-surface)'],
      ['store/text-on-fill', 'brand/neutral/white', ['TEXT_FILL'], 'var(--store-text-on-fill)'],
    ];
    for (const [name, target, scopes, css] of additions) {
      if (V[name]) continue;                       // idempotent
      if (!V[target]) throw new Error('missing var ' + target);
      const v = figma.variables.createVariable(name, brand, 'COLOR');
      v.setValueForMode(mode, { type: 'VARIABLE_ALIAS', id: V[target].id });
      v.scopes = scopes;
      v.setVariableCodeSyntax('WEB', css);
    }
    await reindex();
  }

  /* ── page + cleanup ──────────────────────────────────────────────────── */
  const page = figma.root.children.find(p => p.name === '02 · Components');
  if (!page) throw new Error('page "02 · Components" not found');
  await figma.setCurrentPageAsync(page);

  const OWNED = [
    'Product Card', 'Filter Chip', 'Cart Line', 'Qty Control', 'Trust Chip',
    'Price Block', '· Commerce components',
  ];
  for (const child of [...page.children]) {
    if (OWNED.indexOf(child.name) !== -1) child.remove();
  }

  const made = {};
  const COL_X = 900;          // second column, right of the brand components
  let cursorY = 240;

  const banner = AL('VERTICAL', { name: '· Commerce components', itemSpacing: 8 });
  page.appendChild(banner);
  banner.x = COL_X; banner.y = 100;
  await T(banner, 'Label/Section', 'Component library', 'accent/on-cream');
  await T(banner, 'Display/H2', 'IYKA Living Store', 'cream/text-primary');

  /* ── 1. Price Block — current / MRP / discount tag ─────────────────────── */
  {
    const c = ALC('HORIZONTAL', { name: 'Price Block', itemSpacing: 10, counterAxisAlignItems: 'BASELINE' });
    await T(c, 'Label/Price', '₹ 849', 'cream/text-primary', { name: 'Price' });
    const mrp = await T(c, 'Body/Small', '₹ 999', 'cream/text-muted', { name: 'MRP' });
    mrp.textDecoration = 'STRIKETHROUGH';
    const tag = AL('HORIZONTAL', { name: 'Discount', paddingTop: 3, paddingBottom: 3, paddingLeft: 8, paddingRight: 8 });
    tag.fills = [P('accent/green')];
    c.appendChild(tag);
    await T(tag, 'Label/Eyebrow', '15% off', 'store/text-on-fill');
    c.description = 'Price / MRP / saving. MRP is struck through; the saving chip uses forest green, never red.';
    const pp = c.addComponentProperty('Price', 'TEXT', '₹ 849');
    const pm = c.addComponentProperty('MRP', 'TEXT', '₹ 999');
    c.findOne(n => n.name === 'Price').componentPropertyReferences = { characters: pp };
    c.findOne(n => n.name === 'MRP').componentPropertyReferences = { characters: pm };
    page.appendChild(c);
    c.x = COL_X; c.y = cursorY;
    made['Price Block'] = c.id;
    cursorY += c.height + 80;
  }

  /* ── 2. Filter Chip — .store-filter-btn, default + active ──────────────── */
  {
    const variants = [];
    for (const state of ['Default', 'Active']) {
      const active = state === 'Active';
      const c = ALC('HORIZONTAL', {
        name: 'State=' + state,
        paddingTop: 8, paddingBottom: 8, paddingLeft: 19, paddingRight: 19,
      });
      c.fills = active ? [P('cream/text-primary')] : [];
      c.strokes = [P(active ? 'cream/text-primary' : 'cream/border')];
      c.strokeWeight = 1.5;
      radius(c, 'radius/xs');
      await T(c, 'Body/Small', 'Hair Care', active ? 'store/text-on-fill' : 'cream/text-secondary', { name: 'Label' });
      page.appendChild(c);
      variants.push(c);
    }
    const set = figma.combineAsVariants(variants, page);
    set.name = 'Filter Chip';
    set.description = 'Category filter on the store listing. 2px radius — the one place the store softens.';
    set.layoutMode = 'HORIZONTAL';
    set.primaryAxisSizingMode = 'AUTO';
    set.counterAxisSizingMode = 'AUTO';
    set.itemSpacing = 16;
    set.paddingTop = 24; set.paddingBottom = 24; set.paddingLeft = 24; set.paddingRight = 24;
    set.fills = [P('cream/bg-alt')];
    set.x = COL_X; set.y = cursorY;
    const propId = set.addComponentProperty('Label', 'TEXT', 'Hair Care');
    for (const v of set.children) {
      const l = v.findOne(n => n.type === 'TEXT' && n.name === 'Label');
      if (l) l.componentPropertyReferences = { characters: propId };
    }
    made['Filter Chip'] = set.id;
    cursorY = set.y + set.height + 80;
  }

  /* ── 3. Qty Control — .store-qty-control ───────────────────────────────── */
  {
    const c = ALC('HORIZONTAL', { name: 'Qty Control', itemSpacing: 0, counterAxisAlignItems: 'CENTER' });
    c.strokes = [P('cream/border')];
    c.strokeWeight = 1.5;
    radius(c, 'radius/none');

    function btn(glyph) {
      const b = AL('VERTICAL', { name: 'Btn ' + glyph });
      b.primaryAxisAlignItems = 'CENTER';
      b.counterAxisAlignItems = 'CENTER';
      b.primaryAxisSizingMode = 'FIXED';
      b.counterAxisSizingMode = 'FIXED';
      b.resize(35, 35);
      b.fills = [P('cream/bg-page')];
      return b;
    }
    const minus = btn('−'); c.appendChild(minus);
    await T(minus, 'Body/Base', '−', 'cream/text-primary');

    const val = AL('VERTICAL', { name: 'Value' });
    val.primaryAxisAlignItems = 'CENTER';
    val.counterAxisAlignItems = 'CENTER';
    val.primaryAxisSizingMode = 'FIXED';
    val.counterAxisSizingMode = 'FIXED';
    val.resize(45, 35);
    c.appendChild(val);
    await T(val, 'Body/Small', '1', 'cream/text-primary', { name: 'Qty' });

    const plus = btn('+'); c.appendChild(plus);
    await T(plus, 'Body/Base', '+', 'cream/text-primary');

    c.description = 'Quantity stepper, used on product detail and in the cart.';
    page.appendChild(c);
    c.x = COL_X; c.y = cursorY;
    made['Qty Control'] = c.id;
    cursorY += c.height + 80;
  }

  /* ── 4. Trust Chip — .store-trust-chip ─────────────────────────────────── */
  {
    const c = ALC('HORIZONTAL', {
      name: 'Trust Chip',
      paddingTop: 5, paddingBottom: 5, paddingLeft: 11, paddingRight: 11,
    });
    c.fills = [P('store/bg-surface')];
    c.strokes = [P('cream/border')];
    c.strokeWeight = 1;
    radius(c, 'radius/none');
    await T(c, 'Body/Caption', '100% Natural', 'cream/text-secondary', { name: 'Label' });
    c.description = 'Reassurance chip on product detail — natural, no parabens, cash on delivery, etc.';
    const propId = c.addComponentProperty('Label', 'TEXT', '100% Natural');
    c.findOne(n => n.type === 'TEXT').componentPropertyReferences = { characters: propId };
    page.appendChild(c);
    c.x = COL_X; c.y = cursorY;
    made['Trust Chip'] = c.id;
    cursorY += c.height + 80;
  }

  /* ── 5. Product Card — .store-product-card ─────────────────────────────── */
  {
    const c = ALC('VERTICAL', { name: 'Product Card', itemSpacing: 0 });
    c.resize(300, 100);
    c.layoutSizingHorizontal = 'FIXED';
    c.fills = [P('store/bg-surface')];
    c.strokes = [P('cream/border')];
    c.strokeWeight = 1;
    radius(c, 'radius/none');

    // 1:1 image slot — screens override .fills with an imageHash
    const img = AL('VERTICAL', { name: 'Image' });
    img.fills = [P('cream/bg-page')];
    img.primaryAxisSizingMode = 'FIXED';
    img.counterAxisSizingMode = 'FIXED';
    c.appendChild(img);
    img.resize(300, 300);
    img.layoutSizingHorizontal = 'FILL';
    img.clipsContent = true;

    const badge = AL('HORIZONTAL', { name: 'Badge', paddingTop: 4, paddingBottom: 4, paddingLeft: 10, paddingRight: 10 });
    badge.fills = [P('accent/default')];
    img.appendChild(badge);
    badge.layoutPositioning = 'ABSOLUTE';
    badge.x = 12; badge.y = 12;
    await T(badge, 'Label/Eyebrow', 'Bestseller', 'store/text-on-fill');

    const info = AL('VERTICAL', {
      name: 'Info', itemSpacing: 6,
      paddingTop: 20, paddingBottom: 20, paddingLeft: 20, paddingRight: 20,
    });
    c.appendChild(info);
    info.layoutSizingHorizontal = 'FILL';

    await T(info, 'Label/Eyebrow', 'Hair Care', 'accent/on-cream', { name: 'Category', fill: true });
    await T(info, 'Display/Card Title', 'Keshanidhi Hair Oil', 'cream/text-primary', { name: 'Name', fill: true });
    await T(info, 'Body/Caption', 'Ancient Ayurvedic formula for stronger, lustrous hair', 'cream/text-muted', { name: 'Tagline', fill: true });

    const rating = AL('HORIZONTAL', { name: 'Rating', itemSpacing: 6, counterAxisAlignItems: 'CENTER' });
    info.appendChild(rating);
    await T(rating, 'Body/Caption', '★★★★★', 'accent/on-cream');
    await T(rating, 'Body/Caption', '4.8 (124)', 'cream/text-muted');

    const priceRow = AL('HORIZONTAL', { name: 'Price Row', itemSpacing: 10, counterAxisAlignItems: 'BASELINE', paddingTop: 6 });
    info.appendChild(priceRow);
    await T(priceRow, 'Label/Price', '₹ 849', 'cream/text-primary', { name: 'Price' });
    const mrp = await T(priceRow, 'Body/Small', '₹ 999', 'cream/text-muted', { name: 'MRP' });
    mrp.textDecoration = 'STRIKETHROUGH';

    const cta = AL('HORIZONTAL', { name: 'Add to Cart', paddingTop: 12, paddingBottom: 12 });
    cta.primaryAxisAlignItems = 'CENTER';
    cta.counterAxisAlignItems = 'CENTER';
    cta.fills = [P('cream/text-primary')];
    info.appendChild(cta);
    cta.layoutSizingHorizontal = 'FILL';
    await T(cta, 'Label/Button', 'Add to Cart', 'store/text-on-fill');

    c.description =
      'Store listing card. Hover in code lifts it 3px with Elevation/Store Card and scales the ' +
      'image 1.04. Badge is absolute-positioned inside the image slot.';

    const pn = c.addComponentProperty('Name', 'TEXT', 'Keshanidhi Hair Oil');
    const pc = c.addComponentProperty('Category', 'TEXT', 'Hair Care');
    const pt = c.addComponentProperty('Tagline', 'TEXT', 'Ancient Ayurvedic formula');
    const pp = c.addComponentProperty('Price', 'TEXT', '₹ 849');
    c.findOne(n => n.name === 'Name').componentPropertyReferences = { characters: pn };
    c.findOne(n => n.name === 'Category').componentPropertyReferences = { characters: pc };
    c.findOne(n => n.name === 'Tagline').componentPropertyReferences = { characters: pt };
    c.findOne(n => n.name === 'Price').componentPropertyReferences = { characters: pp };

    page.appendChild(c);
    c.x = COL_X; c.y = cursorY;
    made['Product Card'] = c.id;
    cursorY += c.height + 80;
  }

  /* ── 6. Cart Line — .store-cart-item ───────────────────────────────────── */
  {
    const c = ALC('HORIZONTAL', {
      name: 'Cart Line', itemSpacing: 19, counterAxisAlignItems: 'CENTER',
      paddingTop: 19, paddingBottom: 19, paddingLeft: 19, paddingRight: 19,
    });
    c.resize(680, 100);
    c.layoutSizingHorizontal = 'FIXED';
    c.fills = [P('store/bg-surface')];
    c.strokes = [P('cream/border')];
    c.strokeWeight = 1;
    radius(c, 'radius/none');

    const thumb = AL('VERTICAL', { name: 'Image' });
    thumb.fills = [P('cream/bg-page')];
    thumb.primaryAxisSizingMode = 'FIXED';
    thumb.counterAxisSizingMode = 'FIXED';
    c.appendChild(thumb);
    thumb.resize(90, 90);
    thumb.clipsContent = true;

    const mid = AL('VERTICAL', { name: 'Details', itemSpacing: 3 });
    c.appendChild(mid);
    mid.layoutSizingHorizontal = 'FILL';
    await T(mid, 'Display/Card Title', 'Keshanidhi Hair Oil', 'cream/text-primary', { name: 'Name', fill: true });
    await T(mid, 'Body/Caption', '100 ml', 'cream/text-muted', { name: 'Size', fill: true });
    await T(mid, 'Body/Small', '₹ 849', 'cream/text-primary', { name: 'Price', fill: true });

    const right = AL('VERTICAL', { name: 'Actions', itemSpacing: 10 });
    right.counterAxisAlignItems = 'MAX';
    c.appendChild(right);
    await T(right, 'Body/Caption', 'Remove', 'cream/text-muted', { name: 'Remove' });

    c.description = 'Cart row. Image / details / actions, matching the 90px 1fr auto grid in code.';
    const pn = c.addComponentProperty('Name', 'TEXT', 'Keshanidhi Hair Oil');
    c.findOne(n => n.name === 'Name').componentPropertyReferences = { characters: pn };

    page.appendChild(c);
    c.x = COL_X; c.y = cursorY;
    made['Cart Line'] = c.id;
  }

  const summary = 'IYKA 02 — commerce components built: ' + Object.keys(made).join(', ');
  console.log(summary);
  figma.currentPage.selection = [];
  return summary;

})();
