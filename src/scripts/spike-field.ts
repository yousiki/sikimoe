import { clamp, prefersReducedMotion } from './env';

/**
 * The hero backdrop: a simulated spike-camera sensor.
 *
 * Every cell of a virtual sensor grid integrates the incident light of a slowly
 * drifting illumination field. When a cell's accumulated charge crosses one
 * unit it "fires" — emitting a bright dot and resetting — exactly the
 * integrate-and-fire behaviour of the neuromorphic sensors this site's author
 * builds reconstruction algorithms for. Bright regions therefore fire densely
 * and dark regions stay quiet, so the illumination field becomes visible purely
 * through the statistics of the spikes.
 */

interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

interface Palette {
  readonly cool: Rgb;
  readonly mid: Rgb;
  readonly warm: Rgb;
}

interface Source {
  /** Position in normalised [0,1] space. */
  x: number;
  y: number;
  /** Orbit parameters. */
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
  readonly speed: number;
  readonly phase: number;
  readonly radius: number;
  readonly power: number;
}

const CELL_SIZE_DESKTOP = 21;
const CELL_SIZE_MOBILE = 26;
const DECAY_TAU = 0.5;
const MAX_DPR = 2;
const POINTER_RADIUS = 0.19;
const POINTER_POWER = 1.5;

const parseColor = (raw: string): Rgb => {
  const value = raw.trim();

  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value);
  if (hex?.[1]) {
    const digits =
      hex[1].length === 3
        ? hex[1]
            .split('')
            .map((c) => c + c)
            .join('')
        : hex[1];
    return {
      r: Number.parseInt(digits.slice(0, 2), 16),
      g: Number.parseInt(digits.slice(2, 4), 16),
      b: Number.parseInt(digits.slice(4, 6), 16),
    };
  }

  const numbers = value.match(/[\d.]+/g);
  if (numbers && numbers.length >= 3) {
    return {
      r: Number(numbers[0]),
      g: Number(numbers[1]),
      b: Number(numbers[2]),
    };
  }

  return { r: 183, g: 162, b: 255 };
};

const readPalette = (): Palette => {
  const style = getComputedStyle(document.documentElement);
  return {
    cool: parseColor(style.getPropertyValue('--accent-2')),
    mid: parseColor(style.getPropertyValue('--accent')),
    warm: parseColor(style.getPropertyValue('--accent-3')),
  };
};

const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => ({
  r: Math.round(a.r + (b.r - a.r) * t),
  g: Math.round(a.g + (b.g - a.g) * t),
  b: Math.round(a.b + (b.b - a.b) * t),
});

const sampleRamp = (palette: Palette, t: number): Rgb =>
  t < 0.5 ? mixRgb(palette.cool, palette.mid, t * 2) : mixRgb(palette.mid, palette.warm, t * 2 - 1);

/** Deterministic pseudo-random in [0,1) — keeps the layout stable across reloads. */
const hashNoise = (i: number): number => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const createSources = (): Source[] =>
  [
    { cx: 0.28, cy: 0.36, rx: 0.2, ry: 0.14, speed: 0.055, phase: 0.0, radius: 0.34, power: 1.0 },
    { cx: 0.74, cy: 0.58, rx: 0.16, ry: 0.2, speed: -0.041, phase: 2.1, radius: 0.29, power: 0.85 },
    { cx: 0.52, cy: 0.82, rx: 0.26, ry: 0.1, speed: 0.031, phase: 4.4, radius: 0.36, power: 0.6 },
  ].map((s) => ({ ...s, x: s.cx, y: s.cy }));

export interface SpikeFieldHandle {
  destroy(): void;
}

