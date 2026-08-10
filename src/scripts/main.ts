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
  initMagnetic();
  initScrollUi();
  initSmoothScroll();

  const canvas = document.querySelector<HTMLCanvasElement>('[data-spike-field]');
  if (canvas) initSpikeField(canvas);

  document.documentElement.dataset['jsReady'] = '';
});
