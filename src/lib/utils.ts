import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn-style className merger */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date, opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }) {
  return new Intl.DateTimeFormat('en-US', opts).format(date);
}

/** Rough reading time from raw markdown/mdx body */
export function readingTime(body = '') {
  const words = body.replace(/<[^>]*>|[#*_`>\-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Two-digit index used for section/list numbering ("01", "02"…) */
export const pad = (n: number) => String(n).padStart(2, '0');

/** Is `href` the current page (or a parent section of it)? */
export function isActive(pathname: string, href: string) {
  const clean = (p: string) => p.replace(/\/+$/, '') || '/';
  const path = clean(pathname);
  const target = clean(href);
  return target === '/' ? path === '/' : path === target || path.startsWith(`${target}/`);
}
