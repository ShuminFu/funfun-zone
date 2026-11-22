/**
 * The static header never contains the private entry. These markers are
 * filled only after the Access token has been verified for the owner.
 */

export const MARKER_DESKTOP = '<!-- owner-entry:desktop -->';
export const MARKER_MOBILE = '<!-- owner-entry:mobile -->';
export const PRIVATE_HREF = '/private/';

export type ChromeMode = 'anonymous' | 'signed-in' | 'owner';

export function applyChrome(html: string, mode: ChromeMode, pathname: string): string {
  if (mode === 'anonymous') return html;
  let next = signOut(html);
  if (mode === 'owner') {
    const active = pathname === '/private' || pathname.startsWith('/private/');
    next = next.replace(MARKER_DESKTOP, ownerLink('desktop', active));
    next = next.replace(MARKER_MOBILE, ownerLink('mobile', active));
  }
  return next;
}

function signOut(html: string): string {
  return html.replace(/<a\b[^>]*\bdata-auth="sign-in"[^>]*>\s*Sign in\s*<\/a>/g, (anchor) =>
    anchor
      .replace('href="/auth/login/"', 'href="/auth/logout/"')
      .replace('data-auth="sign-in"', 'data-auth="sign-out"')
      .replace(/>\s*Sign in\s*<\/a>/, '>Sign out</a>'),
  );
}

function ownerLink(kind: 'desktop' | 'mobile', active: boolean): string {
  const desktop = active
    ? 'font-sans text-sm font-medium text-primary-900 dark:text-primary-100'
    : 'font-sans text-sm text-primary-600 transition-colors hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-100';
  const mobile = active
    ? 'block rounded-lg px-3 py-2 text-sm font-medium text-primary-900 dark:text-primary-100'
    : 'block rounded-lg px-3 py-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-100';
  const current = active ? ' aria-current="page"' : '';
  return `<a href="${PRIVATE_HREF}"${current} class="${kind === 'desktop' ? desktop : mobile}">Private Notes</a>`;
}
