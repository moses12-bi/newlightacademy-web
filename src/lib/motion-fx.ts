/**
 * Elementor `motion_fx` maths, reimplemented from the theme's own runtime
 * (`frontend.min(1).js.download` motion-fx actions + `frontend-modules.min.js`
 * Scroll utils). Pure functions only — no DOM, no React — so the numbers can be
 * unit-tested against the original formulas.
 *
 * Elementor's model, in order:
 *   1. an interaction produces a progress percentage (0-100)
 *   2. `affectedRange` clamps that percentage
 *   3. translate/rotateZ use the percentage directly (`direction` only flips it);
 *      scale/opacity/blur first map it through the direction curve `movePoint`
 */

export type FxDirection = "" | "in-out" | "out-in" | "in-out-in" | "out-in-out";
export type Device = "mobile" | "tablet" | "desktop";

export interface FxRange {
  start: number;
  end: number;
}

export interface FxSettings {
  /** Slider value; Elementor stores `{unit,size,sizes}` and we keep only the number. */
  speed?: number;
  direction?: FxDirection | string;
  /** Curve window for scale/opacity/blur. */
  range?: FxRange;
  /** Clamps the incoming progress before the action runs. */
  affectedRange?: FxRange;
  /** opacity/blur strength. */
  level?: number;
}

