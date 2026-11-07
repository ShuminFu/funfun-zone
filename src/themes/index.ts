/**
 * Mycelium Color Themes
 *
 * Paper and ink are shared. A theme's identity is its accent, used for links
 * and small marks rather than page fills.
 */

import type { ThemeName } from '../config';

export interface Theme {
  name: string;
  label: string;
  colors: {
    primary: Record<string, string>;
    accent: Record<string, string>;
    bg: {
      light: string;
      dark: string;
    };
  };
}

// Warm paper in the light stops, charcoal ink in the dark stops.
const paper = {
  '50': '246 243 237',
  '100': '237 232 223',
  '200': '226 219 208',
  '300': '206 197 184',
  '400': '168 158 145',
  '500': '132 122 110',
  '600': '107 98 88',
  '700': '84 76 68',
  '800': '62 56 50',
  '900': '42 38 34',
  '950': '28 25 22',
};

const paperGround = {
  light: paper['50'],
  dark: paper['950'],
};

export const themes: Record<ThemeName, Theme> = {
  sage: {
    name: 'sage',
    label: 'Sage',
    colors: {
      primary: paper,
      accent: {
        '50': '253 250 247',
        '100': '250 241 235',
        '200': '245 224 209',
        '300': '235 198 171',
        '400': '217 166 130',
        '500': '194 139 97',
        '600': '166 112 74',
        '700': '138 90 60',
        '800': '112 74 51',
        '900': '92 62 44',
        '950': '51 33 23',
      },
      bg: paperGround,
    },
  },

  // AstroPaper palette from before the Mycelium rewrite.
  // Light links use accent-600 (#006cac); dark links use accent-400 (#03CE91).
  classic: {
    name: 'classic',
    label: 'Classic',
    colors: {
      primary: paper,
      accent: {
        '50': '239 246 253',
        '100': '222 237 251',
        '200': '192 219 244',
        '300': '134 229 185',
        '400': '3 206 145',
        '500': '30 122 188',
        '600': '0 108 172',
        '700': '0 84 138',
        '800': '0 64 107',
        '900': '7 54 86',
        '950': '3 28 48',
      },
      bg: paperGround,
    },
  },
  nord: {
    name: 'nord',
    label: 'Nord',
    colors: {
      primary: paper,
      accent: {
        '50': '236 254 255',
        '100': '225 251 255',
        '200': '194 242 252',
        '300': '163 228 245',
        '400': '136 192 208',
        '500': '129 161 193',
        '600': '94 129 172',
        '700': '76 107 148',
        '800': '67 94 132',
        '900': '59 82 115',
        '950': '46 66 92',
      },
      bg: paperGround,
    },
  },
  minimal: {
    name: 'minimal',
    label: 'Minimal',
    colors: {
      primary: paper,
      accent: {
        '50': '250 250 250',
        '100': '244 244 245',
        '200': '228 228 231',
        '300': '212 212 216',
        '400': '161 161 170',
        '500': '113 113 122',
        '600': '82 82 91',
        '700': '63 63 70',
        '800': '39 39 42',
        '900': '24 24 27',
        '950': '9 9 11',
      },
      bg: paperGround,
    },
  },
};

export const themeNames = Object.keys(themes);
export const defaultTheme = 'sage';
