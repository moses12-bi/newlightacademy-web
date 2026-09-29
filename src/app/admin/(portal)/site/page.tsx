import ActionForm from "@/components/admin/ActionForm";
import Flash from "@/components/admin/Flash";
import { SOCIAL_NETWORKS, siteDetails } from "@/lib/server/site-details";
import { socialByIcon } from "@/lib/site";

import { saveSiteDetailsAction } from "../../actions";
import { requireUser } from "@/lib/server/auth";

export const metadata = { title: "School details" };

export default async function SiteDetailsPage({ searchParams }: PageProps<"/admin/site">) {
  await requireUser();
  const params = await searchParams;
  const info = siteDetails();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>School details</h1>
          <p>Contact details and social media links shown in the header, footer and contact sections of every page.</p>
        </div>
      </div>
      <Flash ok={params.ok} error={params.error} />

      <section className="adm-card" style={{ maxWidth: 820 }}>
        <ActionForm action={saveSiteDetailsAction} submitLabel="Save details" pendingLabel="Saving…">
          <h2>Contact</h2>
          <div className="adm-row">
            <label className="adm-field">
              <span>Phone</span>
              <input type="text" name="phone" defaultValue={info.phone} placeholder="+250 788 000 000" />
              <small>Leave empty to hide the phone number everywhere.</small>
            </label>
            <label className="adm-field">
              <span>Email</span>
              <input type="email" name="email" defaultValue={info.email} />
              <small>Also where website enquiries are sent, unless set otherwise in Settings.</small>
            </label>
          </div>

          <h2 style={{ marginTop: 8 }}>Address</h2>
          <div className="adm-row">
            <label className="adm-field">
              <span>Address, first line</span>
              <input type="text" name="address1" defaultValue={info.addressLines[0] ?? ""} />
            </label>
            <label className="adm-field">
              <span>Address, second line</span>
              <input type="text" name="address2" defaultValue={info.addressLines[1] ?? ""} />
            </label>
          </div>
          <label className="adm-field">
            <span>Directions</span>
            <input type="text" name="addressDetail" defaultValue={info.addressDetail} />
            <small>A landmark parents can find the school by. Shown on the home, location and contact sections.</small>
          </label>

          <h2 style={{ marginTop: 8 }}>Social media</h2>
          <p className="adm-small adm-muted">
            Only accounts that belong to the school. An empty box hides that network&apos;s icon from the footer.
          </p>
          <div className="adm-row">
            {SOCIAL_NETWORKS.map((network) => (
              <label key={network.icon} className="adm-field">
                <span>{network.label}</span>
                <input
                  type="url"
                  name={`social_${network.icon}`}
                  defaultValue={socialByIcon(network.icon, info)?.href ?? ""}
                  placeholder={network.placeholder}
                />
              </label>
            ))}
          </div>
        </ActionForm>
      </section>
    </>
  );
}
