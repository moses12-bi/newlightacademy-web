"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import {
  deviceFor,
  elementViewportPercent,
  hasMouseEffect,
  hasScrollEffect,
  mousePercent,
  mouseStyles,
  pageScrollPercent,
  parseDevices,
  parseFx,
  scrollStyles,
  type Device,
  type ElementFx,
} from "@/lib/motion-fx";

/**
 * Reproduces the theme's Elementor motion without shipping its jQuery runtime.
 * The maths lives in `@/lib/motion-fx` (unit-tested against Elementor's own
 * formulas by scripts/verify-motion-math.cjs); this file is only the runtime:
 * one rAF loop, one IntersectionObserver, and the media queries that gate them.
 *
 * Markup opts in declaratively:
 *   data-reveal="fadeInUp"      entrance animation name (CSS keyframes)
 *   data-reveal-tablet / -mobile  per-device override; "none" disables it there
 *   data-delay="200"  data-duration="1250"
 *   data-fx='{"scale":{"speed":2,"direction":"in-out","range":{"start":0,"end":40}}}'
 *   data-fx-range="viewport|page"     data-fx-devices="desktop,tablet"
 *   data-fx-bg='{...}'          transforms the element's [data-fx-layer] child only
 *   data-motion="tilt"          legacy shorthand kept for the already-built pages
 *
 * The two in-page sticky sections in the save (the /daily-schedule aside and the
 * /admissions FAQ index) both need a non-zero top offset, so they are plain
 * `position: sticky` rules in their own page stylesheets rather than anything
 * this runtime has to toggle.
 *
 * Content is server-rendered visible; the pre-reveal hidden state is only added
 * once this controller runs, so JS-off and pre-hydration both show everything.
 */

interface ScrollTarget {
  el: HTMLElement;
  /** Measured instead of the element so our own transform cannot feed back in. */
  anchor: HTMLElement;
  fx: ElementFx;
  devices?: Device[];
  usePageRange: boolean;
  /** Background effects transform this layer rather than the element. */
  layer?: HTMLElement;
  active: boolean;
}

interface MouseTarget {
  el: HTMLElement;
  fx: ElementFx;
  devices?: Device[];
  active: boolean;
}

const LEGACY_TILT_SPEED = 4;

