import Container from "@/components/ui/Container";
import ContactForm from "@/components/ui/ContactForm";
import type { FormField } from "@/components/ui/ContactForm";

/* post-1091 #f3d4add. Placeholders are the only visible labels in the save, so
   each one is reused as the accessible label and hidden visually. */
const FIELDS: FormField[] = [
  { name: "name", label: "First Name", type: "text", required: true, placeholder: "First Name", labelHidden: true, width: 50, autoComplete: "given-name" },
  { name: "field_1", label: "Last name", type: "text", required: true, placeholder: "Last name", labelHidden: true, width: 50, autoComplete: "family-name" },
  { name: "email", label: "Email", type: "email", required: true, placeholder: "Email", labelHidden: true, width: 100, autoComplete: "email" },
  { name: "field_2", label: "Sector or neighbourhood", type: "text", placeholder: "Sector or neighbourhood", labelHidden: true, width: 50, autoComplete: "address-level2" },
  { name: "field_3", label: "Phone Number", type: "tel", required: true, placeholder: "Phone Number", labelHidden: true, width: 50, autoComplete: "tel" },
  {
    name: "field_5",
    label: "Ask your question here",
    type: "textarea",
    placeholder: "Ask your question here ",
    labelHidden: true,
    width: 100,
  },
];

/**
 * post-1091 #6a16b44 — the enquiry form that closes the page. It asks a
 * question; it takes no card details and processes no payment, and the success
 * panel says plainly that nothing was sent, stored or charged. Fee details come
 * from the school office, never from this page.
 */
export default function PaymentForm() {
  return (
    <section className="payment-form">
      <Container>
        <ContactForm
          name="Ask about school payments"
          fields={FIELDS}
          submitLabel="Send"
          successMessage="Thanks — your question looks complete. This demo form is not connected to a mail service and takes no payment, so nothing was sent, stored or charged."
        />
      </Container>
    </section>
  );
}
