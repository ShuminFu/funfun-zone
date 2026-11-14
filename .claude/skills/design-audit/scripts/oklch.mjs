// OKLCH <-> sRGB and WCAG contrast. No dependencies.
// Colours are [r, g, b] in 0-255, as the theme files store them ("27 40 55").

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** [r, g, b] -> { L (0-1), C (chroma), h (0-360) } */
export function toOklch([r, g, b]) {
  const [R, G, B] = [r, g, b].map((v) => lin(v / 255));
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const b2 = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  let h = (Math.atan2(b2, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C: Math.hypot(a, b2), h };
}

/** OKLCH -> [r, g, b]. Chroma is reduced until the colour fits sRGB; L and h are kept. */
export function toRgb(L, C, h) {
  for (let c = C, i = 0; i < 90; i++, c *= 0.97) {
    const a = c * Math.cos((h * Math.PI) / 180);
    const b = c * Math.sin((h * Math.PI) / 180);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const rgb = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
    if (rgb.every((v) => v >= -0.0005 && v <= 1.0005)) {
      return rgb.map((v) => Math.round(gam(Math.min(1, Math.max(0, v))) * 255));
    }
  }
  const grey = Math.round(gam(L ** 3) * 255);
  return [grey, grey, grey];
}

export const hex = (rgb) => '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');

/** WCAG 2 contrast ratio, 1 to 21. */
export function contrast(a, b) {
  const lum = (rgb) => {
    const [r, g, bl] = rgb.map((v) => lin(v / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Parse src/themes/index.ts into { name: { primary, accent, accentDark? } } of step -> [r, g, b]. */
export function readThemes(source) {
  const body = source.slice(source.indexOf('export const themes'));
  const themes = {};
  for (const m of body.matchAll(/\n  (\w+): \{\n    name:[\s\S]*?\n  \},(?=\n\n|\n  \/\/|\n  \w+: \{|\n\};)/g)) {
    const theme = {};
    for (const key of ['primary', 'accent', 'accentDark']) {
      const ramp = m[0].match(new RegExp(`\\b${key}: \\{([\\s\\S]*?)\\}`));
      if (ramp) {
        theme[key] = Object.fromEntries(
          [...ramp[1].matchAll(/'(\d+)': '([\d ]+)'/g)].map((x) => [x[1], x[2].split(' ').map(Number)])
        );
      }
    }
    themes[m[1]] = theme;
  }
  return themes;
}
