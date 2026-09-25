"use client";

import { startTransition, useActionState } from "react";
import type { FormEvent, ReactNode } from "react";

export type FormAction = (previous: string | null, form: FormData) => Promise<string | null>;

/**
 * A form bound to a Server Action that returns an error message (or redirects
 * on success). Submitting through `onSubmit` rather than `<form action>` keeps
 * what the user typed when the action reports a problem — React resets a form
 * after an `action` submission.
 */
export default function ActionForm({
  action,
  submitLabel,
  pendingLabel = "Working…",
  children,
  className = "adm-form",
  extraButtons,
  confirm,
}: {
  action: FormAction;
  submitLabel: string;
  pendingLabel?: string;
  children: ReactNode;
  className?: string;
  extraButtons?: ReactNode;
  confirm?: string;
}) {
  const [error, formAction, pending] = useActionState(action, null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (confirm && !window.confirm(confirm)) return;
    const data = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.name) data.set(submitter.name, submitter.value);
    startTransition(() => formAction(data));
  };

  return (
    <form className={className} onSubmit={onSubmit} noValidate>
      {error ? (
        <p role="alert" className="adm-flash adm-flash--error">
          {error}
        </p>
      ) : null}
      {children}
      <div className="adm-actions">
        <button type="submit" className="adm-btn" disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </button>
        {extraButtons}
      </div>
    </form>
  );
}
