import Link from "next/link";
import { notFound } from "next/navigation";

import ActionForm from "@/components/admin/ActionForm";
import AnnouncementFields from "@/components/admin/AnnouncementFields";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { isoToKigaliLocal } from "@/lib/admin/format";
import { getAnnouncement } from "@/lib/server/announcements";

import { deleteAnnouncementAction, saveAnnouncementAction } from "../../../actions";

export const metadata = { title: "Edit announcement" };

export default async function EditAnnouncement({ params }: PageProps<"/admin/announcements/[id]">) {
  const { id } = await params;
  const announcement = getAnnouncement(Number(id));
  if (!announcement) notFound();
  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/announcements" className="adm-small">
            ← Announcements
          </Link>
          <h1>{announcement.title}</h1>
        </div>
        <form action={deleteAnnouncementAction}>
          <input type="hidden" name="id" value={announcement.id} />
          <ConfirmSubmit message="Delete this announcement?">Delete</ConfirmSubmit>
        </form>
      </div>
      <ActionForm
        key={announcement.updated_at}
        action={saveAnnouncementAction}
        submitLabel="Save"
        pendingLabel="Saving…"
        extraButtons={
          <button type="submit" name="share" value="1" className="adm-btn adm-btn--ghost">
            Save &amp; share on social media
          </button>
        }
      >
        <AnnouncementFields
          announcement={announcement}
          publishLocal={isoToKigaliLocal(announcement.publish_at)}
          expiresLocal={isoToKigaliLocal(announcement.expires_at)}
        />
      </ActionForm>
    </>
  );
}
