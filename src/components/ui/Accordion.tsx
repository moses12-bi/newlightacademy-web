"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Elementor's accordion closes the others; its toggle widget does not. */
  allowMultiple?: boolean;
  defaultOpenId?: string;
  /** Heading level that wraps each trigger. The saved pages sit under an h3. */
  headingLevel?: "h2" | "h3" | "h4" | "h5";
  className?: string;
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M12 8v8M8 12h8" strokeLinecap="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 12h8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Elementor `accordion` / `toggle` as a proper disclosure group.
 *
 * Every panel is rendered open on the server, so the page is complete with
 * JavaScript off; the first client effect collapses it to `defaultOpenId`.
 * Headers are buttons with aria-expanded / aria-controls, panels are regions
 * labelled by their header, and Up/Down/Home/End rove focus between headers.
 */
export default function Accordion({
  items,
  allowMultiple = false,
  defaultOpenId,
  headingLevel = "h3",
  className,
}: AccordionProps) {
  const Heading = headingLevel;
  /* null means "not hydrated yet": every panel is open, which is what the server
     rendered, so the first client render matches it exactly. */
  const [openIds, setOpenIds] = useState<string[] | null>(null);
  const triggersRef = useRef<Array<HTMLButtonElement | null>>([]);
  const panelsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    setOpenIds(defaultOpenId ? [defaultOpenId] : []);
  }, [defaultOpenId]);

  const open = useCallback((id: string) => {
    setOpenIds((current) => {
      if (current === null) return current;
      return current.includes(id) ? current : [...current, id];
    });
  }, []);

  /* Find-in-page unhides a `hidden="until-found"` panel itself; mirror that in
     state so the trigger's aria-expanded and icon stay truthful. */
  useEffect(() => {
    const panels = panelsRef.current.slice(0, items.length);
    const cleanups = panels.map((panel, index) => {
      if (!panel) return () => {};
      const item = items[index];
      const handler = () => open(item.id);
      panel.addEventListener("beforematch", handler);
      return () => panel.removeEventListener("beforematch", handler);
    });
    return () => cleanups.forEach((fn) => fn());
  }, [items, open]);

  const isOpen = (id: string): boolean => (openIds === null ? true : openIds.includes(id));

  /* The collapsed state is written straight to the DOM rather than through a
     `hidden` prop: React serialises `hidden` as a boolean attribute, and the
     value we want is `until-found`, which keeps the panel out of the tab order
     and the accessibility tree while leaving it findable with Ctrl+F. Keeping it
     out of props is also what lets the server render every panel open, so the
     page is complete without JavaScript. */
  useEffect(() => {
    items.forEach((item, index) => {
      const panel = panelsRef.current[index];
      if (!panel) return;
      if (openIds === null || openIds.includes(item.id)) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "until-found");
    });
  }, [items, openIds]);

  const toggle = (id: string): void => {
    setOpenIds((current) => {
      const list = current ?? items.map((item) => item.id);
      if (list.includes(id)) return list.filter((entry) => entry !== id);
      return allowMultiple ? [...list, id] : [id];
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const last = items.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    triggersRef.current[next]?.focus();
  };

  return (
    <div className={["w-accordion", className].filter(Boolean).join(" ")}>
      {items.map((item, index) => {
        const expanded = isOpen(item.id);
        return (
          <div className="w-accordion__item" key={item.id}>
            <Heading className="w-accordion__header">
              <button
                type="button"
                id={`w-accordion-trigger-${item.id}`}
                className="w-accordion__trigger"
                aria-expanded={expanded}
                aria-controls={`w-accordion-panel-${item.id}`}
                onClick={() => toggle(item.id)}
                onKeyDown={(event) => onKeyDown(event, index)}
                ref={(node) => {
                  triggersRef.current[index] = node;
                }}
              >
                <span className="w-accordion__icon">
                  {expanded ? <MinusIcon /> : <PlusIcon />}
                </span>
                <span>{item.title}</span>
              </button>
            </Heading>

            <div
              id={`w-accordion-panel-${item.id}`}
              className="w-accordion__panel"
              role="region"
              aria-labelledby={`w-accordion-trigger-${item.id}`}
              ref={(node) => {
                panelsRef.current[index] = node;
              }}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
