// My Pokedex by Jublia AI — Figma design generator
// Run in a new design file (figma.new) renamed to "My Pokedex by Jublia AI"

const FONT = 'Inter';
const W = 390;
const H = 844;
const CARD_R = 20;
const CHIP_R = 999;

const TYPES = [
  ['Normal', '#a8a878'], ['Fire', '#f08030'], ['Water', '#6890f0'],
  ['Electric', '#f8d030'], ['Grass', '#78c850'], ['Ice', '#98d8d8'],
  ['Fighting', '#c03028'], ['Poison', '#a040a0'], ['Ground', '#e0c068'],
  ['Flying', '#a890f0'], ['Psychic', '#f85888'], ['Bug', '#a8b820'],
  ['Rock', '#b8a038'], ['Ghost', '#705898'], ['Dragon', '#7038f8'],
  ['Dark', '#705848'], ['Steel', '#b8b8d0'], ['Fairy', '#ee99ac'],
];

const THEME = {
  light: {
    background: '#f5f5f7', surface: '#ffffff', text: '#1a1a1a',
    textMuted: '#5c5c61', border: '#ececf1', searchFill: '#ececee',
  },
  dark: {
    background: '#0f0f12', surface: '#1c1c1e', text: '#f5f5f7',
    textMuted: '#98989d', border: '#2c2c2e', searchFill: '#2c2c2e',
  },
  brand: { primary: '#e53935', secondary: '#00b8d9' },
};

function hex(h) {
  const n = h.replace('#', '');
  const color = {
    r: parseInt(n.slice(0, 2), 16) / 255,
    g: parseInt(n.slice(2, 4), 16) / 255,
    b: parseInt(n.slice(4, 6), 16) / 255,
  };
  if (n.length === 8) {
    color.a = parseInt(n.slice(6, 8), 16) / 255;
  }
  return color;
}

function paint(color) {
  const c = hex(color);
  if (c.a !== undefined) {
    return [{
      type: 'SOLID',
      color: { r: c.r, g: c.g, b: c.b },
      opacity: c.a,
    }];
  }
  return [{ type: 'SOLID', color: c }];
}

const SPRITES = {
  pikachu: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
  charizard: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
  eevee: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png',
};

async function tryImage(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return figma.createImage(new Uint8Array(await res.arrayBuffer()));
  } catch (e) {
    return null;
  }
}

function setImageFill(node, image) {
  if (!image) return;
  node.fills = [{ type: 'IMAGE', scaleMode: 'FIT', imageHash: image.hash }];
}

function addVectorPokeball(parent, size) {
  const ball = figma.createFrame();
  ball.name = 'pokeball';
  ball.resize(size, size);
  ball.cornerRadius = size / 2;
  ball.clipsContent = true;
  ball.fills = paint('#ffffff');
  const top = figma.createRectangle();
  top.name = 'top';
  top.resize(size, size / 2);
  top.fills = paint(THEME.brand.primary);
  ball.appendChild(top);
  const line = figma.createRectangle();
  line.name = 'line';
  line.resize(size, 4);
  line.y = size / 2 - 2;
  line.fills = paint('#1a1a1a');
  ball.appendChild(line);
  const center = figma.createEllipse();
  center.name = 'center';
  center.resize(size * 0.28, size * 0.28);
  center.x = size * 0.36;
  center.y = size * 0.36;
  center.fills = paint('#ffffff');
  center.strokes = paint('#1a1a1a');
  center.strokeWeight = 4;
  ball.appendChild(center);
  parent.appendChild(ball);
  return ball;
}

function addSplashAura(parent, size, isDark) {
  const outer = figma.createEllipse();
  outer.name = 'aura-outer';
  outer.resize(size * 0.92, size * 0.92);
  outer.x = size * 0.04;
  outer.y = size * 0.04;
  outer.fills = paint(isDark ? '#e5393560' : '#e539352e');
  outer.opacity = isDark ? 0.9 : 0.75;
  parent.appendChild(outer);
  const inner = figma.createEllipse();
  inner.name = 'aura-inner';
  inner.resize(size * 0.58, size * 0.58);
  inner.x = size * 0.21;
  inner.y = size * 0.21;
  inner.fills = paint(isDark ? '#e5393548' : '#e539351f');
  parent.appendChild(inner);
  const ring = figma.createEllipse();
  ring.name = 'aura-ring';
  ring.resize(size * 0.64, size * 0.64);
  ring.x = size * 0.18;
  ring.y = size * 0.18;
  ring.fills = [];
  ring.strokes = paint(THEME.brand.primary);
  ring.strokeWeight = 2;
  ring.opacity = 0.55;
  parent.appendChild(ring);
}

function addSplashDecor(parent, size) {
  const diamond = figma.createRectangle();
  diamond.name = 'deco-diamond';
  diamond.resize(14, 14);
  diamond.x = size * 0.06;
  diamond.y = size * 0.04;
  diamond.rotation = 45;
  diamond.cornerRadius = 3;
  diamond.fills = paint(THEME.brand.secondary);
  parent.appendChild(diamond);
  const ring = figma.createEllipse();
  ring.name = 'deco-ring';
  ring.resize(16, 16);
  ring.x = size * 0.82;
  ring.y = size * 0.82;
  ring.fills = [];
  ring.strokes = paint(THEME.light.textMuted);
  ring.strokeWeight = 3;
  parent.appendChild(ring);
}

function shadow() {
  return [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.06 },
    offset: { x: 0, y: 4 },
    radius: 12,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL',
  }];
}

async function loadFonts() {
  const styles = ['Regular', 'Medium', 'Semi Bold', 'Bold', 'Extra Bold'];
  for (const s of styles) {
    await figma.loadFontAsync({ family: FONT, style: s });
  }
}

function fontStyle(weight) {
  if (weight >= 800) return 'Extra Bold';
  if (weight >= 700) return 'Bold';
  if (weight >= 600) return 'Semi Bold';
  if (weight >= 500) return 'Medium';
  return 'Regular';
}

async function mkText(content, size, weight, color, textAlign) {
  const t = figma.createText();
  t.fontName = { family: FONT, style: fontStyle(weight) };
  t.characters = content;
  t.fontSize = size;
  t.fills = paint(color);
  if (textAlign) t.textAlignHorizontal = textAlign;
  return t;
}

function frame(name, w, h, fill, dir) {
  const f = figma.createFrame();
  f.name = name;
  f.fills = fill ? paint(fill) : [];
  if (dir) {
    f.layoutMode = dir;
    const horizontalIsPrimary = dir === 'HORIZONTAL';
    f.primaryAxisSizingMode = (horizontalIsPrimary ? w != null : h != null) ? 'FIXED' : 'AUTO';
    f.counterAxisSizingMode = (horizontalIsPrimary ? h != null : w != null) ? 'FIXED' : 'AUTO';
    if (w != null || h != null) {
      f.resize(w ?? 100, h ?? 100);
    }
  } else if (w != null || h != null) {
    f.resize(w ?? h, h ?? w);
  }
  return f;
}

function switchPage(page) {
  figma.currentPage = page;
}

function pad(f, t, r, b, l) {
  f.paddingTop = t;
  f.paddingRight = r ?? t;
  f.paddingBottom = b ?? t;
  f.paddingLeft = l ?? r ?? t;
}

function gap(f, g) {
  f.itemSpacing = g;
}

function align(f, primary, counter) {
  if (primary) f.primaryAxisAlignItems = primary;
  if (counter) f.counterAxisAlignItems = counter;
}

