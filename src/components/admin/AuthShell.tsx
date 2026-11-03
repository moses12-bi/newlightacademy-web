import Image from "next/image";
import type { ReactNode } from "react";

import { site } from "@/lib/site";

/** The centred card used by sign-in, invitation and password reset pages. */
export default function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="adm-login">
      <div className="adm-card adm-stack">
        <div className="adm-actions">
          <Image src="/images/fox-color.svg" alt="" width={48} height={44} unoptimized />
          <div>
            <h1>{title}</h1>
            <p className="adm-muted">{site.name} staff portal</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
