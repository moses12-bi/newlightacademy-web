/**
 * Online admissions: the classes a child can apply for, whether applications
 * are open, and the stages staff move applications through. Job applications
 * share the same Applications screen, with their own stages.
 */
import { getContent, isBuildPhase, setContent } from "./db";

/** Follows the class names used across the site (Rwandan convention, awaiting the school's confirmation). */
export const CLASSES = [
  "Baby Class (age 3–4)",
  "Middle Class (age 4–5)",
  "Top Class (age 5–6)",
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
];

export const STUDENT_STAGES = ["New", "Reviewing", "Visit or assessment", "Offered a place", "Waiting list", "Enrolled", "Declined"];
export const JOB_STAGES = ["New", "Reviewing", "Shortlisted", "Interview", "Offered", "Hired", "Not successful"];

export interface AdmissionsSettings {
  open: boolean;
  /** e.g. "2027 school year" — shown on the form and in the portal. */
  intake: string;
  /** Extra guidance above the form: documents, fees, deadlines. */
  note: string;
}

const DEFAULTS: AdmissionsSettings = { open: true, intake: "", note: "" };

export function admissionsSettings(): AdmissionsSettings {
  if (isBuildPhase()) return DEFAULTS;
  try {
    return { ...DEFAULTS, ...getContent<AdmissionsSettings>("admissions") };
  } catch (error) {
    console.warn("[admissions] portal database unavailable:", error);
    return DEFAULTS;
  }
}

export function saveAdmissionsSettings(settings: AdmissionsSettings): void {
  setContent("admissions", settings);
}