function hug(n) {
  if (!n.parent || !('layoutMode' in n.parent) || n.parent.layoutMode === 'NONE') {
    return;
  }
  n.layoutSizingHorizontal = 'HUG';
  n.layoutSizingVertical = 'HUG';
}

function fillChild(n) {
  if (!n.parent || !('layoutMode' in n.parent) || n.parent.layoutMode === 'NONE') {
    return;
  }
  n.layoutSizingHorizontal = 'FILL';
}

function appendFill(parent, child) {
  parent.appendChild(child);
  child.layoutSizingHorizontal = 'FILL';
}

// ─── Variables ───────────────────────────────────────────────

function buildVariables() {
  const collections = figma.variables.getLocalVariableCollections();
  const existing = collections.find((c) => c.name === 'Jublia Tokens');
  if (existing) {
    return { col: existing, lightId: existing.modes[0].modeId, vars: {} };
  }

  const col = figma.variables.createVariableCollection('Jublia Tokens');
  const lightId = col.modes[0].modeId;
  col.renameMode(lightId, 'Light');

  function colorVar(name, lightVal, darkVal, scopes) {
    const v = figma.variables.createVariable(name, col, 'COLOR');
    v.scopes = scopes || ['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL'];
    v.setValueForMode(lightId, { ...hex(lightVal), a: 1 });
    // Dark values shown as swatches; Starter plan supports single variable mode
    return v;
  }

  const vars = {
    primary: colorVar('primary', THEME.brand.primary, THEME.brand.primary, ['ALL_FILLS']),
    secondary: colorVar('secondary', THEME.brand.secondary, THEME.brand.secondary, ['ALL_FILLS']),
    background: colorVar('background', THEME.light.background, THEME.dark.background),
    surface: colorVar('surface', THEME.light.surface, THEME.dark.surface),
    text: colorVar('text', THEME.light.text, THEME.dark.text, ['TEXT_FILL']),
    textMuted: colorVar('text-muted', THEME.light.textMuted, THEME.dark.textMuted, ['TEXT_FILL']),
    border: colorVar('border', THEME.light.border, THEME.dark.border, ['STROKE_COLOR']),
    searchFill: colorVar('search-fill', THEME.light.searchFill, THEME.dark.searchFill),
  };

  return { col, lightId, vars };
}

function applyMode(page, collection, modeId) {
  page.setExplicitVariableModeForCollection(collection, modeId);
}

function bindFill(node, variable, collection, modeId) {
  applyMode(node, collection, modeId);
  const p = figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color: { r: 0, g: 0, b: 0 } },
    'color',
    variable,
  );
  node.fills = [p];
}

// ─── Design System page ──────────────────────────────────────

async function buildDesignSystemPage(page, vars) {
  switchPage(page);
  page.name = 'Design System';

  const root = frame('Design System', 1200, null, THEME.light.background, 'VERTICAL');
  pad(root, 48, 48, 48, 48);
  gap(root, 32);
  page.appendChild(root);

  root.appendChild(await mkText('Design System', 28, 800, THEME.light.text));
  root.appendChild(await mkText('My Pokedex by Jublia AI — tokens from design-tokens.scss', 14, 400, THEME.light.textMuted));

  // Colors
  const colorsSec = frame('Colors', 1100, null, null, 'VERTICAL');
  gap(colorsSec, 16);
  root.appendChild(colorsSec);
  colorsSec.appendChild(await mkText('Color variables (Light / Dark)', 20, 700, THEME.light.text));

  const swatchRow = frame('Swatches', 1100, null, null, 'HORIZONTAL');
  gap(swatchRow, 24);
  colorsSec.appendChild(swatchRow);

  const swatches = [
    ['primary', THEME.brand.primary], ['secondary', THEME.brand.secondary],
    ['background L', THEME.light.background], ['background D', THEME.dark.background],
    ['surface L', THEME.light.surface], ['surface D', THEME.dark.surface],
    ['text L', THEME.light.text], ['text D', THEME.dark.text],
    ['muted L', THEME.light.textMuted], ['muted D', THEME.dark.textMuted],
    ['border L', THEME.light.border], ['border D', THEME.dark.border],
  ];

  for (const [label, color] of swatches) {
    const cell = frame(label, 72, null, null, 'VERTICAL');
    gap(cell, 8);
    align(cell, 'MIN', 'CENTER');
    const sq = frame('swatch', 56, 56, color);
    sq.cornerRadius = 12;
    if (color === '#ffffff' || color === '#f5f5f7') {
      sq.strokes = paint(THEME.light.border);
      sq.strokeWeight = 1;
    }
    cell.appendChild(sq);
    cell.appendChild(await mkText(label, 10, 600, THEME.light.textMuted, 'CENTER'));
    swatchRow.appendChild(cell);
  }

  // Typography
  const typeSec = frame('Typography', 1100, null, null, 'VERTICAL');
  gap(typeSec, 12);
  root.appendChild(typeSec);
  typeSec.appendChild(await mkText('Typography', 20, 700, THEME.light.text));
  typeSec.appendChild(await mkText('Display — 28px / 800 — brand title', 28, 800, THEME.light.text));
  typeSec.appendChild(await mkText('Title — 20px / 700 — screen headers', 20, 700, THEME.light.text));
  typeSec.appendChild(await mkText('Body — 16px / 400', 16, 400, THEME.light.text));
  typeSec.appendChild(await mkText('Caption — 14px / 600 — muted labels', 14, 600, THEME.light.textMuted));

  // Shape
  const shapeSec = frame('Shape', 1100, null, null, 'VERTICAL');
  gap(shapeSec, 12);
  root.appendChild(shapeSec);
  shapeSec.appendChild(await mkText('Shape tokens', 20, 700, THEME.light.text));
  const shapes = frame('shape-row', 1100, null, null, 'HORIZONTAL');
  gap(shapes, 24);
  shapeSec.appendChild(shapes);
  const cardDemo = frame('Card radius 20px', 120, 80, THEME.light.surface);
  cardDemo.cornerRadius = CARD_R;
  cardDemo.strokes = paint(THEME.light.border);
  cardDemo.strokeWeight = 1;
  shapes.appendChild(cardDemo);
  shapes.appendChild(await mkText('Card radius: 20px', 14, 600, THEME.light.textMuted));
  const chipDemo = frame('Chip', 80, 32, THEME.brand.primary);
  chipDemo.cornerRadius = CHIP_R;
  shapes.appendChild(chipDemo);
  shapes.appendChild(await mkText('Chip radius: 999px · Search height: 40px', 14, 600, THEME.light.textMuted));

  // Type palette
  const typePal = frame('Pokemon Types', 1100, null, null, 'VERTICAL');
  gap(typePal, 12);
  root.appendChild(typePal);
  typePal.appendChild(await mkText('Pokémon type palette', 20, 700, THEME.light.text));
  const typeGrid = frame('type-grid', 1100, null, null, 'HORIZONTAL');
  typeGrid.layoutWrap = 'WRAP';
  gap(typeGrid, 8);
  typeGrid.counterAxisSpacing = 8;
  typePal.appendChild(typeGrid);
  for (const [name, color] of TYPES) {
    typeGrid.appendChild(await makeTypeChip(name, color));
  }
}

// ─── Components ──────────────────────────────────────────────

