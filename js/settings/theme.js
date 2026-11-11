/**
 * Theme: turns the brand and accent colors from Settings into CSS custom
 * properties for light and dark mode, with text colors chosen for WCAG AA
 * contrast. Pure color math is exported for tests; applyTheme() touches the DOM.
 */

/** Parse "#rrggbb" (or "#rgb") to [r,g,b] 0–255, or null. */
export function parseHex(hex){
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split('').map(c => c + c).join('') : m[1];
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
}

/** [r,g,b] to "#RRGGBB". */
export const toHex = rgb => '#' + rgb.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();

/** WCAG relative luminance of a hex color. */
export function luminance(hex){
  const rgb = parseHex(hex) || [0, 0, 0];
  const [r, g, b] = rgb.map(v => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colors (1–21). */
export function contrast(a, b){
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Mix two hex colors; t = share of b (0–1). */
export function mix(a, b, t){
  const A = parseHex(a), B = parseHex(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
}

export const WHITE = '#FFFFFF';
export const NEAR_BLACK = '#111111';

/** White or near-black, whichever reads better on the background. */
export function readableInk(bg){
  return contrast(bg, WHITE) >= contrast(bg, NEAR_BLACK) ? WHITE : NEAR_BLACK;
}

/**
 * Move a color toward `toward` (black or white) in small steps until it reaches
 * `ratio` contrast against every background, or return the endpoint.
 */
export function adjustForContrast(color, backgrounds, ratio, toward){
  for (let t = 0; t <= 1.0001; t += 0.02){
    const c = mix(color, toward, Math.min(t, 1));
    if (backgrounds.every(bg => contrast(c, bg) >= ratio)) return c;
  }
  return toward;
}

/** Fixed surface colors (must match css/app.css). */
export const SURFACES = {
  light: { paper:'#F7F9F7', surface:'#FFFFFF' },
  dark: { paper:'#0F1612', surface:'#151F19' },
};

/**
 * Theme tokens for one color scheme.
 * @param {string} brand hex
 * @param {string} accent hex
 * @param {'light'|'dark'} scheme
 * @returns {Record<string,string>} CSS custom property name -> value
 */
export function themeTokens(brand, accent, scheme){
  const B = parseHex(brand) ? toHex(parseHex(brand)) : '#006428';
  const A = parseHex(accent) ? toHex(parseHex(accent)) : '#F0DC3C';
  if (scheme === 'dark'){
    const S = SURFACES.dark;
    const panel = mix(S.surface, B, 0.12), line = mix(S.surface, B, 0.24);
    const b = adjustForContrast(B, [S.paper, S.surface, panel], 4.5, WHITE);
    const mastBg = mix(B, '#000000', 0.55);
    return tokens(b, b, mix(B, '#000000', 0.6), A, mastBg, panel, line);
  }
  const S = SURFACES.light;
  const panel = mix(S.surface, B, 0.07), line = mix(S.surface, B, 0.18);
  const text = adjustForContrast(B, [S.paper, S.surface, panel], 4.5, '#000000');
  return tokens(B, text, mix(text, '#000000', 0.26), A, B, panel, line);
}

function tokens(brand, brandText, brandDeep, accent, mastBg, panel, line){
  const mastInk = readableInk(mastBg);
  const sub = mix(mastInk, mastBg, 0.15);
  return {
    '--brand': brand,
    '--brand-ink': readableInk(brand),
    '--brand-text': brandText,
    '--brand-deep': brandDeep,
    '--accent': accent,
    '--accent-ink': readableInk(accent),
    '--mast-bg': mastBg,
    '--mast-ink': mastInk,
    '--mast-sub': contrast(sub, mastBg) >= 4.5 ? sub : mastInk,
    '--panel': panel,
    '--line': line,
  };
}

/** CSS text for the theme tokens, light and dark, honoring the theme setting. */
export function themeCSS(brand, accent){
  const decl = t => Object.entries(t).map(([k, v]) => `${k}:${v}`).join(';');
  const light = decl(themeTokens(brand, accent, 'light'));
  const dark = decl(themeTokens(brand, accent, 'dark'));
  return `:root{${light}}\n@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${dark}}}\n:root[data-theme="dark"]{${dark}}`;
}

/**
 * Apply brand colors and the light/dark/system theme to the document.
 * @param {{brandColor:string, accentColor:string, theme:'system'|'light'|'dark'}} s
 */
export function applyTheme(s){
  let el = document.getElementById('themeVars');
  if (!el){ el = document.createElement('style'); el.id = 'themeVars'; document.head.appendChild(el); }
  el.textContent = themeCSS(s.brandColor, s.accentColor);
  const root = document.documentElement;
  if (s.theme === 'light' || s.theme === 'dark') root.dataset.theme = s.theme; else delete root.dataset.theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = s.brandColor;
}
