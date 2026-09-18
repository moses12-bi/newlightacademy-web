import type { Metadata } from "next";

import GalleryJustified from "@/components/sections/gallery/GalleryJustified";
import { galleryPhotos } from "@/components/sections/gallery/photos";
import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Illustrative photographs of nursery and primary school life.",
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
          </div>
        </Container>
      </section>
    </>
  );
}