async function makeTypeChip(typeName, color) {
  const chip = frame(`TypeChip/${typeName}`, null, 26, color, 'HORIZONTAL');
  chip.cornerRadius = CHIP_R;
  chip.counterAxisAlignItems = 'CENTER';
  chip.primaryAxisAlignItems = 'CENTER';
  pad(chip, 4, 12, 4, 12);
  chip.appendChild(await mkText(typeName, 12, 600, '#ffffff'));
  return chip;
}

async function makeSearchBar(theme, placeholder) {
  const bar = frame('SearchBar', W - 32, 40, theme.searchFill);
  bar.cornerRadius = CHIP_R;
  pad(bar, 0, 16, 0, 16);
  bar.layoutMode = 'HORIZONTAL';
  bar.counterAxisAlignItems = 'CENTER';
  gap(bar, 8);
  bar.appendChild(await mkText('⌕', 16, 400, theme.textMuted));
  bar.appendChild(await mkText(placeholder || 'Search Pokémon by name or ID', 14, 400, theme.textMuted));
  return bar;
}

async function makeLangSwitch(theme, active) {
  const wrap = frame('LangSwitch', 72, 38, theme.surface, 'HORIZONTAL');
  wrap.cornerRadius = CHIP_R;
  wrap.strokes = paint(theme.border);
  wrap.strokeWeight = 1;
  wrap.counterAxisAlignItems = 'CENTER';
  wrap.primaryAxisAlignItems = 'CENTER';
  wrap.itemSpacing = 4;
  pad(wrap, 4, 4, 4, 4);
  for (const loc of ['EN', 'ID']) {
    const btn = frame(loc, 30, 30, active === loc ? THEME.brand.primary : null, 'HORIZONTAL');
    btn.cornerRadius = CHIP_R;
    btn.counterAxisAlignItems = 'CENTER';
    btn.primaryAxisAlignItems = 'CENTER';
    btn.appendChild(await mkText(loc, 10, 700, active === loc ? '#ffffff' : theme.textMuted));
    wrap.appendChild(btn);
  }
  return wrap;
}

async function makeThemePillMobile(theme, isDark) {
  const track = frame('ThemePillToggle', 54, 38, isDark ? '#48484a' : '#c7c7cc');
  track.cornerRadius = CHIP_R;
  track.clipsContent = true;
  const thumb = frame('thumb', 32, 32, '#ffffff', 'HORIZONTAL');
  thumb.cornerRadius = 16;
  thumb.x = isDark ? 18 : 3;
  thumb.y = 3;
  thumb.counterAxisAlignItems = 'CENTER';
  thumb.primaryAxisAlignItems = 'CENTER';
  thumb.appendChild(await mkText(isDark ? '☾' : '☀', 14, 600, '#111111'));
  track.appendChild(thumb);
  return track;
}

async function makeHeaderBrand(theme, isDark) {
  const header = frame('Header/Brand', W, null, theme.background, 'VERTICAL');
  pad(header, 8, 16, 10, 16);
  gap(header, 8);
  const top = frame('header-brand', W - 32, null, null, 'HORIZONTAL');
  top.counterAxisAlignItems = 'CENTER';
  top.primaryAxisAlignItems = 'SPACE_BETWEEN';
  const titles = frame('header-title', null, null, null, 'VERTICAL');
  gap(titles, 1);
  titles.counterAxisAlignItems = 'MIN';
  titles.appendChild(await mkText('My Pokedex', 18, 800, theme.text));
  titles.appendChild(await mkText('by Jublia AI', 18, 800, theme.text));
  top.appendChild(titles);
  hug(titles);
  const actions = frame('header-brand__actions', null, null, null, 'HORIZONTAL');
  gap(actions, 8);
  actions.counterAxisAlignItems = 'CENTER';
  const switches = frame('switches', null, null, null, 'HORIZONTAL');
  gap(switches, 8);
  switches.appendChild(await makeLangSwitch(theme, 'EN'));
  switches.appendChild(await makeThemePillMobile(theme, isDark));
  actions.appendChild(switches);
  const pokeWrap = frame('header-pokeball-button', null, 40, null, 'HORIZONTAL');
  pokeWrap.counterAxisAlignItems = 'CENTER';
  pokeWrap.itemSpacing = 14;
  const divider = figma.createRectangle();
  divider.name = 'divider';
  divider.resize(1, 28);
  divider.fills = paint(theme.border);
  pokeWrap.appendChild(divider);
  const pokeBtn = frame('pokeball', 36, 36, null);
  addVectorPokeball(pokeBtn, 32);
  pokeWrap.appendChild(pokeBtn);
  actions.appendChild(pokeWrap);
  hug(pokeWrap);
  top.appendChild(actions);
  hug(actions);
  header.appendChild(top);
  header.appendChild(await makeSearchBar(theme));
  return header;
}

async function makeHeaderDefault(theme, title, isDark, searchPlaceholder) {
  const header = frame('Header/Default', W, null, theme.surface, 'VERTICAL');
  pad(header, 12, 16, 10, 16);
  gap(header, 8);
  const top = frame('top', W - 32, null, null, 'HORIZONTAL');
  top.counterAxisAlignItems = 'CENTER';
  top.primaryAxisAlignItems = 'SPACE_BETWEEN';
  top.appendChild(await mkText(title, 20, 700, theme.text));
  const controls = frame('controls', null, null, null, 'HORIZONTAL');
  gap(controls, 8);
  controls.appendChild(await makeLangSwitch(theme, 'EN'));
  controls.appendChild(await makeThemePillMobile(theme, isDark));
  top.appendChild(controls);
  header.appendChild(top);
  if (searchPlaceholder) {
    header.appendChild(await makeSearchBar(theme, searchPlaceholder));
  }
  return header;
}

async function makeHeaderSimple(theme, title, isDark) {
  const header = frame('Header/Simple', W, null, theme.surface, 'HORIZONTAL');
  pad(header, 12, 16, 12, 16);
  gap(header, 8);
  header.counterAxisAlignItems = 'CENTER';
  header.primaryAxisAlignItems = 'SPACE_BETWEEN';
  header.appendChild(await mkText(title, 20, 700, theme.text));
  const controls = frame('controls', null, null, null, 'HORIZONTAL');
  gap(controls, 8);
  controls.appendChild(await makeLangSwitch(theme, 'EN'));
  controls.appendChild(await makeThemePillMobile(theme, isDark));
  header.appendChild(controls);
  return header;
}

async function makeHeaderOverlay(theme, title, isDark) {
  const header = frame('Header/Overlay', W, 56, null, 'HORIZONTAL');
  pad(header, 8, 16, 8, 16);
  gap(header, 12);
  header.counterAxisAlignItems = 'CENTER';
  const back = frame('back', 36, 36, theme.surface);
  back.cornerRadius = 18;
  back.layoutMode = 'HORIZONTAL';
  back.counterAxisAlignItems = 'CENTER';
  back.primaryAxisAlignItems = 'CENTER';
  back.appendChild(await mkText('←', 18, 600, theme.text));
  header.appendChild(back);
  header.appendChild(await mkText(title, 18, 700, theme.text));
  const spacer = frame('spacer', 1, 1, null);
  header.appendChild(spacer);
  spacer.layoutGrow = 1;
  const controls = frame('controls', null, null, null, 'HORIZONTAL');
  gap(controls, 8);
  controls.appendChild(await makeLangSwitch(theme, 'EN'));
  controls.appendChild(await makeThemePillMobile(theme, isDark));
  header.appendChild(controls);
  return header;
}

