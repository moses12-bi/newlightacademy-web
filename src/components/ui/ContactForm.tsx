"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";

export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "textarea"
  | "select"
  | "date"
  | "time"
  | "number"
  | "checkbox"
  /** Elementor's `html` field: a sub-heading inside the grid. */
  | "heading";

/** Elementor column widths, as `elementor-col-*`. */
export type FormFieldWidth = 25 | 33 | 50 | 66 | 75 | 100;

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  autoComplete?: string;
  width?: FormFieldWidth;
  /**
   * The saved forms often show only a placeholder. The label is still rendered
   * for screen readers, just visually hidden.
   */
  labelHidden?: boolean;
  rows?: number;
  /** First `<option>`, rendered with an empty value so a required select validates. */
  placeholderOption?: string;
  headingLevel?: "h2" | "h3" | "h4";
}

export interface ContactFormProps {
  fields: FormField[];
  submitLabel: string;
  className?: string;
  successMessage?: ReactNode;
  /** Accessible name for the form, from the saved `<form aria-label>`. */
  name?: string;
  submitAlign?: "start" | "center" | "stretch";
  /**
   * Which inbox queue the submission lands in (`/api/forms`): "contact", "tour",
   * "apply", "payment", "visit", "newsletter" or "review".
   */
  formId?: string;
}

type Values = Record<string, string | boolean>;
type Errors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEL = /^[+()\d][\d\s().-]{5,}$/;

const DEFAULT_SUCCESS =
  "Thank you — your message has reached the school office. We will be in touch soon.";

function isControl(field: FormField): boolean {
  return field.type !== "heading";
}

function validateField(field: FormField, value: string | boolean): string {
  if (field.type === "heading") return "";
  if (field.type === "checkbox") {
    return field.required && value !== true ? `${field.label} is required.` : "";
  }
  const text = typeof value === "string" ? value.trim() : "";
  if (field.required && text === "") return `${field.label} is required.`;
  if (text === "") return "";
  if (field.type === "email" && !EMAIL.test(text)) {
    return "Enter an email address in the form name@example.com.";
  }
  if (field.type === "tel" && !TEL.test(text)) {
    return "Enter a phone number using digits, spaces, brackets, + or -.";
  }
  return "";
}

/**
 * The shared Elementor `form`, rebuilt as a data-driven React form.
 *
 * A valid submission is posted to `/api/forms`, which files it in the staff
 * portal's Inbox and emails the school office. The success panel only appears
 * once the server has accepted it; a failure keeps the form and says so. Every control has a real `<label for>`, errors are announced through
 * aria-describedby with aria-invalid on the control, and focus moves to the
 * first invalid control on a failed submit.
 */
