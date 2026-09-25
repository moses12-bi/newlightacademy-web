import type { Metadata } from "next";

import AgeCards from "@/components/programs/AgeCards";
import ProgramsDifference from "@/components/programs/ProgramsDifference";
import ProgramsHero from "@/components/programs/ProgramsHero";
import ProgramsPromise from "@/components/programs/ProgramsPromise";
import ProgramsSafety from "@/components/programs/ProgramsSafety";
import ProgramsTuition from "@/components/programs/ProgramsTuition";
import ProgramsVideoBand from "@/components/programs/ProgramsVideoBand";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Programs",
  description: `Nursery and primary education at ${site.name}: Baby Class, Middle Class and Top Class, then P1 to P6 following the Rwanda national curriculum, at a Christian day school in Kinyinya, Kigali.`,
};

export default function ProgramsPage() {
  return (
    <>
      <ProgramsHero />
      <ProgramsPromise />
      <ProgramsVideoBand />
      <ProgramsDifference />
      <AgeCards variant="index" />
      <ProgramsTuition />
      <ProgramsSafety />
    </>
  );
}
