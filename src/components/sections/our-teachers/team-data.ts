/** A card in the Our Teachers grid. */
export interface TeamMember {
  /** Portrait: a path under public/images/staff/ or an uploaded image URL. */
  photo: string;
  /** Set once the school confirms who may be named, and as what. */
  name?: string;
  role?: string;
}

/**
 * The teaching staff as supplied by the school: five matching studio portraits
 * (white wall, NLA lanyards) followed by a further studio portrait. They
 * arrived without saying who is in them, so no names are set.
 *
 * Built by scripts/process-staff.cjs from the school's own photographs.
 *
 * This is only the starting point: the staff portal (Staff) seeds itself from
 * this list, and from then on names, roles, portraits and the Head Teacher are
 * managed there. See `seed()` in src/lib/server/staff.ts for how a database
 * seeded from an earlier version of this list is brought up to date.
 */
export const DEFAULT_TEAM: TeamMember[] = [
  { photo: "/images/staff/staff-01.webp" },
  { photo: "/images/staff/staff-02.webp" },
  { photo: "/images/staff/staff-03.webp" },
  { photo: "/images/staff/staff-04.webp" },
  { photo: "/images/staff/staff-05.webp" },
  { photo: "/images/staff/staff-07b.webp" },
];

/**
 * Portraits that an earlier version of DEFAULT_TEAM seeded into the database.
 * The seed migration retires any of these rows that staff have not touched.
 * The files stay in public/ because a row staff DID edit may still point at one.
 */
export const RETIRED_DEFAULT_PHOTOS: readonly string[] = [
  "/images/staff/teacher-1.webp",
  "/images/staff/teacher-2.webp",
  "/images/staff/teacher-3.webp",
  "/images/staff/teacher-4.webp",
  "/images/staff/teacher-5.webp",
  "/images/staff/teacher-6.webp",
];

/**
 * Default portraits swapped for a better photograph of the SAME person. The seed
 * migration moves every row still showing `from` onto `to`, named or not.
 *   staff-07: a 640px phone photo, replaced by the school's studio portrait of
 *   him (teach3.png, at the owner's request).
 */
export const REPLACED_DEFAULT_PHOTOS: readonly { from: string; to: string }[] = [
  { from: "/images/staff/staff-07.webp", to: "/images/staff/staff-07b.webp" },
];

/**
 * Default portraits taken off the page at the school's request. The seed
 * migration deletes every row still showing one.
 */
export const REMOVED_DEFAULT_PHOTOS: readonly string[] = ["/images/staff/staff-06.webp"];

/** The whole teaching team together, shown above the individual portraits. */
export const TEAM_GROUP_PHOTO = {
  src: "/images/staff/team-group.webp",
  width: 1800,
  height: 787,
  alt: "The New Light Academy teaching staff together in white coats on the school lawn",
} as const;
