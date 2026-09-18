import Image from "next/image";
import Link from "next/link";

import Container from "@/components/ui/Container";
import ContactForm from "@/components/ui/ContactForm";
import type { FormField } from "@/components/ui/ContactForm";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/ui/icons";
import { site, type SocialIcon } from "@/lib/site";

/** Network -> mark, so the list is keyed by account rather than by position. */
const comingSoonSocialIcons: Record<SocialIcon, typeof FacebookIcon> = {
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
  instagram: InstagramIcon,
};

/* The dots illustration scales as the page scrolls (post-1942 #4170f5d:
   scale, out-in, 50-100%, speed 6, on every device). */
const DOTS_FX = JSON.stringify({
  scale: { speed: 6, direction: "out-in", range: { start: 50, end: 100 } },
});

const MOUSE_FX = (speed: number, negative = false): string =>
  JSON.stringify({ mouseTrack: { speed, direction: negative ? "negative" : "" } });

const TILT_FX = JSON.stringify({ tilt: { speed: 4 } });

const FIELDS: FormField[] = [
  {
    name: "email",
    label: "Your email address",
    type: "email",
    required: true,
    placeholder: "Your email address",
    autoComplete: "email",
  },
];

/**
 * The whole `/coming-soon` page (post-1942): a full-height cream panel over the
 * footer illustration, with the logo, the announcement, the notify form, the
 * scenery row and the social links.
 */
export default function ComingSoonPanel() {
  return (
    <section className="coming-panel">
      <Container className="coming-shell">
        <Link href="/" className="coming-logo">
          <Image
            src="/images/logo-nla.png"
            alt={`${site.name} — home`}
            width={320}
            height={320}
            priority
            className="h-[57px] w-auto"
          />
        </Link>

        <div className="coming-intro">
          <Image
            src="/images/home/dots.svg"
            alt=""
            width={771}
            height={445}
            unoptimized
            className="coming-dots"
            data-reveal="bounceIn"
            data-delay="1200"
            data-fx={DOTS_FX}
            data-fx-devices="desktop,tablet,mobile"
          />
          {/* The saved page has no h1 — its largest heading is this h2. It is
              promoted to the page's single h1 so the document has one. */}
          <h1 className="coming-title">This page is on its way</h1>
          <p className="coming-kicker">Leave your email address and we will tell you when it is ready.</p>
        </div>

        <div className="coming-form">
          <ContactForm
            fields={FIELDS}
            submitLabel="Send"
            name="Subscribe for updates"
            submitAlign="stretch"
            successMessage="Thanks — your email address passed validation. There is no mailing list behind this form yet, so nothing was sent, stored or subscribed."
          />
        </div>

        <div className="coming-scene" aria-hidden="true">
          <div className="coming-scene__col coming-scene__col--trees">
            <Image
              src="/images/home/leaf-1.svg"
              alt=""
              width={46}
              height={111}
              unoptimized
              className="coming-leaf-1"
              data-reveal="bounceIn"
              data-delay="150"
              data-fx={MOUSE_FX(0.1)}
              data-fx-devices="desktop,tablet,mobile"
            />
            <Image
              src="/images/home/illustration-tree-1.svg"
              alt=""
              width={67}
              height={79}
              unoptimized
              className="coming-tree-1"
              data-reveal="zoomInLeft"
              data-delay="200"
              data-fx={MOUSE_FX(0.2)}
              data-fx-devices="desktop,tablet,mobile"
            />
            <Image
              src="/images/home/illustration-tree-3.svg"
              alt=""
              width={124}
              height={140}
              unoptimized
              className="coming-tree-3"
              data-reveal="slideInUp"
              data-fx={MOUSE_FX(0.5, true)}
              data-fx-devices="desktop,tablet,mobile"
            />
          </div>

          <div className="coming-scene__col coming-scene__col--people">
            <Image
              src="/images/home/illustration-people-1.svg"
              alt=""
              width={210}
              height={268}
              unoptimized
              className="coming-people"
              data-reveal="fadeInRight"
              data-delay="400"
              data-fx={TILT_FX}
              data-fx-devices="desktop,tablet,mobile"
            />
          </div>

          <div className="coming-scene__col coming-scene__col--leaf">
            <Image
              src="/images/home/leaf-2.svg"
              alt=""
              width={25}
              height={42}
              unoptimized
              className="coming-leaf-2"
              data-reveal="swing"
              data-delay="500"
              data-fx={MOUSE_FX(1)}
              data-fx-devices="desktop,tablet,mobile"
            />
          </div>

          <div className="coming-scene__col coming-scene__col--bird">
            <Image
              src="/images/home/bird.svg"
              alt=""
              width={112}
              height={86}
              unoptimized
              className="coming-bird"
              data-reveal="pulse"
              data-delay="200"
              data-fx={MOUSE_FX(0.1, true)}
              data-fx-devices="desktop,tablet,mobile"
            />
          </div>
        </div>

        {/* Driven by the configured accounts rather than by position, so an
            account the school has not confirmed simply is not listed. */}
        {site.socials.length > 0 ? (
          <ul className="coming-socials">
            {site.socials.map((social) => {
              const Icon = comingSoonSocialIcons[social.icon];
              return (
                <li key={social.href}>
                  <a href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
                    <Icon className="h-[26px] w-[26px]" />
                  </a>
                </li>
              );
            })}
          </ul>
        ) : null}
      </Container>
    </section>
  );
}
