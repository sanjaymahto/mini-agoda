/** Only allow same-site relative redirects (prevents open-redirects like ?redirect=//evil.com). */
export function safeRedirect(value: string | null, fallback = '/account/trips'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}
