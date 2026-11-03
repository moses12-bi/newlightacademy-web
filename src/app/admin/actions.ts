"use server";

/**
 * Every write the staff portal makes. Each action re-checks the session with
 * `requireUser()` — Server Actions are public HTTP endpoints, and the layout's
 * check does not protect them.
 */
import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { kigaliLocalToIso } from "@/lib/admin/format";
import { deleteAnnouncement, saveAnnouncement, type AnnouncementInput } from "@/lib/server/announcements";
import { deleteEvent, EVENT_CATEGORIES, saveEvent, type EventInput } from "@/lib/server/events";
import {
  acceptInvite,
  completeReset,
  countActiveAdmins,
  currentSessionToken,
  deleteUser,
  endSessions,
  getInvite,
  getUser,
  getUserByEmail,
  issueToken,
  loginThrottled,
  passwordProblem,
  requireAdmin,
  requireUser,
  resetThrottled,
  revokeInvite,
  ROLES,
  setPassword,
  signIn,
  signOut,
  updateUser,
  type Role,
} from "@/lib/server/auth";
import { inviteLink, resetLink, sendInvitation, sendResetEmail } from "@/lib/server/account-mail";
import { verifyPassword } from "@/lib/server/crypto";
import { db, logActivity } from "@/lib/server/db";
import { sendMail, verifyMail } from "@/lib/server/mail";
import { deleteAttachmentFiles } from "@/lib/server/files";
import { deleteJob, JOB_CATEGORIES, JOB_TYPES, saveJob, type JobInput } from "@/lib/server/jobs";
import { JOB_STAGES, saveAdmissionsSettings, STUDENT_STAGES } from "@/lib/server/admissions";
import { deleteMessage, getMessage, setMessageStage, setMessageStatus, type MessageStatus } from "@/lib/server/messages";
import { createPost, deletePost, updatePost, type PostInput } from "@/lib/server/posts";
import { createReview, deleteReview, setReviewStatus, type ReviewStatus } from "@/lib/server/reviews";
import { LIBRARY_CACHE_TAG, setDescription, setTag } from "@/lib/server/cloudinary-library";
import { copiesOf, galleryLibrary, HIDE_TAG, markHidden, photoKey } from "@/lib/server/gallery";
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
  /* Keep the #anchor, so the page opens on the item that was just changed. */
  return `${url.pathname}${url.search}${url.hash}`;
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

/* ------------------------------------------------- calendar & announcements -- */

/** Pages that show events or announcements; the urgent banner is on every page. */
function refreshParentPages() {
  revalidatePath("/school-calendar");
  revalidatePath("/announcements");
  revalidatePath("/parents");
}

function eventInput(form: FormData): EventInput | string {
  const title = str(form, "title");
  if (!title) return "Give the event a title.";
  const date = /^\d{4}-\d{2}-\d{2}$/;
  const time = /^\d{2}:\d{2}$/;
  const start = str(form, "start_date");
  const end = str(form, "end_date");
  if (!date.test(start)) return "Choose the date of the event.";
  if (end && (!date.test(end) || end < start)) return "The end date must be on or after the start date.";
  const allDay = form.get("all_day") === "on";
  const startTime = allDay ? "" : str(form, "start_time");
  const endTime = allDay ? "" : str(form, "end_time");
  if (startTime && !time.test(startTime)) return "The start time is not valid.";
  if (endTime && (!time.test(endTime) || !startTime)) return "Add a start time before an end time.";
  const category = str(form, "category");
  return {
    title: title.slice(0, 160),
    category: (EVENT_CATEGORIES as readonly string[]).includes(category) ? category : "Event",
    start_date: start,
    end_date: end === start ? "" : end,
    start_time: startTime,
    end_time: endTime,
    location: str(form, "location").slice(0, 160),
    audience: str(form, "audience").slice(0, 120),
    description: str(form, "description").slice(0, 4000),
    status: str(form, "status") === "draft" ? "draft" : "published",
  };
}

export async function saveEventAction(_prev: string | null, form: FormData): Promise<string | null> {
  const user = await requireUser();
  const input = eventInput(form);
  if (typeof input === "string") return input;
  const id = Number(str(form, "id")) || undefined;
  const event = saveEvent(input, user.id, id);
  logActivity(user.id, id ? "updated calendar event" : "added calendar event", event.title);
  refreshParentPages();
  if (str(form, "share") === "1" && event.status === "published") redirect(`/admin/social?from_event=${event.id}`);
  if (str(form, "another") === "1") redirect(withFlash("/admin/calendar/new", "ok", `Added “${event.title}”. Add the next one.`));
  redirect(withFlash("/admin/calendar", "ok", `Saved “${event.title}”.`));
}

