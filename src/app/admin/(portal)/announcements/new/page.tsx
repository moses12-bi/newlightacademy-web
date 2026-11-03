import Link from "next/link";

import ActionForm from "@/components/admin/ActionForm";
import AnnouncementFields from "@/components/admin/AnnouncementFields";

import { saveAnnouncementAction } from "../../../actions";

export const metadata = { title: "New announcement" };

export default function NewAnnouncement() {
  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/announcements" className="adm-small">
            ← Announcements
          </Link>
          <h1>New announcement</h1>
        </div>
      </div>
      <ActionForm
        action={saveAnnouncementAction}
        submitLabel="Save"
        pendingLabel="Saving…"
        extraButtons={
          <button type="submit" name="share" value="1" className="adm-btn adm-btn--ghost">
            Save &amp; share on social media
          </button>
        }
      >
        <AnnouncementFields />
      </ActionForm>
    </>
  );
}
