/** Shape shared by the private deployment and the public gate. Bodies stay out of the index. */

export interface PrivateNoteMeta {
  slug: string;
  title: string;
  planted: string;
}

export interface PrivateNote extends PrivateNoteMeta {
  body: string;
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PLANTED = /^\d{4}-\d{2}-\d{2}$/;
const MAX_NOTES = 500;
const MAX_TITLE = 200;
const MAX_BODY = 100_000;

export function parseCatalog(input: unknown): PrivateNote[] {
  if (!input || typeof input !== 'object') return [];
  const notes = (input as { notes?: unknown }).notes;
  if (!Array.isArray(notes)) return [];
  const parsed: PrivateNote[] = [];
  const seen = new Set<string>();
  for (const item of notes) {
    if (parsed.length >= MAX_NOTES) break;
    const note = parseNote(item, true);
    if (!note || seen.has(note.slug)) continue;
    seen.add(note.slug);
    parsed.push(note);
  }
  return parsed;
}

export function parseNote(input: unknown, requireBody: boolean): PrivateNote | null {
  if (!input || typeof input !== 'object') return null;
  const record = input as Record<string, unknown>;
  if (typeof record.slug !== 'string' || !SLUG.test(record.slug)) return null;
  if (typeof record.title !== 'string') return null;
  const title = record.title.replace(/[\r\n]+/g, ' ').trim();
  if (!title || title.length > MAX_TITLE) return null;
  if (typeof record.planted !== 'string' || !PLANTED.test(record.planted)) return null;
  if (!requireBody) return { slug: record.slug, title, planted: record.planted, body: '' };
  if (typeof record.body !== 'string' || record.body.length > MAX_BODY) return null;
  return { slug: record.slug, title, planted: record.planted, body: record.body };
}

export function parseIndex(input: unknown): PrivateNoteMeta[] {
  if (!input || typeof input !== 'object') return [];
  const notes = (input as { notes?: unknown }).notes;
  if (!Array.isArray(notes)) return [];
  const parsed: PrivateNoteMeta[] = [];
  const seen = new Set<string>();
  for (const item of notes) {
    if (parsed.length >= MAX_NOTES) break;
    const note = parseNote(item, false);
    if (!note || seen.has(note.slug)) continue;
    seen.add(note.slug);
    parsed.push({ slug: note.slug, title: note.title, planted: note.planted });
  }
  return parsed;
}