export default function ContactForm({
  fields,
  submitLabel,
  className,
  successMessage,
  name,
  submitAlign = "start",
  formId = "contact",
}: ContactFormProps) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "pending" | "success">("idle");
  const [summary, setSummary] = useState<string>("");
  /* Honeypot, hidden from people; a bot that fills it is quietly ignored. */
  const [company, setCompany] = useState("");
  const successRef = useRef<HTMLDivElement>(null);

  /* Move focus to the confirmation once, when it appears — an inline ref
     callback would re-fire on every later render of the surrounding section. */
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const fieldId = (fieldName: string): string => `${uid}-${fieldName}`;
  const errorId = (fieldName: string): string => `${uid}-${fieldName}-error`;

  const setValue = (field: FormField, value: string | boolean): void => {
    setValues((current) => ({ ...current, [field.name]: value }));
    /* Re-validate only once a field has already errored, so the first attempt is
       not punished mid-typing. */
    setErrors((current) => {
      if (!current[field.name]) return current;
      const message = validateField(field, value);
      const next = { ...current };
      if (message) next[field.name] = message;
      else delete next[field.name];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (status === "pending") return;

    const nextErrors: Errors = {};
    for (const field of fields) {
      if (!isControl(field)) continue;
      const message = validateField(field, values[field.name] ?? (field.type === "checkbox" ? false : ""));
      if (message) nextErrors[field.name] = message;
    }
    setErrors(nextErrors);

    const firstInvalid = fields.find((field) => nextErrors[field.name]);
    if (firstInvalid) {
      const count = Object.keys(nextErrors).length;
      setSummary(
        count === 1
          ? "One field needs your attention."
          : `${count} fields need your attention.`,
      );
      const node = formRef.current?.elements.namedItem(firstInvalid.name);
      if (node instanceof HTMLElement) node.focus();
      return;
    }

    setSummary("");
    setStatus("pending");

    /* Keyed by the visible label, so the office reads "Email", not "field_4". */
    const payload: Record<string, string | boolean> = {};
    for (const field of fields) {
      if (!isControl(field)) continue;
      payload[field.label] = values[field.name] ?? (field.type === "checkbox" ? false : "");
    }

    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form: formId, values: payload, company }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "");
      }
      setStatus("success");
    } catch (error) {
      setStatus("idle");
      setSummary(
        (error instanceof Error && error.message) ||
          "Your message could not be sent. Please check your connection and try again, or contact the school directly.",
      );
    }
  };

  return (
    <div className={["w-form", className].filter(Boolean).join(" ")}>
      <div aria-live="polite">
        {status === "success" ? (
          <div className="w-form__success" tabIndex={-1} ref={successRef}>
            <p>{successMessage ?? DEFAULT_SUCCESS}</p>
          </div>
        ) : null}
      </div>

      {status === "success" ? null : (
        <form ref={formRef} aria-label={name} noValidate onSubmit={(event) => void handleSubmit(event)}>
          <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
            <label>
              Company
              <input tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} />
            </label>
          </div>
          {summary ? (
            <p className="w-form__summary" role="alert">
              {summary}
            </p>
          ) : null}

          <div className="w-form__grid">
            {fields.map((field) => {
              const width = field.width ?? 100;
              const wrapperClass = `w-form__field w-form__field--${width}`;

              if (field.type === "heading") {
                const HeadingTag = field.headingLevel ?? "h3";
                return (
                  <div className={wrapperClass} key={field.name}>
                    <HeadingTag className="w-form__heading">{field.label}</HeadingTag>
                  </div>
                );
              }

              const error = errors[field.name];
              const described = error ? errorId(field.name) : undefined;
              const id = fieldId(field.name);
              const labelText = (
                <>
                  {field.label}
                  {field.required ? (
                    <span className="w-form__required" aria-hidden="true">
                      {" *"}
                    </span>
                  ) : null}
                </>
              );

              if (field.type === "checkbox") {
                const checked = values[field.name] === true;
                return (
                  <div className={wrapperClass} key={field.name}>
                    <div className="w-form__check">
                      <input
                        id={id}
                        name={field.name}
                        type="checkbox"
                        checked={checked}
                        required={field.required}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={described}
                        onChange={(event) => setValue(field, event.target.checked)}
                      />
                      <label htmlFor={id}>{labelText}</label>
                    </div>
                    {error ? (
                      <span className="w-form__error" id={errorId(field.name)}>
                        {error}
                      </span>
                    ) : null}
                  </div>
                );
              }

              const value = typeof values[field.name] === "string" ? (values[field.name] as string) : "";

              return (
                <div className={wrapperClass} key={field.name}>
                  <label htmlFor={id} className={field.labelHidden ? "sr-only" : "w-form__label"}>
                    {labelText}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      id={id}
                      name={field.name}
                      className="w-form__control"
                      rows={field.rows ?? 5}
                      placeholder={field.placeholder}
                      required={field.required}
                      autoComplete={field.autoComplete}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={described}
                      value={value}
                      onChange={(event) => setValue(field, event.target.value)}
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={id}
                      name={field.name}
                      className="w-form__control"
                      required={field.required}
                      autoComplete={field.autoComplete}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={described}
                      value={value}
                      onChange={(event) => setValue(field, event.target.value)}
                    >
                      {field.placeholderOption ? (
                        <option value="">{field.placeholderOption}</option>
                      ) : null}
                      {(field.options ?? []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={id}
                      name={field.name}
                      type={field.type}
                      className="w-form__control"
                      placeholder={field.placeholder}
                      required={field.required}
                      autoComplete={field.autoComplete}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={described}
                      value={value}
                      onChange={(event) => setValue(field, event.target.value)}
                    />
                  )}

                  {error ? (
                    <span className="w-form__error" id={errorId(field.name)}>
                      {error}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className={`w-form__actions w-form__actions--${submitAlign}`}>
            <button type="submit" className="w-form__submit" disabled={status === "pending"}>
              {status === "pending" ? "Checking…" : submitLabel}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
