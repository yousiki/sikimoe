import Lenis from 'lenis';

import { prefersReducedMotion, queryAll } from './env';

/** Momentum scrolling, unless the visitor asked for reduced motion. */
export const initSmoothScroll = (): Lenis | null => {
  if (prefersReducedMotion()) return null;

  const lenis = new Lenis({
    duration: 1.05,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  });

  const raf = (time: number): void => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  for (const anchor of queryAll<HTMLAnchorElement>('a[href^="#"]')) {
    anchor.addEventListener('click', (event) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -24 });
      history.replaceState(null, '', id);
    });
  }

  return lenis;
};

/**
 * Header state + scroll progress bar + "which section am I in" highlighting for
 * the section index.
 */
export const initScrollUi = (): void => {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const progress = document.querySelector<HTMLElement>('[data-scroll-progress]');
  const links = queryAll<HTMLAnchorElement>('[data-section-link]');
  const sections = queryAll<HTMLElement>('section[id]');
  const timeline = document.querySelector<HTMLElement>('[data-timeline]');

  let ticking = false;

  const update = (): void => {
    ticking = false;
    const y = window.scrollY;

    if (header) {
      if (y > 40) header.dataset['scrolled'] = '';
      else delete header.dataset['scrolled'];
    }

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    }

    if (timeline) {
      // The spine fills as the list passes the middle of the viewport.
      const rect = timeline.getBoundingClientRect();
      const travelled = window.innerHeight * 0.55 - rect.top;
      const ratio = Math.max(0, Math.min(1, travelled / Math.max(rect.height, 1)));
      timeline.style.setProperty('--timeline-progress', ratio.toFixed(4));
    }
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();

  if (links.length > 0 && sections.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          for (const link of links) {
            const matches = link.getAttribute('href') === `#${id}`;
            if (matches) link.dataset['current'] = '';
            else delete link.dataset['current'];
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );
    for (const section of sections) observer.observe(section);
  }
};
