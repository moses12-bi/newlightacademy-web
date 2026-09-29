"use client";

import { startTransition, useActionState } from "react";

import { loginAction } from "../actions";

export default function LoginForm({ next }: { next: string }) {
  const [error, action, pending] = useActionState(loginAction, null);
  return (
    /* onSubmit rather than `action`, so a failed attempt does not clear the email. */
    <form
      className="adm-form"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
    >
      {error ? (
        <p role="alert" className="adm-flash adm-flash--error">
          {error}
        </p>
      ) : null}
      <input type="hidden" name="next" value={next} />
      <label className="adm-field">
        <span>Email</span>
        <input type="email" name="email" autoComplete="username" required autoFocus />
      </label>
      <label className="adm-field">
        <span>Password</span>
        <input type="password" name="password" autoComplete="current-password" required />
      </label>
      <button type="submit" className="adm-btn" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
