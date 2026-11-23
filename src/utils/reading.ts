/**
 * What a reader actually reads in a note, and how long it takes.
 *
 * Notes are Markdown that may hold raw HTML, inline styles, scripts and
 * base64 images. Counting whitespace-separated "words" on that is wrong in
 * both directions: a 3,000-character Chinese note has almost no spaces, and
 * a widget's script has many.
 */

/**
 * A bilingual note marks the translation a reader switches to with
 * `<section data-alt-lang>`. Only one language is read, so it is not counted.
 */
const ALT_LANG = /<section\b[^>]*\bdata-alt-lang\b[^>]*>[\s\S]*?<\/section>/gi;

/** The note's prose with markup, code, styles, scripts and data URIs removed. */
export function readableText(body: string): string {
  return body
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(ALT_LANG, ' ')
    .replace(/<(style|script|svg|textarea)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, link, label) => label ?? link)
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/^\s{0,3}(?:#{1,6}|>+|[-*+]|\d+\.)\s+/gm, '')
    .replace(/[*_`~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const CJK = /[㐀-鿿豈-﫿]/g;

/** Chinese is counted in characters, Latin text in words. */
export function countWords(text: string): { cjk: number; latin: number; total: number } {
  const cjk = text.match(CJK)?.length ?? 0;
  const latin = text.replace(CJK, ' ').match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0;
  return { cjk, latin, total: cjk + latin };
}

/** Minutes, at about 400 Chinese characters or 230 English words a minute. */
export function readingMinutes(body: string): number {
  const { cjk, latin } = countWords(readableText(body));
  return Math.max(1, Math.round(cjk / 400 + latin / 230));
}

/** Compare two strings by their letters only, ignoring spacing and punctuation. */
const letters = (s: string) => s.replace(/[\s\p{P}\p{S}]/gu, '').toLowerCase();

/**
 * True when the note opens by restating its description, so printing both
 * repeats it. Exact repeats are common; so are near-repeats, where the note's
 * own lede is the description lightly reworded or preceded by a short label.
 * Those are caught by overlap: most of the description's character pairs
 * appear in the note's opening.
 */
export function opensWithDescription(body: string, description?: string): boolean {
  if (!description) return false;
  const want = letters(description);
  if (want.length < 8) return false;
  // Only the first lines count: the same idea coming back a paragraph later
  // is ordinary writing, not a repeat.
  const opening = letters(readableText(body)).slice(0, Math.round(want.length * 1.3) + 60);
  if (opening.startsWith(want)) return true;

  const pairs = new Set<string>();
  for (let i = 0; i < want.length - 1; i++) pairs.add(want.slice(i, i + 2));
  let found = 0;
  for (const pair of pairs) if (opening.includes(pair)) found++;
  return found / pairs.size >= 0.75;
}
