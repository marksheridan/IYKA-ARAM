/* ════════════════════════════════════════════════════════════════════════════
   IYKA-ARAM · 04 — Marketing site screens
   Page: 03 · Screens

   Home, About, Services, Gallery, Blog, Blog Post, Booking, Contact.
   Copy is verbatim from src/components/site/* and src/content/site.ts.
   Layout follows .v2-* in src/app/globals.css — container is
   min(90rem, 100% - 3rem), i.e. 1392px content inside a 1440px frame.

   Run AFTER 01-components-brand.js — it instances Button, Pillar Card,
   Service Row, Team Card, Testimonial Card and Booking Card.

   Standard Figma Plugin API only. Safe to re-run.
   ════════════════════════════════════════════════════════════════════════════ */

(async () => {

  /* ── image hashes (file cmFt5G4SRLrDXGmHHSb0PS) ──────────────────────── */
  const HASH = {
    hero:      '7033c781b15e45f146699cd863fb5d1b5f6de74a',
    hero2:     '01f504daf4d31050d5fda4989f06a6e5ebe79672',
    founder:   '3134edec6ea291736c3b6888e3a1ce370dfd8be1',
    event1:    'c885d91d212e46529d9a3e9f3f19b47c9df02e6b',
    event2:    '5da4363be1c5abaace017a7a85d20fa1f182f805',
    event3:    '0ead4d27ec62d2e46336f733aea6fe94be913856',
    hairOil:   '74bac57e95fdd528a5c42cb724d195b2a5f9e59f',
    soap:      'd252ae4968886a64e6a33579861a56cb58fc596e',
    aloe:      '9dd03b23851e3cb43cecc1dbdc75d4a795f1f2a1',
    g1:        'f739e93911c83a8c9c2889dc62ed6ad82ccc4d3d',
    g2:        '5afab62284143afb42a1c289e141e063d8a8ad1c',
    g3:        'e3664848217ccb86437b053d7bcd5f3f8d88747b',
    g4:        '5e2a3f3126832330a381b71d869db7deab82038a',
    g5:        '83850de433a19936d9679fc84b039156b3524b9f',
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
      ['Cormorant Garamond', 'Light Italic'], ['Cormorant Garamond', 'Italic'],
      ['DM Sans', 'Regular'], ['DM Sans', 'Medium'], ['DM Sans', 'SemiBold'], ['DM Sans', 'Bold'],
    ].map(([family, style]) => figma.loadFontAsync({ family, style })));
  }

  const P = (n) => {
    if (!V[n]) throw new Error('missing var ' + n);
    return figma.variables.setBoundVariableForPaint(
      { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[n]);
  };
  const IMGFILL = (h, mode) => ({ type: 'IMAGE', imageHash: h, scaleMode: mode || 'FILL' });

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
    if (!c) throw new Error('component "' + name + '" not found — run 01-components-brand.js first');
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
    s.resize(10, h);
    s.fills = [];
    s.name = 'spacer';
    parent.appendChild(s);
    s.layoutSizingHorizontal = 'FILL';
    return s;
  }

  const W = 1440, PAD = 80, CONTENT = W - PAD * 2;

  await boot();

  const page = figma.root.children.find(p => p.name === '03 · Screens');
  if (!page) throw new Error('page "03 · Screens" not found');
  await figma.setCurrentPageAsync(page);

  const OWNED = ['Home', 'About', 'Services', 'Gallery', 'Blog', 'Blog Post', 'Booking', 'Contact', '· Marketing site'];
  for (const child of [...page.children]) {
    if (OWNED.indexOf(child.name) !== -1) child.remove();
  }

  /* ── screen shell ────────────────────────────────────────────────────── */
  /* ── Which screens to build ──────────────────────────────────────────────
     Names listed in SKIP are not drawn: each is a near-duplicate of a screen
     already in the set, and a designer would not redraw the same layout twice.
     Remove a name from SKIP to build it. Kept screens are laid out
     contiguously, so skipping never leaves a gap on the canvas.
     ─────────────────────────────────────────────────────────────────────── */
  const SKIP = new Set([
    'About',      // founder block — already the About section of Home
    'Services',   // identical ten-discipline grid to Home
    'Contact',    // identical contact form to Home
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
    _place(name, f); f.y = 200;
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

  /* ── site header ─────────────────────────────────────────────────────── */
  async function siteHeader(parent) {
    const nav = AL('HORIZONTAL', {
      name: 'Site Header', counterAxisAlignItems: 'CENTER',
      paddingTop: 16, paddingBottom: 16, paddingLeft: PAD, paddingRight: PAD,
    });
    nav.fills = [P('dark/bg-page')];
    parent.appendChild(nav);
    nav.layoutSizingHorizontal = 'FILL';

    const brand = AL('VERTICAL', { itemSpacing: 0, name: 'Logo' });
    nav.appendChild(brand);
    await T(brand, 'Display/H4', 'IYKA-ARAM', 'dark/text-primary');
    await T(brand, 'Label/Eyebrow', 'Wellness Starts Here', 'accent/on-dark');

    const links = AL('HORIZONTAL', { itemSpacing: 32, name: 'Links', counterAxisAlignItems: 'CENTER' });
    nav.appendChild(links);
    links.layoutSizingHorizontal = 'FILL';
    links.primaryAxisAlignItems = 'MAX';
    for (const l of ['Mission', 'Services', 'Team', 'Gallery', 'Blog', 'Contact']) {
      await T(links, 'Label/Nav', l, 'dark/text-secondary');
    }

    const actions = AL('HORIZONTAL', { itemSpacing: 12, name: 'Actions', counterAxisAlignItems: 'CENTER' });
    nav.appendChild(actions);
    const store = AL('HORIZONTAL', { paddingTop: 8, paddingBottom: 8, paddingLeft: 18, paddingRight: 18, name: 'Store' });
    store.strokes = [P('accent/default')]; store.strokeWeight = 1;
    actions.appendChild(store);
    await T(store, 'Label/Eyebrow', 'Shop', 'accent/on-dark');
    const cta = inst('Button', 'Style=Gold, Size=Small');
    setProps(cta, { Label: 'Book Now' });
    actions.appendChild(cta);
    return nav;
  }

  /* ── site footer ─────────────────────────────────────────────────────── */
  async function siteFooter(parent) {
    const f = AL('VERTICAL', {
      name: 'Site Footer', itemSpacing: 40,
      paddingTop: 48, paddingBottom: 32, paddingLeft: PAD, paddingRight: PAD,
    });
    f.fills = [P('dark/bg-page')];
    parent.appendChild(f);
    f.layoutSizingHorizontal = 'FILL';

    const cols = AL('HORIZONTAL', { itemSpacing: 48, name: 'Columns' });
    f.appendChild(cols);
    cols.layoutSizingHorizontal = 'FILL';

    const brandCol = AL('VERTICAL', { itemSpacing: 16, name: 'Brand' });
    cols.appendChild(brandCol);
    brandCol.layoutSizingHorizontal = 'FILL';
    await T(brandCol, 'Display/H3', 'IYKA-ARAM', 'dark/text-primary');
    await T(brandCol, 'Body/Small',
      'Clinical wellness in Northeast India. Functional Medicine, Yoga & Naturopathy — drugless, integrative healthcare in Meghalaya.',
      'dark/text-muted', { fill: true });

    const groups = [
      ['Explore', ['Mission', 'Services', 'Team', 'Gallery', 'Blog']],
      ['Services', ['Functional Medicine', 'Clinical Nutrition', 'Naturopathy', 'Yoga Therapy', 'Panchakarma']],
      ['Contact', ['hello@iyka-aram.com', '+91 00000 00000', 'Meghalaya, Northeast India']],
    ];
    for (const [heading, items] of groups) {
      const col = AL('VERTICAL', { itemSpacing: 12, name: heading });
      cols.appendChild(col);
      col.layoutSizingHorizontal = 'FILL';
      await T(col, 'Label/Eyebrow', heading, 'dark/text-primary');
      for (const i of items) await T(col, 'Body/Small', i, 'dark/text-muted', { fill: true });
    }

    const bottom = AL('HORIZONTAL', { name: 'Bottom', paddingTop: 24, counterAxisAlignItems: 'CENTER' });
    bottom.strokes = [P('dark/border')];
    bottom.strokeWeight = 1;
    bottom.strokeTopWeight = 1; bottom.strokeBottomWeight = 0;
    bottom.strokeLeftWeight = 0; bottom.strokeRightWeight = 0;
    f.appendChild(bottom);
    bottom.layoutSizingHorizontal = 'FILL';
    await T(bottom, 'Body/Caption', '© 2026 IYKA-ARAM Wellness. All rights reserved.', 'dark/text-muted', { fill: true });
    await T(bottom, 'Body/Caption', 'Privacy · Terms', 'dark/text-muted');
    return f;
  }

  /* ── section heading helper ──────────────────────────────────────────── */
  async function heading(parent, kicker, title, titleStyle, kickerVar, titleVar, maxW) {
    const h = AL('VERTICAL', { itemSpacing: 16, name: 'Heading' });
    parent.appendChild(h);
    h.layoutSizingHorizontal = 'FILL';
    await T(h, 'Label/Section', kicker, kickerVar);
    const t = await T(h, titleStyle, title, titleVar);
    t.textAutoResize = 'HEIGHT';
    t.resize(maxW || CONTENT, t.height);
    return h;
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 1 — HOME
     ══════════════════════════════════════════════════════════════════════ */
  const home = screen('Home', 0);
  await siteHeader(home);

  /* Hero — .v2-hero, 100svh, cross-fading photo + left-weighted gradient */
  {
    const hero = AL('VERTICAL', { name: 'Hero' });
    hero.primaryAxisSizingMode = 'FIXED';
    hero.counterAxisSizingMode = 'FIXED';
    home.appendChild(hero);
    hero.resize(W, 820);
    hero.layoutSizingHorizontal = 'FILL';
    hero.fills = [IMGFILL(HASH.hero)];
    hero.clipsContent = true;

    const overlay = figma.createRectangle();
    overlay.name = 'Overlay';
    overlay.resize(W, 820);
    overlay.fills = [{
      type: 'GRADIENT_LINEAR',
      gradientTransform: [[1, 0, 0], [0, 1, 0]],
      gradientStops: [
        { position: 0,    color: { r: 20 / 255, g: 35 / 255, b: 18 / 255, a: 0.92 } },
        { position: 0.4,  color: { r: 20 / 255, g: 35 / 255, b: 18 / 255, a: 0.75 } },
        { position: 0.7,  color: { r: 20 / 255, g: 35 / 255, b: 18 / 255, a: 0.35 } },
        { position: 1,    color: { r: 20 / 255, g: 35 / 255, b: 18 / 255, a: 0.15 } },
      ],
    }];
    hero.appendChild(overlay);
    overlay.layoutPositioning = 'ABSOLUTE';
    overlay.x = 0; overlay.y = 0;

    const content = AL('VERTICAL', { name: 'Hero Content', itemSpacing: 0 });
    hero.appendChild(content);
    content.layoutPositioning = 'ABSOLUTE';
    content.x = PAD; content.y = 240;
    content.resize(704, 400);
    content.layoutSizingHorizontal = 'FIXED';

    await T(content, 'Label/Section', 'Shillong · Meghalaya · Northeast India', 'accent/on-dark');
    spacer(content, 24);

    const h1 = figma.createText();
    content.appendChild(h1);
    await h1.setTextStyleIdAsync(S['Display/Hero'].id);
    h1.characters = 'Clinical Wellness.\nThe Drugless\nHealthcare.';
    h1.fills = [P('dark/text-primary')];
    h1.textAutoResize = 'HEIGHT';
    h1.layoutSizingHorizontal = 'FILL';
    // "The Drugless" is italic gold — line 2
    const start = 'Clinical Wellness.\n'.length;
    const end = start + 'The Drugless'.length;
    h1.setRangeFontName(start, end, { family: 'Cormorant Garamond', style: 'Light Italic' });
    h1.setRangeFills(start, end, [P('accent/on-dark')]);

    spacer(content, 24);
    await T(content, 'Body/Lead', 'Ancient wisdom meets modern clinical science.', 'dark/text-secondary', { fill: true });
    spacer(content, 32);

    const btns = AL('HORIZONTAL', { itemSpacing: 16, name: 'Actions' });
    content.appendChild(btns);
    const b1 = inst('Button', 'Style=Gold, Size=Default');
    setProps(b1, { Label: 'Book a Consultation' });
    btns.appendChild(b1);
    const b2 = inst('Button', 'Style=Outline Cream, Size=Default');
    setProps(b2, { Label: 'Explore Services' });
    btns.appendChild(b2);
  }

  /* Marquee — .v2-marquee-section */
  {
    const m = AL('HORIZONTAL', {
      name: 'Marquee', itemSpacing: 0, counterAxisAlignItems: 'CENTER',
      paddingTop: 16, paddingBottom: 16, paddingLeft: PAD, paddingRight: PAD,
    });
    m.fills = [P('accent/green')];
    home.appendChild(m);
    m.layoutSizingHorizontal = 'FILL';
    const items = ['Functional Medicine', 'Yoga Therapy', 'Naturopathy', 'Clinical Nutrition',
                   'Ayurveda', 'Panchakarma', 'Hydrotherapy', 'Physiotherapy'];
    for (const i of items) {
      const wrap = AL('HORIZONTAL', { itemSpacing: 32, counterAxisAlignItems: 'CENTER', paddingLeft: 16, paddingRight: 16 });
      m.appendChild(wrap);
      await T(wrap, 'Display/Marquee', i, 'accent/on-dark');
      const dot = figma.createEllipse();
      dot.resize(6, 6);
      dot.fills = [P('accent/default')];
      wrap.appendChild(dot);
    }
  }

  /* Mission — .v2-mission-grid, stats left / copy right */
  {
    const s = band(home, 'cream/bg-page', 112);
    const grid = AL('HORIZONTAL', { itemSpacing: 80, name: 'Mission Grid', counterAxisAlignItems: 'CENTER' });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';

    const stats = AL('VERTICAL', { itemSpacing: 0, name: 'Stats' });
    grid.appendChild(stats);
    stats.resize(480, 100);
    stats.layoutSizingHorizontal = 'FIXED';
    const rows = [['10+', 'Disciplines of healing'], ['5', 'Sub-brands under IYKA'], ['2019', 'Founded in Shillong']];
    for (let i = 0; i < rows.length; i++) {
      const blk = AL('VERTICAL', { itemSpacing: 5, paddingTop: 32, paddingBottom: 32 });
      stats.appendChild(blk);
      blk.layoutSizingHorizontal = 'FILL';
      await T(blk, 'Display/Stat', rows[i][0], 'cream/text-primary');
      await T(blk, 'Body/Small', rows[i][1], 'cream/text-secondary', { fill: true });
      if (i < rows.length - 1) {
        const d = figma.createRectangle();
        d.resize(100, 1);
        d.fills = [P('cream/border')];
        stats.appendChild(d);
        d.layoutSizingHorizontal = 'FILL';
      }
    }

    const copy = AL('VERTICAL', { itemSpacing: 0, name: 'Copy' });
    grid.appendChild(copy);
    copy.layoutSizingHorizontal = 'FILL';
    await T(copy, 'Label/Section', 'Our Mission', 'accent/on-cream');
    spacer(copy, 19);
    const h2 = figma.createText();
    copy.appendChild(h2);
    await h2.setTextStyleIdAsync(S['Display/H2'].id);
    h2.characters = 'Making healthcare understandable and simple for all.';
    h2.fills = [P('cream/text-primary')];
    h2.textAutoResize = 'HEIGHT';
    h2.layoutSizingHorizontal = 'FILL';
    h2.setRangeFontName(20, 34, { family: 'Cormorant Garamond', style: 'Light Italic' });
    spacer(copy, 24);
    await T(copy, 'Body/Lead',
      'We believe your body has an innate ability to heal — when given the right conditions. At IYKA-ARAM, we combine the precision of functional medicine with the wisdom of naturopathy, yoga, and Ayurveda to address the root cause of illness, not just its symptoms.',
      'cream/text-secondary', { fill: true });
    spacer(copy, 16);
    await T(copy, 'Body/Lead',
      'Based in the misty hills of Shillong, Meghalaya, we serve Northeast India and beyond — in-person and online.',
      'cream/text-secondary', { fill: true });
    spacer(copy, 32);
    const sig = AL('HORIZONTAL', { itemSpacing: 16, counterAxisAlignItems: 'CENTER' });
    copy.appendChild(sig);
    const line = figma.createRectangle();
    line.resize(48, 1);
    line.fills = [P('accent/default')];
    sig.appendChild(line);
    await T(sig, 'Display/Quote', 'Dr. Emidaka — Founder', 'accent/on-cream');

    // Pillars
    spacer(s, 64);
    const pillars = AL('HORIZONTAL', { itemSpacing: 24, name: 'Pillars', paddingTop: 48 });
    pillars.strokes = [P('cream/border')];
    pillars.strokeWeight = 1;
    pillars.strokeTopWeight = 1; pillars.strokeBottomWeight = 0;
    pillars.strokeLeftWeight = 0; pillars.strokeRightWeight = 0;
    s.appendChild(pillars);
    pillars.layoutSizingHorizontal = 'FILL';
    const pdata = [
      ['Drugless', 'We address the root cause — not the symptom. No unnecessary prescriptions, just your body healing itself.'],
      ['Integrative', 'Ten healing disciplines working in harmony: Naturopathy, Yoga, Ayurveda, Nutrition, and more.'],
      ['Longevity', 'Building health that lasts — through lifestyle, nutrition, and daily practices tailored to you.'],
    ];
    for (const [title, body] of pdata) {
      const p = inst('Pillar Card');
      setProps(p, { Title: title, Body: body });
      pillars.appendChild(p);
      p.layoutSizingHorizontal = 'FILL';
    }
  }

  /* Recognition */
  {
    const s = band(home, 'cream/bg-alt', 56);
    const row = AL('HORIZONTAL', { itemSpacing: 64, name: 'Recognition' });
    row.primaryAxisAlignItems = 'CENTER';
    s.appendChild(row);
    row.layoutSizingHorizontal = 'FILL';
    for (const r of ['Ministry of AYUSH, Govt. of India', 'Ministry of Education, Govt. of India', 'Govt. of Meghalaya']) {
      const item = AL('HORIZONTAL', { itemSpacing: 12, counterAxisAlignItems: 'CENTER' });
      row.appendChild(item);
      const mono = AL('VERTICAL', {});
      mono.primaryAxisAlignItems = 'CENTER';
      mono.counterAxisAlignItems = 'CENTER';
      mono.primaryAxisSizingMode = 'FIXED';
      mono.counterAxisSizingMode = 'FIXED';
      mono.resize(52, 52);
      mono.strokes = [P('cream/border-accent')];
      mono.strokeWeight = 1;
      item.appendChild(mono);
      await T(mono, 'Display/Card Title', r.slice(0, 2).toUpperCase(), 'accent/on-cream');
      await T(item, 'Body/Small', r, 'cream/text-secondary');
    }
  }

  /* Services — dark band, ten disciplines */
  {
    const s = band(home, 'dark/bg-page', 112);
    const head = AL('HORIZONTAL', { name: 'Head', counterAxisAlignItems: 'MAX' });
    s.appendChild(head);
    head.layoutSizingHorizontal = 'FILL';
    const hl = AL('VERTICAL', { itemSpacing: 16 });
    head.appendChild(hl);
    hl.layoutSizingHorizontal = 'FILL';
    await T(hl, 'Label/Section', 'What We Offer', 'accent/on-dark');
    const ht = await T(hl, 'Display/H2', 'Healing without the prescription pad.', 'dark/text-primary');
    ht.textAutoResize = 'HEIGHT'; ht.resize(520, ht.height);
    const all = inst('Button', 'Style=Outline Cream, Size=Default');
    setProps(all, { Label: 'All Services' });
    head.appendChild(all);

    spacer(s, 56);
    const grid = AL('VERTICAL', { itemSpacing: 0, name: 'Services Grid' });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';
    const services = [
      ['01', 'Functional Medicine Consultation', 'Root-cause analysis to understand what drives your symptoms'],
      ['02', 'Clinical Nutrition', 'Food as medicine — personalised therapeutic diet plans'],
      ['03', 'Naturopathy', 'Drug-free healing using natural methods and elements'],
      ['04', 'Yoga Therapy', 'Therapeutic yoga for chronic conditions & mental wellness'],
      ['05', 'Ayurveda', 'Ancient wisdom adapted to modern clinical protocols'],
      ['06', 'Panchakarma', 'Detox, cleanse and rejuvenate through classical Ayurvedic procedures'],
      ['07', 'Hydrotherapy', 'Water-based treatments for pain, injury and recovery'],
      ['08', 'Mud Therapy', 'Therapeutic earth applications for inflammation and skin'],
      ['09', 'Physiotherapy', 'Movement-based rehabilitation and chronic pain management'],
      ['10', 'Online Consultation', 'Access expert care from anywhere in Northeast India and beyond'],
    ];
    for (let i = 0; i < services.length; i += 2) {
      const row = AL('HORIZONTAL', { itemSpacing: 0 });
      grid.appendChild(row);
      row.layoutSizingHorizontal = 'FILL';
      for (const [num, name, desc] of services.slice(i, i + 2)) {
        const r = inst('Service Row');
        setProps(r, { Number: num, Name: name, Desc: desc });
        row.appendChild(r);
        r.layoutSizingHorizontal = 'FILL';
      }
    }
  }

  /* About / founder */
  {
    const s = band(home, 'cream/bg-alt', 112);
    const grid = AL('HORIZONTAL', { itemSpacing: 80, name: 'About Grid', counterAxisAlignItems: 'CENTER' });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';

    const imgWrap = AL('VERTICAL', { name: 'Portrait' });
    imgWrap.primaryAxisSizingMode = 'FIXED';
    imgWrap.counterAxisSizingMode = 'FIXED';
    grid.appendChild(imgWrap);
    imgWrap.resize(520, 693);
    imgWrap.fills = [IMGFILL(HASH.founder)];
    imgWrap.clipsContent = false;
    const badge = AL('VERTICAL', { itemSpacing: 3, paddingTop: 16, paddingBottom: 16, paddingLeft: 19, paddingRight: 19 });
    badge.primaryAxisAlignItems = 'CENTER';
    badge.counterAxisAlignItems = 'CENTER';
    badge.fills = [P('accent/default')];
    imgWrap.appendChild(badge);
    badge.layoutPositioning = 'ABSOLUTE';
    badge.x = 380; badge.y = 620;
    await T(badge, 'Display/H3', '10+', 'accent/fg');
    await T(badge, 'Label/Eyebrow', 'Years of\nClinical Practice', 'accent/fg');

    const copy = AL('VERTICAL', { itemSpacing: 0, name: 'Copy' });
    grid.appendChild(copy);
    copy.layoutSizingHorizontal = 'FILL';
    await T(copy, 'Label/Section', 'Meet the Founder', 'accent/on-cream');
    spacer(copy, 19);
    await T(copy, 'Display/H2', 'Dr. Emidaka', 'cream/text-primary', { fill: true });
    spacer(copy, 8);
    await T(copy, 'Label/Eyebrow', 'B.Nat, M.Sc Clinical Nutrition · Functional Medicine Practitioner', 'accent/on-cream', { fill: true });
    spacer(copy, 29);
    const quote = AL('VERTICAL', { paddingLeft: 24, name: 'Quote' });
    quote.strokes = [P('accent/default')];
    quote.strokeWeight = 2;
    quote.strokeLeftWeight = 2; quote.strokeRightWeight = 0;
    quote.strokeTopWeight = 0; quote.strokeBottomWeight = 0;
    copy.appendChild(quote);
    quote.layoutSizingHorizontal = 'FILL';
    await T(quote, 'Display/Quote', '"Making healthcare understandable and simple for all."', 'cream/text-primary', { fill: true });
    spacer(copy, 29);
    await T(copy, 'Body/Base',
      'Dr. Emidaka founded IYKA-ARAM in Shillong with a vision to bring integrative, root-cause healthcare to Northeast India. With a background in Naturopathy and Clinical Nutrition, she has built a practice that bridges ancient healing traditions with evidence-based functional medicine.',
      'cream/text-secondary', { fill: true });
    spacer(copy, 19);
    await T(copy, 'Body/Base',
      'Recognised by the Ministry of AYUSH and the Government of Meghalaya, her work spans clinical consultations, wellness education, yoga therapy retreats, and community outreach through the IYKA Roots Foundation.',
      'cream/text-secondary', { fill: true });
    spacer(copy, 32);
    const acts = AL('HORIZONTAL', { itemSpacing: 16 });
    copy.appendChild(acts);
    const a1 = inst('Button', 'Style=Gold, Size=Default');
    setProps(a1, { Label: 'Book with Dr. Emidaka' });
    acts.appendChild(a1);
    const a2 = inst('Button', 'Style=Outline Dark, Size=Default');
    setProps(a2, { Label: 'Full Profile' });
    acts.appendChild(a2);
  }

  /* Team — dark */
  {
    const s = band(home, 'dark/bg-page', 112);
    const head = AL('VERTICAL', { itemSpacing: 16, name: 'Head' });
    head.counterAxisAlignItems = 'CENTER';
    s.appendChild(head);
    head.layoutSizingHorizontal = 'FILL';
    await T(head, 'Label/Section', 'The Practitioners', 'accent/on-dark');
    const h = figma.createText();
    head.appendChild(h);
    await h.setTextStyleIdAsync(S['Display/H2'].id);
    h.characters = 'Guided by specialists,\nnot generalists.';
    h.fills = [P('dark/text-primary')];
    h.textAlignHorizontal = 'CENTER';
    h.textAutoResize = 'HEIGHT';
    h.layoutSizingHorizontal = 'FILL';
    h.setRangeFontName(24, 39, { family: 'Cormorant Garamond', style: 'Light Italic' });
    h.setRangeFills(24, 39, [P('accent/on-dark')]);

    spacer(s, 56);
    const grid = AL('HORIZONTAL', { itemSpacing: 24, name: 'Team Grid' });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';
    const team = [
      ['Dr. Emidaka', 'Founder & Functional Medicine Practitioner', 'Naturopathy · Clinical Nutrition', HASH.founder],
      ['Priya Dkhar', 'Senior Yoga Therapist', 'Yoga Therapy · Meditation', null],
      ['Richfield K.', 'Clinical Nutritionist', 'Therapeutic Nutrition · Gut Health', null],
      ['Banri Phira', 'Ayurveda & Naturopath', 'Ayurveda · Panchakarma', null],
    ];
    for (const [name, role, spec, photo] of team) {
      const card = inst('Team Card');
      setProps(card, { Name: name, Role: role, Speciality: spec });
      grid.appendChild(card);
      card.layoutSizingHorizontal = 'FILL';
      if (photo) {
        const slot = card.findOne(n => n.name === 'Photo');
        if (slot) {
          slot.fills = [IMGFILL(photo)];
          const ini = slot.findOne(n => n.name === 'Initials');
          if (ini) ini.visible = false;
        }
      }
    }
  }

  /* Products teaser — cream */
  {
    const s = band(home, 'cream/bg-page', 112);
    const head = AL('HORIZONTAL', { counterAxisAlignItems: 'MAX', name: 'Head' });
    s.appendChild(head);
    head.layoutSizingHorizontal = 'FILL';
    const hl = AL('VERTICAL', { itemSpacing: 16 });
    head.appendChild(hl);
    hl.layoutSizingHorizontal = 'FILL';
    await T(hl, 'Label/Section', 'IYKA Living', 'accent/on-cream');
    await T(hl, 'Display/H2', 'Apothecary, made in the hills.', 'cream/text-primary');
    const shop = inst('Button', 'Style=Outline Dark, Size=Default');
    setProps(shop, { Label: 'Visit the Store' });
    head.appendChild(shop);

    spacer(s, 48);
    const grid = AL('HORIZONTAL', { itemSpacing: 24, name: 'Products' });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';
    const prods = [
      ['Keshanidhi Hair Oil', 'Hair Care', '₹ 849', HASH.hairOil],
      ['Herbal Organic Soap', 'Skin Care', '₹ 299', HASH.soap],
      ['Aloe Vera Gel', 'Skin Care', '₹ 349', HASH.aloe],
    ];
    for (const [name, cat, price, img] of prods) {
      const card = AL('VERTICAL', { itemSpacing: 16, name: name });
      grid.appendChild(card);
      card.layoutSizingHorizontal = 'FILL';
      const im = AL('VERTICAL', {});
      im.primaryAxisSizingMode = 'FIXED';
      im.counterAxisSizingMode = 'FIXED';
      card.appendChild(im);
      im.resize(440, 587);
      im.layoutSizingHorizontal = 'FILL';
      im.fills = [IMGFILL(img)];
      const info = AL('VERTICAL', { itemSpacing: 5 });
      card.appendChild(info);
      info.layoutSizingHorizontal = 'FILL';
      await T(info, 'Label/Eyebrow', cat, 'accent/on-cream', { fill: true });
      await T(info, 'Display/Card Title', name, 'cream/text-primary', { fill: true });
      await T(info, 'Body/Small', price, 'cream/text-secondary', { fill: true });
    }
  }

  /* Events — mosaic */
  {
    const s = band(home, 'cream/bg-alt', 112);
    await heading(s, 'Out in the Community', 'Camps, retreats and outreach.', 'Display/H2', 'accent/on-cream', 'cream/text-primary', 700);
    spacer(s, 48);
    const grid = AL('HORIZONTAL', { itemSpacing: 16, name: 'Events' });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';

    const big = AL('VERTICAL', { name: 'Event Large' });
    big.primaryAxisSizingMode = 'FIXED';
    big.counterAxisSizingMode = 'FIXED';
    grid.appendChild(big);
    big.resize(800, 448);
    big.layoutSizingHorizontal = 'FILL';
    big.fills = [IMGFILL(HASH.event1)];

    const col = AL('VERTICAL', { itemSpacing: 16, name: 'Event Column' });
    grid.appendChild(col);
    col.layoutSizingHorizontal = 'FILL';
    for (const h of [HASH.event2, HASH.event3]) {
      const e = AL('VERTICAL', {});
      e.primaryAxisSizingMode = 'FIXED';
      e.counterAxisSizingMode = 'FIXED';
      col.appendChild(e);
      e.resize(560, 216);
      e.layoutSizingHorizontal = 'FILL';
      e.fills = [IMGFILL(h)];
    }
  }

  /* Testimonials */
  {
    const s = band(home, 'cream/bg-page', 112);
    await heading(s, 'In Their Words', 'Care that people come back for.', 'Display/H2', 'accent/on-cream', 'cream/text-primary', 700);
    spacer(s, 48);
    const grid = AL('HORIZONTAL', { itemSpacing: 24, name: 'Testimonials' });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';
    const quotes = [
      ['A completely different approach to health — I finally feel cared for as a whole person, not a set of symptoms.', 'Patient, Shillong'],
      ['The yoga and naturopathy programme changed my daily energy. Premium, calm, and genuinely effective.', 'Online Yoga Member'],
      ['Drugless care that actually works. The team is world-class and the setting is breathtaking.', 'Wellness Guest'],
    ];
    for (const [q, who] of quotes) {
      const c = inst('Testimonial Card', 'Surface=Cream');
      grid.appendChild(c);
      c.layoutSizingHorizontal = 'FILL';
      const qt = c.findOne(n => n.name === 'Quote');
      if (qt) qt.characters = q;
      const nm = c.findOne(n => n.name === 'Name');
      if (nm) nm.characters = who;
    }
  }

  /* Booking paths — dark */
  {
    const s = band(home, 'dark/bg-page', 112);
    const head = AL('VERTICAL', { itemSpacing: 16 });
    head.counterAxisAlignItems = 'CENTER';
    s.appendChild(head);
    head.layoutSizingHorizontal = 'FILL';
    await T(head, 'Label/Section', 'Start Here', 'accent/on-dark');
    await T(head, 'Display/H2', 'Three ways to begin.', 'dark/text-primary');
    spacer(s, 56);
    const grid = AL('HORIZONTAL', { itemSpacing: 24, name: 'Booking Paths' });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';
    const paths = [
      ['Functional Medicine', 'One-to-one with our doctors — root-cause care, offline at the centre or online by video.', '45–60 min · Offline / Online', 'Default'],
      ['Offline Sessions', 'Naturopathy and therapy sessions delivered in person at our Meghalaya centre.', 'At the centre · Book a slot', 'Featured'],
      ['Online Yoga Classes', 'Instructor-led group yoga, live online — join from anywhere, on a regular schedule.', 'Live online · Weekly schedule', 'Default'],
    ];
    for (const [title, desc, detail, state] of paths) {
      const c = inst('Booking Card', 'State=' + state);
      grid.appendChild(c);
      c.layoutSizingHorizontal = 'FILL';
      const t = c.findOne(n => n.name === 'Title'); if (t) t.characters = title;
      const d = c.findOne(n => n.name === 'Desc'); if (d) d.characters = desc;
      const det = c.findOne(n => n.name === 'Detail');
      if (det) { const dt = det.findOne(n => n.type === 'TEXT'); if (dt) dt.characters = detail; }
    }
  }

  /* CTA panel */
  {
    const s = band(home, 'accent/green', 112);
    const inner = AL('HORIZONTAL', { itemSpacing: 64, counterAxisAlignItems: 'CENTER', name: 'CTA' });
    s.appendChild(inner);
    inner.layoutSizingHorizontal = 'FILL';
    const l = AL('VERTICAL', { itemSpacing: 16 });
    inner.appendChild(l);
    l.layoutSizingHorizontal = 'FILL';
    await T(l, 'Label/Section', 'Ready when you are', 'accent/on-dark');
    await T(l, 'Display/H2', 'Your first consultation starts the change.', 'dark/text-primary', { fill: true });
    const r = AL('VERTICAL', { itemSpacing: 24 });
    inner.appendChild(r);
    r.layoutSizingHorizontal = 'FILL';
    await T(r, 'Body/Lead',
      'Book a root-cause consultation with our functional medicine team — at the centre in Shillong, or online from anywhere.',
      'dark/text-secondary', { fill: true });
    const cta = inst('Button', 'Style=Gold, Size=Default');
    setProps(cta, { Label: 'Book a Consultation' });
    r.appendChild(cta);
  }

  /* Location */
  {
    const s = band(home, 'cream/bg-page', 112);
    const grid = AL('HORIZONTAL', { itemSpacing: 64, counterAxisAlignItems: 'CENTER', name: 'Location' });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';
    const copy = AL('VERTICAL', { itemSpacing: 16 });
    grid.appendChild(copy);
    copy.layoutSizingHorizontal = 'FILL';
    await T(copy, 'Label/Section', 'Meghalaya', 'accent/on-cream');
    await T(copy, 'Display/H2', 'Healing, set in the cleanest corner of India', 'cream/text-primary', { fill: true });
    await T(copy, 'Body/Base',
      'Our centre is rooted in the hills of Meghalaya — clean air, living forests, and quiet. The setting is part of the medicine: a place designed to slow you down and bring you back to balance.',
      'cream/text-secondary', { fill: true });
    const map = AL('VERTICAL', { name: 'Map' });
    map.primaryAxisSizingMode = 'FIXED';
    map.counterAxisSizingMode = 'FIXED';
    grid.appendChild(map);
    map.resize(700, 352);
    map.layoutSizingHorizontal = 'FILL';
    map.fills = [IMGFILL(HASH.g3)];
    map.strokes = [P('cream/border')];
    map.strokeWeight = 1;
  }

  /* Contact */
  {
    const s = band(home, 'cream/bg-alt', 112);
    const grid = AL('HORIZONTAL', { itemSpacing: 80, name: 'Contact' });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';

    const left = AL('VERTICAL', { itemSpacing: 16 });
    grid.appendChild(left);
    left.layoutSizingHorizontal = 'FILL';
    await T(left, 'Label/Section', 'Get in Touch', 'accent/on-cream');
    await T(left, 'Display/H2', 'Talk to us.', 'cream/text-primary');
    spacer(left, 16);
    for (const [icon, label] of [['✉', 'hello@iyka-aram.com'], ['☎', '+91 00000 00000'], ['⌂', 'Meghalaya, Northeast India']]) {
      const row = AL('HORIZONTAL', { itemSpacing: 16, counterAxisAlignItems: 'CENTER', paddingTop: 6, paddingBottom: 6 });
      left.appendChild(row);
      row.layoutSizingHorizontal = 'FILL';
      const ic = AL('VERTICAL', {});
      ic.primaryAxisAlignItems = 'CENTER';
      ic.counterAxisAlignItems = 'CENTER';
      ic.primaryAxisSizingMode = 'FIXED';
      ic.counterAxisSizingMode = 'FIXED';
      ic.resize(35, 35);
      ic.fills = [P('cream/bg-alt')];
      row.appendChild(ic);
      await T(ic, 'Body/Base', icon, 'accent/on-cream');
      await T(row, 'Body/Base', label, 'cream/text-primary');
    }

    const form = AL('VERTICAL', {
      itemSpacing: 19, name: 'Form',
      paddingTop: 32, paddingBottom: 32, paddingLeft: 32, paddingRight: 32,
    });
    form.fills = [P('cream/bg-surface')];
    form.strokes = [P('cream/border')];
    form.strokeWeight = 1;
    await form.setEffectStyleIdAsync(E['Elevation/Form'].id);
    grid.appendChild(form);
    form.layoutSizingHorizontal = 'FILL';
    for (const [label, value] of [['Full name', 'Your name'], ['Email', 'you@example.com'], ['Message', 'How can we help?']]) {
      const f = inst('Form Field', 'State=Default');
      form.appendChild(f);
      f.layoutSizingHorizontal = 'FILL';
      const l = f.findOne(n => n.name === 'Label'); if (l) l.characters = label;
      const v = f.findOne(n => n.name === 'Value'); if (v) v.characters = value;
    }
    const send = inst('Button', 'Style=Gold, Size=Default');
    setProps(send, { Label: 'Send Message' });
    form.appendChild(send);
  }

  await siteFooter(home);

  /* ══════════════════════════════════════════════════════════════════════
     SCREENS 2-8 — inner pages
     ══════════════════════════════════════════════════════════════════════ */

  // Simple page shell: header, hero band, body slot, footer
  async function innerPage(name, x, kicker, title, build) {
    const sc = screen(name, x);
    await siteHeader(sc);
    const hero = band(sc, 'dark/bg-page', 96);
    await T(hero, 'Label/Section', kicker, 'accent/on-dark');
    spacer(hero, 16);
    await T(hero, 'Display/H1', title, 'dark/text-primary', { fill: true });
    await build(sc);
    await siteFooter(sc);
    return sc;
  }

  /* About */
  await innerPage('About', 1600, 'Who We Are', 'A new dimension of medicine.', async (sc) => {
    const s = band(sc, 'cream/bg-page', 96);
    const grid = AL('HORIZONTAL', { itemSpacing: 64, counterAxisAlignItems: 'MIN' });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';
    const img = AL('VERTICAL', {});
    img.primaryAxisSizingMode = 'FIXED';
    img.counterAxisSizingMode = 'FIXED';
    grid.appendChild(img);
    img.resize(560, 700);
    img.fills = [IMGFILL(HASH.founder)];
    const copy = AL('VERTICAL', { itemSpacing: 24 });
    grid.appendChild(copy);
    copy.layoutSizingHorizontal = 'FILL';
    await T(copy, 'Display/H2', 'Dr. Emidaka', 'cream/text-primary', { fill: true });
    await T(copy, 'Label/Eyebrow', 'B.Nat, M.Sc Clinical Nutrition · Functional Medicine Practitioner', 'accent/on-cream', { fill: true });
    await T(copy, 'Body/Lead',
      'IYKA-ARAM is the first start-up in the North East to highlight drugless healthcare. We blend functional medicine, yoga, and naturopathy into a premium standard of integrative care — set against the clean, living landscape of Meghalaya.',
      'cream/text-secondary', { fill: true });
    await T(copy, 'Body/Base',
      'Recognised by the Ministry of AYUSH and the Government of Meghalaya, our work spans clinical consultations, wellness education, yoga therapy retreats, and community outreach through the IYKA Roots Foundation.',
      'cream/text-secondary', { fill: true });
  });

  /* Services */
  await innerPage('Services', 3200, 'What We Offer', 'Ten disciplines, one plan.', async (sc) => {
    const s = band(sc, 'dark/bg-alt', 96);
    const grid = AL('VERTICAL', { itemSpacing: 0 });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';
    const services = [
      ['01', 'Functional Medicine Consultation', 'Root-cause analysis to understand what drives your symptoms'],
      ['02', 'Clinical Nutrition', 'Food as medicine — personalised therapeutic diet plans'],
      ['03', 'Naturopathy', 'Drug-free healing using natural methods and elements'],
      ['04', 'Yoga Therapy', 'Therapeutic yoga for chronic conditions & mental wellness'],
      ['05', 'Ayurveda', 'Ancient wisdom adapted to modern clinical protocols'],
      ['06', 'Panchakarma', 'Detox, cleanse and rejuvenate through classical Ayurvedic procedures'],
      ['07', 'Hydrotherapy', 'Water-based treatments for pain, injury and recovery'],
      ['08', 'Mud Therapy', 'Therapeutic earth applications for inflammation and skin'],
      ['09', 'Physiotherapy', 'Movement-based rehabilitation and chronic pain management'],
      ['10', 'Online Consultation', 'Access expert care from anywhere in Northeast India and beyond'],
    ];
    for (const [num, name, desc] of services) {
      const r = inst('Service Row');
      setProps(r, { Number: num, Name: name, Desc: desc });
      grid.appendChild(r);
      r.layoutSizingHorizontal = 'FILL';
    }
  });

  /* Gallery */
  await innerPage('Gallery', 4800, 'The Centre', 'Inside IYKA-ARAM.', async (sc) => {
    const s = band(sc, 'cream/bg-page', 96);
    const imgs = [HASH.g1, HASH.g2, HASH.g3, HASH.g4, HASH.g5, HASH.event1, HASH.event2, HASH.event3, HASH.hero2];
    for (let i = 0; i < imgs.length; i += 3) {
      const row = AL('HORIZONTAL', { itemSpacing: 16 });
      s.appendChild(row);
      row.layoutSizingHorizontal = 'FILL';
      for (const h of imgs.slice(i, i + 3)) {
        const im = AL('VERTICAL', {});
        im.primaryAxisSizingMode = 'FIXED';
        im.counterAxisSizingMode = 'FIXED';
        row.appendChild(im);
        im.resize(453, 340);
        im.layoutSizingHorizontal = 'FILL';
        im.fills = [IMGFILL(h)];
      }
      if (i + 3 < imgs.length) spacer(s, 16);
    }
  });

  /* Blog */
  await innerPage('Blog', 6400, 'Journal', 'Notes on drugless healing.', async (sc) => {
    const s = band(sc, 'cream/bg-page', 96);
    const posts = [
      ['Gut Health', 'Why your gut decides how you feel', 'The gut–brain axis explains more about mood, energy and immunity than most people expect.', HASH.g1],
      ['Yoga Therapy', 'Yoga as clinical intervention, not exercise', 'How therapeutic yoga is prescribed for chronic pain, hypertension and anxiety.', HASH.g2],
      ['Nutrition', 'Food as medicine in a Northeast kitchen', 'Building therapeutic diets from what actually grows in Meghalaya.', HASH.g4],
    ];
    const grid = AL('HORIZONTAL', { itemSpacing: 24 });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';
    for (const [cat, title, excerpt, img] of posts) {
      const card = AL('VERTICAL', { itemSpacing: 19 });
      card.fills = [P('cream/bg-surface')];
      card.strokes = [P('cream/border')];
      card.strokeWeight = 1;
      grid.appendChild(card);
      card.layoutSizingHorizontal = 'FILL';
      const im = AL('VERTICAL', {});
      im.primaryAxisSizingMode = 'FIXED';
      im.counterAxisSizingMode = 'FIXED';
      card.appendChild(im);
      im.resize(440, 280);
      im.layoutSizingHorizontal = 'FILL';
      im.fills = [IMGFILL(img)];
      const body = AL('VERTICAL', { itemSpacing: 12, paddingLeft: 24, paddingRight: 24, paddingBottom: 24 });
      card.appendChild(body);
      body.layoutSizingHorizontal = 'FILL';
      await T(body, 'Label/Eyebrow', cat, 'accent/on-cream', { fill: true });
      await T(body, 'Display/H4', title, 'cream/text-primary', { fill: true });
      await T(body, 'Body/Small', excerpt, 'cream/text-secondary', { fill: true });
    }
  });

  /* Blog Post */
  await innerPage('Blog Post', 8000, 'Gut Health', 'Why your gut decides how you feel', async (sc) => {
    const s = band(sc, 'cream/bg-page', 96);
    const hero = AL('VERTICAL', {});
    hero.primaryAxisSizingMode = 'FIXED';
    hero.counterAxisSizingMode = 'FIXED';
    s.appendChild(hero);
    hero.resize(CONTENT, 480);
    hero.layoutSizingHorizontal = 'FILL';
    hero.fills = [IMGFILL(HASH.g1)];
    spacer(s, 48);
    const article = AL('VERTICAL', { itemSpacing: 24 });
    s.appendChild(article);
    article.resize(760, 100);
    article.layoutSizingHorizontal = 'FIXED';
    await T(article, 'Body/Caption', 'Dr. Emidaka · 8 min read · 12 July 2026', 'cream/text-muted', { fill: true });
    await T(article, 'Body/Lead',
      'The gut–brain axis explains more about mood, energy and immunity than most people expect. In functional medicine we treat the digestive system as the starting point of almost every chronic presentation.',
      'cream/text-primary', { fill: true });
    await T(article, 'Display/H3', 'What the research actually says', 'cream/text-primary', { fill: true });
    await T(article, 'Body/Base',
      'Roughly seventy percent of immune tissue sits in the gut wall. When the barrier is compromised, the downstream effects are systemic — fatigue, skin presentations, joint pain, and mood changes that look unrelated until you map them back.',
      'cream/text-secondary', { fill: true });
    await T(article, 'Display/Quote',
      '"We do not treat the symptom where it appears. We treat it where it starts."',
      'accent/on-cream', { fill: true });
    await T(article, 'Body/Base',
      'A therapeutic protocol usually begins with an elimination phase, followed by targeted repair and reintroduction. The timeline is measured in weeks, not days — which is the part patients find hardest and which matters most.',
      'cream/text-secondary', { fill: true });
  });

  /* Booking */
  await innerPage('Booking', 9600, 'Start Here', 'Book a consultation.', async (sc) => {
    const s = band(sc, 'cream/bg-page', 96);
    // stepper
    const steps = AL('HORIZONTAL', { itemSpacing: 0, name: 'Stepper' });
    s.appendChild(steps);
    steps.layoutSizingHorizontal = 'FILL';
    const stepNames = ['Service', 'Date & Time', 'Your Details', 'Confirm'];
    for (let i = 0; i < stepNames.length; i++) {
      const st = AL('HORIZONTAL', { itemSpacing: 12, counterAxisAlignItems: 'CENTER', paddingTop: 16, paddingBottom: 16 });
      steps.appendChild(st);
      st.layoutSizingHorizontal = 'FILL';
      const dot = AL('VERTICAL', {});
      dot.primaryAxisAlignItems = 'CENTER';
      dot.counterAxisAlignItems = 'CENTER';
      dot.primaryAxisSizingMode = 'FIXED';
      dot.counterAxisSizingMode = 'FIXED';
      dot.resize(32, 32);
      dot.fills = [P(i === 0 ? 'accent/default' : 'cream/bg-alt')];
      radius(dot, 'radius/full');
      st.appendChild(dot);
      await T(dot, 'Label/Eyebrow', String(i + 1), i === 0 ? 'accent/fg' : 'cream/text-muted');
      await T(st, 'Body/Small', stepNames[i], i === 0 ? 'cream/text-primary' : 'cream/text-muted');
    }
    spacer(s, 48);
    const grid = AL('HORIZONTAL', { itemSpacing: 24 });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';
    const paths = [
      ['Functional Medicine', 'One-to-one with our doctors — root-cause care, offline or online.', '45–60 min', 'Featured'],
      ['Offline Session', 'Naturopathy and therapy sessions in person at the centre.', 'At the centre', 'Default'],
      ['Online Yoga', 'Instructor-led group yoga, live online, on a regular schedule.', 'Live online', 'Default'],
    ];
    for (const [title, desc, detail, state] of paths) {
      const c = inst('Booking Card', 'State=' + state);
      grid.appendChild(c);
      c.layoutSizingHorizontal = 'FILL';
      const t = c.findOne(n => n.name === 'Title'); if (t) t.characters = title;
      const d = c.findOne(n => n.name === 'Desc'); if (d) d.characters = desc;
      const det = c.findOne(n => n.name === 'Detail');
      if (det) { const dt = det.findOne(n => n.type === 'TEXT'); if (dt) dt.characters = detail; }
    }
  });

  /* Contact */
  await innerPage('Contact', 11200, 'Get in Touch', 'Talk to us.', async (sc) => {
    const s = band(sc, 'cream/bg-page', 96);
    const grid = AL('HORIZONTAL', { itemSpacing: 80 });
    s.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';
    const left = AL('VERTICAL', { itemSpacing: 19 });
    grid.appendChild(left);
    left.layoutSizingHorizontal = 'FILL';
    for (const [icon, label] of [['✉', 'hello@iyka-aram.com'], ['☎', '+91 00000 00000'], ['⌂', 'Meghalaya, Northeast India'], ['◷', 'Mon–Sat · 9:00 – 18:00']]) {
      const row = AL('HORIZONTAL', { itemSpacing: 16, counterAxisAlignItems: 'CENTER', paddingTop: 6, paddingBottom: 6 });
      left.appendChild(row);
      row.layoutSizingHorizontal = 'FILL';
      const ic = AL('VERTICAL', {});
      ic.primaryAxisAlignItems = 'CENTER';
      ic.counterAxisAlignItems = 'CENTER';
      ic.primaryAxisSizingMode = 'FIXED';
      ic.counterAxisSizingMode = 'FIXED';
      ic.resize(35, 35);
      ic.fills = [P('cream/bg-alt')];
      row.appendChild(ic);
      await T(ic, 'Body/Base', icon, 'accent/on-cream');
      await T(row, 'Body/Base', label, 'cream/text-primary');
    }
    const form = AL('VERTICAL', {
      itemSpacing: 19, paddingTop: 32, paddingBottom: 32, paddingLeft: 32, paddingRight: 32,
    });
    form.fills = [P('cream/bg-surface')];
    form.strokes = [P('cream/border')];
    form.strokeWeight = 1;
    await form.setEffectStyleIdAsync(E['Elevation/Form'].id);
    grid.appendChild(form);
    form.layoutSizingHorizontal = 'FILL';
    for (const [label, value] of [['Full name', 'Your name'], ['Email', 'you@example.com'], ['Phone', '+91'], ['Message', 'How can we help?']]) {
      const f = inst('Form Field', 'State=Default');
      form.appendChild(f);
      f.layoutSizingHorizontal = 'FILL';
      const l = f.findOne(n => n.name === 'Label'); if (l) l.characters = label;
      const v = f.findOne(n => n.name === 'Value'); if (v) v.characters = value;
    }
    const send = inst('Button', 'Style=Gold, Size=Default');
    setProps(send, { Label: 'Send Message' });
    form.appendChild(send);
  });

  for (const t of _trash) t.remove();

  const summary = 'IYKA 04 — marketing screens built: Home, About, Services, Gallery, Blog, Blog Post, Booking, Contact';
  console.log(summary);
  figma.currentPage.selection = [];
  return summary;

})();
