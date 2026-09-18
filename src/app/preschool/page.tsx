import type { Metadata } from "next";

import ProgramPage from "@/components/programs/ProgramPage";
import { getProgram } from "@/components/programs/program-data";

const program = getProgram("preschool");

export const metadata: Metadata = {
  title: program.title,
  description: program.lead,
};

export default function PreschoolPage() {
  return <ProgramPage program={program} />;
}
