import type { Metadata } from "next";

import ProgramPage from "@/components/programs/ProgramPage";
import { getProgram } from "@/components/programs/program-data";

const program = getProgram("toddlers");

export const metadata: Metadata = {
  title: program.title,
  description: program.lead,
};

export default function ToddlersPage() {
  return <ProgramPage program={program} />;
}
