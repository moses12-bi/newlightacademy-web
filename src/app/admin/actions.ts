"use server";

/**
 * Every write the staff portal makes. Each action re-checks the session with
 * `requireUser()` — Server Actions are public HTTP endpoints, and the layout's
 * check does not protect them.
 */
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { kigaliLocalToIso } from "@/lib/admin/format";
import {
  createUser,
  deleteUser,
  loginThrottled,
  requireUser,
  setPassword,
  signIn,
  signOut,
} from "@/lib/server/auth";
import { verifyPassword } from "@/lib/server/crypto";
import { db, logActivity } from "@/lib/server/db";
import { sendMail, verifyMail } from "@/lib/server/mail";
import { getMessage, setMessageStatus, type MessageStatus } from "@/lib/server/messages";
import { createPost, deletePost, updatePost, type PostInput } from "@/lib/server/posts";
import { createReview, deleteReview, setReviewStatus, type ReviewStatus } from "@/lib/server/reviews";
import { addGalleryPhotos, moveGalleryPhoto, removeGalleryPhoto, updateGalleryAlt } from "@/lib/server/gallery";
import { cloudinaryCloud, withTransform } from "@/lib/server/media";
import { SETTINGS, setSetting, siteUrl } from "@/lib/server/settings";
import { saveSiteDetails, SOCIAL_NETWORKS } from "@/lib/server/site-details";
import { addStaff, moveStaff, removeStaff, updateStaff, type StaffInput } from "@/lib/server/staff";
import {
  cancelSocialPost,
  PLATFORMS,
  queueSocialPost,
  retrySocialPost,
  runDueSocialPosts,
  validateSocialPost,
  type MediaType,
  type Platform,
  type SocialJob,
} from "@/lib/server/social";

