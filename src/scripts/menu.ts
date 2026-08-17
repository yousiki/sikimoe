import { queryAll } from './env';

/**
 * Full-screen section index for viewports too narrow for the inline nav.
 * Keeps focus inside the overlay while it is open and restores it on close.
 */
export const initMenu = (): void => {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-menu]');
  if (!toggle || !panel) return;

  const background = [
    ...queryAll<HTMLElement>('body > :not(header):not([data-menu])'),
    ...queryAll<HTMLElement>('header a, header details, header button:not([data-menu-toggle])'),
  ];

  const focusables = (): HTMLElement[] => [
    toggle,
    ...queryAll<HTMLElement>('a[href], button:not([disabled])', panel),
  ];

  const setOpen = (open: boolean, moveFocus = true): void => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', `${open ? 'Close' : 'Open'} section index`);
    panel.dataset['open'] = String(open);
    panel.setAttribute('aria-hidden', String(!open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
    for (const element of background) element.inert = open;

    if (!moveFocus) {
      panel.hidden = !open;
      return;
    }

    if (open) {
      panel.hidden = false;
      document.querySelector<HTMLDetailsElement>('header details[open]')?.removeAttribute('open');
      focusables()[1]?.focus();
    } else {
      // Always hand focus back to the control that opened the panel. Safari
      // does not focus a <button> on click, so remembering the previously
      // focused element would leave focus on <body>.
      toggle.focus();
      // Wait for the exit transition before removing it from the a11y tree.
      setTimeout(() => {
        if (panel.dataset['open'] === 'false') panel.hidden = true;
      }, 450);
    }
  };

  const isOpen = (): boolean => toggle.getAttribute('aria-expanded') === 'true';

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  for (const link of queryAll<HTMLAnchorElement>('a[href^="#"]', panel)) {
    link.addEventListener('click', () => setOpen(false));
  }

  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;

    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (event.key !== 'Tab') return;

    const items = focusables();
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // A resize into the desktop layout would otherwise leave the body locked.
  window.matchMedia('(min-width: 48rem)').addEventListener('change', (event) => {
    if (event.matches && isOpen()) setOpen(false);
  });

  // Initial state only — must not pull focus on load.
  setOpen(false, false);
};