export const initSpikeField = (canvas: HTMLCanvasElement): SpikeFieldHandle | null => {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return null;

  const ctx = context;
  const sources = createSources();

  let palette = readPalette();
  let cols = 0;
  let rows = 0;
  let cell = CELL_SIZE_DESKTOP;
  let charge = new Float32Array(0);
  let life = new Float32Array(0);
  let jitter = new Float32Array(0);
  let width = 0;
  let height = 0;
  let dpr = 1;

  let pointerX = 0.5;
  let pointerY = 0.42;
  let pointerStrength = 0;
  let pointerTarget = 0;

  let rafId = 0;
  let lastTime = 0;
  let elapsed = 0;
  let running = false;
  let visible = true;

  const resize = (): void => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cell = width < 640 ? CELL_SIZE_MOBILE : CELL_SIZE_DESKTOP;
    cols = Math.ceil(width / cell) + 1;
    rows = Math.ceil(height / cell) + 1;

    const count = cols * rows;
    charge = new Float32Array(count);
    life = new Float32Array(count);
    jitter = new Float32Array(count * 2);

    for (let i = 0; i < count; i += 1) {
      // Random initial charge so the field does not fire in lockstep on load.
      charge[i] = hashNoise(i);
      jitter[i * 2] = (hashNoise(i * 2.13) - 0.5) * cell * 0.34;
      jitter[i * 2 + 1] = (hashNoise(i * 3.71) - 0.5) * cell * 0.34;
    }
  };

  /** Incident light at normalised position, in roughly [0, 2]. */
  const luminance = (nx: number, ny: number, t: number): number => {
    let sum = 0;

    for (const s of sources) {
      const dx = nx - s.x;
      const dy = (ny - s.y) * 0.82;
      const d2 = dx * dx + dy * dy;
      sum += s.power * Math.exp(-d2 / (s.radius * s.radius));
    }

    // A slow travelling wave keeps the quiet regions from looking dead.
    sum += 0.16 * (0.5 + 0.5 * Math.sin(nx * 7.2 - t * 0.5 + Math.cos(ny * 5.1 + t * 0.31) * 1.4));

    if (pointerStrength > 0.001) {
      const dx = nx - pointerX;
      const dy = (ny - pointerY) * 0.82;
      const d2 = dx * dx + dy * dy;
      sum += POINTER_POWER * pointerStrength * Math.exp(-d2 / (POINTER_RADIUS * POINTER_RADIUS));
    }

    // Vignette so the field fades out before it reaches the page edges.
    const vx = Math.abs(nx - 0.5) * 2;
    const vy = Math.abs(ny - 0.5) * 2;
    const vignette = clamp(1.18 - 0.55 * (vx * vx + vy * vy * 0.6), 0, 1);

    return sum * vignette;
  };

  const draw = (dt: number): void => {
    ctx.clearRect(0, 0, width, height);

    const decay = Math.exp(-dt / DECAY_TAU);
    const invW = 1 / Math.max(width, 1);
    const invH = 1 / Math.max(height, 1);

    for (let row = 0; row < rows; row += 1) {
      const py = row * cell;
      const ny = py * invH;

      for (let col = 0; col < cols; col += 1) {
        const i = row * cols + col;
        const px = col * cell;
        const nx = px * invW;

        const l = luminance(nx, ny, elapsed);

        // Integrate-and-fire.
        charge[i] = (charge[i] ?? 0) + l * dt * 2.35;
        if ((charge[i] ?? 0) >= 1) {
          charge[i] = (charge[i] ?? 0) % 1;
          life[i] = 1;
        } else {
          life[i] = (life[i] ?? 0) * decay;
        }

        const a = life[i] ?? 0;
        if (a < 0.02) continue;

        const intensity = clamp(l * 0.62, 0, 1);
        const { r, g, b } = sampleRamp(palette, intensity);
        const size = 1.1 + a * 1.9 + intensity * 1.2;

        ctx.fillStyle = `rgba(${r},${g},${b},${(a * (0.28 + intensity * 0.62)).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(
          px + (jitter[i * 2] ?? 0),
          py + (jitter[i * 2 + 1] ?? 0),
          size * 0.5,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
  };

  const step = (time: number): void => {
    if (!running) return;
    rafId = requestAnimationFrame(step);
    if (!visible) {
      lastTime = time;
      return;
    }

    // Clamp dt so a backgrounded tab does not fire the entire sensor at once.
    const dt = clamp((time - lastTime) / 1000, 0, 1 / 20);
    lastTime = time;
    elapsed += dt;

    pointerStrength += (pointerTarget - pointerStrength) * Math.min(1, dt * 4.5);

    for (const s of sources) {
      s.x = s.cx + Math.cos(elapsed * s.speed + s.phase) * s.rx;
      s.y = s.cy + Math.sin(elapsed * s.speed * 1.37 + s.phase) * s.ry;
    }

    draw(dt);
  };

  const start = (): void => {
    if (running) return;
    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(step);
  };

  const stop = (): void => {
    running = false;
    cancelAnimationFrame(rafId);
  };

  const onPointerMove = (event: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / Math.max(rect.width, 1);
    pointerY = (event.clientY - rect.top) / Math.max(rect.height, 1);
    pointerTarget = 1;
  };

  const onPointerLeave = (): void => {
    pointerTarget = 0;
  };

  const onThemeChange = (): void => {
    palette = readPalette();
  };

  const onVisibility = (): void => {
    visible = document.visibilityState === 'visible';
    if (visible) lastTime = performance.now();
  };

  resize();

  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(canvas);

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry) return;
      if (entry.isIntersecting) start();
      else stop();
    },
    { threshold: 0 },
  );

  window.addEventListener('themechange', onThemeChange);

  if (prefersReducedMotion()) {
    // One settled frame: enough charge for the illumination pattern to show,
    // but nothing moves afterwards.
    for (let i = 0; i < 90; i += 1) {
      elapsed += 1 / 30;
      draw(1 / 30);
    }
  } else {
    canvas.addEventListener('pointermove', onPointerMove, { passive: true });
    canvas.addEventListener('pointerleave', onPointerLeave, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    intersectionObserver.observe(canvas);
    start();
  }

  return {
    destroy(): void {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('themechange', onThemeChange);
    },
  };
};