export async function deleteEventAction(form: FormData): Promise<void> {
  const user = await requireUser();
  deleteEvent(Number(str(form, "id")));
  logActivity(user.id, "deleted calendar event");
  refreshParentPages();
  redirect(withFlash("/admin/calendar", "ok", "Event deleted."));
}

function announcementInput(form: FormData): AnnouncementInput | string {
  const title = str(form, "title");
  if (!title) return "Give the announcement a title.";
  const body = str(form, "body");
  if (!body) return "Write the announcement.";
  let publishAt = new Date().toISOString();
  if (str(form, "publish_at")) {
    const iso = kigaliLocalToIso(str(form, "publish_at"));
    if (!iso) return "The publish time is not valid.";
    publishAt = iso;
  }
  let expiresAt = "";
  if (str(form, "expires_at")) {
    const iso = kigaliLocalToIso(str(form, "expires_at"));
    if (!iso) return "The expiry time is not valid.";
    if (iso <= publishAt) return "The announcement must expire after it is published.";
    expiresAt = iso;
  }
  return {
    title: title.slice(0, 160),
    body: body.slice(0, 8000),
    audience: str(form, "audience").slice(0, 120),
    priority: str(form, "priority") === "urgent" ? "urgent" : "normal",
    pinned: form.get("pinned") === "on" ? 1 : 0,
    publish_at: publishAt,
    expires_at: expiresAt,
    status: str(form, "status") === "draft" ? "draft" : "published",
  };
}

export async function saveAnnouncementAction(_prev: string | null, form: FormData): Promise<string | null> {
  const user = await requireUser();
  const input = announcementInput(form);
  if (typeof input === "string") return input;
  const id = Number(str(form, "id")) || undefined;
  const announcement = saveAnnouncement(input, user.id, id);
  logActivity(user.id, id ? "updated announcement" : "posted announcement", announcement.title);
  refreshParentPages();
  /* An urgent announcement is a banner on every page. */
  revalidatePath("/", "layout");
  if (str(form, "share") === "1" && announcement.status === "published") redirect(`/admin/social?from_announcement=${announcement.id}`);
  redirect(withFlash("/admin/announcements", "ok", `Saved “${announcement.title}”.`));
}

export async function deleteAnnouncementAction(form: FormData): Promise<void> {
  const user = await requireUser();
  deleteAnnouncement(Number(str(form, "id")));
  logActivity(user.id, "deleted announcement");
  refreshParentPages();
  revalidatePath("/", "layout");
  redirect(withFlash("/admin/announcements", "ok", "Announcement deleted."));
}

/* --------------------------------------------------------- applications -- */

export async function setStageAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(str(form, "id"));
  const message = getMessage(id);
  const stages = message?.form === "job-application" ? JOB_STAGES : STUDENT_STAGES;
  const stage = str(form, "stage");
  if (message && stages.includes(stage)) {
    setMessageStage(id, stage);
    if (message.status === "new") setMessageStatus(id, "read");
    logActivity(user.id, `application → ${stage}`, message.name);
  }
  const back = str(form, "back");
  redirect(withFlash(back.startsWith("/admin/") ? back : `/admin/inbox/${id}`, "ok", `Moved to “${stage}”.`));
}

export async function saveAdmissionsAction(_prev: string | null, form: FormData): Promise<string | null> {
  const user = await requireUser();
  saveAdmissionsSettings({
    open: form.get("open") === "on",
    intake: str(form, "intake").slice(0, 80),
    note: str(form, "note").slice(0, 1000),
  });
  logActivity(user.id, "updated admissions settings");
  revalidatePath("/how-to-apply");
  redirect(withFlash("/admin/applications", "ok", "Admissions settings saved."));
}

/* -------------------------------------------------------------- careers -- */

