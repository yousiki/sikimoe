import { queryAll } from './env';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'siki-theme';

export const readStoredTheme = (): Theme | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
};

export const systemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

export const currentTheme = (): Theme =>
  document.documentElement.dataset['theme'] === 'light' ? 'light' : 'dark';

export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  root.dataset['theme'] = theme;

  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) {
    meta.content = getComputedStyle(root).getPropertyValue('--paper').trim() || '#08080a';
  }

  for (const button of queryAll<HTMLButtonElement>('[data-theme-toggle]')) {
    button.setAttribute('aria-pressed', String(theme === 'light'));
    button.setAttribute(
      'aria-label',
      theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme',
    );
  }

  window.dispatchEvent(new CustomEvent<Theme>('themechange', { detail: theme }));
};

const persist = (theme: Theme): void => {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode — the in-memory theme still applies */
  }
};

export const initTheme = (): void => {
  applyTheme(readStoredTheme() ?? currentTheme());

  for (const button of queryAll<HTMLButtonElement>('[data-theme-toggle]')) {
    button.addEventListener('click', () => {
      const next: Theme = currentTheme() === 'light' ? 'dark' : 'light';

      // Wrap the swap in a View Transition where supported so the whole page
      // cross-fades instead of flashing.
      const commit = (): void => {
        applyTheme(next);
        persist(next);
      };

      if (
        typeof document.startViewTransition === 'function' &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        document.startViewTransition(commit);
      } else {
        commit();
      }
    });
  }

  // Follow the OS only while the visitor has not made an explicit choice.
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    if (readStoredTheme() === null) applyTheme(systemTheme());
  });
};