function str(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function withFlash(path: string, kind: "ok" | "error", message: string): string {
  const url = new URL(path, "http://portal.local");
  url.searchParams.set(kind, message);
  return `${url.pathname}${url.search}`;
}

function safeNext(next: string): string {
  return next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

/* ---------------------------------------------------------------- auth -- */

export async function loginAction(_prev: string | null, form: FormData): Promise<string | null> {
  const email = str(form, "email");
  const password = typeof form.get("password") === "string" ? (form.get("password") as string) : "";
  const ip = ((await headers()).get("x-forwarded-for") ?? "").split(",")[0].trim();
  const key = `${email.toLowerCase()}|${ip}`;
  if (loginThrottled(key)) return "Too many attempts. Wait 15 minutes and try again.";
  if (!email || !password || !(await signIn(email, password, key))) return "That email and password do not match.";
  redirect(safeNext(str(form, "next")));
}

export async function logoutAction(): Promise<void> {
  await signOut();
  redirect("/admin/login");
}

/** Every public page may show school details, gallery or staff: refresh them all. */
function refreshSite() {
  revalidatePath("/", "layout");
}

/** Only images uploaded to the school's own Cloudinary account are accepted. */
function isOwnUpload(url: string): boolean {
  const cloud = cloudinaryCloud();
  return !!cloud && url.startsWith(`https://res.cloudinary.com/${cloud}/image/upload/`);
}

/* ------------------------------------------------------- school details -- */

export async function saveSiteDetailsAction(_prev: string | null, form: FormData): Promise<string | null> {
  const user = await requireUser();
  const email = str(form, "email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "The email address does not look right.";
  const phone = str(form, "phone");
  if (phone && !/^[+()\d][\d\s().-]{5,}$/.test(phone)) return "Use digits, spaces, brackets, + or - in the phone number.";
  const socials: Record<string, string> = {};
  for (const { icon, label } of SOCIAL_NETWORKS) {
    const href = str(form, `social_${icon}`);
    if (href && !/^https:\/\/\S+$/.test(href)) return `The ${label} link must start with https://`;
    socials[icon] = href;
  }
  saveSiteDetails({
    phone,
    email,
    addressLines: [str(form, "address1"), str(form, "address2")],
    addressDetail: str(form, "addressDetail"),
    socials,
  });
  logActivity(user.id, "updated school details");
  refreshSite();
  redirect(withFlash("/admin/site", "ok", "Saved. The website shows the new details within a moment."));
}

/* -------------------------------------------------------------- gallery -- */

export async function addGalleryPhotosAction(
  photos: { url: string; width: number; height: number; alt: string }[],
  atStart: boolean,
): Promise<string | null> {
  const user = await requireUser();
  const clean = photos.slice(0, 50).filter((photo) => isOwnUpload(photo.url) && photo.width > 0 && photo.height > 0);
  if (clean.length === 0) return "No uploaded photos to add.";
  addGalleryPhotos(
    clean.map((photo) => ({ src: photo.url, width: photo.width, height: photo.height, alt: photo.alt.slice(0, 300) })),
    atStart,
  );
  logActivity(user.id, "added gallery photos", String(clean.length));
  refreshSite();
  return null;
}

export async function galleryPhotoAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(str(form, "id"));
  const op = str(form, "op");
  if (op === "alt") updateGalleryAlt(id, str(form, "alt").slice(0, 300));
  else if (op === "up" || op === "down") moveGalleryPhoto(id, op === "up" ? -1 : 1);
  else if (op === "remove") {
    removeGalleryPhoto(id);
    logActivity(user.id, "removed gallery photo", String(id));
  }
  refreshSite();
  redirect(withFlash(`/admin/gallery#photo-${id}`, "ok", op === "remove" ? "Photo removed from the gallery." : "Saved."));
}

/* ---------------------------------------------------------------- staff -- */

function staffInput(form: FormData): StaffInput | string {
  const photo = str(form, "photo_url");
  if (!photo) return "Add a portrait photo.";
  const uploaded = isOwnUpload(photo);
  if (!uploaded && !photo.startsWith("/images/staff/") && !photo.startsWith("https://res.cloudinary.com/")) {
    return "Upload the portrait with the Upload button.";
  }
  return {
    name: str(form, "name").slice(0, 120),
    role: str(form, "role").slice(0, 120),
    /* Every card is the same 4:5 portrait: new uploads are cropped around the face. */
    photo: uploaded && !photo.includes("/c_fill,") ? withTransform(photo, "c_fill,g_face,w_700,h_875,q_auto") : photo,
    width: 700,
    height: 875,
    isHead: form.get("is_head") === "on",
  };
}

export async function saveStaffAction(_prev: string | null, form: FormData): Promise<string | null> {
  const user = await requireUser();
  const input = staffInput(form);
  if (typeof input === "string") return input;
  const id = Number(str(form, "id"));
  if (id) updateStaff(id, input);
  else addStaff(input);
  logActivity(user.id, id ? "updated staff card" : "added staff card", input.name || "(unnamed)");
  refreshSite();
  redirect(withFlash(id ? `/admin/staff#staff-${id}` : "/admin/staff", "ok", id ? "Saved." : "Staff member added."));
}

export async function staffOrderAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(str(form, "id"));
  const op = str(form, "op");
  if (op === "up" || op === "down") moveStaff(id, op === "up" ? -1 : 1);
  else if (op === "remove") {
    removeStaff(id);
    logActivity(user.id, "removed staff card", String(id));
  }
  refreshSite();
  redirect(withFlash("/admin/staff", "ok", op === "remove" ? "Removed from the Our Teachers page." : "Order saved."));
}

/* ---------------------------------------------------------------- blog -- */

function postInput(form: FormData): PostInput | string {
  const title = str(form, "title");
  if (!title) return "A title is required.";
  const status = str(form, "status") === "published" ? "published" : "draft";
  const date = str(form, "published_at");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "The date is not valid.";
  const imageUrl = str(form, "image_url");
  if (imageUrl && !/^https:\/\//.test(imageUrl)) return "The image must be an https:// address.";
  if (status === "published" && !imageUrl) return "Add a cover photo before publishing — the blog cards need one.";
  return {
    title: title.slice(0, 200),
    slug: str(form, "slug"),
    category: str(form, "category").slice(0, 40) || "News",
    excerpt: str(form, "excerpt").slice(0, 600),
    body: str(form, "body").slice(0, 50_000),
    image_url: imageUrl,
    image_width: Number(str(form, "image_width")) || 1200,
    image_height: Number(str(form, "image_height")) || 800,
    status,
    published_at: date,
  };
}

function refreshBlog(slug?: string) {
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidatePath("/reviews");
}

export async function savePostAction(_prev: string | null, form: FormData): Promise<string | null> {
  const user = await requireUser();
  const input = postInput(form);
  if (typeof input === "string") return input;
  const id = Number(str(form, "id"));
  const post = id ? updatePost(id, input) : createPost(input, user.id);
  logActivity(user.id, id ? "updated blog post" : "created blog post", post.title);
  refreshBlog(post.slug);

  if (str(form, "share") === "1" && post.status === "published") {
    redirect(`/admin/social?from_post=${post.id}`);
  }
  redirect(withFlash(`/admin/blog/${post.id}`, "ok", post.status === "published" ? "Saved and published." : "Draft saved."));
}

export async function deletePostAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(str(form, "id"));
  deletePost(id);
  logActivity(user.id, "deleted blog post", String(id));
  refreshBlog();
  redirect(withFlash("/admin/blog", "ok", "Post deleted."));
}

/* -------------------------------------------------------------- social -- */

export async function createSocialPostAction(_prev: string | null, form: FormData): Promise<string | null> {
  const user = await requireUser();
  const platforms = PLATFORMS.filter((platform) => form.get(`platform_${platform}`) === "on") as Platform[];
  const mediaType = (["image", "video"].includes(str(form, "media_type")) ? str(form, "media_type") : "none") as MediaType;
  const job: SocialJob = {
    caption: str(form, "caption").slice(0, 5000),
    title: str(form, "title").slice(0, 100),
    link: str(form, "link"),
    mediaUrl: mediaType === "none" ? "" : str(form, "media_url"),
    mediaType,
  };
  if (job.link && !/^https?:\/\//.test(job.link)) return "The link must start with https://";
  if (mediaType !== "none" && !/^https:\/\//.test(job.mediaUrl)) return "Upload the photo or video first.";

  const problem = validateSocialPost(job, platforms);
  if (problem) return problem;

  let scheduledAt = new Date().toISOString();
  if (str(form, "when") === "later") {
    const iso = kigaliLocalToIso(str(form, "scheduled_at"));
    if (!iso) return "Choose a date and time to schedule the post.";
    if (new Date(iso).getTime() < Date.now() - 60_000) return "The scheduled time is in the past.";
    scheduledAt = iso;
  }

  queueSocialPost(job, platforms, scheduledAt, user.id);
  logActivity(user.id, "queued social post", `${platforms.join(", ")}: ${job.caption.slice(0, 60)}`);
  after(() => runDueSocialPosts());
  redirect(
    withFlash(
      "/admin/social",
      "ok",
      str(form, "when") === "later" ? "Scheduled." : "Publishing now — refresh in a moment to see each network's result.",
    ),
  );
}

export async function cancelSocialPostAction(form: FormData): Promise<void> {
  await requireUser();
  cancelSocialPost(Number(str(form, "id")));
  redirect(withFlash("/admin/social", "ok", "Scheduled post cancelled."));
}

export async function retrySocialPostAction(form: FormData): Promise<void> {
  await requireUser();
  retrySocialPost(Number(str(form, "id")));
  after(() => runDueSocialPosts());
  redirect(withFlash("/admin/social", "ok", "Retrying the networks that failed."));
}

export async function disconnectAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const which = str(form, "provider");
  const keys: Record<string, string[]> = {
    meta: ["FACEBOOK_PAGE_TOKEN", "INSTAGRAM_USER_ID"],
    google: ["YOUTUBE_REFRESH_TOKEN"],
    tiktok: ["TIKTOK_REFRESH_TOKEN"],
  };
  for (const key of keys[which] ?? []) setSetting(key, "");
  logActivity(user.id, `disconnected ${which}`);
  redirect(withFlash("/admin/social/accounts", "ok", "Disconnected. Values set in the server environment still apply."));
}

/* ------------------------------------------------------------- reviews -- */

export async function reviewStatusAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const status = str(form, "status") as ReviewStatus;
  const id = Number(str(form, "id"));
  if (status === ("delete" as ReviewStatus)) deleteReview(id);
  else if (["pending", "published", "hidden"].includes(status)) setReviewStatus(id, status);
  logActivity(user.id, `review ${status}`, String(id));
  revalidatePath("/reviews");
  redirect(withFlash("/admin/reviews", "ok", "Review updated."));
}

export async function addReviewAction(_prev: string | null, form: FormData): Promise<string | null> {
  const user = await requireUser();
  const name = str(form, "author_name");
  const body = str(form, "body");
  if (!name || !body) return "Name and review text are required.";
  createReview({
    author_name: name.slice(0, 120),
    relation: str(form, "relation").slice(0, 120),
    rating: Number(str(form, "rating")) || 5,
    body: body.slice(0, 3000),
    email: "",
    source: "manual",
    status: str(form, "publish") === "on" ? "published" : "pending",
  });
  logActivity(user.id, "added review", name);
  revalidatePath("/reviews");
  redirect(withFlash("/admin/reviews", "ok", "Review added."));
}

/* --------------------------------------------------------- inbox/email -- */

export async function messageStatusAction(form: FormData): Promise<void> {
  await requireUser();
  const id = Number(str(form, "id"));
  const status = str(form, "status") as MessageStatus;
  if (["new", "read", "replied", "archived"].includes(status)) setMessageStatus(id, status);
  redirect(str(form, "back") === "list" ? "/admin/inbox" : `/admin/inbox/${id}`);
}

export async function replyAction(_prev: string | null, form: FormData): Promise<string | null> {
  const user = await requireUser();
  const id = Number(str(form, "id"));
  const message = getMessage(id);
  if (!message) return "Message not found.";
  if (!message.email) return "This enquiry has no email address — call them instead.";
  const body = str(form, "body");
  if (!body) return "Write a reply first.";
  const result = await sendMail({
    to: message.email,
    subject: str(form, "subject") || "Your enquiry to New Light Academy",
    text: body,
    messageId: id,
    sentBy: user.id,
  });
  if (!result.ok) return `Not sent: ${result.error}`;
  setMessageStatus(id, "replied");
  logActivity(user.id, "replied to enquiry", message.email);
  redirect(withFlash(`/admin/inbox/${id}`, "ok", "Reply sent."));
}

export async function composeEmailAction(_prev: string | null, form: FormData): Promise<string | null> {
  const user = await requireUser();
  const to = str(form, "to");
  const recipients = to.split(/[,;\s]+/).filter(Boolean);
  if (!recipients.length || recipients.some((address) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))) {
    return "Enter one or more valid email addresses.";
  }
  if (recipients.length > 50) return "Send to at most 50 people at a time.";
  const subject = str(form, "subject");
  const body = str(form, "body");
  if (!subject || !body) return "Subject and message are required.";
  const result = await sendMail({ to: recipients.join(", "), subject, text: body, sentBy: user.id });
  if (!result.ok) return `Not sent: ${result.error}`;
  logActivity(user.id, "sent email", `${subject} → ${recipients.length} recipient(s)`);
  redirect(withFlash("/admin/email", "ok", "Email sent."));
}

