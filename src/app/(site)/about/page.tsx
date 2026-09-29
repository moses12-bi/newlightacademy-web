import type { Metadata } from "next";

import AboutHero from "@/components/sections/AboutHero";
import HealthAndSafety from "@/components/sections/HealthAndSafety";
import OurCommunity from "@/components/sections/OurCommunity";
import OurGraduates from "@/components/sections/OurGraduates";
import OurHistory from "@/components/sections/OurHistory";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    `A Christian nursery and primary day school in Kinyinya, Gasabo. Meet ${site.name}: what we believe, how we care for children and how we prepare them for primary school and for the PLE.`,
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <OurHistory />
      <OurGraduates />
      <OurCommunity />
      <HealthAndSafety />
    </>
  );
}
