/**
 * Wires everything to Astro's view-transition lifecycle.
 *  - persistent UI (menu, sound, theme) is initialised once
 *  - page-level effects (animations, hover) are set up on every astro:page-load
 *    and torn down on astro:before-swap so ScrollTriggers never leak between pages
 */
import { initAnimations } from './animations';
import { initHover } from './hover';
import { initLightbox } from './lightbox';
import { initMenu } from './menu';
import { initSound } from './sound';
import { initTheme } from './theme';

let cleanups: Array<() => void> = [];

function teardown() {
  cleanups.forEach((fn) => fn());
  cleanups = [];
}

document.addEventListener('astro:page-load', () => {
  initSound();
  initMenu();
  initTheme();
  initLightbox();

  teardown();
  cleanups.push(initAnimations(), initHover());
});

document.addEventListener('astro:before-swap', teardown);
