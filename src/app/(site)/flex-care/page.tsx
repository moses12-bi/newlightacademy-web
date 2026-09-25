import type { Metadata } from "next";

import ProgramPage from "@/components/programs/ProgramPage";
import { getProgram } from "@/components/programs/program-data";

const program = getProgram("flex-care");

export const metadata: Metadata = {
  title: program.title,
  description: program.lead,
};

export default function FlexCarePage() {
  return <ProgramPage program={program} />;
}
