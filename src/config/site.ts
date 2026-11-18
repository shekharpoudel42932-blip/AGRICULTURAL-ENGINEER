/**
 * Single source of truth for personal details, navigation and home-page copy.
 * Edit this file (and the files in src/content + src/data) to make the site yours.
 */

export type NavItem = { label: string; href: string };
export type Social = { label: string; href: string; short: string };

export const site = {
  name: 'Shekhar Poudel',
  role: 'Agricultural Engineer',
  title: 'Shekhar | Agricultural Engineer',
  description:
    'Hi, its me Shekhar, an Agricultural Engineer from Nepal, working on precision irrigation, farm machinery and post-harvest systems that help farmers to move beyond subsistence.',
  tagline: 'Engineering water-smart, data-driven systems for resilient farms.',
  location: 'Seeking MSc opportunities',
  email: 'shekharpoudel42932@gmail.com',
  availability: 'Open for collaboration',
  locale: 'en',
} as const;

export const nav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Publications', href: '/publications' },
  { label: 'Education', href: '/education' },
  { label: 'Certifications', href: '/certifications' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Self Drive', href: '/self-drive' },
  { label: "Let's talk", href: '/contact' },
];

/** Slide-out menu: a trimmed, re-ordered version of `nav` (the footer keeps the full list) */
const menuOrder = ['/', '/about', '/projects', '/publications', '/education', '/blog', '/self-drive'];
export const menuNav: NavItem[] = menuOrder.map((href) => nav.find((n) => n.href === href)!).filter(Boolean);

export const socials: Social[] = [
  { label: 'LinkedIn', short: 'in', href: 'https://www.linkedin.com/in/shekhar-poudel-a9b709271' },
];

export const stats = [
  { value: 3, suffix: '+', label: 'Years in the field' },
  { value: 800, suffix: ' ha', label: 'Land under supported irrigation' },
  { value: 3, suffix: ' ', label: 'Organizations worked with' },
  { value: 13, suffix: '', label: 'Engineering projects delivered' },
];

export const expertise = [
  'Precision irrigation',
  'Soil & water engineering',
  'Farm machinery design',
  'Post-harvest technology',
  'GIS & remote sensing',
  'Renewable energy on farms',
  'Extension Services',
  'Hydrological modelling',
  'Agri-data analytics',
];

export const tools = ['AutoCAD', 'QGIS', 'ArcGIS', 'Python', 'R', 'CROPWAT', 'AquaCrop', 'PVsyst', 'MODFLOW'];

/** Items per page on paginated listings */
export const pageSize = {
  blog: 6,
  projects: 6,
} as const;
