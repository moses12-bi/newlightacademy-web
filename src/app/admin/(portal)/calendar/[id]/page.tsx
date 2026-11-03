import Link from "next/link";
import { notFound } from "next/navigation";

import ActionForm from "@/components/admin/ActionForm";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import EventFields from "@/components/admin/EventFields";
import { EVENT_CATEGORIES, getEvent } from "@/lib/server/events";

import { deleteEventAction, saveEventAction } from "../../../actions";

export const metadata = { title: "Edit event" };

export default async function EditEvent({ params }: PageProps<"/admin/calendar/[id]">) {
  const { id } = await params;
  const event = getEvent(Number(id));
  if (!event) notFound();
  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/calendar" className="adm-small">
            ← Calendar
          </Link>
          <h1>{event.title}</h1>
        </div>
        <form action={deleteEventAction}>
          <input type="hidden" name="id" value={event.id} />
          <ConfirmSubmit message="Delete this event?">Delete</ConfirmSubmit>
        </form>
      </div>
      <ActionForm
        key={event.updated_at}
        action={saveEventAction}
        submitLabel="Save"
        pendingLabel="Saving…"
        extraButtons={
          <button type="submit" name="share" value="1" className="adm-btn adm-btn--ghost">
            Save &amp; share on social media
          </button>
        }
      >
        <EventFields event={event} categories={EVENT_CATEGORIES} />
      </ActionForm>
    </>
  );
}