/* ------------------------------------------------------------ settings -- */

export async function saveSettingsAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const group = str(form, "group");
  for (const def of SETTINGS.filter((entry) => entry.group === group)) {
    if (def.secret) {
      /* Secrets are never echoed back: blank means "keep", the checkbox clears. */
      if (form.get(`clear_${def.key}`) === "on") setSetting(def.key, "");
      else if (str(form, def.key)) setSetting(def.key, str(form, def.key));
    } else {
      setSetting(def.key, str(form, def.key));
    }
  }
  logActivity(user.id, "updated settings", group);
  redirect(withFlash(`/admin/settings#${group}`, "ok", "Settings saved."));
}

export async function testEmailAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const problem = await verifyMail();
  if (problem) redirect(withFlash("/admin/settings#email", "error", `SMTP check failed: ${problem}`));
  const to = str(form, "to") || user.email;
  const result = await sendMail({
    to,
    subject: "Test email from the New Light Academy staff portal",
    text: `This is a test sent from ${siteUrl()}/admin/settings. If you are reading it, outgoing email works.`,
    sentBy: user.id,
  });
  redirect(
    withFlash("/admin/settings#email", result.ok ? "ok" : "error", result.ok ? `Test email sent to ${to}.` : `Not sent: ${result.error}`),
  );
}

