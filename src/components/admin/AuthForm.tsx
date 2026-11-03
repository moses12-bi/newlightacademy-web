"use client";

import { startTransition, useActionState } from "react";
import type { ReactNode } from "react";

/**
 * The form on the sign-in, invitation, forgot and reset pages. Submits through
 * `onSubmit` so a mistake does not clear what was typed. When the action
 * returns `done`, `doneMessage` replaces the form.
 */
export default function AuthForm({
  action,
  submitLabel,
  pendingLabel = "Working…",
  doneMessage,
  children,
}: {
  action: (previous: string | null, form: FormData) => Promise<string | null>;
  submitLabel: string;
  pendingLabel?: string;
  doneMessage?: ReactNode;
  children: ReactNode;
}) {
  const [result, formAction, pending] = useActionState(action, null);
  if (result === "sent" && doneMessage) {
    return (
      <div role="status" className="adm-flash adm-flash--ok">
        {doneMessage}
      </div>
    );
  }
  return (
    <form
      className="adm-form"
      /* `action` makes the form work before the page's script has loaded (a slow
         connection); once it has, onSubmit takes over and keeps what was typed. */
      action={formAction}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      {result && result !== "sent" ? (
        <p role="alert" className="adm-flash adm-flash--error">
          {result}
        </p>
      ) : null}
      {children}
      <button type="submit" className="adm-btn" disabled={pending}>
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
