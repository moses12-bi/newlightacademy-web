import type { Metadata } from "next";
import { headers } from "next/headers";
import { connection } from "next/server";

import GalleryJustified from "@/components/sections/gallery/GalleryJustified";
import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";
import { site } from "@/lib/site";
import { publicGallery } from "@/lib/server/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: `Photographs of nursery and primary school life at ${site.name}.`,
};

/**
 * Rendered on each request from a Cloudinary listing cached for five minutes
 * (src/lib/server/gallery.ts), so a deploy never serves a build-time copy and a
 * photo hidden in the portal stays hidden.
 */
export default async function GalleryPage({ searchParams }: PageProps<"/gallery">) {
  await connection();
  const params = await searchParams;
  const photos = await publicGallery();
  /* ?all=1 is where "Show more photos" goes without JavaScript. */
  const initialCount = params.all === "1" ? photos.length : undefined;
  /* The masonry's column count, guessed from the device so a phone's first view
     is already two columns; the browser corrects a wrong guess. */
  const request = await headers();
  const agent = request.get("user-agent") ?? "";
  const initialColumns =
    request.get("sec-ch-ua-mobile") === "?1" || /Mobi|iPhone|iPod/i.test(agent) ? 2 : /iPad|Tablet|Android/i.test(agent) ? 3 : 4;
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
              <GalleryJustified photos={photos} initialCount={initialCount} initialColumns={initialColumns} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
