import Container from "@/components/ui/Container";
import ContactForm, { type FormField } from "@/components/ui/ContactForm";
import { site } from "@/lib/site";

/**
 * The tour request form — post-1070 #c6f53a5, inside a 1000px well.
 *
 * Most controls in the save ship a placeholder and no visible label; the label
 * text below is the placeholder wording, rendered for screen readers only
 * (`labelHidden`) so every control still has a real `<label for>`. The two date
 * fields and the select do carry visible labels, as they do in the original.
 *
 * The labels now address the parent or guardian filling the form in. The saved
 * form asked for a US postal code, which does not apply in Rwanda: the field is
 * kept (the layout depends on it) but asks how many children the enquiry is
 * about, which suits the same numeric control, and its `postal-code` autofill
 * hint is dropped so browsers no longer offer a postcode for it.
 *
 * There is no backend in this project: ContactForm validates locally and the
 * success panel says plainly that nothing was sent or booked.
 */
const FIELDS: FormField[] = [
  {
    name: "name",
    label: "Parent or guardian first name",
    type: "text",
    required: true,
    width: 50,
    placeholder: "Parent or guardian first name",
    labelHidden: true,
    autoComplete: "given-name",
  },
  {
    name: "field_1",
    label: "Parent or guardian surname",
    type: "text",
    required: true,
    width: 50,
    placeholder: "Parent or guardian surname",
    labelHidden: true,
    autoComplete: "family-name",
  },
  {
    name: "email",
    label: "Your email address",
    type: "email",
    required: true,
    width: 100,
    placeholder: "Your email address",
    labelHidden: true,
    autoComplete: "email",
  },
  {
    name: "field_2",
    label: "How many children are you asking about?",
    type: "number",
    width: 50,
    placeholder: "How many children are you asking about?",
    labelHidden: true,
  },
  {
    name: "field_3",
    label: "Your phone number",
    type: "tel",
    required: true,
    width: 50,
    placeholder: "Your phone number",
    labelHidden: true,
    autoComplete: "tel",
  },
  {
    name: "field_5",
    label: "What is your child's date of birth?",
    type: "date",
    width: 100,
    placeholder: "dd/mm/yyyy",
  },
  {
    name: "field_7",
    label: "We would like to start in…",
    type: "select",
    width: 50,
    placeholderOption: " ",
    options: [
      "Within a month",
      "1-3 months",
      "3-6 months",
      "6-9 months",
      "9 months+",
      "Unsure at this time",
    ],
  },
  {
    name: "field_9",
    label: "When would you like to visit?",
    type: "date",
    width: 50,
    placeholder: "Choose a date that suits you",
  },
  {
    name: "field_10",
    label: "Questions? Anything you would like us to know about your family?",
    type: "textarea",
    width: 100,
    placeholder: "Questions? Anything you would like us to know about your family?",
    labelHidden: true,
  },
  {
    name: "field_11",
    label: `I agree to ${site.name} using these details to reply to my enquiry.`,
    type: "checkbox",
    width: 100,
  },
];

export default function TourForm() {
  return (
    <section className="tour-formband">
      <Container>
        <div className="tour-formband__well">
          <ContactForm
            name="Schedule a visit"
            fields={FIELDS}
            submitLabel="Submit my information"
            submitAlign="stretch"
            successMessage={`Thanks — your details passed validation. This form is not connected to a booking system yet, so no visit was requested and nothing was sent or stored.`}
          />
        </div>
      </Container>
    </section>
  );
}
