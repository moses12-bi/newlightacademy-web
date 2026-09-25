import type { Metadata } from "next";

import HandbookBody from "@/components/sections/student-handbook/HandbookBody";
import HandbookIntro from "@/components/sections/student-handbook/HandbookIntro";
import PageHero from "@/components/ui/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Student Handbook",
  description:
    `Please contact the school office with any question about the school day at ${site.name}. We have not published a parent and pupil handbook on this site.`,
};

export default function StudentHandbookPage() {
  return (
    <>
      {/* post-1093 #f4e3be9 */}
      <PageHero
        title="Student Handbook"
        lead={`Please contact the school office with any question about the school day at ${site.name}. We have not published a parent and pupil handbook on this site.`}
        dividerFill={{ top: "var(--color-accent-5)", bottom: "var(--color-accent-8)" }}
        image={{
          src: "/images/fox-color.svg",
          alt: "",
          width: 157,
          height: 145,
          unoptimized: true,
          reveal: "bounceInUp",
        }}
      />
      <HandbookIntro />
      <HandbookBody />
    </>
  );
}
