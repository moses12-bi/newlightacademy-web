import Link from "next/link";

import ActionForm from "@/components/admin/ActionForm";
import EventFields from "@/components/admin/EventFields";
import Flash from "@/components/admin/Flash";
import { EVENT_CATEGORIES } from "@/lib/server/events";

import { saveEventAction } from "../../../actions";

export const metadata = { title: "Add event" };

export default async function NewEvent({ searchParams }: PageProps<"/admin/calendar/new">) {
  const params = await searchParams;
  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/calendar" className="adm-small">
            ← Calendar
          </Link>
          <h1>Add event</h1>
        </div>
      </div>
      <Flash ok={params.ok} error={params.error} />
      <ActionForm
        action={saveEventAction}
        submitLabel="Save"
        pendingLabel="Saving…"
        extraButtons={
          <button type="submit" name="another" value="1" className="adm-btn adm-btn--ghost">
            Save &amp; add another
          </button>
        }
      >
        <EventFields categories={EVENT_CATEGORIES} />
      </ActionForm>
    </>
  );
}
