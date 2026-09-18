import type { Metadata } from "next";

import PaymentForm from "@/components/sections/make-a-payment/PaymentForm";
import PaymentIntro from "@/components/sections/make-a-payment/PaymentIntro";
import PaymentOnline from "@/components/sections/make-a-payment/PaymentOnline";
import PageHero from "@/components/ui/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Make a Payment",
  description:
    `School fee payment details for ${site.name} are given by the school office. Please contact us and we will talk you through them.`,
};

export default function MakeAPaymentPage() {
  return (
    <>
      {/* post-1091 #cd9dde9 */}
      <PageHero
        title="Make a Payment"
        lead={`Welcome to ${site.name}. Please contact the school office for the current fee payment details.`}
        dividerFill={{ top: "var(--color-accent-5)", bottom: "var(--color-accent-8)" }}
        image={{
          src: "/images/home/bird.svg",
          alt: "",
          width: 112,
          height: 86,
          unoptimized: true,
          reveal: "bounceInUp",
        }}
      />
      <PaymentIntro />
      <PaymentOnline />
      <PaymentForm />
    </>
  );
}
