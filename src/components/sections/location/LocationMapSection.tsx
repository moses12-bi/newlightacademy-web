"use client";

import { useState } from "react";

import ContactForm from "@/components/ui/ContactForm";
import type { FormField } from "@/components/ui/ContactForm";
import Container from "@/components/ui/Container";
import { site } from "@/lib/site";

/* The address comes from `site.addressLines` rather than being typed here, and
   the map is a search for that address, not a pin at coordinates of our own
   choosing: nobody has confirmed a map marker for the school, so none is placed. */
const PLACE = site.addressLines.join(", ");

/* Built only after the visitor asks for it, so nothing reaches Google on load. */
const EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(PLACE)}&t=m&z=15&output=embed&iwloc=near`;
const OPEN_IN_MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(PLACE)}`;

const FIELDS: FormField[] = [
  { name: "name", label: "First Name", type: "text", required: true, placeholder: "First Name", labelHidden: true, width: 50, autoComplete: "given-name" },
  { name: "field_1", label: "Last name", type: "text", required: true, placeholder: "Last name", labelHidden: true, width: 50, autoComplete: "family-name" },
  { name: "email", label: "Email", type: "email", required: true, placeholder: "Email", labelHidden: true, width: 100, autoComplete: "email" },
  { name: "field_2", label: "Where you live", type: "text", placeholder: "Where you live", labelHidden: true, width: 50, autoComplete: "address-level2" },
  { name: "field_3", label: "Phone Number", type: "tel", required: true, placeholder: "Phone Number", labelHidden: true, width: 50, autoComplete: "tel" },
  {
    name: "field_4",
    label: "When would you like your child to start?",
    type: "select",
    required: true,
    width: 100,
    placeholderOption: "When would you like your child to start?",
    options: ["Unsure at this time", "Within a month", "1-3 months", "3-6 months", "6-9 months", "9 months+"],
  },
  {
    name: "field_11",
    label: "What is your child's date of birth?",
    type: "date",
    required: true,
    placeholder: "Date",
    width: 100,
  },
  {
    name: "field_5",
    label:
      "Send us your details below and we will be in touch. We look forward to meeting you.",
    type: "textarea",
    placeholder: "Is there anything we should know about your family?",
    width: 100,
  },
];

/**
 * The map + tour form band (post-1074 #a3cc9ed).
 *
 * The map is a local facade: a styled panel with the address and an
 * "Open in Google Maps" link that is always available. Google's embed is only
 * requested once the visitor presses "Show the map".
 *
 * The panel names the area in words — Kinyinya, Gasabo, and the bus station
 * everyone navigates by — instead of dropping a pin, because the exact marker
 * has not been confirmed on the ground.
 */
export default function LocationMapSection() {
  const [showMap, setShowMap] = useState(false);

  return (
    <section className="location-visit">
      <Container className="location-visit__layout">
        <div className="location-map">
          {showMap ? (
            <iframe
              className="location-map__frame"
              src={EMBED_SRC}
              title={`Google Maps — ${PLACE}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="location-map__facade">
              <p className="location-map__place">{PLACE}</p>
              <p className="location-map__note">
                We are in Kinyinya sector, Gasabo district, Kigali — {site.addressDetail}. The map is
                loaded from Google: press the button to load it, or open the address in a new tab
                instead.
              </p>
              <div className="location-map__actions">
                <button type="button" className="location-map__button" onClick={() => setShowMap(true)}>
                  Show the map
                </button>
                <a
                  className="location-map__link"
                  href={OPEN_IN_MAPS}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="location-tour">
          <h2 className="location-tour__title">Arrange a visit</h2>
          <ContactForm
            fields={FIELDS}
            submitLabel="Send my details"
            name="Arrange a visit"
            submitAlign="stretch"
          />
        </div>
      </Container>
    </section>
  );
}
