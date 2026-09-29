import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import PostBody from "@/components/sections/blog/PostBody";
import Container from "@/components/ui/Container";
import UploadForm, { type UploadField } from "@/components/ui/UploadForm";
import { ACCEPTED_EXTENSIONS } from "@/lib/server/files";
import { isAccepting, lines, publicJob } from "@/lib/server/jobs";
import { site } from "@/lib/site";

/* Vacancies are managed in the staff portal, so each page is rendered per request. */
export const dynamic = "force-dynamic";

interface JobPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const job = publicJob((await params).slug);
  if (!job) return { title: "Vacancy not found" };
  return {
    title: `${job.title} — Careers`,
    description: job.summary || `${job.job_type} ${job.title} at ${site.name}, Kinyinya, Kigali.`,
    robots: isAccepting(job) ? undefined : { index: false, follow: true },
  };
}

const FIELDS: UploadField[] = [
  { name: "name", label: "Full name", type: "text", required: true, width: 50, autoComplete: "name" },
  { name: "email", label: "Email", type: "email", required: true, width: 50, autoComplete: "email" },
  { name: "phone", label: "Phone number", type: "tel", required: true, width: 50, autoComplete: "tel" },
  { name: "available", label: "When could you start?", type: "text", width: 50, placeholder: "e.g. January 2027" },
  { name: "experience", label: "Current role or experience", type: "text", placeholder: "e.g. Nursery teacher, 3 years" },
  { name: "letter", label: "Why you would like this position", type: "textarea", rows: 6 },
  {
    name: "files",
    label: "CV and supporting documents",
    type: "file",
    required: true,
    multiple: true,
    accept: ACCEPTED_EXTENSIONS,
    hint: "Your CV plus up to two more files (certificates, references). PDF, Word, JPG or PNG, 5 MB each.",
  },
  {
    name: "consent",
    label: `I agree to ${site.name} keeping my application and documents for recruitment`,
    type: "checkbox",
    required: true,
  },
];

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="job-page__section">
      <h2>{title}</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default async function JobPage({ params }: JobPageProps) {
  const job = publicJob((await params).slug);
  if (!job) notFound();
  const accepting = isAccepting(job);
  const facts: [string, string][] = [
    ["Type of work", job.job_type],
    ["Category", job.category],
    ["Class or department", job.department],
    ["Location", job.location || "Kinyinya, Kigali"],
    ["Start date", job.start_date],
    ["Salary", job.salary],
    [
      "Closing date",
      job.closing_date
        ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
            new Date(`${job.closing_date}T00:00:00Z`),
          )
        : "Open until filled",
    ],
  ];

  return (
    <article className="job-page">
      <Container className="job-page__inner">
        <Link href="/careers#vacancies" className="job-page__back">
          ← All vacancies
        </Link>
        <h1 className="job-page__title">{job.title}</h1>
        {!accepting ? <p className="job-page__closed">This vacancy is closed and no longer accepting applications.</p> : null}

        <dl className="job-page__facts">
          {facts
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
        </dl>

        {job.summary ? <p className="job-page__summary">{job.summary}</p> : null}
        {job.description ? (
          <section className="job-page__section">
            <h2>About the role</h2>
            <PostBody text={job.description} />
          </section>
        ) : null}
        <List title="Responsibilities" items={lines(job.responsibilities)} />
        <List title="Requirements" items={lines(job.requirements)} />

        {accepting ? (
          <section className="job-page__section job-page__apply" id="apply">
            <h2>Apply for this position</h2>
            {job.how_to_apply ? <p>{job.how_to_apply}</p> : null}
            <UploadForm
              endpoint="/api/careers/apply"
              name={`Apply: ${job.title}`}
              hidden={{ job: String(job.id) }}
              fields={FIELDS}
              submitLabel="Send my application"
              successMessage={`Thank you — your application for ${job.title} has reached ${site.name}. We will contact shortlisted candidates.`}
            />
          </section>
        ) : null}
      </Container>
    </article>
  );
}
