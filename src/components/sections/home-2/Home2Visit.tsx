import Image from "next/image";
import { Fragment } from "react";

import Container from "@/components/ui/Container";
import ContactForm from "@/components/ui/ContactForm";
import { visitFormFields } from "@/components/ui/visit-form-fields";
import { hasAddress, hasEmail, hasPhone, site } from "@/lib/site";

/* #f81fc2b — the standing illustration drifts left as the band scrolls past. */
const PEOPLE_FX = JSON.stringify({
  translateX: { speed: 1, direction: "negative", affectedRange: { start: 0, end: 54 } },
});

/**
 * "Come and visit us." (post-1104 #f6c5369): the address block beside the tour
 * request form.
 *
 * The form column is first in the DOM so its h2 precedes the address heading —
 * which is also the order Elementor's `reverse-mobile` gives the saved section
 * on phones — and `row-reverse` restores the desktop arrangement.
 */
export default function Home2Visit() {
  return (
    <section className="home2-visit">
      <Container>
        <p className="home2-word" data-reveal="zoomInDown">
          Come
        </p>

        <div className="home2-visit__row">
          <div className="home2-visit__form">
            <h2>and visit us.</h2>
            <p className="home2-visit__lead">
              Tell us a little about your family below, or contact the school office if you would
              like to ask about visiting.
            </p>
            <ContactForm
              fields={visitFormFields}
              submitLabel="Submit my information"
              name="Come and visit us"
              submitAlign="stretch"
            />
          </div>

          <div className="home2-visit__address">
            <Image
              src="/images/home/illustration-people-2.svg"
              alt=""
              width={227}
              height={400}
              unoptimized
              className="home2-visit__people"
              data-fx={PEOPLE_FX}
            />
            <h3 className="home2-visit__place">{site.name}</h3>
            <div className="home2-visit__details card-copy">
              {/* Each row disappears when its field is unset, so the block never
                  renders an empty label or a bare link. */}
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
                  <a href={site.phoneHref}>{site.phone}</a>
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
        </div>
      </Container>
    </section>
  );
}
