import Container from "@/components/ui/Container";
import ContactForm, { type FormField } from "@/components/ui/ContactForm";
import ShapeDivider from "@/components/ui/ShapeDivider";
import UploadForm, { type UploadField } from "@/components/ui/UploadForm";
import type { AdmissionsSettings } from "@/lib/server/admissions";
import { site } from "@/lib/site";

/**
 * The application form — post-1064 #4b893c3, inside the cream band #094b59f
 * with a wavy white edge top and bottom. The id is `form` because the "Apply
 * Today" flip box links to `#form`.
 *
 * Field set, order, column widths and required flags are the saved ones, and
 * the empty first option Elementor renders is kept so the select starts blank.
 * The labels are rewritten to address the parent or guardian filling the form
 * in, and the age list is cut to 3-12 — the ages this school actually teaches,
 * nursery through P6 — rather than the saved 3-16.
 *
 * This short enquiry form is what shows while online applications are closed
 * (portal → Applications). While they are open, the full application form
 * below takes its place.
 */
const FIELDS: FormField[] = [
  { name: "parent_details", label: "Parent or guardian", type: "heading", headingLevel: "h3", width: 50 },
  { name: "child_details", label: "About your child", type: "heading", headingLevel: "h3", width: 50 },
  { name: "name", label: "Your name and surname", type: "text", required: true, width: 50, autoComplete: "name" },
  {
    name: "field_4",
    label: "Your child’s age",
    type: "select",
    required: true,
    width: 50,
    placeholderOption: " ",
    options: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
  },
  { name: "field_1", label: "Your phone number", type: "tel", width: 50, autoComplete: "tel" },
  { name: "field_5", label: "Class you are applying for", type: "text", width: 50 },
  { name: "email", label: "Your email address", type: "email", required: true, width: 50, autoComplete: "email" },
  { name: "field_6", label: "Anything you would like us to know", type: "text", width: 50 },
  {
    name: "field_7",
    label: `I agree to ${site.name} using these details to reply to my enquiry`,
    type: "checkbox",
    width: 100,
  },
];

/** The online student application: posted to /api/admissions/apply with the child's documents. */
function applicationFields(classes: string[], accept: string): UploadField[] {
  return [
    { name: "h_child", label: "About your child", type: "heading" },
    { name: "child_name", label: "Child's full name", type: "text", required: true, width: 50 },
    { name: "child_dob", label: "Date of birth", type: "date", required: true, width: 50 },
    { name: "child_gender", label: "Gender", type: "select", width: 50, options: ["Girl", "Boy"], placeholder: "Choose…" },
    { name: "class", label: "Class applying for", type: "select", required: true, width: 50, options: classes, placeholder: "Choose a class…" },
    { name: "start", label: "When would your child start?", type: "text", width: 50, placeholder: "e.g. Term 1, 2027" },
    { name: "previous_school", label: "Current or previous school", type: "text", width: 50, placeholder: "If any" },
    {
      name: "needs",
      label: "Health, allergies or learning needs we should know about",
      type: "textarea",
      rows: 3,
    },
    { name: "h_parent", label: "Parent or guardian", type: "heading" },
    { name: "parent_name", label: "Your full name", type: "text", required: true, width: 50, autoComplete: "name" },
    {
      name: "relationship",
      label: "Relationship to the child",
      type: "select",
      width: 50,
      options: ["Mother", "Father", "Guardian", "Other"],
      placeholder: "Choose…",
    },
    { name: "phone", label: "Phone number", type: "tel", required: true, width: 50, autoComplete: "tel" },
    { name: "email", label: "Email", type: "email", width: 50, autoComplete: "email" },
    { name: "area", label: "Where you live", type: "text", width: 50, placeholder: "e.g. Kinyinya, Gasabo" },
    { name: "heard", label: "How did you hear about us?", type: "text", width: 50 },
    {
      name: "files",
      label: "Documents (optional)",
      type: "file",
      multiple: true,
      accept,
      hint: "Birth certificate, last school report, passport photo — up to 3 files, PDF, Word, JPG or PNG, 5 MB each. You can also bring them to the school.",
    },
    {
      name: "consent",
      label: `I agree to ${site.name} keeping these details and documents to process this application`,
      type: "checkbox",
      required: true,
    },
  ];
}

export default function ApplyForm({
  admissions,
  classes,
  accept,
}: {
  admissions: AdmissionsSettings;
  classes: string[];
  accept: string;
}) {
  return (
    <section id="form" className="adm-band adm-band--cream hta-formband">
      <ShapeDivider position="top" />
      <ShapeDivider position="bottom" />
      <Container>
        {admissions.open ? (
          <>
            <h2 className="hta-formband__title">
              Apply online{admissions.intake ? ` — ${admissions.intake}` : ""}
            </h2>
            {admissions.note ? <p className="hta-formband__note">{admissions.note}</p> : null}
            <UploadForm
              endpoint="/api/admissions/apply"
              name="Student application"
              fields={applicationFields(classes, accept)}
              submitLabel="Send application"
              successMessage={`Thank you — your application has reached ${site.name}. The admissions team will contact you about the next steps, usually a visit to the school.`}
            />
          </>
        ) : (
          <>
            <p className="hta-formband__note">
              Online applications are closed at the moment. Send us your details and we will tell you when places open.
            </p>
            <ContactForm
              name="Application enquiry"
              fields={FIELDS}
              submitLabel="Submit"
              submitAlign="stretch"
              formId="apply"
              successMessage={`Thank you — your application enquiry has reached ${site.name}. The admissions team will contact you about the next steps.`}
            />
          </>
        )}
      </Container>
    </section>
  );
}