async function makePokemonCard(theme, name, id, types, spriteUrl) {
  const typeColor = (TYPES.find((x) => x[0] === types[0]) || ['', '#a8a878'])[1];
  const card = frame('PokemonCard', 170, null, theme.surface, 'VERTICAL');
  card.cornerRadius = CARD_R;
  card.strokes = paint(theme.border);
  card.strokeWeight = 1;
  card.effects = shadow();
  card.clipsContent = true;

  const fav = frame('favorite-btn', 32, 32, null, 'HORIZONTAL');
  fav.cornerRadius = 16;
  fav.counterAxisAlignItems = 'CENTER';
  fav.primaryAxisAlignItems = 'CENTER';
  fav.appendChild(await mkText('♡', 16, 400, theme.textMuted));
  card.appendChild(fav);
  fav.layoutPositioning = 'ABSOLUTE';
  fav.x = 126;
  fav.y = 8;

  const spriteArea = frame('image-wrap', 170, 168, theme.surface);
  spriteArea.clipsContent = true;
  const outerAura = figma.createEllipse();
  outerAura.name = 'aura-outer';
  outerAura.resize(156, 156);
  outerAura.x = 7;
  outerAura.y = 6;
  outerAura.fills = paint(typeColor + '55');
  outerAura.opacity = 0.55;
  spriteArea.appendChild(outerAura);
  const innerAura = figma.createEllipse();
  innerAura.name = 'aura-inner';
  innerAura.resize(120, 120);
  innerAura.x = 25;
  innerAura.y = 24;
  innerAura.fills = paint(typeColor + '88');
  innerAura.opacity = 0.45;
  spriteArea.appendChild(innerAura);
  const sprite = frame('sprite', 108, 108, null);
  sprite.x = 31;
  sprite.y = 30;
  if (spriteUrl) {
    const img = await tryImage(spriteUrl);
    setImageFill(sprite, img);
  }
  spriteArea.appendChild(sprite);
  card.appendChild(spriteArea);

  const info = frame('card-body', 170, null, null, 'VERTICAL');
  pad(info, 4, 16, 16, 16);
  gap(info, 4);
  info.counterAxisAlignItems = 'MIN';
  info.appendChild(await mkText(id, 12, 400, theme.textMuted));
  info.appendChild(await mkText(name, 18, 800, theme.text));
  const chips = frame('types', null, null, null, 'HORIZONTAL');
  gap(chips, 6);
  for (const t of types) {
    const typeData = TYPES.find((x) => x[0] === t);
    chips.appendChild(await makeTypeChip(t, typeData ? typeData[1] : '#a8a878'));
  }
  info.appendChild(chips);
  card.appendChild(info);
  return card;
}

function addPromoGlow(parent, x, y, size, color) {
  const glow = figma.createEllipse();
  glow.name = 'promo-glow';
  glow.resize(size, size);
  glow.fills = paint(color);
  glow.opacity = 0.4;
  parent.insertChild(0, glow);
  glow.layoutPositioning = 'ABSOLUTE';
  glow.x = x;
  glow.y = y;
}

async function makeComparePromo() {
  const promoW = W - 32;
  const promo = frame('ComparePromo', promoW, null, '#12131a', 'VERTICAL');
  promo.cornerRadius = 24;
  promo.clipsContent = true;
  promo.strokes = paint('#ffffff14');
  promo.strokeWeight = 1;
  pad(promo, 16, 16, 16, 16);
  gap(promo, 14);

  addPromoGlow(promo, -30, 70, 140, '#f8d03055');
  addPromoGlow(promo, promoW - 90, 55, 140, '#f0803055');

  const header = frame('promo-header', promoW - 32, null, null, 'HORIZONTAL');
  header.primaryAxisAlignItems = 'SPACE_BETWEEN';
  header.counterAxisAlignItems = 'MIN';

  const titles = frame('titles', null, null, null, 'VERTICAL');
  gap(titles, 6);
  titles.counterAxisAlignItems = 'MIN';
  const badge = frame('badge', null, null, THEME.brand.primary, 'HORIZONTAL');
  badge.cornerRadius = CHIP_R;
  pad(badge, 3, 9, 3, 9);
  badge.counterAxisAlignItems = 'CENTER';
  badge.primaryAxisAlignItems = 'CENTER';
  badge.appendChild(await mkText('FEATURED', 10, 800, '#ffffff'));
  titles.appendChild(badge);
  hug(badge);
  titles.appendChild(await mkText('Battle stats head-to-head', 17, 800, '#f4f4f7'));
  titles.appendChild(await mkText('Pick two Pokémon and see who wins.', 13, 400, '#b8b8bf'));
  header.appendChild(titles);
  hug(titles);

  const shuffle = frame('shuffle', 40, 40, '#ffffff0f', 'HORIZONTAL');
  shuffle.cornerRadius = 12;
  shuffle.strokes = paint('#ffffff24');
  shuffle.strokeWeight = 1;
  shuffle.counterAxisAlignItems = 'CENTER';
  shuffle.primaryAxisAlignItems = 'CENTER';
  shuffle.appendChild(await mkText('⇄', 16, 600, '#ffffff'));
  header.appendChild(shuffle);
  promo.appendChild(header);

  const arena = frame('arena', promoW - 32, null, null, 'HORIZONTAL');
  gap(arena, 6);
  arena.counterAxisAlignItems = 'CENTER';
  arena.primaryAxisAlignItems = 'CENTER';

  async function fighter(name, spriteUrl, accent) {
    const card = frame('fighter-card', null, 118, '#ffffff0f', 'VERTICAL');
    card.cornerRadius = 18;
    card.strokes = paint(accent + '55');
    card.strokeWeight = 1;
    card.counterAxisAlignItems = 'CENTER';
    card.primaryAxisAlignItems = 'CENTER';
    gap(card, 6);
    pad(card, 10, 8, 8, 8);
    const sp = frame('sprite', 72, 72, null);
    const img = await tryImage(spriteUrl);
    setImageFill(sp, img);
    card.appendChild(sp);
    card.appendChild(await mkText(name, 12, 700, '#f4f4f7', 'CENTER'));
    return card;
  }

  const leftFighter = await fighter('Pikachu', SPRITES.pikachu, '#f8d030');
  appendFill(arena, leftFighter);

  const vsCol = frame('vs-col', 38, null, null, 'VERTICAL');
  gap(vsCol, 8);
  align(vsCol, 'CENTER', 'CENTER');
  const vs = frame('VS', 38, 38, THEME.brand.primary, 'HORIZONTAL');
  vs.cornerRadius = 12;
  vs.counterAxisAlignItems = 'CENTER';
  vs.primaryAxisAlignItems = 'CENTER';
  vs.appendChild(await mkText('VS', 11, 900, '#ffffff'));
  vsCol.appendChild(vs);
  const swap = frame('swap', 34, 34, '#ffffff14', 'HORIZONTAL');
  swap.cornerRadius = CHIP_R;
  swap.strokes = paint('#ffffff28');
  swap.strokeWeight = 1;
  swap.counterAxisAlignItems = 'CENTER';
  swap.primaryAxisAlignItems = 'CENTER';
  swap.appendChild(await mkText('⇄', 14, 600, '#ffffff'));
  vsCol.appendChild(swap);
  arena.appendChild(vsCol);

  const rightFighter = await fighter('Charizard', SPRITES.charizard, '#f08030');
  appendFill(arena, rightFighter);
  promo.appendChild(arena);

  const bst = frame('bst-track', promoW - 32, 8, null, 'HORIZONTAL');
  bst.cornerRadius = CHIP_R;
  bst.clipsContent = true;
  bst.fills = paint('#ffffff1a');
  const leftFill = frame('left', Math.round((promoW - 32) * 0.58), 8, '#f8d030');
  const rightFill = frame('right', null, 8, '#f08030');
  bst.appendChild(leftFill);
  appendFill(bst, rightFill);
  promo.appendChild(bst);

  const leader = frame('leader', promoW - 32, null, null, 'HORIZONTAL');
  leader.counterAxisAlignItems = 'CENTER';
  leader.primaryAxisAlignItems = 'CENTER';
  leader.itemSpacing = 6;
  leader.appendChild(await mkText('⚡', 14, 400, '#ffd54f'));
  leader.appendChild(await mkText('Pikachu leads', 12, 700, '#b8b8bf'));
  promo.appendChild(leader);

  const cta = await makePrimaryCta('Start comparing', promoW - 32);
  promo.appendChild(cta);
  return promo;
}

