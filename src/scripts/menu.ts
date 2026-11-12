/**
 * auge-style floating menu.
 *
 * Smoothness: the panel is always laid out at its full size and we only tween its
 * clip-path (from a 60×44 bottom-right "box" to the whole panel). Clip-path changes
 * are paint-only, so there is no layout work per frame (unlike width/height tweens).
 *
 * Interaction:
 *  - desktop (fine pointer): opens on hover, closes shortly after the pointer leaves
 *  - touch / keyboard: opens on click / Enter, closes via ×, Esc or the backdrop
 *  - one accent pill slides behind the hovered/focused link
 * The menu DOM is persisted across view transitions, so this runs once.
 */
import { gsap } from 'gsap';
import { sound } from './sound';
import { isActive } from '@/lib/utils';

const BOX = { w: 60, h: 44 };
const OPEN_CLIP = 'inset(0px 0px 0px 0px round 10px)';
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const HOVER_OPEN_DELAY = 60;
const HOVER_CLOSE_DELAY = 280;

let initialised = false;

export function initMenu() {
  if (initialised) return;
  const found = document.querySelector<HTMLElement>('[data-menu-root]');
  if (!found) return;
  initialised = true;
  const root: HTMLElement = found;

  const panel = root.querySelector<HTMLElement>('[data-menu-panel]')!;
  const openBtn = root.querySelector<HTMLButtonElement>('[data-menu-open]')!;
  const closeBtn = root.querySelector<HTMLButtonElement>('[data-menu-close]')!;
  const content = root.querySelector<HTMLElement>('[data-menu-content]')!;
  const backdrop = root.querySelector<HTMLElement>('[data-menu-backdrop]')!;
  const navEl = root.querySelector<HTMLElement>('[data-menu-nav]')!;
  const highlight = root.querySelector<HTMLElement>('[data-menu-highlight]')!;
  const links = [...root.querySelectorAll<HTMLAnchorElement>('[data-menu-link]')];
  const labels = links.map((l) => l.querySelector('[data-menu-label]')!);
  const bars = root.querySelectorAll('[data-menu-bar]');
  const fades = root.querySelectorAll('[data-menu-fade]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

  let isOpen = false;
  let tl: gsap.core.Timeline | null = null;
  let openTimer = 0;
  let closeTimer = 0;

  const d = (s: number) => (reduce.matches ? 0 : s);
  const closedClip = () => `inset(${panel.offsetHeight - BOX.h}px 0px 0px ${panel.offsetWidth - BOX.w}px round 6px)`;

  // Switch from the CSS calc() fallback to pixel values GSAP can interpolate
  gsap.set(panel, { clipPath: closedClip() });
  gsap.set(labels, { yPercent: 105 });

  function open({ focus = false } = {}) {
    window.clearTimeout(closeTimer);
    if (isOpen) return;
    isOpen = true;
    sound.play('open');

    content.inert = false;
    openBtn.setAttribute('aria-expanded', 'true');
    openBtn.tabIndex = -1;
    backdrop.style.pointerEvents = 'auto';
    panel.style.willChange = 'clip-path';

    tl?.kill();
    tl = gsap
      .timeline({ onComplete: () => (panel.style.willChange = '') })
      .set(content, { autoAlpha: 1 }, 0)
      .to(bars, { scaleX: 0, duration: d(0.25), stagger: 0.04, ease: 'power3.in' }, 0)
      .set(openBtn, { autoAlpha: 0 }, d(0.25))
      .to(backdrop, { autoAlpha: 1, duration: d(0.5), ease: 'power2.out' }, 0)
      .to(panel, { clipPath: OPEN_CLIP, duration: d(0.75), ease: 'power4.inOut' }, 0)
      .to(labels, { yPercent: 0, duration: d(0.8), stagger: 0.04, ease: 'expo.out' }, d(0.28))
      .fromTo(fades, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: d(0.5), ease: 'power3.out' }, d(0.4));

    if (focus) tl.add(() => closeBtn.focus({ preventScroll: true }), d(0.35));
  }

  function close({ silent = false, restoreFocus = false } = {}) {
    window.clearTimeout(closeTimer);
    window.clearTimeout(openTimer);
    if (!isOpen) return;
    isOpen = false;
    if (!silent) sound.play('close');

    hideHighlight();
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.tabIndex = 0;
    backdrop.style.pointerEvents = 'none';
    content.inert = true;
    panel.style.willChange = 'clip-path';

    tl?.kill();
    tl = gsap
      .timeline({ onComplete: () => (panel.style.willChange = '') })
      .to(fades, { autoAlpha: 0, duration: d(0.2), ease: 'power2.in' }, 0)
      .to(labels, { yPercent: -105, duration: d(0.35), stagger: { each: 0.02, from: 'end' }, ease: 'power3.in' }, 0)
      .to(panel, { clipPath: closedClip(), duration: d(0.65), ease: 'power4.inOut' }, d(0.12))
      .to(backdrop, { autoAlpha: 0, duration: d(0.45), ease: 'power2.inOut' }, d(0.15))
      .set(content, { autoAlpha: 0 })
      .set(labels, { yPercent: 105 })
      .set(openBtn, { autoAlpha: 1 }, '-=0.15')
      .to(bars, { scaleX: 1, duration: d(0.45), stagger: 0.06, ease: 'expo.out' }, '<');

    if (restoreFocus) openBtn.focus({ preventScroll: true });
  }

  // ---- sliding highlight pill (transform-based) --------------------------
  let highlightVisible = false;
  function moveHighlight(link: HTMLElement) {
    links.forEach((l) => l.toggleAttribute('data-hover', l === link));
    const box = { x: link.offsetLeft, y: link.offsetTop, width: link.offsetWidth, height: link.offsetHeight };
    if (!highlightVisible) {
      highlightVisible = true;
      gsap.set(highlight, box);
      gsap.fromTo(highlight, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: d(0.5), ease: 'expo.out', overwrite: 'auto' });
    } else {
      gsap.to(highlight, { ...box, duration: d(0.5), ease: 'expo.out', overwrite: 'auto' });
    }
  }
  function hideHighlight() {
    if (!highlightVisible) return;
    highlightVisible = false;
    links.forEach((l) => l.removeAttribute('data-hover'));
    gsap.to(highlight, { clipPath: 'inset(0% 0% 0% 100%)', duration: d(0.4), ease: 'expo.out', overwrite: 'auto' });
  }

  links.forEach((link) => {
    link.addEventListener('pointerenter', () => moveHighlight(link));
    link.addEventListener('focus', () => moveHighlight(link));
  });
  navEl.addEventListener('pointerleave', hideHighlight);

  // ---- hover-to-open (desktop only) -----------------------------------------
  const isMouse = (e: PointerEvent) => e.pointerType === 'mouse' && canHover.matches;

  openBtn.addEventListener('pointerenter', (e) => {
    if (!isMouse(e)) return;
    window.clearTimeout(openTimer);
    openTimer = window.setTimeout(() => open(), HOVER_OPEN_DELAY);
  });
  openBtn.addEventListener('pointerleave', () => window.clearTimeout(openTimer));
  panel.addEventListener('pointerenter', () => window.clearTimeout(closeTimer));
  panel.addEventListener('pointerleave', (e) => {
    if (!isOpen || !isMouse(e)) return;
    closeTimer = window.setTimeout(() => close(), HOVER_CLOSE_DELAY);
  });

  // ---- click / keyboard -------------------------------------------------------
  openBtn.addEventListener('click', (e) => {
    // keyboard "clicks" have detail 0 → move focus into the menu
    open({ focus: e.detail === 0 || !canHover.matches });
  });
  closeBtn.addEventListener('click', (e) => close({ restoreFocus: e.detail === 0 }));
  backdrop.addEventListener('click', () => close());

  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close({ restoreFocus: true });
    } else if (e.key === 'Tab') {
      const items = [...content.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (!content.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener('resize', () => {
    if (!isOpen && !tl?.isActive()) gsap.set(panel, { clipPath: closedClip() });
  });

  // ---- navigation -------------------------------------------------------------
  document.addEventListener('astro:before-preparation', () => close({ silent: true }));
  const markActive = () =>
    links.forEach((l) => {
      if (isActive(location.pathname, l.getAttribute('href')!)) l.setAttribute('aria-current', 'page');
      else l.removeAttribute('aria-current');
    });
  document.addEventListener('astro:page-load', markActive);
  markActive();
}
