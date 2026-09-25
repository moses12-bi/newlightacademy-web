import Link from "next/link";

import Flash from "@/components/admin/Flash";
import { SETTING_GROUPS, SETTINGS, getSetting, settingSource } from "@/lib/server/settings";

import { saveSettingsAction, testEmailAction } from "../../actions";

export const metadata = { title: "Settings" };

const SOURCE_TEXT = { portal: "set here", env: "from server environment", unset: "not set" } as const;

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  const params = await searchParams;

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Settings</h1>
          <p>Connections to email, media storage and the social networks. Secrets are stored encrypted.</p>
        </div>
        <Link href="/admin/settings/users" className="adm-btn adm-btn--ghost">
          Staff accounts
        </Link>
      </div>
      <Flash ok={params.ok} error={params.error} />

      <div className="adm-stack">
        {SETTING_GROUPS.map((group) => (
          <section key={group.id} id={group.id} className="adm-card adm-stack" style={{ scrollMarginTop: 16 }}>
            <h2>{group.title}</h2>
            <p className="adm-small adm-muted">{group.intro}</p>
            <form action={saveSettingsAction} className="adm-form">
              <input type="hidden" name="group" value={group.id} />
              <div className="adm-row">
                {SETTINGS.filter((def) => def.group === group.id).map((def) => {
                  const source = settingSource(def.key);
                  const value = def.secret ? "" : getSetting(def.key);
                  return (
                    <div key={def.key} className="adm-field">
                      <label htmlFor={`s-${def.key}`} className="adm-label">
                        {def.label}
                      </label>
                      <input
                        id={`s-${def.key}`}
                        type={def.secret ? "password" : "text"}
                        name={def.key}
                        defaultValue={source === "portal" ? value : ""}
                        placeholder={
                          def.secret
                            ? source === "unset"
                              ? "not set"
                              : "•••••••• (leave blank to keep)"
                            : source === "env"
                              ? value
                              : def.placeholder
                        }
                        autoComplete="off"
                      />
                      <small>
                        <span className={`adm-pill ${source === "unset" ? "" : "adm-pill--ok"}`}>{SOURCE_TEXT[source]}</span>{" "}
                        <span className="adm-code">{def.key}</span>
                        {def.help ? <> — {def.help}</> : null}
                      </small>
                      {def.secret && source === "portal" ? (
                        <label className="adm-check adm-small">
                          <input type="checkbox" name={`clear_${def.key}`} /> Clear
                        </label>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <div className="adm-actions">
                <button type="submit" className="adm-btn">
                  Save {group.title.split(" ")[0].toLowerCase()} settings
                </button>
              </div>
            </form>
            {group.id === "email" ? (
              <form action={testEmailAction} className="adm-actions">
                <input type="email" name="to" placeholder="Send a test to… (defaults to you)" style={{ maxWidth: 320 }} />
                <button type="submit" className="adm-btn adm-btn--ghost">
                  Send test email
                </button>
              </form>
            ) : null}
          </section>
        ))}
      </div>
    </>
  );
}
