import type { Metadata } from "next";
import type { CSSProperties } from "react";

import FaqGroups from "@/components/sections/faq/FaqGroups";
import PageHero from "@/components/ui/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    `Answers about ${site.name} — the school itself, our nursery and primary classes, learning and care, admissions, and the practical questions parents ask first.`,
};

export default function FaqPage() {
  return (
    <>
      {/* post-1068 #99e3143: cream band with a white wave top and bottom, plus a
          100px gap under it on tablet and 50px on phones. */}
      <PageHero
        className="adm-hero"
        style={{ "--adm-hero-mb-md": "100px", "--adm-hero-mb-sm": "50px" } as CSSProperties}
        title="FAQ"
        lead={
          <p>
            Still wondering about something? Contact us and we’ll be happy to help. We would love
            to hear from you.
          </p>
        }
        image={{
          src: "/images/fox-color.svg",
          alt: "",
          width: 157,
          height: 145,
          unoptimized: true,
          reveal: "zoomInDown",
        }}
      />

      <FaqGroups />
    </>
  );
}
