import type { Metadata } from "next";

import AttendancePolicyBody from "@/components/sections/attendance-policy/AttendancePolicyBody";
import PageHero from "@/components/ui/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Attendance Policy",
  description:
    `Please contact the school office with any question about attendance at ${site.name}. We have not published an attendance policy on this site.`,
};

export default function AttendancePolicyPage() {
  return (
    <>
      {/* post-1089 #8248589 */}
      <PageHero
        title="Attendance Policy"
        lead="Please contact the school office with any question about attendance. We have not published an attendance policy on this site."
        dividerFill={{ top: "var(--color-accent-5)", bottom: "var(--color-accent-5)" }}
        image={{
          src: "/images/home/illustration-tree-1.svg",
          alt: "",
          width: 67,
          height: 79,
          unoptimized: true,
          reveal: "bounceInUp",
        }}
      />
      <AttendancePolicyBody />
    </>
  );
}