const TAB_ICON_PATHS = {
  Home: 'M 10 20 V 14 H 14 V 20 H 19 V 12 H 22 L 12 3 L 2 12 H 5 V 20 Z',
  Compare: 'M 7 11 L 3 15 L 7 19 V 16 H 14 V 14 H 7 V 11 Z M 21 9 L 17 5 V 8 H 10 V 10 H 17 V 13 L 21 9 Z',
  Favorites:
    'M 12 21.35 L 10.55 20.03 C 5.4 15.36 2 12.28 2 8.5 C 2 5.42 4.42 3 7.5 3 C 9.24 3 10.91 3.81 12 5.09 C 13.09 3.81 14.76 3 16.5 3 C 19.58 3 22 5.42 22 8.5 C 22 12.28 18.6 15.36 13.45 20.04 L 12 21.35 Z',
  Settings:
    'M 12 15.6 C 10.02 15.6 8.4 13.98 8.4 12 C 8.4 10.02 10.02 8.4 12 8.4 C 13.98 8.4 15.6 10.02 15.6 12 C 15.6 13.98 13.98 15.6 12 15.6 Z M 19.14 12.94 C 19.18 12.64 19.2 12.32 19.2 12 C 19.2 11.68 19.18 11.36 19.13 11.06 L 21.16 9.48 C 21.34 9.34 21.39 9.07 21.28 8.87 L 19.36 5.55 C 19.24 5.33 18.99 5.26 18.77 5.33 L 16.38 6.29 C 15.88 5.91 15.35 5.59 14.76 5.35 L 14.4 2.81 C 14.36 2.57 14.16 2.4 13.92 2.4 H 10.08 C 9.84 2.4 9.64 2.57 9.61 2.81 L 9.25 5.35 C 8.66 5.59 8.12 5.91 7.63 6.29 L 5.24 5.33 C 5.02 5.25 4.77 5.33 4.65 5.55 L 2.73 8.87 C 2.61 9.08 2.65 9.34 2.85 9.48 L 4.88 11.06 C 4.84 11.36 4.8 11.69 4.8 12 C 4.8 12.31 4.82 12.64 4.87 12.94 L 2.84 14.52 C 2.66 14.66 2.61 14.93 2.72 15.13 L 4.64 18.45 C 4.76 18.67 5.01 18.74 5.23 18.67 L 7.62 17.71 C 8.12 18.09 8.65 18.41 9.24 18.65 L 9.6 21.19 C 9.64 21.43 9.84 21.6 10.08 21.6 H 13.92 C 14.16 21.6 14.36 21.43 14.39 21.19 L 14.75 18.65 C 15.34 18.41 15.88 18.09 16.37 17.71 L 18.76 18.67 C 18.98 18.75 19.23 18.67 19.35 18.45 L 21.27 15.13 C 21.39 14.92 21.34 14.66 21.14 14.52 L 19.14 12.94 Z',
};

const TAB_ICON_FALLBACK = {
  Home: '⌂',
  Compare: '⇄',
  Favorites: '♥',
  Settings: '⚙',
};

async function makeTabIcon(tab, size, color) {
  try {
  const path = TAB_ICON_PATHS[tab];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${color}" d="${path}"/></svg>`;
    const node = figma.createNodeFromSvg(svg);
    node.name = `icon/${tab}`;
    node.resize(size, size);
    return node;
  } catch (e) {
    const wrap = frame(`icon/${tab}`, size, size, null, 'HORIZONTAL');
    wrap.counterAxisAlignItems = 'CENTER';
    wrap.primaryAxisAlignItems = 'CENTER';
    wrap.appendChild(await mkText(TAB_ICON_FALLBACK[tab], size - 2, 700, color));
    return wrap;
  }
}

async function makeTabBar(theme, active) {
  const tabs = ['Home', 'Compare', 'Favorites', 'Settings'];
  const bar = frame('TabBar', W, 56, theme.surface, 'HORIZONTAL');
  bar.strokes = paint(theme.border);
  bar.strokeWeight = 1;
  bar.primaryAxisAlignItems = 'SPACE_BETWEEN';
  pad(bar, 8, 24, 24, 24);
  for (const tab of tabs) {
    const isActive = tab === active;
    const item = frame(tab, null, null, null, 'VERTICAL');
    gap(item, 4);
    align(item, 'CENTER', 'CENTER');
    const icon = await makeTabIcon(tab, 22, isActive ? THEME.brand.primary : theme.textMuted);
    item.appendChild(icon);
    item.appendChild(await mkText(tab, 10, isActive ? 700 : 500, isActive ? THEME.brand.primary : theme.textMuted, 'CENTER'));
    bar.appendChild(item);
  }
  return bar;
}

async function makeCompareCard(theme, side, spriteUrl) {
  const card = frame('CompareCard', null, 190, theme.surface, 'VERTICAL');
  card.cornerRadius = CARD_R;
  card.strokes = paint(theme.border);
  card.strokeWeight = 1.5;
  card.dashPattern = spriteUrl ? [] : [6, 5];
  card.counterAxisAlignItems = 'CENTER';
  card.primaryAxisAlignItems = 'CENTER';
  gap(card, 8);
  pad(card, 16, 12, 16, 12);
  card.appendChild(await mkText(side, 11, 700, THEME.brand.primary));
  if (spriteUrl) {
    const sprite = frame('sprite', 72, 72, null);
    const img = await tryImage(spriteUrl);
    setImageFill(sprite, img);
    card.appendChild(sprite);
    card.appendChild(await mkText('Pikachu', 15, 800, theme.text, 'CENTER'));
    const chips = frame('types', null, null, null, 'HORIZONTAL');
    gap(chips, 4);
    chips.appendChild(await makeTypeChip('Electric', '#f8d030'));
    card.appendChild(chips);
  } else {
    const icon = frame('icon', 44, 44, theme.background, 'HORIZONTAL');
    icon.cornerRadius = 22;
    icon.counterAxisAlignItems = 'CENTER';
    icon.primaryAxisAlignItems = 'CENTER';
    icon.appendChild(await mkText('+', 20, 700, theme.textMuted));
    card.appendChild(icon);
    card.appendChild(await mkText('Tap to assign', 12, 500, theme.textMuted, 'CENTER'));
  }
  return card;
}