/** Device buckets for this theme: mobile <= 767, tablet 768-1024, desktop >= 1025. */
export function deviceFor(width: number): Device {
  if (width <= 767) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

/* -------------------------------------------------------------------------
   Progress sources
------------------------------------------------------------------------- */

/**
 * Elementor `Scroll.getElementViewportPercentage`. Measured on the element's
 * parent section, so a transform on the element cannot feed back into it.
 */
export function elementViewportPercent(
  rect: { top: number; height: number },
  viewportHeight: number,
  range?: FxRange,
): number {
  const s = (viewportHeight * (range?.start ?? 0)) / 100;
  const o = (viewportHeight * (range?.end ?? 0)) / 100;
  const a = rect.top - viewportHeight;
  const c = 0 - a + s;
  const l = rect.top + s + rect.height - a + o;
  if (l === 0) return 0;
  return Number((100 * Math.max(0, Math.min(c / l, 1))).toFixed(2));
}

/** Elementor `Scroll.getPageScrollPercentage`. */
export function pageScrollPercent(
  scrollTop: number,
  scrollRange: number,
  range?: FxRange,
): number {
  const i = scrollRange;
  const s = (i * (range?.start ?? 0)) / 100;
  const o = i + s + (i * (range?.end ?? 0)) / 100;
  if (o === 0) return 0;
  return ((scrollTop + s) / o) * 100;
}

/** Mouse interaction: both axes as a percentage of the viewport. */
export function mousePercent(clientX: number, clientY: number, w: number, h: number) {
  return { x: (100 / w) * clientX, y: (100 / h) * clientY };
}

/* -------------------------------------------------------------------------
   Core maths
------------------------------------------------------------------------- */

/**
 * Elementor computes `passed / whole * 100` with no zero guard, so a range whose
 * `end` is 100 divides 0/0 and yields NaN once progress reaches 100 (likewise at
 * the head of a range starting at 0). We reproduce the NaN exactly rather than
 * substituting 0 — under the `in-out-in` / `out-in-out` branches the move point is
 * inverted (`100 - s`), so a 0 there would become 100 and apply a large visible
 * transform where the original applies none.
 *
 * Elementor's NaN reaches CSS and the browser drops the declaration, so the
 * element renders untransformed. `scrollStyles`/`mouseStyles` reproduce that by
 * skipping any effect whose value is not finite — which also stops one NaN from
 * invalidating a sibling transform in a combined string.
 */
const movePointFromPassed = (whole: number, passed: number): number =>
  Number(((passed / whole) * 100).toFixed(2));

const effectValueFromMovePoint = (value: number, mp: number): number => (value * mp) / 100;

/** Elementor `getDirectionMovePoint` — the in/out curve for scale, opacity and blur. */
export function movePoint(progress: number, direction: string | undefined, range: FxRange): number {
  let s: number;
  if (progress < range.start) {
    if (direction === "out-in") s = 0;
    else if (direction === "in-out") s = 100;
    else {
      s = movePointFromPassed(range.start, progress);
      if (direction === "in-out-in") s = 100 - s;
    }
  } else if (progress < range.end) {
    if (direction === "in-out-in") s = 0;
    else if (direction === "out-in-out") s = 100;
    else {
      s = movePointFromPassed(range.end - range.start, progress - range.start);
      if (direction === "in-out") s = 100 - s;
    }
  } else {
    if (direction === "in-out") s = 0;
    else if (direction === "out-in") s = 100;
    else {
      s = movePointFromPassed(100 - range.end, 100 - progress);
      if (direction === "in-out-in") s = 100 - s;
    }
  }
  return s;
}

/** Elementor `runAction`: clamp the progress into the affected range first. */
export function clampToAffected(progress: number, affectedRange?: FxRange): number {
  if (!affectedRange) return progress;
  let p = progress;
  if (affectedRange.start > p) p = affectedRange.start;
  if (affectedRange.end < p) p = affectedRange.end;
  return p;
}

/** Elementor `getElementStep` — used by translateX/Y and rotateZ. */
export const elementStep = (progress: number, speed: number): number => -(progress - 50) * speed;

/** Elementor `getBackgroundStep` — background layers move by their own slack. */
export const backgroundStep = (movable: number, mp: number): number =>
  -effectValueFromMovePoint(movable, mp);

/* -------------------------------------------------------------------------
   Actions — each returns the CSS value Elementor would set
------------------------------------------------------------------------- */

/** translateX / translateY / rotateZ. `direction` only flips the progress. */
export function translateValue(progress: number, s: FxSettings): number {
  const p = s.direction ? 100 - progress : progress;
  return elementStep(p, s.speed ?? 0);
}

export function scaleValue(progress: number, s: FxSettings): number {
  const mp = movePoint(progress, s.direction, s.range ?? { start: 0, end: 100 });
  return 1 + ((s.speed ?? 0) * mp) / 1000;
}

export function opacityValue(progress: number, s: FxSettings): number {
  const mp = movePoint(progress, s.direction, s.range ?? { start: 0, end: 100 });
  const level = (s.level ?? 10) / 10;
  return 1 - level + effectValueFromMovePoint(level, mp);
}

export function blurValue(progress: number, s: FxSettings): number {
  const mp = movePoint(progress, s.direction, s.range ?? { start: 0, end: 100 });
  const level = s.level ?? 0;
  return level - effectValueFromMovePoint(level, mp);
}

/**
 * Elementor `tilt`: halves the speed, drives rotateX from the vertical position
 * and rotateY from the inverted horizontal position.
 */
export function tiltValue(xPercent: number, yPercent: number, s: FxSettings) {
  const inner: FxSettings = { speed: (s.speed ?? 0) / 10, direction: s.direction };
  return {
    rotateX: translateValue(yPercent, inner),
    rotateY: translateValue(100 - xPercent, inner),
  };
}

/** Elementor `mouseTrack` -> translateXY. */
export function mouseTrackValue(xPercent: number, yPercent: number, s: FxSettings) {
  return { translateX: translateValue(xPercent, s), translateY: translateValue(yPercent, s) };
}

/* -------------------------------------------------------------------------
   Declarative element config (what the markup carries)
------------------------------------------------------------------------- */

export interface ElementFx {
  translateX?: FxSettings;
  translateY?: FxSettings;
  rotateZ?: FxSettings;
  scale?: FxSettings;
  opacity?: FxSettings;
  blur?: FxSettings;
  mouseTrack?: FxSettings;
  tilt?: FxSettings;
}

export interface FxConfig {
  fx?: ElementFx;
  devices?: Device[];
  /** `viewport` (default) measures the parent section; `page` uses document scroll. */
  range?: "viewport" | "page";
}

const SCROLL_EFFECTS = ["translateX", "translateY", "rotateZ", "scale", "opacity", "blur"] as const;
const MOUSE_EFFECTS = ["mouseTrack", "tilt"] as const;

export const hasScrollEffect = (fx?: ElementFx): boolean =>
  !!fx && SCROLL_EFFECTS.some((k) => fx[k]);

export const hasMouseEffect = (fx?: ElementFx): boolean => !!fx && MOUSE_EFFECTS.some((k) => fx[k]);

/**
 * Builds the `transform`, `filter` and `opacity` a scroll progress implies.
 * Returns `null` when the config contributes nothing, so callers can clear
 * inline styles rather than writing an identity transform.
 */
export function scrollStyles(progress: number, fx: ElementFx): { transform: string; filter: string; opacity: string } | null {
  const transforms: string[] = [];
  let filter = "";
  let opacity = "";

  for (const key of SCROLL_EFFECTS) {
    const s = fx[key];
    if (!s) continue;
    const p = clampToAffected(progress, s.affectedRange);
    // A non-finite value is Elementor's degenerate-range case; the browser drops
    // such a declaration, so we simply omit the effect this frame.
    if (key === "opacity") {
      const v = opacityValue(p, s);
      if (Number.isFinite(v)) opacity = String(v);
      continue;
    }
    if (key === "blur") {
      const v = blurValue(p, s);
      if (Number.isFinite(v)) filter = `blur(${v}px)`;
      continue;
    }
    const v = key === "scale" ? scaleValue(p, s) : translateValue(p, s);
    if (!Number.isFinite(v)) continue;
    if (key === "translateX") transforms.push(`translateX(${v}px)`);
    else if (key === "translateY") transforms.push(`translateY(${v}px)`);
    else if (key === "rotateZ") transforms.push(`rotateZ(${v}deg)`);
    else if (key === "scale") transforms.push(`scale(${v})`);
  }

  if (!transforms.length && !filter && !opacity) return null;
  return { transform: transforms.join(" "), filter, opacity };
}

/** Same, for the two pointer-driven effects. */
export function mouseStyles(xPercent: number, yPercent: number, fx: ElementFx): string | null {
  const transforms: string[] = [];
  if (fx.mouseTrack) {
    const { translateX, translateY } = mouseTrackValue(xPercent, yPercent, fx.mouseTrack);
    transforms.push(`translateX(${translateX}px)`, `translateY(${translateY}px)`);
  }
  if (fx.tilt) {
    const { rotateX, rotateY } = tiltValue(xPercent, yPercent, fx.tilt);
    transforms.push(`perspective(1000px)`, `rotateX(${rotateX}deg)`, `rotateY(${rotateY}deg)`);
  }
  return transforms.length ? transforms.join(" ") : null;
}

/** Parses the JSON blob carried on `data-fx`, tolerating malformed markup. */
export function parseFx(value: string | undefined | null): ElementFx | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value) as ElementFx;
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function parseDevices(value: string | undefined | null): Device[] | undefined {
  if (!value) return undefined;
  const list = value
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter((d): d is Device => d === "mobile" || d === "tablet" || d === "desktop");
  return list.length ? list : undefined;
}
