import Container from "@/components/ui/Container";
import ContactForm, { type FormField } from "@/components/ui/ContactForm";
import ShapeDivider from "@/components/ui/ShapeDivider";
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
 * There is no backend in this project: ContactForm validates locally and says
 * so, and never claims the application was sent or stored.
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

export default function ApplyForm() {
  return (
    <section id="form" className="adm-band adm-band--cream hta-formband">
      <ShapeDivider position="top" />
      <ShapeDivider position="bottom" />
      <Container>
        <ContactForm
          name="Application enquiry"
          fields={FIELDS}
          submitLabel="Submit"
          submitAlign="stretch"
          successMessage={`Thanks — your details passed validation. There is no application system behind this form yet, so nothing was sent, stored or submitted to ${site.name}.`}
        />
      </Container>
    </section>
  );
}
