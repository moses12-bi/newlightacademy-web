"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import MobileNav from "@/components/layout/MobileNav";
import Button from "@/components/ui/Button";
import { ChevronDownIcon, PhoneIcon } from "@/components/ui/icons";
import { mainNav } from "@/lib/navigation";
import { hasPhone, site } from "@/lib/site";

/**
 * The "rainbow" hover colours live in the navigation data, not in the theme, so
 * they reach CSS as a custom property on each item rather than as a utility class.
 */
type AccentStyle = CSSProperties & { "--nav-accent": string };

const FALLBACK_ACCENT = "var(--color-accent-1)";

/**
 * Sticky white site header: logo, desktop rainbow nav with hover/focus dropdowns,
 * phone + "Book a Visit" cluster, and the mobile hamburger below `lg`.
 */
export default function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 w-full bg-accent-5">
      {/* The source header is `elementor-section-full_width` with viewport-percentage
          gutters (`padding: 0.5% 1%`), not the 1260px content well — so no `Container`.
          Measured against the original at 1440px: 74px tall, 110x39 logo, menu at x=182. */}
      <div className="flex items-center px-[30px] py-[14px] min-[1025px]:px-[1%] min-[1025px]:pt-[0.5%] min-[1025px]:pb-0">
        <Link href="/" className="site-logo shrink-0 min-[1025px]:ml-[10px]">
          {/* Square crest. Sized in globals.css (.site-logo img) rather than with
              Tailwind variants, so the desktop step cannot lose to a named
              breakpoint in the generated cascade. */}
          <Image
            src="/images/logo-nla.png"
            alt={site.name}
            width={320}
            height={320}
            priority
            className="site-logo-img"
          />
        </Link>

        {/* The nav is left-aligned immediately after the logo — in the source theme
            the menu starts at x=182 on a 1440px viewport, not centred in the row. */}
        <nav aria-label="Main" className="hidden self-stretch min-[1025px]:ml-[36px] min-[1025px]:block">
          <ul className="flex h-full items-stretch">
            {mainNav.map((item) => {
              const accentStyle: AccentStyle = {
                "--nav-accent": item.accent ?? FALLBACK_ACCENT,
              };
              const children = item.children ?? [];
              const active = pathname === item.href || children.some((child) => child.href === pathname);

              return (
                <li
                  key={item.href + item.label}
                  className="desktop-nav-item group relative flex items-stretch"
                  style={accentStyle}
                  data-active={active}
                >
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="flex items-center gap-[6px] px-[15px] py-[13px] text-[16px] font-extrabold tracking-[0.5px] whitespace-nowrap text-accent-3 transition-colors duration-300 group-focus-within:text-[color:var(--nav-accent)] group-hover:text-[color:var(--nav-accent)]"
                  >
                    {item.label}
                    {children.length > 0 ? (
                      <ChevronDownIcon className="nav-chevron mt-[2px] h-[12px] w-[12px] shrink-0 transition-transform duration-300" />
                    ) : null}
                  </Link>

                  {/* Original colored dot marks the active or hovered navigation item. */}
                  <span
                    aria-hidden="true"
                    className="nav-dot"
                  />

                  {children.length > 0 ? (
                    <div className="nav-dropdown absolute left-0 top-full z-50 w-[240px] pt-[10px]">
                      <ul className="rounded-[8px] bg-accent-5 py-[10px] shadow-[0_12px_34px_rgba(6,61,20,0.16)]">
                        {children.map((child) => (
                          <li key={child.href + child.label}>
                            <Link
                              href={child.href}
                              className="block px-5 py-[9px] text-[16px] font-semibold text-accent-3 transition-colors duration-200 hover:text-accent-1 focus-visible:text-accent-1"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto hidden items-center gap-6 min-[1025px]:flex" data-reveal="pulse">
          {/* Drops out entirely when no number is configured, rather than
              rendering an empty `tel:` link. */}
          {hasPhone() ? (
            <a
              href={site.phoneHref}
              className="hidden items-center gap-2 text-[16px] font-extrabold tracking-[0.5px] whitespace-nowrap text-accent-3 transition-colors duration-300 hover:text-accent-1 xl:inline-flex"
            >
              <PhoneIcon className="h-[18px] w-[18px] shrink-0 text-accent-1" />
              {site.phone}
            </a>
          ) : null}
          <Button href="/schedule-a-tour" className="whitespace-nowrap">
            Book a Visit
          </Button>
        </div>

        <div className="ml-auto min-[1025px]:hidden"><MobileNav /></div>
      </div>
    </header>
  );
}
