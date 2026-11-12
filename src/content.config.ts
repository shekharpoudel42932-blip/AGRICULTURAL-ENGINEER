import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';

/**
 * Cover image: either a local file (optimised by astro:assets), relative to the
 * markdown file, e.g. `cover: ../../assets/covers/wheat.jpg`, or a remote https URL.
 */
const cover = (image: SchemaContext['image']) => z.union([z.url(), image()]).optional();

/**
 * Extra images shown as a gallery under a post/project. Each `src` is a local image relative to the
 * markdown file (e.g. `../../assets/gallery/my-project/site-visit.jpg`) or a remote https URL.
 */
const gallery = (image: SchemaContext['image']) =>
  z
    .array(
      z.object({
        src: z.union([z.url(), image()]),
        alt: z.string().optional(),
        caption: z.string().optional(),
      }),
    )
    .default([]);

/**
 * Downloadable files (PDF, Word, Excel, slides, CSV, ZIP…). `file` is a path relative to the markdown file
 * (e.g. `../../assets/files/my-project/report.pdf`), a path under /public (`/files/report.pdf`) or a URL.
 */
const attachments = z
  .array(
    z.object({
      file: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
    }),
  )
  .default([]);

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      cover: cover(image),
      coverAlt: z.string().optional(),
      gallery: gallery(image),
      attachments,
      draft: z.boolean().default(false),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      year: z.number(),
      role: z.string(),
      location: z.string().optional(),
      status: z.enum(['completed', 'ongoing', 'research']).default('completed'),
      tags: z.array(z.string()).default([]),
      pattern: z.enum(['rows', 'contours', 'grid', 'drops']).default('rows'),
      cover: cover(image),
      coverAlt: z.string().optional(),
      gallery: gallery(image),
      attachments,
      featured: z.boolean().default(false),
      order: z.number().default(0),
      metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
      links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    }),
});

const publications = defineCollection({
  loader: file('./src/content/publications.json'),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    year: z.number(),
    type: z.enum(['journal', 'conference', 'book-chapter', 'thesis', 'report']),
    doi: z.string().optional(),
    url: z.string().optional(),
    abstract: z.string().optional(),
  }),
});

const timeline = z.object({
  start: z.string(),
  end: z.string().default('Present'),
  location: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  order: z.number().default(0),
});

const education = defineCollection({
  loader: file('./src/content/education.json'),
  schema: timeline.extend({
    degree: z.string(),
    institution: z.string(),
    grade: z.string().optional(),
  }),
});

const experience = defineCollection({
  loader: file('./src/content/experience.json'),
  schema: timeline.extend({
    role: z.string(),
    organization: z.string(),
  }),
});

/**
 * Training & certification. One markdown file per credential; the body is optional.
 * `image` is the certificate scan/photo (local path or URL); it opens in a lightbox.
 */
const certifications = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/certifications' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      issuer: z.string(),
      type: z.enum(['certification', 'training']),
      /** Free text such as "Online course · 40 h" or "Workshop · 3 days" */
      format: z.string().optional(),
      date: z.coerce.date(),
      expires: z.coerce.date().optional(),
      credentialId: z.string().optional(),
      /** Verification / course page */
      url: z.string().optional(),
      hours: z.number().optional(),
      skills: z.array(z.string()).default([]),
      image: cover(image),
      imageAlt: z.string().optional(),
      featured: z.boolean().default(false),
    }),
});

/**
 * Stand-alone markdown pages (e.g. the "Self Drive" story). The file name is the id:
 * src/content/pages/self-drive.md → getEntry('pages', 'self-drive').
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      eyebrow: z.string().optional(),
      description: z.string(),
      cover: cover(image),
      coverAlt: z.string().optional(),
      /** Small label/value pairs shown in the sidebar */
      facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
      /** Show a chapter list built from the ## headings */
      toc: z.boolean().default(true),
      updated: z.coerce.date().optional(),
    }),
});

export const collections = { blog, projects, publications, education, experience, certifications, pages };
