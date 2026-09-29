import Link from "next/link";

import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import Flash from "@/components/admin/Flash";
import GalleryUploader from "@/components/admin/GalleryUploader";
import { listGallery } from "@/lib/server/gallery";
import { mediaConfigured } from "@/lib/server/media";

import { addGalleryPhotosAction, galleryPhotoAction } from "../../actions";
import { requireUser } from "@/lib/server/auth";

export const metadata = { title: "Gallery" };

function OpButton({ id, op, label, disabled }: { id: number; op: string; label: string; disabled?: boolean }) {
  return (
    <form action={galleryPhotoAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="op" value={op} />
      <button type="submit" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={disabled} aria-label={label}>
        {op === "up" ? "↑" : "↓"}
      </button>
    </form>
  );
}

export default async function GalleryAdmin({ searchParams }: PageProps<"/admin/gallery">) {
  await requireUser();
  const params = await searchParams;
  const photos = listGallery();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Gallery</h1>
          <p>
            The photographs on <a href="/gallery" target="_blank" rel="noreferrer">/gallery</a>, in this order.
          </p>
        </div>
      </div>
      <Flash ok={params.ok} error={params.error} />

      <section className="adm-card adm-stack">
        <h2>Add photos</h2>
        <p className="adm-flash adm-flash--warn">
          Only publish photographs of children whose parents have given consent. If a parent asks for a photo to be
          taken down, remove it here — the website updates straight away.
        </p>
        {mediaConfigured() ? (
          <GalleryUploader addPhotos={addGalleryPhotosAction} />
        ) : (
          <p className="adm-muted">
            Photo uploads need Cloudinary — add it under <Link href="/admin/settings#cloudinary">Settings → Integrations</Link>.
          </p>
        )}
      </section>

      <p className="adm-muted adm-small" style={{ margin: "16px 0" }}>
        {photos.length} photo{photos.length === 1 ? "" : "s"}. The description is read aloud to visitors who cannot see the
        picture: say what is in it, without naming children.
      </p>
      <div className="adm-gallery">
        {photos.map((photo, index) => (
          <article key={photo.id} id={`photo-${photo.id}`} className="adm-card adm-gallery__item">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of an arbitrary source */}
            <img src={photo.src} alt="" loading="lazy" />
            <form action={galleryPhotoAction} className="adm-form">
              <input type="hidden" name="id" value={photo.id} />
              <input type="hidden" name="op" value="alt" />
              <label className="adm-field">
                <span className="adm-small">Description</span>
                <textarea name="alt" rows={2} defaultValue={photo.alt} maxLength={300} style={{ minHeight: 0 }} />
              </label>
              <button type="submit" className="adm-btn adm-btn--ghost adm-btn--sm">
                Save description
              </button>
            </form>
            <div className="adm-actions" style={{ justifyContent: "space-between" }}>
              <div className="adm-actions">
                <OpButton id={photo.id} op="up" label="Move earlier" disabled={index === 0} />
                <OpButton id={photo.id} op="down" label="Move later" disabled={index === photos.length - 1} />
                <span className="adm-muted adm-small">#{index + 1}</span>
              </div>
              <form action={galleryPhotoAction}>
                <input type="hidden" name="id" value={photo.id} />
                <input type="hidden" name="op" value="remove" />
                <ConfirmSubmit message="Remove this photo from the gallery?" className="adm-btn adm-btn--danger adm-btn--sm">
                  Remove
                </ConfirmSubmit>
              </form>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