async function makeStatBar(theme, label, value, max) {
  const row = frame('StatBar', 320, null, null, 'VERTICAL');
  gap(row, 4);
  const top = frame('labels', 320, null, null, 'HORIZONTAL');
  top.primaryAxisAlignItems = 'SPACE_BETWEEN';
  top.appendChild(await mkText(label, 12, 600, theme.textMuted));
  top.appendChild(await mkText(String(value), 12, 700, theme.text));
  row.appendChild(top);
  const track = frame('track', 320, 8, theme.border);
  track.cornerRadius = 4;
  const fill = frame('fill', (value / max) * 320, 8, THEME.brand.primary);
  fill.cornerRadius = 4;
  track.appendChild(fill);
  row.appendChild(track);
  return row;
}

async function makePrimaryCta(label, width) {
  const btn = frame('Button/Primary', width, 48, THEME.brand.primary, 'HORIZONTAL');
  btn.cornerRadius = 14;
  btn.counterAxisAlignItems = 'CENTER';
  btn.primaryAxisAlignItems = 'CENTER';
  btn.itemSpacing = 8;
  pad(btn, 12, 16, 12, 16);
  btn.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0.898, g: 0.224, b: 0.208, a: 0.35 },
    offset: { x: 0, y: 10 },
    radius: 24,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL',
  }];
  btn.appendChild(await mkText('⇄', 16, 600, '#ffffff'));
  btn.appendChild(await mkText(label, 14, 700, '#ffffff'));
  return btn;
}

async function makeButton(label, variant, theme, width) {
  const btn = frame(
    `Button/${variant}`,
    width ?? null,
    48,
    variant === 'Primary' ? THEME.brand.primary : theme.surface,
    'HORIZONTAL',
  );
  btn.cornerRadius = variant === 'Primary' ? 14 : CHIP_R;
  if (variant === 'Outline') {
    btn.strokes = paint(THEME.brand.primary);
    btn.strokeWeight = 2;
  }
  pad(btn, 12, 24, 12, 24);
  btn.counterAxisAlignItems = 'CENTER';
  btn.primaryAxisAlignItems = 'CENTER';
  btn.appendChild(await mkText(label, 14, 700, variant === 'Primary' ? '#ffffff' : THEME.brand.primary));
  return btn;
}

async function buildComponentsPage(page) {
  switchPage(page);
  page.name = 'Components';

  const root = frame('Component Library', 900, null, THEME.light.background, 'VERTICAL');
  pad(root, 40, 40, 40, 40);
  gap(root, 32);
  page.appendChild(root);
  root.appendChild(await mkText('Components', 28, 800, THEME.light.text));
  root.appendChild(await mkText('390px-wide mobile components — Light theme reference', 14, 400, THEME.light.textMuted));

  const theme = THEME.light;
  const list = [
    ['Header/Brand', () => makeHeaderBrand(theme, false)],
    ['Header/Default', () => makeHeaderDefault(theme, 'Compare Pokémon', false, 'Search Pokémon to compare...')],
    ['Header/Overlay', () => makeHeaderOverlay(theme, 'Pikachu', false)],
    ['SearchBar', () => makeSearchBar(theme)],
    ['ThemePillToggle', () => makeThemePillMobile(theme, false)],
    ['PokemonCard', () => makePokemonCard(theme, 'Pikachu', '#025', ['Electric'], SPRITES.pikachu)],
    ['TypeChip', () => makeTypeChip('Fire', '#f08030')],
    ['TabBar', () => makeTabBar(theme, 'Home')],
    ['CompareCard', () => makeCompareCard(theme, 'Left')],
    ['StatBar', () => makeStatBar(theme, 'HP', 35, 255)],
    ['Button/Primary', () => makeButton('Start comparing', 'Primary', theme)],
    ['Button/Outline', () => makeButton('Explore Pokémon', 'Outline', theme)],
  ];

  for (const [name, factory] of list) {
    const section = frame(name, 420, null, null, 'VERTICAL');
    gap(section, 8);
    section.appendChild(await mkText(name, 12, 600, THEME.light.textMuted));
    section.appendChild(await factory());
    root.appendChild(section);
  }
}

// ─── Screens ─────────────────────────────────────────────────

async function screenFrame(name, theme, isDark, builder) {
  const screen = figma.createFrame();
  screen.name = name;
  screen.resize(W, H);
  screen.layoutMode = 'VERTICAL';
  screen.primaryAxisSizingMode = 'FIXED';
  screen.counterAxisSizingMode = 'FIXED';
  screen.fills = paint(theme.background);
  screen.clipsContent = true;
  await builder(screen, theme, isDark);
  return screen;
}

async function buildSplashContent(screen, theme, isDark) {
  const body = figma.createFrame();
  body.name = 'body';
  body.resize(W, H);
  body.fills = paint(theme.background);
  body.layoutMode = 'VERTICAL';
  body.primaryAxisSizingMode = 'FIXED';
  body.counterAxisSizingMode = 'FIXED';
  body.primaryAxisAlignItems = 'CENTER';
  body.counterAxisAlignItems = 'CENTER';
  body.itemSpacing = 28;
  body.paddingTop = 100;
  body.paddingBottom = 80;

  const hero = figma.createFrame();
  hero.name = 'splash-hero';
  hero.resize(260, 260);
  hero.fills = [];
  addSplashAura(hero, 260, isDark);
  addSplashDecor(hero, 260);
  const ballHost = figma.createFrame();
  ballHost.name = 'ball-host';
  ballHost.resize(150, 150);
  ballHost.x = 55;
  ballHost.y = 55;
  ballHost.fills = [];
  addVectorPokeball(ballHost, 150);
  hero.appendChild(ballHost);
  body.appendChild(hero);

  body.appendChild(await mkText('My Pokedex', 36, 800, theme.text, 'CENTER'));
  body.appendChild(await mkText('by Jublia AI', 22, 400, theme.text, 'CENTER'));

  const loader = frame('splash-loader', 28, 28, null);
  loader.layoutMode = 'HORIZONTAL';
  loader.counterAxisAlignItems = 'CENTER';
  loader.primaryAxisAlignItems = 'CENTER';
  loader.appendChild(await mkText('◌', 24, 400, theme.textMuted, 'CENTER'));
  body.appendChild(loader);
  screen.appendChild(body);
}

async function buildHomeContent(screen, theme, isDark) {
  screen.appendChild(await makeHeaderBrand(theme, isDark));
  const content = frame('content', W, null, null, 'VERTICAL');
  pad(content, 0, 16, 80, 16);
  gap(content, 16);

  content.appendChild(await makeComparePromo());

  const filtersHeader = frame('filters-header', W - 32, null, null, 'HORIZONTAL');
  filtersHeader.primaryAxisAlignItems = 'SPACE_BETWEEN';
  filtersHeader.counterAxisAlignItems = 'CENTER';
  filtersHeader.appendChild(await mkText('Multi-Select Type', 14, 700, theme.text));
  filtersHeader.appendChild(await mkText('Browse by type', 14, 700, THEME.brand.primary));
  content.appendChild(filtersHeader);

  const chips = frame('filters', W - 32, null, null, 'HORIZONTAL');
  gap(chips, 8);
  for (const [name, color] of TYPES.slice(0, 5)) {
    chips.appendChild(await makeTypeChip(name, color));
  }
  content.appendChild(chips);

  content.appendChild(await mkText('151 Pokémon', 14, 600, theme.textMuted));

  const grid = frame('grid', W - 32, null, null, 'HORIZONTAL');
  gap(grid, 12);
  grid.appendChild(await makePokemonCard(theme, 'Pikachu', '#025', ['Electric'], SPRITES.pikachu));
  grid.appendChild(await makePokemonCard(theme, 'Charizard', '#006', ['Fire', 'Flying'], SPRITES.charizard));
  content.appendChild(grid);
  screen.appendChild(content);
  screen.appendChild(await makeTabBar(theme, 'Home'));
}

