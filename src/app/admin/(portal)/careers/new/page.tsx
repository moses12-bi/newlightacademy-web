import Link from "next/link";

import ActionForm from "@/components/admin/ActionForm";
import JobFields from "@/components/admin/JobFields";
import { JOB_CATEGORIES, JOB_TYPES } from "@/lib/server/jobs";

import { saveJobAction } from "../../../actions";

export const metadata = { title: "New vacancy" };

export default function NewJob() {
  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/careers" className="adm-small">
            ← Careers
          </Link>
          <h1>New vacancy</h1>
        </div>
      </div>
      <ActionForm action={saveJobAction} submitLabel="Save" pendingLabel="Saving…">
        <JobFields types={JOB_TYPES} categories={JOB_CATEGORIES} />
      </ActionForm>
    </>
  );
}
