import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

/** Resolve a cover (local or remote) to a URL suitable for og:image */
export async function ogImageFor(cover: ImageMetadata | string | undefined) {
  if (!cover) return undefined;
  if (typeof cover === 'string') return cover;
  const img = await getImage({ src: cover, width: 1200, height: 630, fit: 'cover', format: 'jpg' });
  return img.src;
}
