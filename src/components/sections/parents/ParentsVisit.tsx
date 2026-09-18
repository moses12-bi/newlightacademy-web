import { Fragment } from "react";
import Image from "next/image";

import Container from "@/components/ui/Container";
import ContactForm from "@/components/ui/ContactForm";
import { visitFormFields } from "@/components/ui/visit-form-fields";
import { displayPhone, hasAddress, hasEmail, hasPhone, site } from "@/lib/site";

/**
 * post-3216 #a7c3a39 — the oversized "Come" lettering over a 900px well that
 * pairs the school's address with the enquiry form. The inner section carries
 * `elementor-reverse-mobile`, so on phones the form comes first.
 */
export default function ParentsVisit() {
  return (
    <section className="parents-visit">
      <Container>
        <div className="parents-come" data-reveal="zoomInDown" data-reveal-mobile="none">
          Come
        </div>

        <div className="parents-visit__inner">
          <div className="parents-visit__art">
            <Image
              src="/images/home/illustration-people-2.svg"
              alt=""
              width={227}
              height={400}
              unoptimized
              data-fx='{"translateX":{"direction":"negative","speed":1,"affectedRange":{"start":0,"end":54}}}'
              data-fx-devices="desktop"
            />
            <h3>{site.name}</h3>
            <div className="parents-visit__address">
              {hasAddress() ? (
                <p>
                  {site.addressLines.map((line) => (
                    <Fragment key={line}>
                      {line}
                      <br />
                    </Fragment>
                  ))}
                </p>
              ) : null}
              {hasPhone() ? (
                <p>
                  <strong>Phone:</strong>
                  <br />
                  <a href={site.phoneHref}>{displayPhone()}</a>
                </p>
              ) : null}
              {hasEmail() ? (
                <p>
                  <strong>Email:</strong>
                  <br />
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </p>
              ) : null}
            </div>
          </div>

          <div className="parents-visit__form">
            <h2>and visit us.</h2>
            <p className="parents-visit__lead">
              Tell us a little about your family and we will be in touch. We would love to welcome
              you to {site.name} and show you around.
            </p>
            <ContactForm
              name="Family enquiry"
              fields={visitFormFields}
              submitLabel="Submit my information"
              successMessage="Thanks — your details look complete. This demo form is not connected to a mail service, so nothing was sent, stored or charged."
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