async function buildCompareContent(screen, theme, isDark) {
  screen.appendChild(await makeHeaderDefault(theme, 'Compare Pokémon', isDark, 'Search Pokémon to compare...'));
  const content = frame('content', W, null, null, 'VERTICAL');
  pad(content, 16, 16, 80, 16);
  gap(content, 16);

  const toolbar = frame('compare-toolbar', W - 32, null, null, 'HORIZONTAL');
  toolbar.primaryAxisAlignItems = 'SPACE_BETWEEN';
  toolbar.counterAxisAlignItems = 'CENTER';
  toolbar.appendChild(await mkText('Tap a side, then pick a Pokémon.', 13, 400, theme.textMuted));
  const surprise = frame('surprise', null, 32, null, 'HORIZONTAL');
  surprise.cornerRadius = CHIP_R;
  surprise.strokes = paint(THEME.brand.primary);
  surprise.strokeWeight = 1.5;
  surprise.counterAxisAlignItems = 'CENTER';
  surprise.primaryAxisAlignItems = 'CENTER';
  surprise.itemSpacing = 6;
  pad(surprise, 6, 12, 6, 12);
  surprise.appendChild(await mkText('⇄', 12, 700, THEME.brand.primary));
  surprise.appendChild(await mkText('Surprise me', 12, 700, THEME.brand.primary));
  toolbar.appendChild(surprise);
  content.appendChild(toolbar);

  const duel = frame('duel', W - 32, null, null, 'HORIZONTAL');
  gap(duel, 8);
  duel.counterAxisAlignItems = 'CENTER';
  duel.primaryAxisAlignItems = 'CENTER';
  appendFill(duel, await makeCompareCard(theme, 'LEFT', SPRITES.pikachu));
  const vs = frame('VS', 36, 36, THEME.brand.primary, 'HORIZONTAL');
  vs.cornerRadius = 18;
  vs.counterAxisAlignItems = 'CENTER';
  vs.primaryAxisAlignItems = 'CENTER';
  vs.appendChild(await mkText('vs', 12, 800, '#ffffff'));
  duel.appendChild(vs);
  appendFill(duel, await makeCompareCard(theme, 'RIGHT', null));
  content.appendChild(duel);

  const bst = frame('BST', W - 32, null, theme.surface, 'VERTICAL');
  bst.cornerRadius = CARD_R;
  bst.strokes = paint(theme.border);
  bst.strokeWeight = 1;
  pad(bst, 12, 12, 12, 12);
  gap(bst, 8);
  bst.appendChild(await mkText('Total BST', 14, 700, theme.text));
  const barRow = frame('bars', W - 56, 16, null, 'HORIZONTAL');
  gap(barRow, 4);
  const leftBar = frame('left', 140, 16, THEME.brand.primary);
  leftBar.cornerRadius = 4;
  const rightBar = frame('right', 100, 16, THEME.brand.secondary);
  rightBar.cornerRadius = 4;
  barRow.appendChild(leftBar);
  barRow.appendChild(rightBar);
  bst.appendChild(barRow);
  content.appendChild(bst);

  const radar = frame('RadarChart Placeholder', W - 32, 160, theme.surface);
  radar.cornerRadius = CARD_R;
  radar.strokes = paint(theme.border);
  radar.strokeWeight = 1;
  radar.layoutMode = 'VERTICAL';
  radar.counterAxisAlignItems = 'CENTER';
  radar.primaryAxisAlignItems = 'CENTER';
  radar.appendChild(await mkText('Radar chart placeholder', 13, 600, theme.textMuted, 'CENTER'));
  content.appendChild(radar);
  screen.appendChild(content);
  screen.appendChild(await makeTabBar(theme, 'Compare'));
}

async function buildDetailContent(screen, theme, isDark) {
  screen.appendChild(await makeHeaderOverlay(theme, 'Pikachu', isDark));
  const content = frame('content', W, null, null, 'VERTICAL');
  pad(content, 0, 16, 24, 16);
  gap(content, 16);

  const hero = frame('hero', W - 32, 220, theme.surface, 'VERTICAL');
  hero.cornerRadius = CARD_R;
  hero.strokes = paint(theme.border);
  hero.strokeWeight = 1;
  hero.counterAxisAlignItems = 'CENTER';
  hero.primaryAxisAlignItems = 'CENTER';
  const auraOuter = figma.createEllipse();
  auraOuter.name = 'aura-outer';
  auraOuter.resize(180, 180);
  auraOuter.fills = paint('#f8d03040');
  hero.appendChild(auraOuter);
  auraOuter.layoutPositioning = 'ABSOLUTE';
  auraOuter.x = (W - 32 - 180) / 2;
  auraOuter.y = 20;
  const sprite = frame('sprite', 150, 150, null);
  const spriteImg = await tryImage(SPRITES.pikachu);
  setImageFill(sprite, spriteImg);
  hero.appendChild(sprite);
  content.appendChild(hero);

  const identity = frame('identity', W - 32, null, null, 'VERTICAL');
  identity.counterAxisAlignItems = 'CENTER';
  gap(identity, 4);
  identity.appendChild(await mkText('#025', 13, 600, theme.textMuted, 'CENTER'));
  identity.appendChild(await mkText('Pikachu', 24, 800, theme.text, 'CENTER'));
  const idTypes = frame('types', null, null, null, 'HORIZONTAL');
  gap(idTypes, 6);
  idTypes.appendChild(await makeTypeChip('Electric', '#f8d030'));
  identity.appendChild(idTypes);
  content.appendChild(identity);

  const actions = frame('actions', W - 32, null, null, 'HORIZONTAL');
  gap(actions, 8);
  actions.appendChild(await makeButton('♥ Favorite', 'Outline', theme));
  actions.appendChild(await makeButton('Compare', 'Outline', theme));
  content.appendChild(actions);

  const stats = frame('physical-stats', W - 32, null, theme.surface, 'HORIZONTAL');
  stats.cornerRadius = CARD_R;
  stats.strokes = paint(theme.border);
  stats.strokeWeight = 1;
  pad(stats, 14, 16, 14, 16);
  stats.primaryAxisAlignItems = 'SPACE_BETWEEN';
  for (const [label, value] of [['Height', '0.4 m'], ['Weight', '6.0 kg']]) {
    const stat = frame(label, null, null, null, 'VERTICAL');
    gap(stat, 2);
    stat.appendChild(await mkText(label, 11, 600, theme.textMuted));
    stat.appendChild(await mkText(value, 16, 800, theme.text));
    stats.appendChild(stat);
  }
  content.appendChild(stats);

  content.appendChild(await mkText('Base Stats', 18, 700, theme.text));
  for (const [l, v] of [['HP', 35], ['Attack', 55], ['Defense', 40], ['Speed', 90]]) {
    content.appendChild(await makeStatBar(theme, l, v, 255));
  }
  screen.appendChild(content);
}

