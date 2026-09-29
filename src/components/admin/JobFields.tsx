import type { JobRow } from "@/lib/server/jobs";

/** The vacancy form fields; rendered inside an ActionForm on the new and edit pages. */
export default function JobFields({
  job,
  types,
  categories,
}: {
  job?: JobRow;
  types: readonly string[];
  categories: readonly string[];
}) {
  return (
    <div className="adm-grid-2">
      <div className="adm-form">
        {job ? <input type="hidden" name="id" value={job.id} /> : null}
        <label className="adm-field">
          <span>Job title</span>
          <input type="text" name="title" defaultValue={job?.title} required maxLength={160} placeholder="e.g. Nursery Teacher (Baby Class)" />
        </label>
        <label className="adm-field">
          <span>Summary</span>
          <textarea name="summary" rows={3} defaultValue={job?.summary} maxLength={600} />
          <small>One or two sentences, shown in the list of vacancies.</small>
        </label>
        <label className="adm-field">
          <span>About the role</span>
          <textarea name="description" rows={8} defaultValue={job?.description} />
          <small>Leave a blank line between paragraphs.</small>
        </label>
        <label className="adm-field">
          <span>Responsibilities</span>
          <textarea name="responsibilities" rows={7} defaultValue={job?.responsibilities} placeholder={"Plan and teach daily lessons\nKeep parents informed of progress"} />
          <small>One per line.</small>
        </label>
        <label className="adm-field">
          <span>Requirements</span>
          <textarea
            name="requirements"
            rows={7}
            defaultValue={job?.requirements}
            placeholder={"A2 or A1 in Education (Early Childhood)\nAt least 2 years' teaching experience\nFluent English and Kinyarwanda"}
          />
          <small>Qualifications, experience, languages, documents — one per line. Required before publishing.</small>
        </label>
        <label className="adm-field">
          <span>How to apply</span>
          <textarea
            name="how_to_apply"
            rows={3}
            defaultValue={job?.how_to_apply}
            placeholder="Apply with the form below: attach your CV and copies of your certificates."
          />
          <small>Shown above the application form. Mention any documents you need.</small>
        </label>
      </div>
      <div className="adm-form">
        <label className="adm-field">
          <span>Status</span>
          <select name="status" defaultValue={job?.status ?? "draft"}>
            <option value="draft">Draft — not on the website</option>
            <option value="open">Open — accepting applications</option>
            <option value="closed">Closed — shown as closed</option>
          </select>
        </label>
        <label className="adm-field">
          <span>Type of work</span>
          <select name="job_type" defaultValue={job?.job_type ?? "Full-time"}>
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label className="adm-field">
          <span>Category</span>
          <select name="category" defaultValue={job?.category ?? "Teaching"}>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="adm-field">
          <span>Class or department</span>
          <input type="text" name="department" defaultValue={job?.department} placeholder="e.g. Nursery, P4–P6, Office" />
        </label>
        <label className="adm-field">
          <span>Closing date</span>
          <input type="date" name="closing_date" defaultValue={job?.closing_date} />
          <small>Applications stop after this day. Empty = open until filled.</small>
        </label>
        <label className="adm-field">
          <span>Start date</span>
          <input type="text" name="start_date" defaultValue={job?.start_date} placeholder="e.g. January 2027, or As soon as possible" />
        </label>
        <label className="adm-field">
          <span>Location</span>
          <input type="text" name="location" defaultValue={job?.location} placeholder="Kinyinya, Kigali" />
        </label>
        <label className="adm-field">
          <span>Salary (optional)</span>
          <input type="text" name="salary" defaultValue={job?.salary} placeholder="Leave empty to not publish it" />
        </label>
        <label className="adm-field">
          <span>Web address</span>
          <input type="text" name="slug" defaultValue={job?.slug} placeholder="made from the title" />
          <small>newlight-academy.rw/careers/…</small>
        </label>
      </div>
    </div>
  );
}
