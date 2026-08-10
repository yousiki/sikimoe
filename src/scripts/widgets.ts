import { hasFinePointer, prefersReducedMotion, queryAll } from './env';

/** Releases the staggered per-character hero animation once fonts are ready. */
export const initHero = (): void => {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;

  const reveal = (): void => {
    hero.dataset['heroReady'] = '';
  };

  if (prefersReducedMotion()) {
    reveal();
    return;
  }

  // Waiting on the webfont avoids a visible reflow mid-animation.
  const fonts = document.fonts as FontFaceSet | undefined;
  if (fonts) {
    void Promise.race([fonts.ready, new Promise((r) => setTimeout(r, 700))]).then(reveal);
  } else {
    reveal();
  }
};

/** Cycles the trailing word of the hero tagline. */
export const initRotator = (): void => {
  const rotator = document.querySelector<HTMLElement>('[data-rotator]');
  if (!rotator) return;

  const items = queryAll<HTMLElement>('[data-rotator-item]', rotator);
  if (items.length < 2) return;

  if (prefersReducedMotion()) {
    items[0]?.setAttribute('data-current', '');
    return;
  }

  let index = 0;
  items[0]?.setAttribute('data-current', '');

  setInterval(() => {
    items[index]?.removeAttribute('data-current');
    items[index]?.setAttribute('data-leaving', '');
    const leaving = items[index];
    setTimeout(() => leaving?.removeAttribute('data-leaving'), 700);
    index = (index + 1) % items.length;
    items[index]?.setAttribute('data-current', '');
  }, 2800);
};

/** Live local time at the author's location. */
export const initClock = (): void => {
  const el = document.querySelector<HTMLElement>('[data-clock]');
  if (!el) return;

  const timeZone = el.dataset['clock'] || 'Asia/Shanghai';
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const tick = (): void => {
    el.textContent = formatter.format(new Date());
  };

  tick();
  setInterval(tick, 1000);
};

/**
 * "Show all publications". The rows it reveals are already in the list, in date
 * order, collapsed to zero height by CSS — so this only has to flip a flag and
 * relabel the button, and the animation belongs entirely to the stylesheet.
 */
export const initDisclosure = (): void => {
  for (const button of queryAll<HTMLButtonElement>('[data-disclosure-toggle]')) {
    const id = button.getAttribute('aria-controls');
    const panel = id ? document.getElementById(id) : null;
    if (!panel) continue;

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));

      if (expanded) delete panel.dataset['expanded'];
      else panel.dataset['expanded'] = '';

      const label = button.querySelector<HTMLElement>('[data-disclosure-label]');
      if (label) {
        label.textContent = expanded
          ? (button.dataset['labelClosed'] ?? 'Show all')
          : (button.dataset['labelOpen'] ?? 'Show fewer');
      }
    });
  }
};

/**
 * The two behaviours a native `<details>` dropdown lacks: it closes when the
 * pointer lands elsewhere, on Escape, and when a sibling dropdown opens. Opening
 * and closing themselves stay with the element, so this is purely additive.
 */
export const initDropdowns = (): void => {
  const dropdowns = queryAll<HTMLDetailsElement>('[data-dropdown]');
  if (dropdowns.length === 0) return;

  const close = (dropdown: HTMLDetailsElement, moveFocus = false): void => {
    if (!dropdown.open) return;
    dropdown.open = false;
    if (moveFocus) dropdown.querySelector('summary')?.focus();
  };

  for (const dropdown of dropdowns) {
    // `toggle` rather than a click handler on the summary: it also fires for the
    // keyboard and for `open` being set from here.
    dropdown.addEventListener('toggle', () => {
      if (!dropdown.open) return;
      for (const other of dropdowns) if (other !== dropdown) close(other);
    });
  }

  document.addEventListener('pointerdown', (event) => {
    const target = event.target as Node;
    for (const dropdown of dropdowns) {
      if (!dropdown.contains(target)) close(dropdown);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    for (const dropdown of dropdowns) {
      // Focus goes back to the summary only if it was inside the panel, which is
      // also what stops this from stealing focus from the section overlay.
      close(dropdown, dropdown.contains(document.activeElement));
    }
  });
};

/** Subtle pointer-tracked tilt + spotlight on cards. */
export const initTilt = (): void => {
  if (!hasFinePointer() || prefersReducedMotion()) return;

  for (const card of queryAll<HTMLElement>('[data-tilt]')) {
    const max = Number(card.dataset['tilt'] || 5);

    card.addEventListener(
      'pointermove',
      (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        card.style.setProperty('--spot-x', `${px * 100}%`);
        card.style.setProperty('--spot-y', `${py * 100}%`);
        card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateZ(0)`;
      },
      { passive: true },
    );

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  }
};

/**
 * Copies the email address to the clipboard and confirms inline, while leaving
 * the underlying `mailto:` link working for anyone who prefers it.
 */
export const initCopy = (): void => {
  for (const button of queryAll<HTMLButtonElement>('[data-copy]')) {
    const value = button.dataset['copy'];
    if (!value) continue;
    const label = button.querySelector<HTMLElement>('[data-copy-label]');
    const original = label?.textContent ?? '';

    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(value);
        if (label) label.textContent = 'Copied';
        button.dataset['copied'] = '';
      } catch {
        if (label) label.textContent = value;
      }
      setTimeout(() => {
        if (label) label.textContent = original;
        delete button.dataset['copied'];
      }, 1800);
    });
  }
};
