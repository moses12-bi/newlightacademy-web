import type { Metadata } from "next";

import LocationFaq from "@/components/sections/location/LocationFaq";
import LocationMapSection from "@/components/sections/location/LocationMapSection";
import PageHero from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Location",
  description:
    "Where to find us in Kinyinya, Gasabo district, Kigali, how to arrange a visit, and answers to questions parents often ask.",
};

export default function LocationPage() {
  return (
    <>
      <PageHero
        title="Location"
        lead="Find us in Kinyinya, Gasabo district, Kigali. If you have a question, or would like to come and see the school, we are glad to hear from you."
        image={{
          src: "/images/home/illustration-tree-2.svg",
          alt: "",
          width: 141,
          height: 148,
          unoptimized: true,
          reveal: "bounceInUp",
        }}
      />
      <LocationMapSection />
      <LocationFaq />
    </>
  );
}
