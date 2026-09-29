import type { Metadata } from "next";

import ProgramPage from "@/components/programs/ProgramPage";
import { getProgram } from "@/components/programs/program-data";

const program = getProgram("art-program");

export const metadata: Metadata = {
  title: program.title,
  description: program.lead,
};

export default function ArtProgramPage() {
  return <ProgramPage program={program} />;
}
