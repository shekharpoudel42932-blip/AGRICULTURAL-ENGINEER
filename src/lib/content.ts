import { getCollection } from 'astro:content';
import { slugify } from './utils';

/** Published blog posts, newest first */
export async function getPosts() {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getProjects({ featured }: { featured?: boolean } = {}) {
  const projects = await getCollection('projects', ({ data }) => (featured ? data.featured : true));
  return projects.sort((a, b) => a.data.order - b.data.order || b.data.year - a.data.year);
}

export async function getPublications() {
  const pubs = await getCollection('publications');
  return pubs.sort((a, b) => b.data.year - a.data.year);
}

/** Publications grouped by year: [[2025, [...]], [2024, [...]]] */
export async function getPublicationsByYear() {
  const groups = new Map<number, Awaited<ReturnType<typeof getPublications>>>();
  for (const p of await getPublications()) {
    groups.set(p.data.year, [...(groups.get(p.data.year) ?? []), p]);
  }
  return [...groups.entries()];
}

export async function getEducation() {
  return (await getCollection('education')).sort((a, b) => a.data.order - b.data.order);
}

export async function getExperience() {
  return (await getCollection('experience')).sort((a, b) => a.data.order - b.data.order);
}

export type TagCount = { slug: string; label: string; count: number };

/** Unique tags (with counts) across any tagged collection, most used first */
export function countTags(entries: { data: { tags: string[] } }[]): TagCount[] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const entry of entries) {
    for (const tag of entry.data.tags) {
      const slug = slugify(tag);
      counts.set(slug, { label: tag, count: (counts.get(slug)?.count ?? 0) + 1 });
    }
  }
  return [...counts.entries()].map(([slug, v]) => ({ slug, ...v })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Entries carrying a given tag slug */
export function withTag<T extends { data: { tags: string[] } }>(entries: T[], slug: string) {
  return entries.filter((e) => e.data.tags.some((t) => slugify(t) === slug));
}

export async function getTags() {
  return countTags(await getPosts());
}

export async function getProjectTags() {
  return countTags(await getProjects());
}

/** Certifications and trainings, newest first */
export async function getCertifications({ featured, type }: { featured?: boolean; type?: 'certification' | 'training' } = {}) {
  const items = await getCollection('certifications', ({ data }) => (!featured || data.featured) && (!type || data.type === type));
  return items.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
