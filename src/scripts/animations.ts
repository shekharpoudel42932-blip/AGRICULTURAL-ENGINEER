/**
 * Declarative GSAP animations. Add attributes in markup and no JS is needed per component:
 *
 *   data-reveal[="fade-up" | "fade" | "scale"]  + optional data-delay="0.2"
 *   data-stagger           children reveal one after another
 *   data-split[="lines" | "words" | "chars"]   SplitText masked reveal for headings
 *   data-parallax="0.2"    vertical drift while scrolling (negative = opposite)
 *   data-counter="1200"    counts up from 0 when visible
 *   data-draw[="load"]     strokes SVG paths in (on scroll, or on page load)
 *   data-draw-line         scaleY "growing" line, scrubbed to scroll (timelines)
 *   data-marquee="40"      infinite ticker (seconds per loop), slows on hover
 *   data-progress          reading progress bar (scaleX)
 *
 * Everything runs inside a gsap.context() so a single revert() cleans up on page change.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

const START = 'top 88%';

const reveals: Record<string, gsap.TweenVars> = {
  'fade-up': { y: 40, autoAlpha: 0 },
  fade: { autoAlpha: 0 },
  scale: { scale: 0.94, autoAlpha: 0 },
};

export function initAnimations(scope: ParentNode = document) {
  const q = <T extends Element = HTMLElement>(sel: string) => [...scope.querySelectorAll<T>(sel)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce) {
    // Show final states immediately
    q('[data-counter]').forEach((el) => (el.textContent = Number(el.dataset.counter).toLocaleString('en-US')));
    return () => {};
  }

  const splits: SplitText[] = [];

  const ctx = gsap.context(() => {
    // ---- reveal --------------------------------------------------------
    q('[data-reveal]').forEach((el) => {
      const from = reveals[el.dataset.reveal || 'fade-up'] ?? reveals['fade-up'];
      gsap.fromTo(el, from, {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 1.1,
        ease: 'expo.out',
        delay: Number(el.dataset.delay ?? 0),
        scrollTrigger: { trigger: el, start: START, once: true },
      });
    });

    // ---- stagger -------------------------------------------------------
    q('[data-stagger]').forEach((el) => {
      gsap.fromTo(
        el.children,
        { y: 32, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: START, once: true },
        },
      );
    });

    // ---- split headings -----------------------------------------------
    q('[data-split]').forEach((el) => {
      const type = (el.dataset.split || 'lines') as 'lines' | 'words' | 'chars';
      const split = SplitText.create(el, {
        type: type === 'lines' ? 'lines' : `lines,${type}`,
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { visibility: 'visible' });
          const targets = type === 'lines' ? self.lines : type === 'words' ? self.words : self.chars;
          return gsap.from(targets, {
            yPercent: 110,
            duration: type === 'chars' ? 1.2 : 1.1,
            ease: 'expo.out',
            stagger: type === 'chars' ? 0.035 : 0.08,
            scrollTrigger: { trigger: el, start: START, once: true },
          });
        },
      });
      splits.push(split);
    });

    // ---- parallax ------------------------------------------------------
    q('[data-parallax]').forEach((el) => {
      const amount = Number(el.dataset.parallax || 0.2);
      const trigger = el.parentElement ?? el;
      // above-the-fold elements start at 0 offset so nothing jumps on load
      const aboveFold = trigger.getBoundingClientRect().top + window.scrollY < window.innerHeight;
      gsap.to(el, {
        yPercent: amount * 100,
        ease: 'none',
        scrollTrigger: { trigger, start: aboveFold ? 'top top' : 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    // ---- counters ------------------------------------------------------
    q('[data-counter]').forEach((el) => {
      const target = Number(el.dataset.counter);
      const obj = { v: 0 };
      el.textContent = '0';
      gsap.to(obj, {
        v: target,
        duration: 2,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: START, once: true },
        onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString('en-US')),
      });
    });

    // ---- svg line drawing ---------------------------------------------
    q<SVGSVGElement>('[data-draw]').forEach((svg) => {
      const paths = svg.querySelectorAll('path');
      const onLoad = svg.dataset.draw === 'load';
      gsap.from(paths, {
        drawSVG: '0%',
        duration: onLoad ? 2.4 : 1.8,
        ease: 'power2.inOut',
        stagger: onLoad ? 0.06 : 0.04,
        ...(onLoad ? { delay: 0.2 } : { scrollTrigger: { trigger: svg, start: 'top 85%', once: true } }),
      });
    });

    // ---- timeline line --------------------------------------------------
    q('[data-draw-line]').forEach((el) => {
      gsap.fromTo(
        el,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement ?? el, start: 'top 75%', end: 'bottom 60%', scrub: 0.6 },
        },
      );
    });

    // ---- marquee ---------------------------------------------------------
    q('[data-marquee]').forEach((el) => {
      const track = el.querySelector<HTMLElement>('[data-marquee-track]');
      if (!track) return;
      const reverse = el.hasAttribute('data-marquee-reverse');
      const tween = gsap.fromTo(
        track,
        { xPercent: reverse ? -50 : 0 },
        { xPercent: reverse ? 0 : -50, duration: Number(el.dataset.marquee || 40), ease: 'none', repeat: -1 },
      );
      el.addEventListener('pointerenter', () => gsap.to(tween, { timeScale: 0.25, duration: 0.6 }));
      el.addEventListener('pointerleave', () => gsap.to(tween, { timeScale: 1, duration: 0.6 }));
    });

    // ---- reading progress -------------------------------------------------
    q('[data-progress]').forEach((el) => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 } },
      );
    });
  });

  // Layout can shift once web fonts settle
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  return () => {
    splits.forEach((s) => s.revert());
    ctx.revert();
  };
}
