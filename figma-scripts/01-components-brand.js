/* ════════════════════════════════════════════════════════════════════════════
   IYKA-ARAM · 01 — Brand components
   Page: 02 · Components

   Builds the customer-facing component library from src/app/globals.css
   (.v2-* rules) and src/components/site/*. Every fill, stroke, padding and
   radius is bound to a variable that already exists in the file.

   Standard Figma Plugin API only — no MCP-runtime conveniences.
   Safe to re-run: removes what it previously made first.
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
      ['Cormorant Garamond', 'Light Italic'], ['Cormorant Garamond', 'Italic'],
      ['DM Sans', 'Regular'], ['DM Sans', 'Medium'], ['DM Sans', 'SemiBold'], ['DM Sans', 'Bold'],
    ].map(([family, style]) => figma.loadFontAsync({ family, style })));
  }

  // Bound paint. Throws loudly rather than silently drawing black.
  const P = (name) => {
    if (!V[name]) throw new Error('missing var ' + name);
    return figma.variables.setBoundVariableForPaint(
      { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[name]);
  };

  // Auto-layout frame. Standard API — figma.createAutoLayout() does not exist here.
  function AL(dir, props) {
    const f = figma.createFrame();
    f.layoutMode = dir;
    f.primaryAxisSizingMode = 'AUTO';
    f.counterAxisSizingMode = 'AUTO';
    f.fills = [];
    if (props) Object.assign(f, props);
    return f;
  }

  // Auto-layout COMPONENT.
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

  /* ── page + cleanup ──────────────────────────────────────────────────── */
  await boot();

  const page = figma.root.children.find(p => p.name === '02 · Components');
  if (!page) throw new Error('page "02 · Components" not found');
  await figma.setCurrentPageAsync(page);

  const OWNED = [
    'Button', 'Section Label', 'Stat Block', 'Pillar Card', 'Service Row',
    'Team Card', 'Testimonial Card', 'Booking Card', 'Form Field',
    '· Brand components',
  ];
  for (const child of [...page.children]) {
    if (OWNED.indexOf(child.name) !== -1) child.remove();
  }

  const made = {};
  let cursorY = 240;
  const COL_X = 120;

  // Section heading on canvas
  const banner = AL('VERTICAL', { name: '· Brand components', itemSpacing: 8 });
  page.appendChild(banner);
  banner.x = COL_X; banner.y = 100;
  await T(banner, 'Label/Section', 'Component library', 'accent/on-cream');
  await T(banner, 'Display/H2', 'Brand — site & store', 'cream/text-primary');

  /* ── 1. Button ───────────────────────────────────────────────────────────
     .v2-btn / .v2-btn-gold / .v2-btn-outline-cream / .v2-btn-outline-dark
     plus the store's dark primary. 4 styles x 2 sizes.
     ──────────────────────────────────────────────────────────────────────── */
  {
    const defs = [
      // [Style,          fillVar,             strokeVar,       textVar]
      ['Gold',           'accent/default',     null,            'accent/fg'],
      ['Outline Cream',   null,                'dark/border',   'dark/text-primary'],
      ['Outline Dark',    null,                'cream/border',  'cream/text-primary'],
      ['Store Primary',  'cream/text-primary', null,            'dark/text-primary'],
    ];
    const sizes = [['Default', 14, 32], ['Small', 10, 22]];

    const variants = [];
    for (const [styleName, fillVar, strokeVar, textVar] of defs) {
      for (const [sizeName, padY, padX] of sizes) {
        const c = ALC('HORIZONTAL', {
          name: 'Style=' + styleName + ', Size=' + sizeName,
          itemSpacing: 8,
          counterAxisAlignItems: 'CENTER',
          paddingTop: padY, paddingBottom: padY,
          paddingLeft: padX, paddingRight: padX,
        });
        c.fills = fillVar ? [P(fillVar)] : [];
        if (strokeVar) { c.strokes = [P(strokeVar)]; c.strokeWeight = 1; }
        radius(c, 'radius/none');
        await T(c, 'Label/Button', 'Book a Consultation', textVar, { name: 'Label' });
        page.appendChild(c);
        variants.push(c);
      }
    }

    const set = figma.combineAsVariants(variants, page);
    set.name = 'Button';
    set.description =
      'Gold is the single primary action across all four surfaces. The two outline styles pair ' +
      'with dark and cream sections respectively. Square by default — radius/none is a brand decision.';
    set.layoutMode = 'VERTICAL';
    set.primaryAxisSizingMode = 'AUTO';
    set.counterAxisSizingMode = 'AUTO';
    set.itemSpacing = 16;
    set.paddingTop = 32; set.paddingBottom = 32;
    set.paddingLeft = 32; set.paddingRight = 32;
    set.fills = [P('cream/bg-alt')];
    set.x = COL_X; set.y = cursorY;

    const propId = set.addComponentProperty('Label', 'TEXT', 'Book a Consultation');
    for (const v of set.children) {
      const label = v.findOne(n => n.type === 'TEXT' && n.name === 'Label');
      if (label) label.componentPropertyReferences = { characters: propId };
    }

    made.Button = set.id;
    cursorY = set.y + set.height + 100;
  }

  /* ── 2. Section Label — the gold uppercase kicker above every heading ──── */
  {
    const c = ALC('HORIZONTAL', { name: 'Section Label' });
    await T(c, 'Label/Section', 'Our Mission', 'accent/on-cream', { name: 'Text' });
    c.description = 'Gold uppercase kicker. Sits above every section heading on the site.';
    const propId = c.addComponentProperty('Text', 'TEXT', 'Our Mission');
    c.findOne(n => n.type === 'TEXT').componentPropertyReferences = { characters: propId };
    page.appendChild(c);
    c.x = COL_X; c.y = cursorY;
    made['Section Label'] = c.id;
    cursorY += c.height + 80;
  }

  /* ── 3. Stat Block — .v2-stat-block, used in the Mission section ───────── */
  {
    const c = ALC('VERTICAL', {
      name: 'Stat Block', itemSpacing: 5,
      paddingTop: 32, paddingBottom: 32,
    });
    c.resize(320, 100);
    c.layoutSizingHorizontal = 'FIXED';
    await T(c, 'Display/Stat', '2019', 'cream/text-primary', { name: 'Value' });
    await T(c, 'Body/Small', 'Founded in Shillong', 'cream/text-secondary', { name: 'Label', fill: true });
    c.description = 'Mission section statistic. Divider between blocks is drawn by the parent.';
    const pv = c.addComponentProperty('Value', 'TEXT', '2019');
    const pl = c.addComponentProperty('Label', 'TEXT', 'Founded in Shillong');
    c.findOne(n => n.name === 'Value').componentPropertyReferences = { characters: pv };
    c.findOne(n => n.name === 'Label').componentPropertyReferences = { characters: pl };
    page.appendChild(c);
    c.x = COL_X; c.y = cursorY;
    made['Stat Block'] = c.id;
    cursorY += c.height + 80;
  }

  /* ── 4. Pillar Card — .v2-pillar-card (Drugless / Integrative / Longevity) */
  {
    const c = ALC('VERTICAL', {
      name: 'Pillar Card', itemSpacing: 12,
      paddingTop: 32, paddingBottom: 32, paddingLeft: 24, paddingRight: 24,
    });
    c.resize(360, 100);
    c.layoutSizingHorizontal = 'FIXED';
    c.fills = [P('cream/bg-surface')];
    c.strokes = [P('cream/border')];
    c.strokeWeight = 1;
    radius(c, 'radius/none');
    await T(c, 'Display/H3', '\u{1F33F}', null, { name: 'Icon' });
    await T(c, 'Display/H4', 'Drugless', 'cream/text-primary', { name: 'Title', fill: true });
    await T(c, 'Body/Small',
      'We address the root cause — not the symptom. No unnecessary prescriptions, just your body healing itself.',
      'cream/text-secondary', { name: 'Body', fill: true });
    c.description = 'Mission pillar. Hover state in code adds Elevation/Gold Soft and a gold-pale border.';
    const pt = c.addComponentProperty('Title', 'TEXT', 'Drugless');
    const pb = c.addComponentProperty('Body', 'TEXT', 'We address the root cause — not the symptom.');
    c.findOne(n => n.name === 'Title').componentPropertyReferences = { characters: pt };
    c.findOne(n => n.name === 'Body').componentPropertyReferences = { characters: pb };
    page.appendChild(c);
    c.x = COL_X; c.y = cursorY;
    made['Pillar Card'] = c.id;
    cursorY += c.height + 80;
  }

  /* ── 5. Service Row — .v2-service-card, the 10-discipline grid on dark ─── */
  {
    const c = ALC('HORIZONTAL', {
      name: 'Service Row', itemSpacing: 24,
      counterAxisAlignItems: 'MIN',
      paddingTop: 29, paddingBottom: 29, paddingLeft: 24, paddingRight: 24,
    });
    c.resize(448, 100);
    c.layoutSizingHorizontal = 'FIXED';
    c.fills = [P('dark/bg-page')];
    c.strokes = [P('dark/border')];
    c.strokeWeight = 1;
    radius(c, 'radius/none');

    const num = await T(c, 'Display/Card Title', '01', 'accent/on-dark', { name: 'Number' });
    num.opacity = 0.6;
    num.resize(32, num.height);

    const stack = AL('VERTICAL', { itemSpacing: 6, name: 'Text' });
    c.appendChild(stack);
    stack.layoutSizingHorizontal = 'FILL';
    await T(stack, 'Display/Card Title', 'Functional Medicine Consultation', 'dark/text-primary', { name: 'Name', fill: true });
    await T(stack, 'Body/Small', 'Root-cause analysis to understand what drives your symptoms', 'dark/text-muted', { name: 'Desc', fill: true });

    c.description = 'One of the ten disciplines. Grid draws its own 1px hairlines between rows.';
    const pn = c.addComponentProperty('Number', 'TEXT', '01');
    const pname = c.addComponentProperty('Name', 'TEXT', 'Functional Medicine Consultation');
    const pd = c.addComponentProperty('Desc', 'TEXT', 'Root-cause analysis');
    c.findOne(n => n.name === 'Number').componentPropertyReferences = { characters: pn };
    c.findOne(n => n.name === 'Name').componentPropertyReferences = { characters: pname };
    c.findOne(n => n.name === 'Desc').componentPropertyReferences = { characters: pd };
    page.appendChild(c);
    c.x = COL_X; c.y = cursorY;
    made['Service Row'] = c.id;
    cursorY += c.height + 80;
  }

  /* ── 6. Team Card — .v2-team-card, 3:4 photo + name/role/speciality ────── */
  {
    const c = ALC('VERTICAL', { name: 'Team Card', itemSpacing: 19 });
    c.resize(280, 100);
    c.layoutSizingHorizontal = 'FIXED';

    const photo = AL('VERTICAL', { name: 'Photo' });
    photo.primaryAxisAlignItems = 'CENTER';
    photo.counterAxisAlignItems = 'CENTER';
    photo.fills = [P('dark/bg-surface')];
    c.appendChild(photo);
    photo.layoutSizingHorizontal = 'FILL';
    photo.primaryAxisSizingMode = 'FIXED';
    photo.resize(280, 373); // 3:4
    const initials = await T(photo, 'Display/H1', 'DE', 'accent/on-dark', { name: 'Initials' });
    initials.opacity = 0.6;

    const info = AL('VERTICAL', { itemSpacing: 4, name: 'Info' });
    c.appendChild(info);
    info.layoutSizingHorizontal = 'FILL';
    await T(info, 'Display/Card Title', 'Dr. Emidaka', 'dark/text-primary', { name: 'Name', fill: true });
    await T(info, 'Body/Caption', 'Founder & Functional Medicine Practitioner', 'accent/on-dark', { name: 'Role', fill: true });
    await T(info, 'Body/Caption', 'Naturopathy · Clinical Nutrition', 'dark/text-muted', { name: 'Speciality', fill: true });

    c.description = 'Practitioner card. Falls back to initials when no photo is set — see team-section.tsx.';
    const pn = c.addComponentProperty('Name', 'TEXT', 'Dr. Emidaka');
    const pr = c.addComponentProperty('Role', 'TEXT', 'Founder');
    const ps = c.addComponentProperty('Speciality', 'TEXT', 'Naturopathy');
    c.findOne(n => n.name === 'Name').componentPropertyReferences = { characters: pn };
    c.findOne(n => n.name === 'Role').componentPropertyReferences = { characters: pr };
    c.findOne(n => n.name === 'Speciality').componentPropertyReferences = { characters: ps };
    page.appendChild(c);
    c.x = COL_X; c.y = cursorY;
    made['Team Card'] = c.id;
    cursorY += c.height + 80;
  }

  /* ── 7. Testimonial Card — .v2-testimonial-card, cream + dark variants ─── */
  {
    const variants = [];
    for (const surface of ['Cream', 'Dark']) {
      const onCream = surface === 'Cream';
      const c = ALC('VERTICAL', {
        name: 'Surface=' + surface, itemSpacing: 19,
        paddingTop: 32, paddingBottom: 32, paddingLeft: 32, paddingRight: 32,
      });
      c.resize(380, 100);
      c.layoutSizingHorizontal = 'FIXED';
      c.fills = [P(onCream ? 'cream/bg-surface' : 'dark/bg-surface')];
      c.strokes = [P(onCream ? 'cream/border' : 'dark/border-accent')];
      c.strokeWeight = 1;
      radius(c, 'radius/none');

      const tag = AL('HORIZONTAL', {
        name: 'Tag', paddingTop: 3, paddingBottom: 3, paddingLeft: 10, paddingRight: 10,
      });
      tag.strokes = [P(onCream ? 'cream/border-accent' : 'dark/border-accent')];
      tag.strokeWeight = 1;
      c.appendChild(tag);
      await T(tag, 'Label/Eyebrow', 'Patient', onCream ? 'accent/on-cream' : 'accent/on-dark');

      await T(c, 'Display/Quote',
        'A completely different approach to health — I finally feel cared for as a whole person, not a set of symptoms.',
        onCream ? 'cream/text-primary' : 'dark/text-primary', { name: 'Quote', fill: true });

      const author = AL('HORIZONTAL', { itemSpacing: 13, name: 'Author', counterAxisAlignItems: 'CENTER', paddingTop: 16 });
      c.appendChild(author);
      author.layoutSizingHorizontal = 'FILL';

      const avatar = AL('VERTICAL', { name: 'Avatar' });
      avatar.primaryAxisAlignItems = 'CENTER';
      avatar.counterAxisAlignItems = 'CENTER';
      avatar.primaryAxisSizingMode = 'FIXED';
      avatar.counterAxisSizingMode = 'FIXED';
      avatar.resize(40, 40);
      avatar.fills = [P('accent/green')];
      radius(avatar, 'radius/full');
      author.appendChild(avatar);
      await T(avatar, 'Display/Card Title', 'P', 'dark/text-primary');

      const who = AL('VERTICAL', { itemSpacing: 2, name: 'Who' });
      author.appendChild(who);
      who.layoutSizingHorizontal = 'FILL';
      await T(who, 'Body/Small', 'Patient, Shillong', onCream ? 'cream/text-primary' : 'dark/text-primary', { name: 'Name', fill: true });
      await T(who, 'Body/Caption', 'Meghalaya', onCream ? 'cream/text-muted' : 'dark/text-muted', { name: 'Location', fill: true });

      page.appendChild(c);
      variants.push(c);
    }

    const set = figma.combineAsVariants(variants, page);
    set.name = 'Testimonial Card';
    set.description = 'Patient quote. Cream variant for light sections, Dark for the green/ink sections.';
    set.layoutMode = 'HORIZONTAL';
    set.primaryAxisSizingMode = 'AUTO';
    set.counterAxisSizingMode = 'AUTO';
    set.itemSpacing = 24;
    set.paddingTop = 32; set.paddingBottom = 32; set.paddingLeft = 32; set.paddingRight = 32;
    set.fills = [P('cream/bg-alt')];
    set.x = COL_X; set.y = cursorY;
    made['Testimonial Card'] = set.id;
    cursorY = set.y + set.height + 100;
  }

  /* ── 8. Booking Card — .v2-book-card, default + featured ───────────────── */
  {
    const variants = [];
    for (const state of ['Default', 'Featured']) {
      const featured = state === 'Featured';
      const c = ALC('VERTICAL', {
        name: 'State=' + state, itemSpacing: 16,
        paddingTop: 32, paddingBottom: 32, paddingLeft: 32, paddingRight: 32,
      });
      c.resize(360, 100);
      c.layoutSizingHorizontal = 'FIXED';
      c.fills = [P(featured ? 'accent/green-mid' : 'dark/bg-surface')];
      c.strokes = [P(featured ? 'dark/border-accent' : 'dark/border')];
      c.strokeWeight = 1;
      radius(c, 'radius/none');

      const icon = AL('VERTICAL', { name: 'Icon' });
      icon.primaryAxisAlignItems = 'CENTER';
      icon.counterAxisAlignItems = 'CENTER';
      icon.primaryAxisSizingMode = 'FIXED';
      icon.counterAxisSizingMode = 'FIXED';
      icon.resize(48, 48);
      icon.fills = [P('dark/bg-surface')];
      c.appendChild(icon);
      await T(icon, 'Display/H4', '⊕', 'accent/on-dark');

      await T(c, 'Display/H4', 'Functional Medicine', 'dark/text-primary', { name: 'Title', fill: true });
      await T(c, 'Body/Small',
        'One-to-one with our doctors — root-cause care, offline at the centre or online by video.',
        'dark/text-muted', { name: 'Desc', fill: true });

      const detail = AL('VERTICAL', { itemSpacing: 3, name: 'Detail', paddingTop: 12, paddingBottom: 12 });
      detail.strokes = [P('dark/border')];
      detail.strokeWeight = 1;
      detail.strokeTopWeight = 1; detail.strokeBottomWeight = 1;
      detail.strokeLeftWeight = 0; detail.strokeRightWeight = 0;
      c.appendChild(detail);
      detail.layoutSizingHorizontal = 'FILL';
      await T(detail, 'Body/Caption', '45–60 min · Offline / Online', 'dark/text-muted', { fill: true });

      page.appendChild(c);
      variants.push(c);
    }

    const set = figma.combineAsVariants(variants, page);
    set.name = 'Booking Card';
    set.description = 'One of the three booking paths. Featured carries the green-mid fill and a gold tag.';
    set.layoutMode = 'HORIZONTAL';
    set.primaryAxisSizingMode = 'AUTO';
    set.counterAxisSizingMode = 'AUTO';
    set.itemSpacing = 24;
    set.paddingTop = 32; set.paddingBottom = 32; set.paddingLeft = 32; set.paddingRight = 32;
    set.fills = [P('dark/bg-page')];
    set.x = COL_X; set.y = cursorY;
    made['Booking Card'] = set.id;
    cursorY = set.y + set.height + 100;
  }

  /* ── 9. Form Field — .v2-form-group, default + focus ───────────────────── */
  {
    const variants = [];
    for (const state of ['Default', 'Focus']) {
      const c = ALC('VERTICAL', { name: 'State=' + state, itemSpacing: 6 });
      c.resize(360, 100);
      c.layoutSizingHorizontal = 'FIXED';

      await T(c, 'Label/Section', 'Full name', 'cream/text-secondary', { name: 'Label', fill: true });

      const input = AL('HORIZONTAL', {
        name: 'Input', paddingTop: 13, paddingBottom: 13, paddingLeft: 16, paddingRight: 16,
      });
      input.fills = [P('cream/bg-page')];
      input.strokes = [P(state === 'Focus' ? 'accent/default' : 'cream/border')];
      input.strokeWeight = 1;
      radius(input, 'radius/none');
      c.appendChild(input);
      input.layoutSizingHorizontal = 'FILL';
      await T(input, 'Body/Base',
        state === 'Focus' ? 'Emidaka' : 'Your name',
        state === 'Focus' ? 'cream/text-primary' : 'cream/text-muted',
        { name: 'Value', fill: true });

      page.appendChild(c);
      variants.push(c);
    }

    const set = figma.combineAsVariants(variants, page);
    set.name = 'Form Field';
    set.description = 'Contact and booking form field. Focus swaps the border to gold — no glow, no shift.';
    set.layoutMode = 'HORIZONTAL';
    set.primaryAxisSizingMode = 'AUTO';
    set.counterAxisSizingMode = 'AUTO';
    set.itemSpacing = 24;
    set.paddingTop = 32; set.paddingBottom = 32; set.paddingLeft = 32; set.paddingRight = 32;
    set.fills = [P('cream/bg-alt')];
    set.x = COL_X; set.y = cursorY;
    made['Form Field'] = set.id;
  }

  const summary = 'IYKA 01 — brand components built: ' + Object.keys(made).join(', ');
  console.log(summary);
  figma.currentPage.selection = [];
  return summary;

})();