function jobInput(form: FormData): JobInput | string {
  const title = str(form, "title");
  if (!title) return "A job title is required.";
  const status = (["draft", "open", "closed"].includes(str(form, "status")) ? str(form, "status") : "draft") as JobInput["status"];
  const closing = str(form, "closing_date");
  if (closing && !/^\d{4}-\d{2}-\d{2}$/.test(closing)) return "The closing date is not valid.";
  const requirements = str(form, "requirements");
  if (status === "open" && !requirements) return "List the requirements before publishing the vacancy.";
  const jobType = str(form, "job_type");
  const category = str(form, "category");
  return {
    slug: str(form, "slug"),
    title: title.slice(0, 160),
    job_type: (JOB_TYPES as readonly string[]).includes(jobType) ? jobType : "Full-time",
    category: (JOB_CATEGORIES as readonly string[]).includes(category) ? category : "Other",
    department: str(form, "department").slice(0, 120),
    location: str(form, "location").slice(0, 160),
    salary: str(form, "salary").slice(0, 120),
    start_date: str(form, "start_date").slice(0, 60),
    closing_date: closing,
    summary: str(form, "summary").slice(0, 600),
    description: str(form, "description").slice(0, 20_000),
    responsibilities: str(form, "responsibilities").slice(0, 10_000),
    requirements: requirements.slice(0, 10_000),
    how_to_apply: str(form, "how_to_apply").slice(0, 4_000),
    status,
  };
}

export async function saveJobAction(_prev: string | null, form: FormData): Promise<string | null> {
  const user = await requireUser();
  const input = jobInput(form);
  if (typeof input === "string") return input;
  const id = Number(str(form, "id")) || undefined;
  const job = saveJob(input, id);
  logActivity(user.id, id ? "updated vacancy" : "created vacancy", job.title);
  revalidatePath("/careers");
  if (str(form, "share") === "1" && job.status === "open") redirect(`/admin/social?from_job=${job.id}`);
  redirect(withFlash(`/admin/careers/${job.id}`, "ok", job.status === "open" ? "Saved and published on /careers." : "Saved."));
}

export async function deleteJobAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(str(form, "id"));
  deleteJob(id);
  logActivity(user.id, "deleted vacancy", String(id));
  revalidatePath("/careers");
  redirect(withFlash("/admin/careers", "ok", "Vacancy deleted. Applications already received stay in the Inbox."));
}

/* -------------------------------------------------------------- gallery -- */

/* The gallery follows the Cloudinary library (src/lib/server/gallery.ts), so these
   change the library itself: the nla-hide tag, and the photo's alt and caption. */

function refreshGallery() {
  updateTag(LIBRARY_CACHE_TAG);
  refreshSite();
}

/** After the uploader has put photos straight into the gallery's folder. */
export async function galleryUploadedAction(count: number): Promise<void> {
  const user = await requireUser();
  logActivity(user.id, "added gallery photos", String(count));
  refreshGallery();
}

