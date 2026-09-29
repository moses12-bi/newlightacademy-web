/** The one-line result banner Server Actions leave in `?ok=` / `?error=`. */
export default function Flash({ ok, error }: { ok?: string | string[]; error?: string | string[] }) {
  const pick = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);
  const good = pick(ok);
  const bad = pick(error);
  if (!good && !bad) return null;
  return (
    <p role={bad ? "alert" : "status"} className={`adm-flash adm-flash--${bad ? "error" : "ok"}`}>
      {bad ?? good}
    </p>
  );
}
