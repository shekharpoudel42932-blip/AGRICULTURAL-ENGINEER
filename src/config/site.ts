/**
 * Single source of truth for personal details, navigation and home-page copy.
 * Edit this file (and the files in src/content + src/data) to make the site yours.
 */

export type NavItem = { label: string; href: string };
export type Social = { label: string; href: string; short: string };

export const site = {
  name: 'Shekhar',
  role: 'Agricultural Engineer',
  title: 'Shekhar | Agricultural Engineer',
  description:
    'Agricultural engineer working on precision irrigation, farm machinery and post-harvest systems that help farmers grow more with less.',
  tagline: 'Engineering water-smart, data-driven systems for resilient farms.',
  location: 'Open to field work worldwide',
  email: 'shekharpoudel42932@gmail.com',
  availability: 'Available for research & consulting',
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
  { value: 6, suffix: '+', label: 'Years in the field' },
  { value: 1200, suffix: ' ha', label: 'Land under designed irrigation' },
  { value: 9, suffix: '', label: 'Peer-reviewed publications' },
  { value: 24, suffix: '', label: 'Engineering projects delivered' },
];

export const expertise = [
  'Precision irrigation',
  'Soil & water engineering',
  'Farm machinery design',
  'Post-harvest technology',
  'IoT sensing',
  'GIS & remote sensing',
  'Renewable energy on farms',
  'CAD / FEA',
  'Hydrological modelling',
  'Agri-data analytics',
];

export const tools = ['AutoCAD', 'SolidWorks', 'QGIS', 'ArcGIS', 'Python', 'R', 'CROPWAT', 'AquaCrop', 'HEC-RAS', 'Arduino / ESP32'];

/** Items per page on paginated listings */
export const pageSize = {
  blog: 6,
  projects: 6,
} as const;
