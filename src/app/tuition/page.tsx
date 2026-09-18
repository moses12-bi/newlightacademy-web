import type { Metadata } from "next";

import TuitionDiscounts from "@/components/sections/tuition/TuitionDiscounts";
import TuitionPlans, { FIRST_BAND, SECOND_BAND } from "@/components/sections/tuition/TuitionPlans";
import TuitionSupport from "@/components/sections/tuition/TuitionSupport";
import PageHero from "@/components/ui/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tuition",
  description:
    `The classes ${site.name} offers, from Baby Class to P6, and how to ask the school office about fees.`,
};

export default function TuitionPage() {
  return (
    <>
      {/* post-1066 #1e1c759: white wave on top, cream wave at the bottom so it
          meets the cream band of price tables below. */}
      <PageHero
        className="adm-hero adm-hero--tinted"
        title="Tuition"
        lead={<p>The classes we offer, and how to ask the school office about fees.</p>}
        dividerFill={{ top: "var(--color-accent-5)", bottom: "var(--color-accent-8)" }}
        image={{
          src: "/images/home/illustration-tree-2.svg",
          alt: "",
          width: 141,
          height: 148,
          unoptimized: true,
          reveal: "bounceInUp",
        }}
      />

      <TuitionPlans plans={FIRST_BAND} />
      <TuitionPlans plans={SECOND_BAND} second />
      <TuitionDiscounts />
      <TuitionSupport />
    </>
  );
}
