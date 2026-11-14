/**
 * Mycelium Color Themes
 *
 * Each theme defines primary and accent color palettes.
 * Colors use RGB values for Tailwind CSS compatibility.
 */

import type { ThemeName } from '../config';

export interface Theme {
  name: string;
  label: string;
  colors: {
    primary: Record<string, string>;
    accent: Record<string, string>;
    /** Accent scale used in dark mode. Omit to use `accent` in both modes. */
    accentDark?: Record<string, string>;
    bg: {
      light: string;
      dark: string;
    };
  };
}

export const themes: Record<ThemeName, Theme> = {
  sage: {
    name: 'sage',
    label: 'Sage',
    colors: {
      primary: {
        '50': '247 250 247',
        '100': '236 243 236',
        '200': '214 228 214',
        '300': '181 204 181',
        '400': '143 176 143',
        '500': '111 148 111',
        '600': '78 114 79',
        '700': '66 95 66',
        '800': '47 69 47',
        '900': '35 52 35',
        '950': '26 38 26',
      },
      accent: {
        '50': '253 250 247',
        '100': '250 241 235',
        '200': '245 224 209',
        '300': '235 198 171',
        '400': '217 166 130',
        '500': '194 139 97',
        '600': '141 88 51',
        '700': '114 68 38',
        '800': '88 52 30',
        '900': '67 39 22',
        '950': '40 23 13',
      },
      bg: {
        light: '252 251 249',
        dark: '24 28 24',
      },
    },
  },

  // Editorial cream paper. Warm paper primary, terracotta accent.
  anthropic: {
    name: 'anthropic',
    label: 'Anthropic',
    colors: {
      primary: {
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
      },
      accent: {
        '50': '253 250 247',
        '100': '250 241 235',
        '200': '245 224 209',
        '300': '235 198 171',
        '400': '217 166 130',
        '500': '194 139 97',
        '600': '141 88 51',
        '700': '114 68 38',
        '800': '88 52 30',
        '900': '67 39 22',
        '950': '40 23 13',
      },
      bg: {
        light: '246 243 237',
        dark: '28 25 22',
      },
    },
  },

  // AstroPaper's colours, rebuilt as single-hue scales (computed in OKLCH).
  // Neutrals are one cool slate (252°) with even lightness steps, so dark
  // cards (900) sit a step above the dark page (950). The accent has a full
  // scale per mode: blue anchored on #006cac for light, mint anchored on
  // #03CE91 for dark, so one screen never mixes the two.
  classic: {
    name: 'classic',
    label: 'Classic',
    colors: {
      primary: {
        '50': '250 251 253',
        '100': '240 243 248',
        '200': '222 229 237',
        '300': '201 211 222',
        '400': '148 163 180',
        '500': '109 126 145',
        '600': '76 94 114',
        '700': '54 71 90',
        '800': '39 53 70',
        '900': '27 40 55',
        '950': '17 28 40',
      },
      accent: {
        '50': '241 248 255',
        '100': '223 240 255',
        '200': '190 225 255',
        '300': '139 202 251',
        '400': '85 171 235',
        '500': '35 138 205',
        '600': '0 108 172',
        '700': '1 86 134',
        '800': '1 66 104',
        '900': '2 50 80',
        '950': '1 30 50',
      },
      accentDark: {
        '50': '235 251 243',
        '100': '212 249 230',
        '200': '171 242 208',
        '300': '120 231 182',
        '400': '3 206 145',
        '500': '16 172 121',
        '600': '13 137 96',
        '700': '8 106 73',
        '800': '7 81 55',
        '900': '9 59 40',
        '950': '5 34 22',
      },
      bg: {
        light: '250 251 253',
        dark: '17 28 40',
      },
    },
  },
  nord: {
    name: 'nord',
    label: 'Nord',
    colors: {
      primary: {
        '50': '236 239 244',
        '100': '229 233 240',
        '200': '216 222 233',
        '300': '208 214 226',
        '400': '169 177 191',
        '500': '129 140 160',
        '600': '94 105 126',
        '700': '76 86 106',
        '800': '67 76 94',
        '900': '59 66 82',
        '950': '46 52 64',
      },
      accent: {
        '50': '236 254 255',
        '100': '225 251 255',
        '200': '194 242 252',
        '300': '163 228 245',
        '400': '136 192 208',
        '500': '129 161 193',
        '600': '71 105 146',
        '700': '52 82 122',
        '800': '37 63 99',
        '900': '26 47 78',
        '950': '9 28 51',
      },
      bg: {
        light: '236 239 244',
        dark: '46 52 64',
      },
    },
  },
  minimal: {
    name: 'minimal',
    label: 'Minimal',
    colors: {
      primary: {
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
      bg: {
        light: '255 255 255',
        dark: '18 18 18',
      },
    },
  },
};

export const themeNames = Object.keys(themes);
export const defaultTheme = 'classic';
