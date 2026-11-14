/**
 * Page language for <html lang>, og:locale and JSON-LD inLanguage.
 *
 * The site default (config `language`) is English, but most notes are
 * written in Chinese. A post can set `lang` in its frontmatter; otherwise
 * the language is read off the title and description.
 */

import { siteConfig } from '../config';

const CJK = /[㐀-鿿豈-﫿]/g;

export function detectLang(text: string, explicit?: string): string {
  if (explicit) return explicit;
  const letters = text.replace(/[\s\d\p{P}\p{S}]/gu, '');
  if (!letters) return siteConfig.language;
  const cjk = text.match(CJK)?.length ?? 0;
  return cjk / letters.length > 0.2 ? 'zh-CN' : siteConfig.language;
}

/** Open Graph wants underscores and a region: en -> en_US, zh-CN -> zh_CN. */
export function ogLocale(lang: string): string {
  if (lang.includes('-')) return lang.replace('-', '_');
  return lang === 'en' ? 'en_US' : lang;
}
