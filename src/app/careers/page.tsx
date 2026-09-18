import type { Metadata } from "next";

import CareersBenefits from "@/components/sections/careers/CareersBenefits";
import CareersCta from "@/components/sections/careers/CareersCta";
import CareersPerks from "@/components/sections/careers/CareersPerks";
import PageHero from "@/components/ui/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers",
  description: `Teaching at ${site.name}, a Christian nursery and primary day school in Kinyinya, Kigali: how to get in touch if you would like to work with our children.`,
};

export default function CareersPage() {
  return (
    <>
      {/* #28fa3cb — the bottom wave is filled with the blue of the next band. */}
      <PageHero
        className="careers-hero"
        title="Careers"
        lead="We would be glad to hear from teachers who would like to join our nursery and primary classes."
        dividerFill={{ top: "var(--color-accent-5)", bottom: "var(--color-tint-powder)" }}
        image={{
          src: "/images/fox-color.svg",
          alt: "",
          width: 157,
          height: 145,
          unoptimized: true,
          reveal: "bounceInUp",
        }}
      />
      <CareersPerks />
      <CareersBenefits />
      <CareersCta />
    </>
  );
}
