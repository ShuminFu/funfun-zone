/** A small markdown subset. Raw HTML is escaped so a note cannot inject a script into the public origin. */

const BLOCK_START = /^(```|#{1,3} |>(?: |$)|[-*] |\d+\. )/;

export function renderMarkdown(source: string): string {
  const lines = source.replaceAll('\r\n', '\n').split('\n');
  const blocks: string[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? '';
    if (line.startsWith('```')) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !(lines[index] ?? '').startsWith('```')) {
        code.push(lines[index] ?? '');
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }
    const heading = /^(#{1,3}) (.*)$/.exec(line);
    if (heading) {
      const level = heading[1]?.length ?? 1;
      blocks.push(`<h${level}>${inline(heading[2] ?? '')}</h${level}>`);
      index += 1;
      continue;
    }
    if (line.startsWith('>')) {
      const quote: string[] = [];
      while (index < lines.length && (lines[index] ?? '').startsWith('>')) {
        quote.push((lines[index] ?? '').replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push(`<blockquote>${quote.map((item) => `<p>${inline(item)}</p>`).join('')}</blockquote>`);
      continue;
    }
    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*] /.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').slice(2));
        index += 1;
      }
      blocks.push(`<ul>${items.map((item) => `<li>${inline(item)}</li>`).join('')}</ul>`);
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\. /.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').replace(/^\d+\. /, ''));
        index += 1;
      }
      blocks.push(`<ol>${items.map((item) => `<li>${inline(item)}</li>`).join('')}</ol>`);
      continue;
    }
    if (line.trim() === '') {
      index += 1;
      continue;
    }
    const paragraph: string[] = [];
    while (index < lines.length && (lines[index] ?? '').trim() !== '' && !BLOCK_START.test(lines[index] ?? '')) {
      paragraph.push(lines[index] ?? '');
      index += 1;
    }
    blocks.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }
  return blocks.join('\n');
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function inline(raw: string): string {
  const pattern = /`([^`]+)`|!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  const parts: string[] = [];
  let last = 0;
  for (const match of raw.matchAll(pattern)) {
    const index = match.index ?? 0;
    parts.push(escapeHtml(raw.slice(last, index)));
    if (match[1] !== undefined) {
      parts.push(`<code>${escapeHtml(match[1])}</code>`);
    } else if (match[2] !== undefined) {
      parts.push(escapeHtml(match[2] || match[0]));
    } else if (match[4] !== undefined) {
      const href = safeUrl(match[5] ?? '');
      parts.push(href ? `<a href="${escapeHtml(href)}">${escapeHtml(match[4])}</a>` : escapeHtml(match[0]));
    } else if (match[6] !== undefined) {
      parts.push(`<strong>${escapeHtml(match[6])}</strong>`);
    } else {
      parts.push(`<em>${escapeHtml(match[7] ?? '')}</em>`);
    }
    last = index + match[0].length;
  }
  parts.push(escapeHtml(raw.slice(last)));
  return parts.join('');
}

function safeUrl(url: string): string | null {
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(url)) return `/private/${url}/`;
  if (!/^https:\/\/[^\s<>"'\\]+$/.test(url)) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return null;
    return parsed.href;
  } catch {
    return null;
  }
}
