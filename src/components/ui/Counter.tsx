"use client";

import { useEffect, useRef } from "react";

export interface CounterProps {
  start?: number;
  end: number;
  /** Milliseconds for the whole count. */
  duration?: number;
  prefix?: string;
  suffix?: string;
  title?: string;
  className?: string;
}

/**
 * Elementor `counter`.
 *
 * The final number is rendered on the server, so it is correct with JavaScript
 * off and there is nothing to hydrate. On the client an IntersectionObserver
 * starts a single requestAnimationFrame loop that writes to the node's
 * textContent — no state update per frame — and `prefers-reduced-motion` skips
 * the count entirely, leaving the server's number in place.
 */
export default function Counter({
  start = 0,
  end,
  duration = 2000,
  prefix,
  suffix,
  title,
  className,
}: CounterProps) {
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = numberRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let cancelled = false;
    node.textContent = String(start);

    const step = (from: number, to: number, began: number) => {
      const tick = (now: number) => {
        if (cancelled) return;
        const progress = Math.min(1, (now - began) / Math.max(1, duration));
        /* easeOutQuad, so the number settles rather than stopping dead. */
        const eased = 1 - (1 - progress) * (1 - progress);
        node.textContent = String(Math.round(from + (to - from) * eased));
        if (progress < 1) frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          step(start, end, performance.now());
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      node.textContent = String(end);
    };
  }, [start, end, duration]);

  return (
    <div className={["w-counter", className].filter(Boolean).join(" ")}>
      <div className="w-counter__number">
        {prefix ? <span className="w-counter__prefix">{prefix}</span> : null}
        <span ref={numberRef}>{end}</span>
        {suffix ? <span className="w-counter__suffix">{suffix}</span> : null}
      </div>
      {title ? <div className="w-counter__title">{title}</div> : null}
    </div>
  );
}
