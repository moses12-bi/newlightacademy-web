import Link from "next/link";

import Container from "@/components/ui/Container";
import type { JobRow } from "@/lib/server/jobs";

function closingText(date: string): string {
  if (!date) return "Open until filled";
  return `Apply by ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  )}`;
}

/** Open positions, published from the staff portal (Careers). */
export default function CareersVacancies({ jobs }: { jobs: JobRow[] }) {
  return (
    <section className="careers-vacancies" id="vacancies" aria-labelledby="vacancies-title">
      <Container>
        <h2 id="vacancies-title">Open positions</h2>
        {jobs.length === 0 ? (
          <p className="careers-vacancies__empty">
            There are no open positions at the moment. New vacancies are published here — please check back.
          </p>
        ) : (
          <ul className="careers-vacancies__list">
            {jobs.map((job) => (
              <li key={job.id}>
                <article className="job-card">
                  <p className="job-card__meta">
                    <span className="job-card__badge">{job.job_type}</span>
                    <span>{[job.category, job.department].filter(Boolean).join(" · ")}</span>
                  </p>
                  <h3 className="job-card__title">
                    <Link href={`/careers/${job.slug}`}>{job.title}</Link>
                  </h3>
                  {job.summary ? <p className="job-card__summary">{job.summary}</p> : null}
                  <p className="job-card__foot">
                    <span>{closingText(job.closing_date)}</span>
                    <Link href={`/careers/${job.slug}`} className="job-card__more" aria-label={`View and apply: ${job.title}`}>
                      View &amp; apply ➝
                    </Link>
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
