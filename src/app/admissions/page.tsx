import type { Metadata } from "next";

import AdmissionsEducation from "@/components/sections/admissions/AdmissionsEducation";
import AdmissionsForms from "@/components/sections/admissions/AdmissionsForms";
import AdmissionsKeyDates from "@/components/sections/admissions/AdmissionsKeyDates";
import AdmissionsSnail from "@/components/sections/admissions/AdmissionsSnail";
import AdmissionsSteps from "@/components/sections/admissions/AdmissionsSteps";
import AdmissionsTeam from "@/components/sections/admissions/AdmissionsTeam";
import PageHero from "@/components/ui/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Admissions",
  description:
    `How to start, what to ask about and the three steps from your first visit to a place at ${site.name}, a nursery and primary school in Kinyinya, Kigali.`,
};

export default function AdmissionsPage() {
  return (
    <>
      {/* post-2461 #f75d70b: cream band, white wave on top, cream wave at the
          bottom so it meets the Key dates band it sits above. */}
      <PageHero
        className="adm-hero adm-hero--tinted"
        title="Admissions"
        lead={<p>We are glad you are thinking of us. Here is how joining {site.name} works.</p>}
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

      <AdmissionsKeyDates />
      <AdmissionsSnail />
      <AdmissionsEducation />
      <AdmissionsForms />
      <AdmissionsTeam />
      <AdmissionsSteps />
    </>
  );
}
