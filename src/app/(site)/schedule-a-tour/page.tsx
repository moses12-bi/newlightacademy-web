import type { Metadata } from "next";
import type { CSSProperties } from "react";

import TourForm from "@/components/sections/schedule-a-tour/TourForm";
import PageHero from "@/components/ui/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Schedule a Tour",
  description:
    `Tell us about your family and when you would like to come, and ask the ${site.name} office anything you need to know.`,
};

export default function ScheduleATourPage() {
  return (
    <>
      {/* post-1070 #cf7ef88: cream band with a white wave top and bottom. */}
      <PageHero
        className="adm-hero"
        style={{ "--adm-hero-art-md": "48%" } as CSSProperties}
        title="Schedule a Tour"
        lead={<p>A school is best judged by walking around it. Tell us about your family and when would suit you.</p>}
        image={{
          src: "/images/home/illustration-people-1.svg",
          alt: "",
          width: 210,
          height: 268,
          unoptimized: true,
          reveal: "bounceInUp",
        }}
      />

      <TourForm />
    </>
  );
}
