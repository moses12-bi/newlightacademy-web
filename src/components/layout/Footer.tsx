import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/ui/icons";
import { footerNavPrimary, footerNavSecondary, type NavLink } from "@/lib/navigation";
import { displayPhone, hasAddress, hasEmail, hasPhone, site } from "@/lib/site";

/* --------------------------------------------------------------------------
   Shared bits
-------------------------------------------------------------------------- */

/** 16px / 600 / dark green, turning primary green on hover — the footer link recipe. */
const footerLink =
  "text-base font-semibold text-accent-3 transition-colors duration-300 hover:text-accent-1 focus-visible:text-accent-1";

const socialIcons = {
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
  instagram: InstagramIcon,
} as const;

interface FooterNavProps {
  /** Accessible name — the two columns are separate landmarks, so it must be unique. */
  label: string;
  items: NavLink[];
}

function FooterNav({ label, items }: FooterNavProps) {
  return (
    <nav aria-label={label} className="text-center md:text-start">
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={`block py-[7px] leading-none ${footerLink}`}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* --------------------------------------------------------------------------
   Footer
-------------------------------------------------------------------------- */

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* --- Band A: decorative row, bottom-aligned and overlapping the cream band --- */}
      <div className="relative z-[2] mt-10 -mb-[25px] md:mt-0 md:-mb-[55px]">
        <Container className="grid grid-cols-[30%_50%_20%] items-end md:grid-cols-[12.533%_28.747%_40.929%_17.791%]">
          <div className="text-center" data-reveal="rotateInUpRight">
            <Image
              src="/images/tree-1.svg"
              alt=""
              width={60}
              height={83}
              unoptimized
              className="inline-block w-[40%] md:w-auto md:max-w-full"
            />
          </div>
          <div className="text-center md:text-start" data-reveal="bounceInDown" data-reveal-mobile="pulse">
            <Image
              src="/images/fox-color.svg"
              data-motion="tilt"
              alt=""
              width={157}
              height={145}
              unoptimized
              className="inline-block w-[65%] md:w-auto md:max-w-full"
            />
          </div>
          {/* Spacer column; dropped on phones so the three marks still fit the row. */}
          <div className="hidden md:block" aria-hidden="true" />
          <div className="text-start" data-reveal="rotateInUpLeft">
            <Image
              src="/images/tree-2.svg"
              alt=""
              width={56}
              height={70}
              unoptimized
              className="inline-block w-[60%] md:w-auto md:max-w-full"
            />
          </div>
        </Container>
      </div>

      {/* --- Band B: the cream main footer (bands B and C share one background) --- */}
      <div className="footer-main bg-accent-8 pt-10 pb-[10px] md:pt-[150px] md:pb-[30px]">
        <Container>
          <div className="footer-columns">
            <FooterNav label="Footer" items={footerNavPrimary} />
            <FooterNav label="Footer, more links" items={footerNavSecondary} />

            <div className="footer-logo">
              {/* The theme's mark was a 300x106 wordmark; this is a square crest,
                  so matching that height left it reading as a thumbnail. Sized to
                  the logo column instead (26.94% of the 1260px well ~= 339px), which
                  is what makes the badge legible. `inline-block` keeps the link box
                  — and so the focus ring — around the crest rather than stretching
                  it to the full grid cell. */}
              <Link href="/" className="inline-block">
                <Image
                  src="/images/logo-nla.png"
                  alt={site.name}
                  width={320}
                  height={320}
                  className="h-auto w-auto"
                />
              </Link>
            </div>

            <address className="footer-contact text-center text-base font-semibold leading-[1.5] text-accent-3 not-italic md:text-start">
              <p>
                {hasAddress()
                  ? site.addressLines.map((line) => (
                      <Fragment key={line}>
                        {line}
                        <br />
                      </Fragment>
                    ))
                  : null}
                <Link href={site.mapHref} className={footerLink}>
                  Find us
                </Link>
              </p>
              {hasPhone() || hasEmail() ? (
                <p className="mt-[1.25em]">
                  {hasPhone() ? (
                    <>
                      Phone:{" "}
                      <a href={site.phoneHref} className={footerLink}>
                        {displayPhone()}
                      </a>
                    </>
                  ) : null}
                  {hasPhone() && hasEmail() ? <br /> : null}
                  {hasEmail() ? (
                    <a href={`mailto:${site.email}`} className={footerLink}>
                      {site.email}
                    </a>
                  ) : null}
                </p>
              ) : null}
            </address>

            <div className="footer-actions flex flex-col items-center md:items-end">
              <Button href="/schedule-a-tour">Book a Visit</Button>
              <ul className="mt-5 flex items-center gap-3 min-[1025px]:gap-[3px]">
                {site.socials.map((social) => {
                  const Icon = socialIcons[social.icon];
                  return (
                    <li key={social.href}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-pop flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-accent-3 transition-colors duration-300 hover:bg-accent-3 hover:text-accent-5 focus-visible:bg-accent-3 focus-visible:text-accent-5"
                      >
                        <Icon className="h-5 w-5" />
                        <span className="sr-only">{social.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* --- Band C: legal row --- */}
          {/* The source splits this row in two 630px halves: credits left, a small
              horizontal menu right (`elementor-element-b988b7c`, 14px/normal). */}
          <div className="flex flex-col items-center gap-4 pt-5 pb-5 text-sm font-normal text-muted md:pt-20 min-[1025px]:flex-row min-[1025px]:justify-between min-[1025px]:pt-5 min-[1025px]:pb-0">
            <div className="flex flex-wrap items-center justify-center gap-x-[5px] text-center min-[1025px]:justify-start min-[1025px]:text-start">
            {/* Ownership is the school's; the VamTam and Freepik credits are kept
                because the theme licence has not been checked and attribution
                must not be dropped on an assumption. */}
            <span>
              &copy; {new Date().getFullYear()} {site.legalName}. All rights reserved.
            </span>
            <span aria-hidden="true">|</span>
            <span>
              Theme by{" "}
              <a
                href="https://vamtam.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:underline focus-visible:underline"
              >
                VamTam
              </a>
            </span>
            <span aria-hidden="true">|</span>
            <span>
              Icons by{" "}
              <a
                href="https://www.freepik.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:underline focus-visible:underline"
              >
                Freepik
              </a>
            </span>
            </div>

            <nav aria-label="Legal" className="shrink-0">
              <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
                {footerNavPrimary.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-muted transition-colors duration-300 hover:text-accent-1 focus-visible:text-accent-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </Container>
      </div>
    </footer>
  );
}
