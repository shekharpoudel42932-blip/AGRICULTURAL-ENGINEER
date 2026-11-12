/**
 * Minimal lightbox built on <dialog> + GSAP.
 * Open: click any a[data-lightbox] (its href is the full-size image).
 *   data-caption           caption under the image
 *   data-lightbox-group    links sharing a group can be stepped through with ←/→ or the arrow buttons
 *   data-download          URL of the original file; shows a download button (data-download-name sets the file name)
 * Close: × button, clicking the dimmed background, or Esc.
 * Uses a capture-phase listener so it runs before Astro's client router.
 */
import { gsap } from 'gsap';
import { sound } from './sound';

let wired = false;

/** Links in the current gallery, and which one is showing */
let group: HTMLAnchorElement[] = [];
let index = 0;

export function initLightbox() {
  if (wired) return;
  wired = true;

  document.addEventListener(
    'click',
    (e) => {
      const link = (e.target as Element).closest<HTMLAnchorElement>('a[data-lightbox]');
      if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox-dialog]');
      if (!dialog) return;
      e.preventDefault();
      open(dialog, link);
    },
    { capture: true },
  );
}

function parts(dialog: HTMLDialogElement) {
  return {
    bg: dialog.querySelector<HTMLElement>('[data-lightbox-bg]')!,
    figure: dialog.querySelector<HTMLElement>('[data-lightbox-figure]')!,
    img: dialog.querySelector<HTMLImageElement>('[data-lightbox-img]')!,
    caption: dialog.querySelector<HTMLElement>('[data-lightbox-caption]')!,
    counter: dialog.querySelector<HTMLElement>('[data-lightbox-counter]')!,
    toolbar: dialog.querySelector<HTMLElement>('[data-lightbox-toolbar]')!,
    closeBtn: dialog.querySelector<HTMLButtonElement>('[data-lightbox-close]')!,
    download: dialog.querySelector<HTMLAnchorElement>('[data-lightbox-download]')!,
    prev: dialog.querySelector<HTMLButtonElement>('[data-lightbox-prev]')!,
    next: dialog.querySelector<HTMLButtonElement>('[data-lightbox-next]')!,
  };
}

/** Fill the dialog with the image behind `link` */
function show(dialog: HTMLDialogElement, link: HTMLAnchorElement) {
  const { img, caption, counter, download, prev, next } = parts(dialog);

  img.src = link.href;
  img.alt = link.querySelector('img')?.alt ?? '';
  caption.textContent = link.dataset.caption ?? '';

  const multi = group.length > 1;
  counter.hidden = !multi;
  counter.textContent = multi ? `${index + 1} / ${group.length}` : '';
  prev.hidden = next.hidden = !multi;

  const file = link.dataset.download;
  download.hidden = !file;
  if (file) {
    download.href = file;
    download.download = link.dataset.downloadName ?? '';
  }
}

function step(dialog: HTMLDialogElement, delta: number) {
  if (group.length < 2) return;
  index = (index + delta + group.length) % group.length;
  const { img } = parts(dialog);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  show(dialog, group[index]);
  gsap.fromTo(img, { autoAlpha: 0, x: reduce ? 0 : delta * 24 }, { autoAlpha: 1, x: 0, duration: reduce ? 0 : 0.45, ease: 'expo.out' });
}

function open(dialog: HTMLDialogElement, link: HTMLAnchorElement) {
  const { bg, figure, toolbar, closeBtn, prev, next } = parts(dialog);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const name = link.dataset.lightboxGroup;
  group = name ? [...document.querySelectorAll<HTMLAnchorElement>(`a[data-lightbox][data-lightbox-group="${CSS.escape(name)}"]`)] : [link];
  index = Math.max(0, group.indexOf(link));
  show(dialog, link);

  // Wire handlers once per dialog element (a fresh dialog arrives with each page)
  if (!dialog.dataset.wired) {
    dialog.dataset.wired = 'true';
    const close = () => {
      if (!dialog.open) return;
      sound.play('close');
      gsap
        .timeline({ onComplete: () => dialog.close() })
        .to(figure, { autoAlpha: 0, scale: 0.96, y: 10, duration: reduce ? 0 : 0.3, ease: 'power3.in' }, 0)
        .to([bg, toolbar, prev, next], { autoAlpha: 0, duration: reduce ? 0 : 0.35 }, 0.05);
    };
    closeBtn.addEventListener('click', close);
    bg.addEventListener('click', close);
    figure.addEventListener('click', (ev) => {
      if (ev.target === figure) close();
    });
    prev.addEventListener('click', () => step(dialog, -1));
    next.addEventListener('click', () => step(dialog, 1));
    dialog.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowLeft') step(dialog, -1);
      else if (ev.key === 'ArrowRight') step(dialog, 1);
    });
    dialog.addEventListener('cancel', (ev) => {
      ev.preventDefault();
      close();
    });
  }

  dialog.showModal();
  sound.play('open');
  gsap.fromTo([bg, toolbar, prev, next], { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.4, ease: 'power2.out' });
  gsap.fromTo(figure, { autoAlpha: 0, scale: 0.94, y: 24 }, { autoAlpha: 1, scale: 1, y: 0, duration: reduce ? 0 : 0.7, ease: 'expo.out' });
}
