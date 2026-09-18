import type { FormField } from "@/components/ui/ContactForm";

/**
 * The "come and visit us" enquiry form. The same nine fields are rendered on
 * more than one page, so they are described once here rather than inline in each
 * sections.
 *
 * The placeholder is the only visible label in this layout, so each one is
 * reused as the accessible label and hidden visually. The wording addresses the
 * parent or guardian filling the form in.
 */
export const visitFormFields: FormField[] = [
  { name: "name", label: "Parent or guardian first name", type: "text", required: true, placeholder: "First name", labelHidden: true, width: 50, autoComplete: "given-name" },
  { name: "field_1", label: "Parent or guardian last name", type: "text", required: true, placeholder: "Last name", labelHidden: true, width: 50, autoComplete: "family-name" },
  { name: "email", label: "Email address", type: "email", required: true, placeholder: "Email address", labelHidden: true, width: 100, autoComplete: "email" },
  { name: "field_2", label: "Child's age in years", type: "number", placeholder: "Child's age in years", labelHidden: true, width: 50 },
  { name: "field_3", label: "Phone number", type: "tel", required: true, placeholder: "Phone number", labelHidden: true, width: 50, autoComplete: "tel" },
  {
    name: "field_4",
    label: "When would you like your child to start?",
    type: "select",
    labelHidden: true,
    width: 100,
    placeholderOption: "When would you like your child to start?",
    options: ["Within a month", "In 1-3 months", "In 3-6 months", "In 6-9 months", "In 9 months or more", "Not sure yet"],
  },
  { name: "field_9", label: "Preferred date for your visit", type: "date", placeholder: "Preferred date", labelHidden: true, width: 50 },
  { name: "field_10", label: "Preferred time for your visit", type: "time", placeholder: "Preferred time", labelHidden: true, width: 50 },
  {
    name: "field_5",
    label: "Is there anything you would like us to know about your child or family?",
    type: "textarea",
    placeholder: "Is there anything you would like us to know about your child or family?",
    labelHidden: true,
    width: 100,
  },
];
