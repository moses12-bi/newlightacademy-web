/** The emails behind invitations and password resets. */
import { site } from "@/lib/site";

import { ROLES, type Role } from "./auth";
import { mailConfigured, sendMail } from "./mail";
import { siteUrl } from "./settings";

export function inviteLink(token: string, origin?: string): string {
  return `${siteUrl(origin)}/admin/invite/${token}`;
}

export function resetLink(token: string, origin?: string): string {
  return `${siteUrl(origin)}/admin/reset/${token}`;
}

export async function sendInvitation(input: {
  email: string;
  name: string;
  role: Role;
  invitedBy: string;
  link: string;
  sentBy: number;
}): Promise<{ ok: boolean; error?: string }> {
  if (!mailConfigured()) return { ok: false, error: "Email is not set up (Settings → Integrations → Email)." };
  const roleLabel = ROLES.find((role) => role.id === input.role)?.label ?? input.role;
  return sendMail({
    to: input.email,
    subject: `You're invited to the ${site.name} staff portal`,
    text: `Hello${input.name ? ` ${input.name}` : ""},

${input.invitedBy} has invited you to the ${site.name} staff portal as ${roleLabel}. The portal is where the school updates its website — news, photos, vacancies and applications — and its social media.

Choose your password and sign in here:
${input.link}

This link works once and expires in 7 days. If you were not expecting it, you can ignore this email.

${site.name}`,
    sentBy: input.sentBy,
  });
}

export async function sendResetEmail(input: { email: string; name: string; link: string }): Promise<{ ok: boolean; error?: string }> {
  if (!mailConfigured()) return { ok: false, error: "Email is not set up." };
  return sendMail({
    to: input.email,
    subject: `Reset your ${site.name} staff portal password`,
    text: `Hello ${input.name},

Someone asked to reset the password for your ${site.name} staff portal account. To choose a new password, open:
${input.link}

This link works once and expires in 1 hour. If you did not ask for this, ignore this email — your password stays the same.

${site.name}`,
  });
}
