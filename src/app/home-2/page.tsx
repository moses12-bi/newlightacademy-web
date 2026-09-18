import type { Metadata } from "next";

import Home2Ages from "@/components/sections/home-2/Home2Ages";
import Home2Approach from "@/components/sections/home-2/Home2Approach";
import Home2Empower from "@/components/sections/home-2/Home2Empower";
import Home2Hero from "@/components/sections/home-2/Home2Hero";
import Home2Learning from "@/components/sections/home-2/Home2Learning";
import Home2News from "@/components/sections/home-2/Home2News";
import Home2Visit from "@/components/sections/home-2/Home2Visit";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Home 2",
  description:
    `Nursery and primary education at ${site.name} in Kinyinya, Kigali: our approach to learning, the levels we teach and how to arrange a visit.`,
};

export default function HomeTwoPage() {
  return (
    <>
      <Home2Hero />
      <Home2Approach />
      <Home2Learning />
      <Home2Ages />
      <Home2Empower />
      <Home2News />
      <Home2Visit />
    </>
  );
}
