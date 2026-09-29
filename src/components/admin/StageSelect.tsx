"use client";

import { useRef } from "react";

/** A stage dropdown that saves as soon as it changes. */
export default function StageSelect({
  action,
  id,
  stage,
  stages,
  back,
  label,
}: {
  action: (form: FormData) => Promise<void>;
  id: number;
  stage: string;
  stages: string[];
  back: string;
  label: string;
}) {
  const form = useRef<HTMLFormElement>(null);
  return (
    <form action={action} ref={form}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="back" value={back} />
      <select
        name="stage"
        aria-label={label}
        defaultValue={stage || "New"}
        onChange={() => form.current?.requestSubmit()}
        style={{ minWidth: 170 }}
      >
        {stages.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <noscript>
        <button type="submit">Save</button>
      </noscript>
    </form>
  );
}
