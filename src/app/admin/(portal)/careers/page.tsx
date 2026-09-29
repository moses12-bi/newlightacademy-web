import Link from "next/link";

import Flash from "@/components/admin/Flash";
import { formatDate } from "@/lib/admin/format";
import { isAccepting, listJobs } from "@/lib/server/jobs";
import { requireUser } from "@/lib/server/auth";

export const metadata = { title: "Careers" };

export default async function CareersAdmin({ searchParams }: PageProps<"/admin/careers">) {
  await requireUser();
  const params = await searchParams;
  const jobs = listJobs();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Careers</h1>
          <p>
            Vacancies published on <a href="/careers" target="_blank" rel="noreferrer">/careers</a>. Applications arrive in the Inbox with
            the applicant&apos;s CV.
          </p>
        </div>
        <Link href="/admin/careers/new" className="adm-btn">
          New vacancy
        </Link>
      </div>
      <Flash ok={params.ok} error={params.error} />
      {jobs.length === 0 ? (
        <div className="adm-card adm-empty">No vacancies yet. The careers page says there are no open positions until one is published.</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Vacancy</th>
                <th>Type</th>
                <th>Status</th>
                <th>Closes</th>
                <th>Applications</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const accepting = isAccepting(job);
                const expired = job.status === "open" && !accepting;
                return (
                  <tr key={job.id}>
                    <td>
                      <Link href={`/admin/careers/${job.id}`}>
                        <b>{job.title}</b>
                      </Link>
                      <div className="adm-muted adm-small">{[job.category, job.department].filter(Boolean).join(" · ")}</div>
                    </td>
                    <td>{job.job_type}</td>
                    <td>
                      {accepting ? (
                        <span className="adm-pill adm-pill--ok">Open</span>
                      ) : expired ? (
                        <span className="adm-pill adm-pill--warn">Past closing date</span>
                      ) : job.status === "closed" ? (
                        <span className="adm-pill">Closed</span>
                      ) : (
                        <span className="adm-pill">Draft</span>
                      )}
                    </td>
                    <td>{job.closing_date ? formatDate(`${job.closing_date}T12:00:00Z`) : "Until filled"}</td>
                    <td>
                      {job.applications > 0 ? (
                        <Link href={`/admin/inbox?job=${job.id}`}>{job.applications}</Link>
                      ) : (
                        <span className="adm-muted">0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
