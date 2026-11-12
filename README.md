# Shekhar | Agricultural Engineer portfolio

Astro 7 · Tailwind CSS 4 (shadcn-style tokens) · GSAP 3 (ScrollTrigger, SplitText, DrawSVG) · MDX

```bash
npm install
npm run dev       # http://localhost:4321
npm run build && npm run preview
npx astro check   # types + content schemas
```

## Make it yours

| What | Where |
| --- | --- |
| Name, bio, email, nav, socials, stats, skills | `src/config/site.ts` |
| Blog posts (`.md` / `.mdx`) | `src/content/blog/` |
| Projects | `src/content/projects/` |
| Publications / Education / Experience | `src/content/*.json` |
| Training & certifications | `src/content/certifications/*.md` |
| Self Drive story (markdown + cover) | `src/content/pages/self-drive.md` |
| Colours, radius, fonts | `src/styles/global.css` (`:root` and `.dark`) |
| Production URL | `astro.config.mjs` → `site` |

### Cover images
Blog posts and projects accept an optional `cover` (plus `coverAlt`) in frontmatter:

```yaml
cover: ../../assets/covers/wheat.jpg       # local file → optimised (webp, srcset) by astro:assets
# or
cover: https://images.example.com/x.jpg    # remote URL → plain lazy <img>
coverAlt: "Golden wheat field under a clear sky"
```

Put local images in `src/assets/`. The cover appears on cards, on the detail page and as the page's `og:image`.
Without a cover, projects fall back to a line pattern and blog cards fall back to text only.
The sample illustrations in `src/assets/covers/` are placeholders; replace them with real photos.

### Image galleries and downloadable files
Blog posts and projects can also list extra images (`gallery`) and files such as PDFs (`attachments`).
Both are optional and appear under the article body:

```yaml
gallery:
  - src: ../../assets/gallery/stw-banke/site-visit.jpg   # local (optimised) or https URL
    alt: Farmers beside a newly installed shallow tube well
    caption: Handover of a shallow tube well, Banke   # optional
  - src: ../../assets/gallery/stw-banke/pump-test.jpg
attachments:
  - file: ../../assets/files/stw-banke/completion-report.pdf
    title: Work completion report                     # optional, defaults to the file name
    description: Design, estimate and completion summary   # optional
  - file: /Shekhar_Poudel_CV.pdf                      # a file in public/ also works
  - file: https://example.com/dataset.xlsx            # or a link elsewhere
```

- Paths are relative to the markdown file, like `cover`. A good convention is one folder per entry:
  `src/assets/gallery/<entry>/` for images and `src/assets/files/<entry>/` for documents.
- Gallery images open in the lightbox. Visitors can step through them with ←/→ and download the original.
- Each file gets a **Download** button, plus a **View** button (opens in a new tab) for PDFs and text files.
  The file type and size are shown.
- Supported file types under `src/assets`: pdf, doc(x), xls(x), ppt(x), odt/ods/odp, csv, txt, zip, kml/kmz, dwg.
- A wrong path stops the build with an error naming the post or project, so broken links never go live.

### Training & certification
One markdown file per credential in `src/content/certifications/`:

```yaml
title: Certified Micro-Irrigation Designer
issuer: Irrigation Design Board
type: certification            # or: training
format: Professional certification · exam + portfolio
date: 2025-03-14
expires: 2028-03-14            # optional, shows "Valid until" / "Expired"
credentialId: MID-2025-0417    # optional
url: https://verify.example     # optional "Verify" / "Course page" link
hours: 40                      # optional, summed on the page for training hours
skills: [Drip design, Hydraulics]
image: ../../assets/certificates/irrigation-designer.jpg   # optional certificate scan (local or URL)
imageAlt: Certificate for Certified Micro-Irrigation Designer
featured: true                 # shown on the home page
```

Certificate images open full-size in a lightbox. The sample certificates in `src/assets/certificates/`
are watermarked placeholders; replace them with your real scans.

## Structure

```
src/
  components/ui        primitives: Button, Badge, Card, Section, Icon, Pattern, Timeline…
  components/cards     ProjectCard, PostCard, PublicationItem, TimelineItem
  components/sections  home-page blocks (Hero, Stats, About, …)
  components/layout    Header, MenuNav (auge-style), Sound/Theme toggles, Footer, Marquee
  layouts/             BaseLayout (SEO, ClientRouter), PostLayout
  lib/                 utils (cn, dates), content queries
  scripts/             animations, hover, menu, sound, theme, lifecycle
```

## Animation and sound attributes

Add these to any element. No extra JS is needed.

`data-reveal[="fade-up|fade|scale"]`, `data-delay`, `data-stagger`, `data-split[="lines|words|chars"]`,
`data-parallax="0.2"`, `data-counter="120"`, `data-draw`, `data-draw-line`, `data-magnetic`, `data-card`,
`data-sound="hover|click"`.

Sounds are synthesised with the Web Audio API and are off by default; visitors turn them on with the speaker toggle.
All motion respects `prefers-reduced-motion`.
