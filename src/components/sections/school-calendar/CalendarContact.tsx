import { Fragment } from "react";
import Container from "@/components/ui/Container";
import { displayPhone, hasAddress, hasEmail, hasPhone, site } from "@/lib/site";

/**
 * post-1095 #7d669c8 — the four-up address row that closes the page, with the
 * snail illustration along the bottom edge. The saved widgets are h4s, but they
 * are an address block rather than section headings, so they keep the size and
 * lose the heading role.
 */
export default function CalendarContact() {
  return (
    <section className="calendar-contact" aria-label="Contact details">
      <Container>
        <address className="calendar-contact__grid not-italic">
          <div>
            <p>{site.name}</p>
          </div>
          {hasAddress() ? (
            <div>
              <p>
                {site.addressLines.map((line) => (
                  <Fragment key={line}>
                    {line}
                    <br />
                  </Fragment>
                ))}
              </p>
            </div>
          ) : null}
          {hasPhone() ? (
            <div>
              <p>
                Phone:
                <br />
                <a href={site.phoneHref}>{displayPhone()}</a>
              </p>
            </div>
          ) : null}
          {hasEmail() ? (
            <div>
              <p>
                Email:
                <br />
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </p>
            </div>
          ) : null}
        </address>
      </Container>
    </section>
  );
}
