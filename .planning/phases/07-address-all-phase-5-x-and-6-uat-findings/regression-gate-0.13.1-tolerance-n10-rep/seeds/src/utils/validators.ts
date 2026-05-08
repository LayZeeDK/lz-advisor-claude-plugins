const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?$/i;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

export function isUrl(value: string): boolean {
  return URL_RE.test(value);
}

export function isNonEmpty(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function sanitizeHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

export function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}
