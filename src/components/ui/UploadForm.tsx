"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";

export interface UploadField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "select" | "textarea" | "checkbox" | "file" | "heading";
  required?: boolean;
  width?: 50 | 100;
  options?: string[];
  placeholder?: string;
  rows?: number;
  autoComplete?: string;
  /** File fields: accepted extensions, several files allowed. */
  accept?: string;
  multiple?: boolean;
  hint?: string;
}

export interface UploadFormProps {
  /** Route handler that receives the multipart form. */
  endpoint: string;
  /** Accessible name of the form. */
  name: string;
  fields: UploadField[];
  /** Values sent with every submission (e.g. the vacancy id). */
  hidden?: Record<string, string>;
  submitLabel: string;
  successMessage: string;
}

/**
 * An application form with file attachments — used for job and student
 * applications. Styled with the site's shared `w-form` classes; validation is
 * the browser's own, and the server's message is shown if it refuses the form.
 */
export default function UploadForm({ endpoint, name, fields, hidden = {}, submitLabel, successMessage }: UploadFormProps) {
  const uid = useId();
  const [status, setStatus] = useState<"idle" | "pending" | "success">("idle");
  const [error, setError] = useState("");
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "pending") return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setError("");
    setStatus("pending");
    try {
      const response = await fetch(endpoint, { method: "POST", body: new FormData(form) });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || "The application could not be sent. Please try again.");
      setStatus("success");
    } catch (submitError) {
      setStatus("idle");
      setError(submitError instanceof Error ? submitError.message : String(submitError));
      window.setTimeout(() => errorRef.current?.focus(), 0);
    }
  };

  if (status === "success") {
    return (
      <div className="w-form" aria-live="polite">
        <div className="w-form__success" tabIndex={-1} ref={successRef}>
          <p>{successMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-form">
      <form aria-label={name} onSubmit={(event) => void onSubmit(event)} encType="multipart/form-data">
        {Object.entries(hidden).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
          <label>
            Company
            <input name="company" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        {error ? (
          <p className="w-form__summary" role="alert" tabIndex={-1} ref={errorRef}>
            {error}
          </p>
        ) : null}

        <div className="w-form__grid">
          {fields.map((field) => {
            const id = `${uid}-${field.name}`;
            const wrapper = `w-form__field w-form__field--${field.width ?? 100}`;
            const label = (
              <>
                {field.label}
                {field.required ? (
                  <span className="w-form__required" aria-hidden="true">
                    {" *"}
                  </span>
                ) : null}
              </>
            );

            if (field.type === "heading") {
              return (
                <div key={field.name} className="w-form__field w-form__field--100">
                  <h3 className="w-form__heading">{field.label}</h3>
                </div>
              );
            }
            if (field.type === "checkbox") {
              return (
                <div key={field.name} className={wrapper}>
                  <div className="w-form__check">
                    <input id={id} name={field.name} type="checkbox" required={field.required} />
                    <label htmlFor={id}>{label}</label>
                  </div>
                </div>
              );
            }
            return (
              <div key={field.name} className={wrapper}>
                <label htmlFor={id} className="w-form__label">
                  {label}
                </label>
                {field.type === "textarea" ? (
                  <textarea id={id} name={field.name} className="w-form__control" rows={field.rows ?? 5} required={field.required} placeholder={field.placeholder} />
                ) : field.type === "select" ? (
                  <select id={id} name={field.name} className="w-form__control" required={field.required} defaultValue="">
                    <option value="" disabled>
                      {field.placeholder ?? "Choose…"}
                    </option>
                    {(field.options ?? []).map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={id}
                    name={field.name}
                    type={field.type}
                    className="w-form__control"
                    required={field.required}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    accept={field.accept}
                    multiple={field.multiple}
                    aria-describedby={field.hint ? `${id}-hint` : undefined}
                  />
                )}
                {field.hint ? (
                  <small id={`${id}-hint`} className="w-form__hint">
                    {field.hint}
                  </small>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="w-form__actions w-form__actions--stretch">
          <button type="submit" className="w-form__submit" disabled={status === "pending"}>
            {status === "pending" ? "Sending…" : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
