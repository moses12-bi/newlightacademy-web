import type { Metadata } from "next";

import TeachersClosing from "@/components/sections/our-teachers/TeachersClosing";
import TeachersProfile from "@/components/sections/our-teachers/TeachersProfile";
import TeachersTeam from "@/components/sections/our-teachers/TeachersTeam";
import PageHero from "@/components/ui/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Teachers",
  description: `The teachers who welcome, teach and care for the children at ${site.name}, our Christian nursery and primary day school in Kinyinya, Kigali.`,
};

export default function TeachersPage() {
  return (
    <>
      {/* #a991a89 — cream hero, white waves top and bottom, bird illustration. */}
      <PageHero
        title="Teachers"
        lead="The teachers who welcome, teach and care for the children here every day."
        image={{
          src: "/images/home/bird.svg",
          alt: "",
          width: 112,
          height: 86,
          unoptimized: true,
          reveal: "bounceInUp",
        }}
      />
      <TeachersProfile />
      <TeachersTeam />
      <TeachersClosing />
    </>
  );
}
