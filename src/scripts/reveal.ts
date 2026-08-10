import { prefersReducedMotion, queryAll } from './env';

/**
 * Releases `[data-reveal]` elements as they enter the viewport. Elements that
 * share a `data-reveal-group` are staggered in DOM order.
 */
export const initReveal = (): void => {
  const targets = queryAll<HTMLElement>('[data-reveal]');
  if (targets.length === 0) return;

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    for (const el of targets) el.dataset['revealed'] = '';
    return;
  }

  const groupCounters = new Map<string, number>();
  for (const el of targets) {
    const group = el.dataset['revealGroup'];
    if (group === undefined) continue;
    const index = groupCounters.get(group) ?? 0;
    groupCounters.set(group, index + 1);
    el.style.setProperty('--reveal-delay', `${index * 90}ms`);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset['revealed'] = '';
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
  );

  for (const el of targets) {
    // The negative bottom margin above means an element sitting in the lowest
    // slice of the first screen would never qualify — release those directly
    // so nothing above the fold waits for a scroll that may never come.
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.dataset['revealed'] = '';
      continue;
    }
    observer.observe(el);
  }
};