export async function galleryPhotoAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const publicId = str(form, "id");
  const op = str(form, "op");
  const library = await galleryLibrary();
  if (!library) redirect(withFlash("/admin/gallery", "error", "Cloudinary could not be reached. Try again in a moment."));
  if (!library.some((photo) => photo.publicId === publicId)) {
    redirect(withFlash("/admin/gallery", "error", "That photo is no longer in the library."));
  }
  const back = `/admin/gallery#photo-${photoKey(publicId)}`;
  try {
    if (op === "hide" || op === "show") {
      await setTag(await copiesOf(publicId), HIDE_TAG, op === "hide");
      markHidden(photoKey(publicId), op === "hide");
      logActivity(user.id, op === "hide" ? "hid gallery photo" : "showed gallery photo", publicId);
    } else if (op === "describe") {
      await setDescription(publicId, str(form, "alt").slice(0, 300), str(form, "label").slice(0, 40));
    }
  } catch (error) {
    redirect(withFlash(back, "error", error instanceof Error ? error.message : "Cloudinary refused the change."));
  }
  refreshGallery();
  redirect(
    withFlash(back, "ok", op === "hide" ? "Hidden from the gallery." : op === "show" ? "Back in the gallery." : "Saved."),
  );
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
  if (imageUrl && !/^(https:\/\/|\/images\/)/.test(imageUrl)) return "The image must be an https:// address.";
  return {
    title: title.slice(0, 200),
    slug: str(form, "slug"),
    category: str(form, "category").slice(0, 40) || "News",
    excerpt: str(form, "excerpt").slice(0, 600),
    body: str(form, "body").slice(0, 50_000),
    image_url: imageUrl,
    image_width: Number(str(form, "image_width")) || 1200,
    image_height: Number(str(form, "image_height")) || 800,
    image_focus: /^\d{1,3}% \d{1,3}%$/.test(str(form, "image_focus")) && imageUrl ? str(form, "image_focus") : "",
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
  const user = await requireAdmin();
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

/** Deletes an enquiry and any files that came with it — e.g. an applicant's CV. */
export async function deleteMessageAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(str(form, "id"));
  const message = getMessage(id);
  if (message) {
    deleteAttachmentFiles(id);
    deleteMessage(id);
    logActivity(user.id, "deleted enquiry", `${message.form} ${message.name}`.trim());
  }
  redirect(withFlash("/admin/inbox", "ok", "Deleted, with any attached files."));
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
  const user = await requireAdmin();
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
  const user = await requireAdmin();
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

/* --------------------------------------------------------- staff accounts -- */

export interface InviteResult {
  error?: string;
  /** Shown to the administrator when the email could not be sent, to pass on by hand. */
  link?: string;
  ok?: string;
}

function isRole(value: string): value is Role {
  return ROLES.some((role) => role.id === value);
}

async function requestOrigin(): Promise<string | undefined> {
  const host = (await headers()).get("host");
  return host ? `${host.startsWith("localhost") ? "http" : "https"}://${host}` : undefined;
}

export async function inviteUserAction(_prev: InviteResult | null, form: FormData): Promise<InviteResult> {
  const admin = await requireAdmin();
  const email = str(form, "email").toLowerCase();
  const name = str(form, "name").slice(0, 120);
  const role = str(form, "role");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (!isRole(role)) return { error: "Choose a role." };
  const existing = getUserByEmail(email);
  if (existing) return { error: existing.disabled ? "That person has a deactivated account — reactivate it instead." : "That person already has an account." };

  const link = inviteLink(issueToken({ kind: "invite", email, name, role, createdBy: admin.id }), await requestOrigin());
  logActivity(admin.id, "invited staff member", `${email} (${role})`);
  const sent = await sendInvitation({ email, name, role, invitedBy: admin.name, link, sentBy: admin.id });
  revalidatePath("/admin/settings/users");
  if (sent.ok) return { ok: `Invitation emailed to ${email}. The link works for 7 days.` };
  return {
    ok: `Invitation created, but the email could not be sent (${sent.error}). Send this link to ${email} yourself — it works once, for 7 days:`,
    link,
  };
}

export async function resendInviteAction(_prev: InviteResult | null, form: FormData): Promise<InviteResult> {
  const admin = await requireAdmin();
  const invite = getInvite(Number(str(form, "id")));
  if (!invite || invite.used_at) return { error: "That invitation is no longer pending." };
  const link = inviteLink(
    issueToken({ kind: "invite", email: invite.email, name: invite.name, role: invite.role, createdBy: admin.id }),
    await requestOrigin(),
  );
  const sent = await sendInvitation({ email: invite.email, name: invite.name, role: invite.role, invitedBy: admin.name, link, sentBy: admin.id });
  revalidatePath("/admin/settings/users");
  if (sent.ok) return { ok: `New invitation emailed to ${invite.email}. The old link no longer works.` };
  return { ok: `New link created (the email could not be sent: ${sent.error}). Send it to ${invite.email} yourself:`, link };
}

export async function revokeInviteAction(form: FormData): Promise<void> {
  const admin = await requireAdmin();
  revokeInvite(Number(str(form, "id")));
  logActivity(admin.id, "cancelled invitation");
  redirect(withFlash("/admin/settings/users", "ok", "Invitation cancelled — the link no longer works."));
}

/** Role, deactivate/reactivate and remove — with the last active administrator protected. */
export async function manageUserAction(form: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = Number(str(form, "id"));
  const op = str(form, "op");
  const target = getUser(id);
  const back = "/admin/settings/users";
  if (!target) redirect(withFlash(back, "error", "That account no longer exists."));
  const losesAdmin =
    target.role === "admin" && !target.disabled && (op === "disable" || op === "remove" || (op === "role" && str(form, "role") !== "admin"));
  if (losesAdmin && countActiveAdmins() <= 1) {
    redirect(withFlash(back, "error", "There must always be at least one active administrator. Make someone else an administrator first."));
  }
  if (id === admin.id && (op === "disable" || op === "remove")) {
    redirect(withFlash(back, "error", "You cannot deactivate or remove your own account."));
  }

  let message = "Saved.";
  if (op === "role") {
    const role = str(form, "role");
    if (isRole(role)) {
      updateUser(id, { role });
      message = `${target.name} is now ${ROLES.find((entry) => entry.id === role)!.label}.`;
    }
  } else if (op === "disable") {
    updateUser(id, { disabled: true });
    message = `${target.name} can no longer sign in. Their work stays in the portal.`;
  } else if (op === "enable") {
    updateUser(id, { disabled: false });
    message = `${target.name} can sign in again.`;
  } else if (op === "remove") {
    deleteUser(id);
    message = `${target.name}'s account was removed.`;
  }
  logActivity(admin.id, `staff account: ${op}`, target.email);
  redirect(withFlash(back, "ok", message));
}

/** An administrator sends someone a password reset link (e.g. they are locked out). */
export async function adminResetLinkAction(_prev: InviteResult | null, form: FormData): Promise<InviteResult> {
  const admin = await requireAdmin();
  const target = getUser(Number(str(form, "id")));
  if (!target || target.disabled) return { error: "That account is not active." };
  const link = resetLink(issueToken({ kind: "reset", email: target.email, userId: target.id, createdBy: admin.id }), await requestOrigin());
  logActivity(admin.id, "sent password reset link", target.email);
  const sent = await sendResetEmail({ email: target.email, name: target.name, link });
  if (sent.ok) return { ok: `Reset link emailed to ${target.email}. It works for 1 hour.` };
  return { ok: `Email could not be sent (${sent.error}). Give ${target.name} this link — it works once, for 1 hour:`, link };
}

/* ------------------------------------------------------------ my account -- */

export async function updateProfileAction(_prev: string | null, form: FormData): Promise<string | null> {
  const user = await requireUser();
  const name = str(form, "name");
  const email = str(form, "email").toLowerCase();
  if (!name) return "Your name cannot be empty.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
  if (email !== user.email) {
    /* Changing the sign-in address needs the password, like changing the password. */
    const row = db().prepare("SELECT password_hash FROM users WHERE id = ?").get(user.id) as { password_hash: string };
    if (!verifyPassword(String(form.get("current") ?? ""), row.password_hash)) return "Enter your current password to change your email.";
    if (getUserByEmail(email)) return "Another account already uses that email.";
  }
  updateUser(user.id, { name: name.slice(0, 120), email });
  logActivity(user.id, "updated profile");
  redirect(withFlash("/admin/account", "ok", "Profile saved."));
}

export async function changePasswordAction(_prev: string | null, form: FormData): Promise<string | null> {
  const user = await requireUser();
  const row = db().prepare("SELECT password_hash FROM users WHERE id = ?").get(user.id) as { password_hash: string };
  if (!verifyPassword(String(form.get("current") ?? ""), row.password_hash)) return "Your current password is not right.";
  const next = String(form.get("password") ?? "");
  const problem = passwordProblem(next, String(form.get("confirm") ?? ""));
  if (problem) return problem;
  setPassword(user.id, next);
  logActivity(user.id, "changed password");
  redirect("/admin/login?changed=1");
}

export async function signOutEverywhereAction(): Promise<void> {
  const user = await requireUser();
  endSessions(user.id, await currentSessionToken());
  logActivity(user.id, "signed out other devices");
  redirect(withFlash("/admin/account", "ok", "Signed out on every other device."));
}

/* ------------------------------------------- invitation, forgot & reset -- */

export async function acceptInviteAction(_prev: string | null, form: FormData): Promise<string | null> {
  const problem = passwordProblem(String(form.get("password") ?? ""), String(form.get("confirm") ?? ""));
  if (problem) return problem;
  const result = await acceptInvite(str(form, "token"), str(form, "name").slice(0, 120), String(form.get("password")));
  if (typeof result === "string") return result;
  redirect("/admin?ok=" + encodeURIComponent(`Welcome, ${result.name}. Your account is ready.`));
}

/** Always answers the same way, so the form cannot be used to find out who has an account. */
export async function forgotPasswordAction(_prev: string | null, form: FormData): Promise<string | null> {
  const email = str(form, "email").toLowerCase();
  const ip = ((await headers()).get("x-forwarded-for") ?? "").split(",")[0].trim();
  const done = "sent";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter the email address you sign in with.";
  if (resetThrottled(`ip:${ip}`) || resetThrottled(`email:${email}`)) return done;
  const user = getUserByEmail(email);
  if (user && !user.disabled) {
    const link = resetLink(issueToken({ kind: "reset", email, userId: user.id }), await requestOrigin());
    const sent = await sendResetEmail({ email, name: user.name, link });
    logActivity(user.id, sent.ok ? "requested password reset" : "password reset email failed", sent.error ?? "");
  }
  return done;
}

export async function resetPasswordAction(_prev: string | null, form: FormData): Promise<string | null> {
  const problem = passwordProblem(String(form.get("password") ?? ""), String(form.get("confirm") ?? ""));
  if (problem) return problem;
  const result = completeReset(str(form, "token"), String(form.get("password")));
  if (typeof result === "string") return result;
  redirect("/admin/login?reset=1");
}
