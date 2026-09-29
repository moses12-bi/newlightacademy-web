import { headers } from "next/headers";
import Link from "next/link";

import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import Flash from "@/components/admin/Flash";
import { callbackPath, PROVIDER_FOR } from "@/lib/server/oauth";
import { siteUrl } from "@/lib/server/settings";
import { describeAccounts, PLATFORM_LABELS, PLATFORMS, platformStatus } from "@/lib/server/social";

import { disconnectAction } from "../../../actions";
import { requireUser } from "@/lib/server/auth";

export const metadata = { title: "Social accounts" };

const PROVIDER_TEXT = {
  meta: { button: "Connect Facebook & Instagram", where: "Meta app → Facebook Login → Settings → Valid OAuth Redirect URIs" },
  google: { button: "Connect YouTube", where: "Google Cloud Console → Credentials → OAuth client → Authorised redirect URIs" },
  tiktok: { button: "Connect TikTok", where: "TikTok developer portal → Login Kit → Redirect URI" },
} as const;

export default async function AccountsPage({ searchParams }: PageProps<"/admin/social/accounts">) {
  await requireUser();
  const params = await searchParams;
  const host = (await headers()).get("host");
  const origin = siteUrl(host ? `${host.startsWith("localhost") ? "http" : "https"}://${host}` : undefined);
  const accounts = await describeAccounts();

  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/social" className="adm-small">
            ← Social media
          </Link>
          <h1>Social accounts</h1>
          <p>Which of the school&apos;s accounts the portal can post to.</p>
        </div>
      </div>
      <Flash ok={params.ok} error={params.error} />

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Network</th>
              <th>Status</th>
              <th>Account</th>
            </tr>
          </thead>
          <tbody>
            {PLATFORMS.map((platform) => {
              const status = platformStatus(platform);
              const account = accounts[platform];
              return (
                <tr key={platform}>
                  <td>
                    <b>{PLATFORM_LABELS[platform]}</b>
                  </td>
                  <td>
                    {!status.configured ? (
                      <span className="adm-pill adm-pill--warn">Not connected</span>
                    ) : account.ok ? (
                      <span className="adm-pill adm-pill--ok">Connected</span>
                    ) : (
                      <span className="adm-pill adm-pill--bad">Error</span>
                    )}
                  </td>
                  <td className="adm-small">
                    {status.configured ? account.text : <span className="adm-muted">Missing: {status.missing.join(", ")}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="adm-grid" style={{ marginTop: 16 }}>
        {(["meta", "google", "tiktok"] as const).map((provider) => {
          const platforms = PLATFORMS.filter((platform) => PROVIDER_FOR[platform] === provider);
          const connected = platforms.some((platform) => platformStatus(platform).configured);
          return (
            <section key={provider} className="adm-card adm-stack">
              <h2>{platforms.map((platform) => PLATFORM_LABELS[platform]).join(" & ")}</h2>
              <p className="adm-small adm-muted">
                Redirect URI to register ({PROVIDER_TEXT[provider].where}):
              </p>
              <p>
                <span className="adm-code">
                  {origin}
                  {callbackPath(provider)}
                </span>
              </p>
              <div className="adm-actions">
                <a href={`/api/admin/oauth/${provider}/start`} className="adm-btn">
                  {connected ? "Reconnect" : PROVIDER_TEXT[provider].button}
                </a>
                {connected ? (
                  <form action={disconnectAction}>
                    <input type="hidden" name="provider" value={provider} />
                    <ConfirmSubmit message="Disconnect this account from the portal?">Disconnect</ConfirmSubmit>
                  </form>
                ) : null}
              </div>
              <p className="adm-small adm-muted">
                App keys are entered under <Link href={`/admin/settings#${provider}`}>Settings → Integrations</Link>.
              </p>
            </section>
          );
        })}
      </div>
    </>
  );
}
