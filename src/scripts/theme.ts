/**
 * Light/dark toggle. The initial class is set by an inline script in <head>
 * (see BaseLayout) to avoid a flash; this only handles the button.
 */
let wired = false;

export function initTheme() {
  if (wired) return;
  const btn = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!btn) return;
  wired = true;

  btn.addEventListener('click', () => {
    const apply = () => {
      const dark = document.documentElement.classList.toggle('dark');
      try {
        localStorage.setItem('theme', dark ? 'dark' : 'light');
      } catch {
        /* ignore */
      }
    };
    // Smooth cross-fade where supported
    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  });
}
