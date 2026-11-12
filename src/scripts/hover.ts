/**
 * Subtle pointer-driven hover effects (desktop / fine pointers only):
 *   [data-magnetic]  element is gently pulled toward the cursor
 *   [data-card]      lifts a few px with a slight 3D tilt
 */
import { gsap } from 'gsap';

export function initHover(scope: ParentNode = document) {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return () => {};

  const ac = new AbortController();
  const { signal } = ac;

  // ---- magnetic buttons ----------------------------------------------------
  scope.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const inner = el.querySelector<HTMLElement>('[data-magnetic-inner]');
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const ixTo = inner && gsap.quickTo(inner, 'x', { duration: 0.5, ease: 'power3.out' });
    const iyTo = inner && gsap.quickTo(inner, 'y', { duration: 0.5, ease: 'power3.out' });

    el.addEventListener(
      'pointermove',
      (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        xTo(dx * 0.22);
        yTo(dy * 0.3);
        ixTo?.(dx * 0.1);
        iyTo?.(dy * 0.12);
      },
      { signal },
    );
    el.addEventListener(
      'pointerleave',
      () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
        if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      },
      { signal },
    );
  });

  // ---- cards: lift + tilt ----------------------------------------------------
  scope.querySelectorAll<HTMLElement>('[data-card]').forEach((card) => {
    gsap.set(card, { transformPerspective: 900 });
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });

    card.addEventListener('pointerenter', () => gsap.to(card, { y: -6, duration: 0.5, ease: 'power3.out', overwrite: 'auto' }), { signal });
    card.addEventListener(
      'pointermove',
      (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rx(py * -3);
        ry(px * 3);
      },
      { signal },
    );
    card.addEventListener(
      'pointerleave',
      () => {
        rx(0);
        ry(0);
        gsap.to(card, { y: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
      },
      { signal },
    );
  });

  return () => ac.abort();
}