async function buildFavoritesContent(screen, theme, isDark) {
  screen.appendChild(await makeHeaderSimple(theme, 'Favorites', isDark));
  const content = frame('content', W, null, null, 'VERTICAL');
  pad(content, 16, 16, 80, 16);
  gap(content, 12);
  content.appendChild(await mkText('3 favorites', 14, 600, theme.textMuted));
  const grid = frame('grid', W - 32, null, null, 'HORIZONTAL');
  gap(grid, 12);
  grid.appendChild(await makePokemonCard(theme, 'Pikachu', '#025', ['Electric'], SPRITES.pikachu));
  grid.appendChild(await makePokemonCard(theme, 'Eevee', '#133', ['Normal'], SPRITES.eevee));
  content.appendChild(grid);
  screen.appendChild(content);
  screen.appendChild(await makeTabBar(theme, 'Favorites'));
}

async function buildSettingsContent(screen, theme, isDark) {
  screen.appendChild(await makeHeaderSimple(theme, 'Settings', isDark));
  const content = frame('content', W, null, null, 'VERTICAL');
  pad(content, 16, 16, 80, 16);
  gap(content, 20);

  const hero = frame('hero', W - 32, 100, theme.surface, 'VERTICAL');
  hero.cornerRadius = CARD_R;
  hero.strokes = paint(theme.border);
  hero.strokeWeight = 1;
  pad(hero, 20, 20, 20, 20);
  gap(hero, 4);
  hero.appendChild(await mkText('Premium Pokédex Experience', 18, 700, theme.text));
  hero.appendChild(await mkText('Version 1.0.0', 13, 400, theme.textMuted));
  content.appendChild(hero);

  content.appendChild(await mkText('Language', 14, 600, theme.textMuted));
  const langRow = frame('lang', W - 32, 48, theme.surface, 'HORIZONTAL');
  langRow.cornerRadius = CARD_R;
  langRow.strokes = paint(theme.border);
  langRow.strokeWeight = 1;
  pad(langRow, 12, 16, 12, 16);
  langRow.counterAxisAlignItems = 'CENTER';
  langRow.appendChild(await mkText('English', 16, 500, theme.text));
  content.appendChild(langRow);

  content.appendChild(await mkText('Theme', 14, 600, theme.textMuted));
  const themeRow = frame('theme', W - 32, 48, theme.surface, 'HORIZONTAL');
  themeRow.cornerRadius = CARD_R;
  themeRow.strokes = paint(theme.border);
  themeRow.strokeWeight = 1;
  pad(themeRow, 12, 16, 12, 16);
  themeRow.counterAxisAlignItems = 'CENTER';
  themeRow.primaryAxisAlignItems = 'SPACE_BETWEEN';
  themeRow.appendChild(await mkText('Dark mode', 16, 500, theme.text));
  themeRow.appendChild(await makeThemePillMobile(theme, isDark));
  content.appendChild(themeRow);
  screen.appendChild(content);
  screen.appendChild(await makeTabBar(theme, 'Settings'));
}

async function buildBrowseContent(screen, theme, isDark) {
  screen.appendChild(await makeHeaderSimple(theme, 'Browse Types', isDark));
  const content = frame('content', W, null, null, 'VERTICAL');
  pad(content, 16, 16, 80, 16);
  gap(content, 4);
  content.appendChild(await mkText('Explore by type', 14, 700, theme.text));
  content.appendChild(await mkText('Pick a type to see matching Pokémon.', 13, 400, theme.textMuted));

  const grid = frame('type-grid', W - 32, null, null, 'VERTICAL');
  grid.paddingTop = 12;
  gap(grid, 10);
  const tileW = (W - 32 - 10) / 2;
  for (let i = 0; i < TYPES.length; i += 2) {
    const row = frame('row', W - 32, null, null, 'HORIZONTAL');
    gap(row, 10);
    for (const [name, color] of TYPES.slice(i, i + 2)) {
      const tile = frame(`TypeTile/${name}`, tileW, 64, theme.surface, 'HORIZONTAL');
      tile.cornerRadius = CARD_R;
      tile.strokes = paint(color + '55');
      tile.strokeWeight = 1;
      tile.counterAxisAlignItems = 'CENTER';
      tile.itemSpacing = 8;
      pad(tile, 0, 14, 0, 14);
      const swatch = figma.createEllipse();
      swatch.name = 'swatch';
      swatch.resize(12, 12);
      swatch.fills = paint(color);
      tile.appendChild(swatch);
      const label = await mkText(name, 14, 700, color);
      tile.appendChild(label);
      fillChild(label);
      tile.appendChild(await mkText('›', 16, 700, theme.textMuted));
      row.appendChild(tile);
    }
    grid.appendChild(row);
  }
  content.appendChild(grid);
  screen.appendChild(content);
  screen.appendChild(await makeTabBar(theme, 'Home'));
}

async function buildScreensPage(page) {
  switchPage(page);
  page.name = 'Screens';

  const builders = {
    Splash: buildSplashContent,
    Home: buildHomeContent,
    Compare: buildCompareContent,
    Detail: buildDetailContent,
    Favorites: buildFavoritesContent,
    Settings: buildSettingsContent,
    Browse: buildBrowseContent,
  };

  let y = 0;
  const colGap = 48;
  const rowGap = 64;

  for (const [screenName, builder] of Object.entries(builders)) {
    for (const mode of ['Light', 'Dark']) {
      const isDark = mode === 'Dark';
      const theme = isDark ? THEME.dark : THEME.light;
      const frameName = `Screen/${screenName}/${mode}`;
      const col = mode === 'Light' ? 0 : W + colGap;
      const scr = await screenFrame(frameName, theme, isDark, builder);
      scr.x = col;
      scr.y = y;
      page.appendChild(scr);

      const label = await mkText(frameName, 12, 600, '#888888');
      label.x = col;
      label.y = y - 24;
      page.appendChild(label);
    }
    y += H + rowGap;
  }

  const pageTitle = await mkText('Screens — Light | Dark (390×844)', 24, 800, '#1a1a1a');
  pageTitle.x = 0;
  pageTitle.y = -48;
  page.appendChild(pageTitle);
}

// ─── Main ────────────────────────────────────────────────────

(async () => {
  try {
    await loadFonts();

    const existing = figma.root.children;
    let dsPage = existing.find((p) => p.name === 'Design System') || existing[0];
    let compPage = existing.find((p) => p.name === 'Components');
    let screensPage = existing.find((p) => p.name === 'Screens');

    if (!compPage && existing.length < 3) compPage = figma.createPage();
    if (!screensPage && existing.length < 3) screensPage = figma.createPage();
    if (!compPage) compPage = existing.find((p) => p.name === 'Components') || existing[1];
    if (!screensPage) screensPage = existing.find((p) => p.name === 'Screens') || existing[2];

    dsPage.name = 'Design System';
    compPage.name = 'Components';
    screensPage.name = 'Screens';

    for (const ch of [...dsPage.children]) ch.remove();
    const varBundle = buildVariables();
    await buildDesignSystemPage(dsPage, varBundle);

    for (const ch of [...compPage.children]) ch.remove();
    await buildComponentsPage(compPage);

    for (const ch of [...screensPage.children]) ch.remove();
    await buildScreensPage(screensPage);

    switchPage(screensPage);
    const frames = screensPage.children.filter((n) => n.type === 'FRAME');
    if (frames.length > 0) {
      figma.viewport.scrollAndZoomIntoView([frames[0]]);
    }

    figma.closePlugin('Design rebuilt!');
  } catch (err) {
    const msg = err && typeof err === 'object' && err.message ? String(err.message) : String(err);
    figma.closePlugin('Error: ' + msg);
  }
})();
