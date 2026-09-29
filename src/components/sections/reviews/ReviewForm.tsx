import ContactForm, { type FormField } from "@/components/ui/ContactForm";
import { site } from "@/lib/site";

/* Labels matter: /api/forms finds the name, rating and review text by them. */
const FIELDS: FormField[] = [
  { name: "name", label: "Your name", type: "text", required: true, width: 50, autoComplete: "name" },
  { name: "email", label: "Email (not published)", type: "email", width: 50, autoComplete: "email" },
  {
    name: "relation",
    label: "Relation to the school",
    type: "text",
    width: 50,
    placeholder: "e.g. Parent of a Middle Class pupil",
  },
  {
    name: "rating",
    label: "Rating",
    type: "select",
    required: true,
    width: 50,
    options: ["5", "4", "3", "2", "1"],
    placeholderOption: "Choose 1–5 stars",
  },
  { name: "review", label: "Your review", type: "textarea", required: true, rows: 6 },
  {
    name: "consent",
    label: `I agree to ${site.name} publishing my review and first name on this website`,
    type: "checkbox",
    required: true,
  },
];

export default function ReviewForm() {
  return (
    <ContactForm
      name="Leave a review"
      formId="review"
      fields={FIELDS}
      submitLabel="Send my review"
      successMessage="Thank you for your review. It will appear on this page once the school has read it."
    />
  );
}
