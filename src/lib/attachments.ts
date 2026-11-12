import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

/**
 * Every downloadable file under src/assets, bundled by Vite so it gets a hashed, cache-friendly URL.
 * Keys look like "/src/assets/files/my-project/report.pdf".
 */
const bundled = import.meta.glob('/src/assets/**/*.{pdf,PDF,doc,docx,xls,xlsx,ppt,pptx,odt,ods,odp,csv,txt,zip,kmz,kml,dwg}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export type Attachment = {
  href: string;
  title: string;
  description?: string;
  /** Suggested file name when downloading */
  fileName: string;
  /** Upper-case extension, e.g. "PDF" */
  ext: string;
  /** Human-readable size, when the file is local */
  size?: string;
  /** Browsers can show it in a tab (PDF, text, images) */
  viewable: boolean;
};

type Input = { file: string; title?: string; description?: string };

const VIEWABLE = new Set(['pdf', 'txt', 'csv', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']);

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function titleFrom(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
}

/**
 * Resolve the `attachments` of a content entry into links.
 * @param entryFilePath `entry.filePath`, e.g. "src/content/projects/my-project.md"
 */
export function resolveAttachments(entryFilePath: string | undefined, items: Input[]): Attachment[] {
  return items.map(({ file, title, description }) => {
    const fileName = decodeURIComponent(file.split(/[?#]/)[0].split('/').pop() ?? file);
    const ext = (fileName.split('.').pop() ?? '').toLowerCase();
    const base = { title: title ?? titleFrom(fileName), description, fileName, ext: ext.toUpperCase(), viewable: VIEWABLE.has(ext) };

    // Remote URL
    if (/^https?:\/\//.test(file)) return { ...base, href: file };

    // File in /public, served as-is
    if (file.startsWith('/')) {
      const onDisk = path.join(process.cwd(), 'public', file);
      if (!existsSync(onDisk)) throw new Error(`Attachment not found: public${file} (listed in ${entryFilePath})`);
      return { ...base, href: file, size: formatSize(statSync(onDisk).size) };
    }

    // Path relative to the markdown file, bundled from src/assets
    if (!entryFilePath) throw new Error(`Cannot resolve relative attachment "${file}" without the entry's file path`);
    const key = path.posix.normalize(path.posix.join('/', path.posix.dirname(entryFilePath), file));
    const href = bundled[key];
    if (!href) {
      throw new Error(
        `Attachment not found: "${file}" (resolved to ${key.slice(1)}) in ${entryFilePath}. ` +
          'Put the file under src/assets/ and make sure the path is relative to the markdown file.',
      );
    }
    return { ...base, href, size: formatSize(statSync(path.join(process.cwd(), key)).size) };
  });
}
