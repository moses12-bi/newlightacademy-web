export type Platform = "facebook" | "instagram" | "youtube" | "tiktok";
export type MediaType = "none" | "image" | "video";

export const PLATFORMS: Platform[] = ["facebook", "instagram", "youtube", "tiktok"];

export const PLATFORM_LABELS: Record<Platform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
};

/** What each network will accept. Checked when a post is composed, not when it fails. */
export const PLATFORM_MEDIA: Record<Platform, MediaType[]> = {
  facebook: ["none", "image", "video"],
  instagram: ["image", "video"],
  youtube: ["video"],
  tiktok: ["image", "video"],
};

export interface SocialJob {
  caption: string;
  /** YouTube needs a title; other networks ignore it. */
  title: string;
  link: string;
  mediaUrl: string;
  mediaType: MediaType;
}

export interface PublishResult {
  remoteId: string;
  remoteUrl: string;
}

export interface PlatformStatus {
  configured: boolean;
  /** Setting keys still empty. */
  missing: string[];
}

export class PlatformError extends Error {}