export async function addUserAction(_prev: string | null, form: FormData): Promise<string | null> {
  const user = await requireUser();
  const email = str(form, "email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
  try {
    createUser(email, str(form, "name"), String(form.get("password") ?? ""));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes("UNIQUE") ? "There is already an account with that email." : message;
  }
  logActivity(user.id, "added staff account", email);
  redirect(withFlash("/admin/settings/users", "ok", `Account created for ${email}.`));
}

export async function removeUserAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(str(form, "id"));
  if (id === user.id) redirect(withFlash("/admin/settings/users", "error", "You cannot remove your own account."));
  deleteUser(id);
  logActivity(user.id, "removed staff account", String(id));
  redirect(withFlash("/admin/settings/users", "ok", "Account removed."));
}

export async function changePasswordAction(_prev: string | null, form: FormData): Promise<string | null> {
  const user = await requireUser();
  const row = db().prepare("SELECT password_hash FROM users WHERE id = ?").get(user.id) as { password_hash: string };
  if (!verifyPassword(String(form.get("current") ?? ""), row.password_hash)) return "Your current password is not right.";
  const next = String(form.get("password") ?? "");
  if (next !== String(form.get("confirm") ?? "")) return "The new passwords do not match.";
  try {
    setPassword(user.id, next);
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  logActivity(user.id, "changed password");
  redirect("/admin/login?changed=1");
}
