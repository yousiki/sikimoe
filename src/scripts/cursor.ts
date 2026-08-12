import { hasFinePointer, prefersReducedMotion, queryAll } from './env';

/**
 * A two-part cursor: an inner dot that tracks the pointer exactly and an outer
 * ring that trails behind and swells over interactive targets. Pointer-fine
 * devices only — touch screens keep the native behaviour.
 */
export const initCursor = (): void => {
  if (!hasFinePointer() || prefersReducedMotion()) return;

  const root = document.querySelector<HTMLElement>('[data-cursor]');
  const dot = document.querySelector<HTMLElement>('[data-cursor-dot]');
  const ring = document.querySelector<HTMLElement>('[data-cursor-ring]');
  if (!root || !dot || !ring) return;

  root.hidden = false;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let ringX = targetX;
  let ringY = targetY;
  let visible = false;
  let raf = 0;

  const render = (): void => {
    raf = requestAnimationFrame(render);
    ringX += (targetX - ringX) * 0.16;
    ringY += (targetY - ringY) * 0.16;
    dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
  };

  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;
      targetX = event.clientX;
      targetY = event.clientY;
      if (!visible) {
        visible = true;
        root.dataset['active'] = '';
      }
    },
    { passive: true },
  );

  document.addEventListener('pointerleave', () => {
    visible = false;
    delete root.dataset['active'];
  });

  const interactive = 'a, button, [role="button"], input, summary, [data-cursor-target]';
  document.addEventListener('pointerover', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(interactive)) root.dataset['hover'] = '';
  });
  document.addEventListener('pointerout', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(interactive)) delete root.dataset['hover'];
  });

  raf = requestAnimationFrame(render);
  window.addEventListener('pagehide', () => cancelAnimationFrame(raf));
};

/** Elements tagged `data-magnetic` drift toward the pointer while it is near. */
export const initMagnetic = async (): Promise<void> => {
  if (!hasFinePointer() || prefersReducedMotion()) return;

  const targets = queryAll<HTMLElement>('[data-magnetic]');
  if (targets.length === 0) return;

  /*
   * `motion` is ~16 kB gzipped and this is the only place that reaches for it,
   * behind a guard no touch device and no reduced-motion visitor ever passes.
   * Importing it *after* the guard keeps it out of the entry chunk, so those
   * visitors never download a library that could not have run for them.
   */
  const { animate } = await import('motion');

  for (const el of targets) {
    const strength = Number(el.dataset['magnetic'] || 0.32);

    const onMove = (event: PointerEvent): void => {
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      animate(
        el,
        { x: dx * strength, y: dy * strength },
        { type: 'spring', stiffness: 240, damping: 22 },
      );
    };

    const onLeave = (): void => {
      animate(el, { x: 0, y: 0 }, { type: 'spring', stiffness: 200, damping: 18 });
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('blur', onLeave);
  }
};
