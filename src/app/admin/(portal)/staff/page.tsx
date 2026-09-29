import Link from "next/link";

import ActionForm from "@/components/admin/ActionForm";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import Flash from "@/components/admin/Flash";
import MediaField from "@/components/admin/MediaField";
import { mediaConfigured } from "@/lib/server/media";
import { listStaff, type StaffRow } from "@/lib/server/staff";

import { saveStaffAction, staffOrderAction } from "../../actions";

export const metadata = { title: "Staff" };

function OrderButton({ id, op, label, disabled }: { id: number; op: "up" | "down"; label: string; disabled: boolean }) {
  return (
    <form action={staffOrderAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="op" value={op} />
      <button type="submit" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={disabled} aria-label={label}>
        {op === "up" ? "↑" : "↓"}
      </button>
    </form>
  );
}

function StaffFields({ member }: { member?: StaffRow }) {
  return (
    <>
      {member ? <input type="hidden" name="id" value={member.id} /> : null}
      <MediaField
        name="photo"
        label="Portrait"
        accept="image/*"
        initial={member ? { url: member.photo, type: "image", width: member.width, height: member.height } : undefined}
        hint="Cropped to a 4:5 portrait around the face."
      />
      <label className="adm-field">
        <span>Name</span>
        <input type="text" name="name" defaultValue={member?.name} placeholder="Leave empty until confirmed" />
      </label>
      <label className="adm-field">
        <span>Role</span>
        <input type="text" name="role" defaultValue={member?.role} placeholder="e.g. Top Class teacher" />
      </label>
      <label className="adm-check">
        <input type="checkbox" name="is_head" defaultChecked={!!member?.is_head} /> Head Teacher (shown first)
      </label>
    </>
  );
}

export default async function StaffAdmin({ searchParams }: PageProps<"/admin/staff">) {
  const params = await searchParams;
  const staff = listStaff();
  const others = staff.filter((member) => !member.is_head);

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Staff</h1>
          <p>
            The teacher cards on <a href="/our-teachers" target="_blank" rel="noreferrer">/our-teachers</a>. The name and role appear
            when a visitor turns a card over; cards without a name show a general caption.
          </p>
        </div>
      </div>
      <Flash ok={params.ok} error={params.error} />
      {!mediaConfigured() ? (
        <p className="adm-flash adm-flash--warn">
          New portraits need Cloudinary — add it under <Link href="/admin/settings#cloudinary">Settings → Integrations</Link>. Names and
          roles can be edited without it.
        </p>
      ) : null}

      <div className="adm-gallery">
        {staff.map((member) => {
          const position = others.findIndex((other) => other.id === member.id);
          return (
            <article key={member.id} id={`staff-${member.id}`} className="adm-card adm-gallery__item adm-staff__item">
              {member.is_head ? <span className="adm-pill adm-pill--ok">Head Teacher</span> : null}
              <ActionForm action={saveStaffAction} submitLabel="Save" pendingLabel="Saving…">
                <StaffFields member={member} />
              </ActionForm>
              <div className="adm-actions" style={{ justifyContent: "space-between" }}>
                {member.is_head ? (
                  <span />
                ) : (
                  <div className="adm-actions">
                    <OrderButton id={member.id} op="up" label="Move earlier" disabled={position === 0} />
                    <OrderButton id={member.id} op="down" label="Move later" disabled={position === others.length - 1} />
                  </div>
                )}
                <form action={staffOrderAction}>
                  <input type="hidden" name="id" value={member.id} />
                  <input type="hidden" name="op" value="remove" />
                  <ConfirmSubmit message="Remove this card from the Our Teachers page?" className="adm-btn adm-btn--danger adm-btn--sm">
                    Remove card
                  </ConfirmSubmit>
                </form>
              </div>
            </article>
          );
        })}

        <article className="adm-card adm-gallery__item adm-staff__item">
          <h2>Add a staff member</h2>
          <ActionForm action={saveStaffAction} submitLabel="Add" pendingLabel="Adding…">
            <StaffFields />
          </ActionForm>
        </article>
      </div>
    </>
  );
}