export default function PageMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    const scrollTargets: ScrollTarget[] = [];
    const mouseTargets: MouseTarget[] = [];
    let frame = 0;
    let pointer: { x: number; y: number } | null = null;
    let inView = new Set<HTMLElement>();

    const currentDevice = (): Device => deviceFor(window.innerWidth);
    const allowed = (devices: Device[] | undefined, device: Device) => !devices || devices.includes(device);

    /* ---------------------------------------------------------------- reveals */

    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    const revealNameFor = (el: HTMLElement, device: Device): string => {
      const override = device === "mobile" ? el.dataset.revealMobile : device === "tablet" ? el.dataset.revealTablet : undefined;
      const name = override ?? el.dataset.reveal ?? "";
      return name === "none" ? "" : name;
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("motion-visible");
          el.style.removeProperty("will-change");
          revealObserver.unobserve(el);
        }
      },
      { threshold: 0.05 },
    );

    const applyReveals = () => {
      const device = currentDevice();
      const reduced = reducedQuery.matches;
      for (const el of reveals) {
        const name = revealNameFor(el, device);
        if (reduced || !name) {
          // Visible immediately, with nothing left behind to animate.
          el.classList.remove("motion-ready");
          el.classList.add("motion-visible");
          el.style.removeProperty("animation-name");
          el.style.removeProperty("will-change");
          revealObserver.unobserve(el);
          continue;
        }
        el.style.setProperty("animation-name", name);
        if (el.dataset.duration) el.style.setProperty("animation-duration", `${el.dataset.duration}ms`);
        if (el.dataset.delay) el.style.setProperty("animation-delay", `${el.dataset.delay}ms`);
        if (!el.classList.contains("motion-visible")) {
          el.classList.add("motion-ready");
          el.style.setProperty("will-change", "transform, opacity");
          revealObserver.observe(el);
        }
      }
    };

    /* ------------------------------------------------------------ fx targets */

    /**
     * The Home 1 / About pages were built against the earlier shorthand runtime.
     * Only `tilt` maps cleanly onto Elementor's engine; the rest used bespoke
     * curves, so they keep their original formulas verbatim rather than being
     * approximated — re-deriving them from the source belongs to the per-page
     * motion pass, not to this compatibility shim.
     */
    const LEGACY_SCROLL = new Set(["photo", "fox", "snail", "home-dots", "home-people", "home-person"]);

    const legacyFx = (el: HTMLElement): ElementFx | undefined =>
      el.dataset.motion === "tilt" ? { tilt: { speed: LEGACY_TILT_SPEED } } : undefined;

    const legacyTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-motion]")).filter(
      (el) => el.dataset.motion && LEGACY_SCROLL.has(el.dataset.motion),
    );

    /**
     * Read pass for the legacy targets. Every measurement happens here, beside
     * the other reads, so nothing forces a second layout once the write pass has
     * started; `transform: null` means "clear this one".
     */
    const readLegacy = (
      reduced: boolean,
      device: Device,
      viewportHeight: number,
      documentHeight: number,
    ): { el: HTMLElement; transform: string | null }[] => {
      if (legacyTargets.length === 0) return [];
      const pageRange = Math.max(1, documentHeight - viewportHeight);
      const pageProgress = Math.min(1, Math.max(0, window.scrollY / pageRange));
      const work: { el: HTMLElement; transform: string | null }[] = [];
      for (const el of legacyTargets) {
        if (reduced || device !== "desktop") {
          work.push({ el, transform: null });
          continue;
        }
        const anchor = el.closest("section") ?? el.parentElement;
        if (!anchor) continue;
        const rect = anchor.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
        let transform = "";
        switch (el.dataset.motion) {
          case "photo":
            transform = `translate3d(0, ${(0.5 - pageProgress) * 400}px, 0)`;
            break;
          case "fox":
            transform = `scale(${1.6 - Math.max(0, (progress - 0.5) * 2) * 0.6})`;
            break;
          case "snail":
            transform = `translate3d(${(0.5 - progress) * 300}px, 0, 0)`;
            break;
          case "home-dots":
            transform = `translate3d(0, ${(0.5 - progress) * 100}px, 0)`;
            break;
          case "home-people":
            transform = `translate3d(${(0.5 - progress) * 180}px, 0, 0)`;
            break;
          case "home-person":
            transform = `translate3d(${(progress - 0.5) * 120}px, 0, 0)`;
            break;
        }
        work.push({ el, transform: transform || null });
      }
      return work;
    };

    for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-fx], [data-fx-bg], [data-motion]"))) {
      const explicit = parseFx(el.dataset.fx);
      const fx = explicit ?? legacyFx(el);
      const bg = parseFx(el.dataset.fxBg);
      const devices = parseDevices(el.dataset.fxDevices) ?? (explicit ? undefined : (["desktop"] as Device[]));

      if (fx && hasScrollEffect(fx)) {
        const anchor = (el.closest("section") as HTMLElement | null) ?? el.parentElement ?? el;
        scrollTargets.push({
          el,
          anchor,
          fx,
          devices,
          usePageRange: el.dataset.fxRange === "page",
          active: false,
        });
      }
      if (fx && hasMouseEffect(fx)) {
        mouseTargets.push({ el, fx, devices, active: false });
      }
      if (bg && hasScrollEffect(bg)) {
        const layer = el.querySelector<HTMLElement>("[data-fx-layer]");
        if (layer) {
          const anchor = el;
          scrollTargets.push({
            el,
            anchor,
            fx: bg,
            devices: parseDevices(el.dataset.fxBgDevices) ?? (["desktop"] as Device[]),
            usePageRange: el.dataset.fxBgRange === "page",
            layer,
            active: false,
          });
        }
      }
    }

    /* Only run the loop for things currently on screen. */
    const viewObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) inView.add(el);
          else inView.delete(el);
        }
        schedule();
      },
      { rootMargin: "10% 0px" },
    );
    for (const t of scrollTargets) viewObserver.observe(t.anchor);

    const clear = (target: ScrollTarget | MouseTarget, node: HTMLElement) => {
      node.style.removeProperty("transform");
      node.style.removeProperty("filter");
      node.style.removeProperty("opacity");
      node.style.removeProperty("will-change");
      target.active = false;
    };

    const update = () => {
      frame = 0;
      const reduced = reducedQuery.matches;
      const device = currentDevice();
      const viewportHeight = window.innerHeight;
      const scrollTop = document.documentElement.scrollTop + document.body.scrollTop;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollRange = documentHeight - document.documentElement.clientHeight;

      // --- read pass: no writes here, so nothing forces extra layout
      const scrollWork: { target: ScrollTarget; node: HTMLElement; progress: number | null }[] = [];
      for (const target of scrollTargets) {
        const node = target.layer ?? target.el;
        if (reduced || !allowed(target.devices, device) || !inView.has(target.anchor)) {
          scrollWork.push({ target, node, progress: null });
          continue;
        }
        const rect = target.anchor.getBoundingClientRect();
        const progress = target.usePageRange
          ? pageScrollPercent(scrollTop, scrollRange)
          : elementViewportPercent({ top: rect.top, height: rect.height }, viewportHeight);
        scrollWork.push({ target, node, progress });
      }

      const mouseWork: { target: MouseTarget; styles: string | null }[] = [];
      for (const target of mouseTargets) {
        if (reduced || !finePointer.matches || !allowed(target.devices, device) || !pointer) {
          mouseWork.push({ target, styles: null });
          continue;
        }
        const { x, y } = mousePercent(pointer.x, pointer.y, window.innerWidth, viewportHeight);
        mouseWork.push({ target, styles: mouseStyles(x, y, target.fx) });
      }

      const legacyWork = readLegacy(reduced, device, viewportHeight, documentHeight);

      // --- write pass
      for (const { target, node, progress } of scrollWork) {
        if (progress === null) {
          if (target.active) clear(target, node);
          continue;
        }
        const styles = scrollStyles(progress, target.fx);
        if (!styles) {
          if (target.active) clear(target, node);
          continue;
        }
        if (!target.active) {
          node.style.setProperty("will-change", "transform");
          target.active = true;
        }
        if (styles.transform) node.style.setProperty("transform", styles.transform);
        else node.style.removeProperty("transform");
        if (styles.filter) node.style.setProperty("filter", styles.filter);
        else node.style.removeProperty("filter");
        if (styles.opacity) node.style.setProperty("opacity", styles.opacity);
        else node.style.removeProperty("opacity");
      }

      for (const { el, transform } of legacyWork) {
        if (transform === null) {
          el.style.removeProperty("transform");
          el.style.removeProperty("will-change");
          continue;
        }
        el.style.setProperty("will-change", "transform");
        el.style.setProperty("transform", transform);
      }

      for (const { target, styles } of mouseWork) {
        if (!styles) {
          if (target.active) clear(target, target.el);
          continue;
        }
        if (!target.active) {
          target.el.style.setProperty("will-change", "transform");
          target.active = true;
        }
        target.el.style.setProperty("transform", styles);
      }
    };

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    /* --------------------------------------------------------------- wiring */

    const onScroll = () => {
      schedule();
    };
    const onPointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      schedule();
    };
    const onPointerLeave = () => {
      pointer = null;
      schedule();
    };
    const onResize = () => {
      applyReveals();
      schedule();
    };
    const onPreference = () => {
      applyReveals();
      schedule();
    };

    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.body);

    applyReveals();
    schedule();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    reducedQuery.addEventListener("change", onPreference);
    finePointer.addEventListener("change", schedule);

    return () => {
      revealObserver.disconnect();
      viewObserver.disconnect();
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      reducedQuery.removeEventListener("change", onPreference);
      finePointer.removeEventListener("change", schedule);
      inView = new Set();
      for (const el of reveals) {
        /* The header and footer come from the root layout and survive a
           client-side navigation, so resetting them here would blink them to
           opacity 0 and replay a 1.25s entrance on every in-app link. Page
           content is unmounted anyway, so only it is reset. */
        if (el.isConnected && !el.closest("main")) continue;
        el.classList.remove("motion-ready", "motion-visible");
        el.style.removeProperty("animation-name");
        el.style.removeProperty("animation-delay");
        el.style.removeProperty("animation-duration");
        el.style.removeProperty("will-change");
      }
      for (const el of legacyTargets) {
        el.style.removeProperty("transform");
        el.style.removeProperty("will-change");
      }
      for (const t of scrollTargets) clear(t, t.layer ?? t.el);
      for (const t of mouseTargets) clear(t, t.el);
    };
  }, [pathname]);

  return null;
}
