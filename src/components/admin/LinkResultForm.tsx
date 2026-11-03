"use client";

import { useActionState, useState } from "react";
import type { ReactNode } from "react";

import type { InviteResult } from "@/app/admin/actions";

/**
 * A form whose action may hand back a one-time link (an invitation or a
 * password reset) when the email could not be sent, so the administrator can
 * pass it on by hand. The link is shown once and never stored in the page URL.
 */
export default function LinkResultForm({
  action,
  submitLabel,
  pendingLabel = "Working…",
  children,
  className = "adm-form",
  buttonClass = "adm-btn",
}: {
  action: (previous: InviteResult | null, form: FormData) => Promise<InviteResult>;
  submitLabel: string;
  pendingLabel?: string;
  children?: ReactNode;
  className?: string;
  buttonClass?: string;
}) {
  const [result, formAction, pending] = useActionState(action, null);
  const [copied, setCopied] = useState(false);

  return (
    <form action={formAction} className={className}>
      {children}
      <div className="adm-actions">
        <button type="submit" className={buttonClass} disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </button>
      </div>
      {result?.error ? (
        <p role="alert" className="adm-flash adm-flash--error">
          {result.error}
        </p>
      ) : null}
      {result?.ok ? (
        <div role="status" className={`adm-flash ${result.link ? "adm-flash--warn" : "adm-flash--ok"}`}>
          <p>{result.ok}</p>
          {result.link ? (
            <div className="adm-actions" style={{ marginTop: 8 }}>
              <input type="text" readOnly value={result.link} onFocus={(event) => event.currentTarget.select()} aria-label="Link" />
              <button
                type="button"
                className="adm-btn adm-btn--ghost adm-btn--sm"
                onClick={() => {
                  void navigator.clipboard?.writeText(result.link!).then(() => setCopied(true));
                }}
              >
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
