import Link from "next/link";

import ActionForm from "@/components/admin/ActionForm";
import Flash from "@/components/admin/Flash";
import StageSelect from "@/components/admin/StageSelect";
import { formatDate } from "@/lib/admin/format";
import { admissionsSettings, CLASSES, JOB_STAGES, STUDENT_STAGES } from "@/lib/server/admissions";
import { db } from "@/lib/server/db";
import { listApplications } from "@/lib/server/messages";

import { saveAdmissionsAction, setStageAction } from "../../actions";

export const metadata = { title: "Applications" };

const STAGE_PILL: Record<string, string> = {
  New: "adm-pill--new",
  "Offered a place": "adm-pill--ok",
  Enrolled: "adm-pill--ok",
  Offered: "adm-pill--ok",
  Hired: "adm-pill--ok",
  Declined: "adm-pill--bad",
  "Not successful": "adm-pill--bad",
};

export default async function ApplicationsPage({ searchParams }: PageProps<"/admin/applications">) {
  const params = await searchParams;
  const tab = params.type === "jobs" ? "jobs" : "students";
  const stageFilter = typeof params.stage === "string" ? params.stage : "";
  const groupFilter = typeof params.group === "string" ? params.group : "";
  const stages = tab === "jobs" ? JOB_STAGES : STUDENT_STAGES;

  const rows = listApplications(tab === "jobs" ? "job-application" : "student-application").map((message) => {
    const fields = JSON.parse(message.fields_json) as Record<string, string>;
    const count = (db().prepare("SELECT COUNT(*) AS n FROM attachments WHERE message_id = ?").get(message.id) as { n: number }).n;
    return {
      message,
      stage: message.stage || "New",
      who: tab === "jobs" ? message.name : fields["Child's full name"] || message.name,
      group: tab === "jobs" ? fields.Position ?? "" : fields["Class applying for"] ?? "",
      contact: tab === "jobs" ? [message.email, message.phone].filter(Boolean).join(" · ") : `${message.name} · ${message.phone}`,
      files: count,
    };
  });
  const groups = [...new Set(rows.map((row) => row.group).filter(Boolean))];
  const counts = Object.fromEntries(stages.map((stage) => [stage, rows.filter((row) => row.stage === stage).length]));
  const shown = rows.filter((row) => (!stageFilter || row.stage === stageFilter) && (!groupFilter || row.group === groupFilter));
  const settings = admissionsSettings();
  const base = `/admin/applications?type=${tab}`;
  const here = `${base}${stageFilter ? `&stage=${encodeURIComponent(stageFilter)}` : ""}${groupFilter ? `&group=${encodeURIComponent(groupFilter)}` : ""}`;

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Applications</h1>
          <p>Student applications from /how-to-apply and job applications from /careers. Move each one along as it progresses.</p>
        </div>
        <div className="adm-actions">
          <Link href="/admin/applications?type=students" className={`adm-btn ${tab === "students" ? "" : "adm-btn--ghost"}`}>
            Students
          </Link>
          <Link href="/admin/applications?type=jobs" className={`adm-btn ${tab === "jobs" ? "" : "adm-btn--ghost"}`}>
            Jobs
          </Link>
        </div>
      </div>
      <Flash ok={params.ok} error={params.error} />

      {tab === "students" ? (
        <details className="adm-card" style={{ marginBottom: 16 }} open={!settings.open}>
          <summary style={{ cursor: "pointer", fontWeight: 800 }}>
            Online admissions:{" "}
            <span className={`adm-pill ${settings.open ? "adm-pill--ok" : "adm-pill--warn"}`}>{settings.open ? "Open" : "Closed"}</span>
            {settings.intake ? <span className="adm-muted"> · {settings.intake}</span> : null}
          </summary>
          <div style={{ marginTop: 12 }}>
            <ActionForm action={saveAdmissionsAction} submitLabel="Save admissions settings" pendingLabel="Saving…">
              <label className="adm-check">
                <input type="checkbox" name="open" defaultChecked={settings.open} /> Accept applications online
              </label>
              <div className="adm-row">
                <label className="adm-field">
                  <span>Intake</span>
                  <input type="text" name="intake" defaultValue={settings.intake} placeholder="e.g. 2027 school year" />
                </label>
              </div>
              <label className="adm-field">
                <span>Note above the form</span>
                <textarea name="note" rows={3} defaultValue={settings.note} placeholder="e.g. Documents to bring, deadlines, the assessment visit." />
              </label>
              <p className="adm-small adm-muted">Classes offered: {CLASSES.join(", ")}.</p>
            </ActionForm>
          </div>
        </details>
      ) : (
        <p className="adm-small adm-muted" style={{ marginBottom: 16 }}>
          Vacancies are managed under <Link href="/admin/careers">Careers</Link>.
        </p>
      )}

      <div className="adm-actions" style={{ marginBottom: 12 }}>
        <Link href={`${base}${groupFilter ? `&group=${encodeURIComponent(groupFilter)}` : ""}`} className={`adm-pill ${stageFilter ? "" : "adm-pill--ok"}`}>
          All ({rows.length})
        </Link>
        {stages.map((stage) => (
          <Link
            key={stage}
            href={`${base}&stage=${encodeURIComponent(stage)}${groupFilter ? `&group=${encodeURIComponent(groupFilter)}` : ""}`}
            className={`adm-pill ${stageFilter === stage ? "adm-pill--ok" : ""}`}
          >
            {stage} ({counts[stage]})
          </Link>
        ))}
      </div>
      {groups.length > 1 ? (
        <form className="adm-actions" style={{ marginBottom: 12 }}>
          <input type="hidden" name="type" value={tab} />
          {stageFilter ? <input type="hidden" name="stage" value={stageFilter} /> : null}
          <select name="group" defaultValue={groupFilter} aria-label={tab === "jobs" ? "Position" : "Class"} style={{ maxWidth: 280 }}>
            <option value="">{tab === "jobs" ? "All positions" : "All classes"}</option>
            {groups.map((group) => (
              <option key={group}>{group}</option>
            ))}
          </select>
          <button type="submit" className="adm-btn adm-btn--ghost adm-btn--sm">
            Filter
          </button>
        </form>
      ) : null}

      {shown.length === 0 ? (
        <div className="adm-card adm-empty">No applications here yet.</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>{tab === "jobs" ? "Applicant" : "Child"}</th>
                <th>{tab === "jobs" ? "Position" : "Class"}</th>
                <th>Received</th>
                <th>Files</th>
                <th>Stage</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => (
                <tr key={row.message.id} className={row.message.status === "new" ? "is-new" : undefined}>
                  <td>
                    <Link href={`/admin/inbox/${row.message.id}`}>
                      <b>{row.who}</b>
                    </Link>
                    <div className="adm-muted adm-small">{row.contact}</div>
                  </td>
                  <td>{row.group}</td>
                  <td>{formatDate(row.message.created_at)}</td>
                  <td>{row.files || <span className="adm-muted">—</span>}</td>
                  <td>
                    <span className={`adm-pill ${STAGE_PILL[row.stage] ?? ""}`} style={{ marginBottom: 6 }}>
                      {row.stage}
                    </span>
                    <StageSelect
                      action={setStageAction}
                      id={row.message.id}
                      stage={row.stage}
                      stages={stages}
                      back={here}
                      label={`Stage for ${row.who}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
