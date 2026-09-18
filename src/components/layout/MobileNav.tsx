"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import { ChevronDownIcon, CloseIcon, MenuIcon, PhoneIcon } from "@/components/ui/icons";
import { mainNav } from "@/lib/navigation";
import { hasPhone, site } from "@/lib/site";

const PANEL_ID = "mobile-nav-panel";

/**
 * Below `lg` the primary navigation collapses to this hamburger + panel.
 * The panel is absolutely positioned against the sticky `<header>`, so it drops
 * directly beneath the header bar across the full viewport width.
 */
export default function MobileNav() {
  const [open, setOpen] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const toggleSection = useCallback((label: string) => {
    setExpanded((current) =>
      current.includes(label) ? current.filter((entry) => entry !== label) : [...current, label],
    );
  }, []);

  /* A completed navigation always dismisses the panel. Individual links also close
     it on click, which covers taps that resolve to the route already showing. */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* Escape closes the panel and hands focus back to the trigger. */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  /* Growing past the `lg` breakpoint reveals the desktop nav, so drop the panel. */
  useEffect(() => {
    if (!open) return;

    const query = window.matchMedia("(min-width: 1025px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [open]);

  /* Lock the page behind the panel; the cleanup also covers unmount. */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  /* The panel is an opaque sheet over a page that can no longer scroll, so focus
     must not wander behind it: keep Tab cycling through the toggle and the panel's
     own links. Collapsed sub-menus are `inert`, so they stay out of the loop. */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const toggle = toggleRef.current;
      const panel = panelRef.current;
      if (!toggle || !panel) return;

      const sequence = [
        toggle,
        ...Array.from(panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")).filter(
          (element) => !element.closest("[inert]"),
        ),
      ];
      const first = sequence[0];
      const last = sequence[sequence.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !active || !sequence.includes(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last || !active || !sequence.includes(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="min-[1025px]:hidden">
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] text-accent-3 transition-colors duration-300 hover:text-accent-1"
      >
        {open ? <CloseIcon className="h-7 w-7" /> : <MenuIcon className="h-7 w-7" />}
      </button>

      <div
        id={PANEL_ID}
        ref={panelRef}
        inert={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={[
          "absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-80px)] overflow-y-auto border-t border-accent-7 bg-accent-5 shadow-[0_18px_40px_rgba(6,61,20,0.16)] transition-[opacity,transform,visibility] duration-200",
          open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-2 opacity-0",
        ].join(" ")}
      >
        <nav aria-label="Main" className="px-[30px] py-4">
          <ul className="flex flex-col">
            {mainNav.map((item, index) => {
              const children = item.children ?? [];
              const isExpanded = expanded.includes(item.label);
              const sectionId = `mobile-nav-section-${index}`;

              return (
                <li key={item.href + item.label} className="border-b border-accent-7 last:border-b-0">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={item.href}
                      onClick={close}
                      className="flex-1 py-[14px] text-[16px] font-extrabold tracking-[0.5px] text-accent-3 transition-colors duration-200 hover:text-accent-1"
                    >
                      {item.label}
                    </Link>

                    {children.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => toggleSection(item.label)}
                        aria-expanded={isExpanded}
                        aria-controls={sectionId}
                        aria-label={`${isExpanded ? "Hide" : "Show"} ${item.label} submenu`}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-accent-3 transition-colors duration-200 hover:text-accent-1"
                      >
                        <ChevronDownIcon
                          className={[
                            "h-[14px] w-[14px] transition-transform duration-300",
                            isExpanded ? "rotate-180" : "rotate-0",
                          ].join(" ")}
                        />
                      </button>
                    ) : null}
                  </div>

                  {children.length > 0 ? (
                    <div
                      id={sectionId}
                      className={[
                        "grid transition-[grid-template-rows] duration-300 ease-out",
                        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      ].join(" ")}
                    >
                      {/* `inert` keeps the collapsed links out of the tab order while the
                          grid-row transition animates the open/close height. */}
                      <div className="overflow-hidden" inert={!isExpanded}>
                        <ul className="flex flex-col pb-3 pl-4">
                          {children.map((child) => (
                            <li key={child.href + child.label}>
                              <Link
                                href={child.href}
                                onClick={close}
                                className="block py-[9px] text-[16px] font-semibold text-accent-3 transition-colors duration-200 hover:text-accent-1"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col items-start gap-4 pt-6 pb-2">
            {hasPhone() ? (
              <a
                href={site.phoneHref}
                onClick={close}
                className="inline-flex items-center gap-2 text-[16px] font-extrabold tracking-[0.5px] text-accent-3 transition-colors duration-200 hover:text-accent-1"
              >
                <PhoneIcon className="h-[18px] w-[18px] text-accent-1" />
                {site.phone}
              </a>
            ) : null}
            <Button href="/schedule-a-tour" className="w-full" onClick={close}>
              Book a Visit
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
}
