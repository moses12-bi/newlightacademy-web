import type { Metadata } from "next";

import GalleryJustified from "@/components/sections/gallery/GalleryJustified";
import { galleryPhotos } from "@/components/sections/gallery/photos";
import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";
import { hasEmail, hasPhone, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gallery",
  description: `Photographs of nursery and primary school life at ${site.name}.`,
};

export default function GalleryPage() {
  return (
    <>
      {/* #355e47b5 — a plain white title band; the second column is empty. */}
      <section className="gallery-intro">
        <Container>
          <div className="gallery-intro__copy">
            <h1 data-reveal="fadeIn">Gallery</h1>
          </div>
        </Container>
      </section>

      {/* #85a8dbb — cream band, wavy on both edges. */}
      <section className="gallery-section">
        <ShapeDivider position="top" />
        <ShapeDivider position="bottom" />
        <Container>
          <div className="gallery-section__inner" data-reveal="fadeIn" data-delay="500">
            {/* #5f571d4: fadeIn on desktop and tablet, no reveal on phones. */}
            <div data-reveal="fadeIn" data-reveal-mobile="none">
              <GalleryJustified photos={galleryPhotos} />
            </div>

            {/* Rwanda's Law 058/2021 requires a way to withdraw consent for a
                child's image, not only to give it. The school confirmed it holds
                parental consent for these photographs; this is the other half. */}
            {hasPhone() || hasEmail() ? (
              <p className="gallery-consent" data-reveal="fadeIn" data-delay="200">
                If you would like a photograph of your child removed from this page, please
                contact the school office
                {hasPhone() ? (
                  <>
                    {" "}
                    on <a href={site.phoneHref}>{site.phone}</a>
                  </>
                ) : null}
                {hasPhone() && hasEmail() ? " or" : null}
                {hasEmail() ? (
                  <>
                    {" "}
                    at <a href={`mailto:${site.email}`}>{site.email}</a>
                  </>
                ) : null}
                , and we will take it down.
              </p>
            ) : null}
          </div>
        </Container>
      </section>
    </>
  );
}
