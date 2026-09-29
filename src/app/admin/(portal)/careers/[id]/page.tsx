import Link from "next/link";
import { notFound } from "next/navigation";

import ActionForm from "@/components/admin/ActionForm";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import Flash from "@/components/admin/Flash";
import JobFields from "@/components/admin/JobFields";
import { getJob, isAccepting, JOB_CATEGORIES, JOB_TYPES } from "@/lib/server/jobs";
import { listMessages } from "@/lib/server/messages";

import { deleteJobAction, saveJobAction } from "../../../actions";
import { requireUser } from "@/lib/server/auth";

export const metadata = { title: "Edit vacancy" };

export default async function EditJob({ params, searchParams }: PageProps<"/admin/careers/[id]">) {
  await requireUser();
  const { id } = await params;
  const flash = await searchParams;
  const job = getJob(Number(id));
  if (!job) notFound();
  const applications = listMessages("all", `job:${job.id}`).length;

  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/careers" className="adm-small">
            ← Careers
          </Link>
          <h1>{job.title}</h1>
          <p>
            {applications > 0 ? (
              <Link href={`/admin/inbox?job=${job.id}`}>
                {applications} application{applications === 1 ? "" : "s"} →
              </Link>
            ) : (
              "No applications yet."
            )}
          </p>
        </div>
        <div className="adm-actions">
          {job.status !== "draft" ? (
            <a href={`/careers/${job.slug}`} target="_blank" rel="noreferrer" className="adm-btn adm-btn--ghost">
              View on website ↗
            </a>
          ) : null}
          <form action={deleteJobAction}>
            <input type="hidden" name="id" value={job.id} />
            <ConfirmSubmit message="Delete this vacancy? Applications already received stay in the Inbox.">Delete</ConfirmSubmit>
          </form>
        </div>
      </div>
      <Flash ok={flash.ok} error={flash.error} />
      {job.status === "open" && !isAccepting(job) ? (
        <p className="adm-flash adm-flash--warn">The closing date has passed, so the website shows this vacancy as closed.</p>
      ) : null}
      <ActionForm
        key={job.updated_at}
        action={saveJobAction}
        submitLabel="Save"
        pendingLabel="Saving…"
        extraButtons={
          <button type="submit" name="share" value="1" className="adm-btn adm-btn--ghost">
            Save &amp; share on social media
          </button>
        }
      >
        <JobFields job={job} types={JOB_TYPES} categories={JOB_CATEGORIES} />
      </ActionForm>
    </>
  );
}
