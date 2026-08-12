import { onReady } from './env';
import { initCursor, initMagnetic } from './cursor';
import { initMenu } from './menu';
import { initReveal } from './reveal';
import { initScrollUi, initSmoothScroll } from './scroll';
import { initSpikeField } from './spike-field';
import { initTheme } from './theme';
import {
  initClock,
  initCopy,
  initDisclosure,
  initDropdowns,
  initHero,
  initRotator,
  initTilt,
} from './widgets';

onReady(() => {
  initTheme();
  initMenu();
  initReveal();
  initHero();
  initRotator();
  initClock();
  initDisclosure();
  initDropdowns();
  initTilt();
  initCopy();
  initCursor();
  initScrollUi();

  /*
   * These two load their animation library after their own device guards, so
   * they settle a tick later than everything above. Deliberately not awaited:
   * nothing here depends on them, and awaiting would hold up the rest.
   */
  void initMagnetic();
  void initSmoothScroll();

  const canvas = document.querySelector<HTMLCanvasElement>('[data-spike-field]');
  if (canvas) initSpikeField(canvas);
});
