"use client";

import type { ReactNode } from "react";

/** A submit button that asks first — for deletes and other one-way actions. */
export default function ConfirmSubmit({
  message,
  children,
  className = "adm-btn adm-btn--danger",
}: {
  message: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
