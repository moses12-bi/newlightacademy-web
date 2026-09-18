import type { Metadata } from "next";

import ComingSoonPanel from "@/components/sections/coming-soon/ComingSoonPanel";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Coming Soon",
  description: `This part of the ${site.name} website is still being built. Leave your email address and we will let you know when it is ready.`,
};

export default function ComingSoonPage() {
  return <ComingSoonPanel />;
}
