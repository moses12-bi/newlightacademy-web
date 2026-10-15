import Link from "next/link";

import Flash from "@/components/admin/Flash";
import GalleryUploader from "@/components/admin/GalleryUploader";
import { requireUser } from "@/lib/server/auth";
import { galleryLibrary, HIDE_TAG } from "@/lib/server/gallery";
import { mediaConfigured, withTransform } from "@/lib/server/media";

import { galleryPhotoAction, galleryUploadedAction } from "../../actions";

export const metadata = { title: "Gallery" };

/**
 * The gallery follows the school's Cloudinary library: this page lists it,
 * puts photos into it, and hides or describes them there.
 */
export default async function GalleryAdmin({ searchParams }: PageProps<"/admin/gallery">) {
  await requireUser();
  const params = await searchParams;
  const configured = mediaConfigured();
  const library = configured ? await galleryLibrary() : null;
  const onSite = library?.filter((photo) => !photo.hidden).length ?? 0;
  const hidden = (library?.length ?? 0) - onSite;

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Gallery</h1>
          <p>
            <a href="/gallery" target="_blank" rel="noreferrer">
              /gallery
            </a>{" "}
            shows every photo in the school&apos;s Cloudinary library, newest uploads first. Photos added in the
            Cloudinary console appear within five minutes; changes made here show straight away.
          </p>
        </div>
      </div>
      <Flash ok={params.ok} error={params.error} />

      <section className="adm-card adm-stack">
        <h2>Add photos</h2>
        <p className="adm-flash adm-flash--warn">
          Only publish photographs of children whose parents have given consent. If a parent asks for a photo to be
          taken down, hide it here — the website updates straight away.
        </p>
        {configured ? (
          <GalleryUploader uploaded={galleryUploadedAction} />
        ) : (
          <p className="adm-muted">
            The gallery needs Cloudinary — add it under{" "}
            <Link href="/admin/settings#cloudinary">Settings → Integrations</Link>.
          </p>
        )}
      </section>

      {configured && !library ? (
        <p className="adm-flash adm-flash--error" style={{ margin: "16px 0" }}>
          Cloudinary could not be reached, so the library cannot be shown. The public gallery shows its built-in photos
          until it can. Try again in a moment.
        </p>
      ) : null}

      {library ? (
        <>
          <p className="adm-muted adm-small" style={{ margin: "16px 0" }}>
            {onSite} photo{onSite === 1 ? "" : "s"} on the website, {hidden} hidden. Hide keeps a photo in Cloudinary
            but off the website (it is tagged <code>{HIDE_TAG}</code>, which also works from the Cloudinary console).
            The description is read aloud to visitors who cannot see the picture: say what is in it, without naming
            children. The label is the short caption on the tile.
          </p>
          <div className="adm-gallery">
            {library.map((photo) => (
              <article
                key={photo.publicId}
                id={`photo-${photo.key}`}
                className="adm-card adm-gallery__item"
                style={photo.hidden ? { opacity: 0.6 } : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, resized by Cloudinary */}
                <img src={withTransform(photo.src, "c_limit,w_480,f_auto,q_auto")} alt="" loading="lazy" />
                <div className="adm-actions" style={{ justifyContent: "space-between" }}>
                  <span className={photo.hidden ? "adm-pill adm-pill--warn" : "adm-pill adm-pill--ok"}>
                    {photo.hidden ? "Hidden" : "On the website"}
                  </span>
                  <form action={galleryPhotoAction}>
                    <input type="hidden" name="id" value={photo.publicId} />
                    <input type="hidden" name="op" value={photo.hidden ? "show" : "hide"} />
                    <button
                      type="submit"
                      className={photo.hidden ? "adm-btn adm-btn--sm" : "adm-btn adm-btn--ghost adm-btn--sm"}
                    >
                      {photo.hidden ? "Show" : "Hide"}
                    </button>
                  </form>
                </div>
                <form action={galleryPhotoAction} className="adm-form">
                  <input type="hidden" name="id" value={photo.publicId} />
                  <input type="hidden" name="op" value="describe" />
                  <label className="adm-field">
                    <span className="adm-small">Label</span>
                    <input name="label" defaultValue={photo.label ?? ""} maxLength={40} />
                  </label>
                  <label className="adm-field">
                    <span className="adm-small">Description</span>
                    <textarea name="alt" rows={2} defaultValue={photo.alt ?? ""} maxLength={300} style={{ minHeight: 0 }} />
                  </label>
                  <button type="submit" className="adm-btn adm-btn--ghost adm-btn--sm">
                    Save
                  </button>
                </form>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}
