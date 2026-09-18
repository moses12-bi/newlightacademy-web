import { FacebookIcon } from "@/components/ui/icons";
import { site, socialByIcon } from "@/lib/site";

export interface FacebookShareLinkProps {
  className?: string;
  label: string;
}

/**
 * The saved markup hard-coded the original host's own Facebook address. No
 * Facebook page has been confirmed as this school's, so the link is looked up
 * in `site.socials` instead: when there is no confirmed account the component
 * renders nothing rather than send families to somebody else's page.
 */
export default function FacebookShareLink({ className, label }: FacebookShareLinkProps) {
  const account = socialByIcon("facebook");
  if (!account) return null;

  return (
    <a
      href={account.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${site.name} on Facebook (opens in a new tab)`}
      className={className}
    >
      <FacebookIcon className="h-5 w-5" />
      {label}
    </a>
  );
}
