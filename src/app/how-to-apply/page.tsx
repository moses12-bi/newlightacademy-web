import type { Metadata } from "next";
import type { CSSProperties } from "react";

import ApplyChoices from "@/components/sections/how-to-apply/ApplyChoices";
import ApplyForm from "@/components/sections/how-to-apply/ApplyForm";
import ApplySteps from "@/components/sections/how-to-apply/ApplySteps";
import PageHero from "@/components/ui/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "How to Apply",
  description:
    `Welcome to ${site.name}. Ask us about the school, ask about visiting, or tell us about your child.`,
};

export default function HowToApplyPage() {
  return (
    <>
      {/* post-1064 #ee8cd9b: cream band with a white wave top and bottom, and a
          50px gap under it on phones. */}
      <PageHero
        className="adm-hero"
        style={
          {
            "--adm-hero-art": "28%",
            "--adm-hero-art-md": "38%",
            "--adm-hero-mb-sm": "50px",
          } as CSSProperties
        }
        title="How to Apply"
        lead={
          <p>
            Welcome to {site.name}. We look forward to getting to know you, your child and your
            family.
          </p>
        }
        image={{
          src: "/images/home/illustration-people-3.svg",
          alt: "",
          width: 280,
          height: 494,
          unoptimized: true,
          reveal: "zoomInDown",
        }}
      />

      <ApplyChoices />
      <ApplySteps />
      <ApplyForm />
    </>
  );
}
