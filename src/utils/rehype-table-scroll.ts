/**
 * Rehype plugin: give every table its own sideways scroller.
 *
 * A table wider than the text column otherwise widens whatever holds it. In
 * an embedded note that is the whole article body, so the reader drags the
 * entire text sideways to see the last column. Wrapped, only the table moves.
 *
 * Tables an author already put in a wrapper (a parent whose class mentions
 * "table", "tbl" or "scroll") are left alone, so their own styles keep
 * working.
 */

import { visit } from 'unist-util-visit';

const ALREADY_WRAPPED = /table|tbl|scroll/i;
const WRAPPER_OPEN = '<div class="table-scroll" tabindex="0" role="region" aria-label="Table">';

/**
 * Embedded notes are raw HTML, which reaches this plugin as text, not as
 * elements. Wrap their tables in the string. `open` carries a table that
 * started in an earlier raw node (raw HTML is split at blank lines).
 */
function wrapRawTables(html: string, state: { open: boolean }): string {
  let out = '';
  let rest = html;
  while (rest) {
    if (state.open) {
      const end = rest.search(/<\/table\s*>/i);
      if (end < 0) return out + rest;
      const close = rest.match(/<\/table\s*>/i)![0];
      out += rest.slice(0, end) + close + '</div>';
      rest = rest.slice(end + close.length);
      state.open = false;
      continue;
    }
    const start = rest.search(/<table\b/i);
    if (start < 0) return out + rest;
    const before = out + rest.slice(0, start);
    // The tag that directly holds this table, if it is already a wrapper.
    const holder = before.match(/<([a-z0-9]+)\b[^>]*\bclass="([^"]*)"[^>]*>\s*$/i);
    if (holder && ALREADY_WRAPPED.test(holder[2])) {
      const end = rest.slice(start).search(/<\/table\s*>/i);
      const cut = end < 0 ? rest.length : start + end;
      out = before + rest.slice(start, cut);
      rest = rest.slice(cut);
      if (end < 0) return out;
      const close = rest.match(/^<\/table\s*>/i)![0];
      out += close;
      rest = rest.slice(close.length);
      continue;
    }
    out = before + WRAPPER_OPEN;
    rest = rest.slice(start);
    // Step past "<table" so the next search finds this table's end, not its start.
    out += rest.slice(0, 6);
    rest = rest.slice(6);
    state.open = true;
  }
  return out;
}

export function rehypeTableScroll() {
  return function transformer(tree: any) {
    const state = { open: false };
    visit(tree, 'raw', (node: any) => {
      if (state.open || /<table\b/i.test(node.value)) node.value = wrapRawTables(node.value, state);
    });

    visit(tree, 'element', (node: any, index: number | undefined, parent: any) => {
      if (node.tagName !== 'table' || index === undefined || !parent) return;

      const parentClass = [parent.properties?.className ?? []].flat().join(' ');
      if (parent.type === 'element' && ALREADY_WRAPPED.test(parentClass)) return;

      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        // Focusable so a keyboard reader can scroll it with the arrow keys.
        properties: { className: ['table-scroll'], tabIndex: 0, role: 'region', ariaLabel: 'Table' },
        children: [node],
      };
    });
  };
}
