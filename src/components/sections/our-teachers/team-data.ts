/** A card in the Our Teachers grid. */
export interface TeamMember {
  /** Portrait: a path under public/images/staff/ or an uploaded image URL. */
  photo: string;
  /** Set once the school confirms who may be named, and as what. */
  name?: string;
  role?: string;
}

/**
 * The teaching staff as first supplied — the portraits the school sent, with
 * no names, because the photographs arrived without saying who is in them.
 *
 * This is only the starting point: the staff portal (Staff) seeds itself from
 * this list and from then on names, roles, portraits and the Head Teacher are
 * managed there.
 */
export const DEFAULT_TEAM: TeamMember[] = [
  { photo: "/images/staff/teacher-1.webp" },
  { photo: "/images/staff/teacher-2.webp" },
  { photo: "/images/staff/teacher-3.webp" },
  { photo: "/images/staff/teacher-4.webp" },
  { photo: "/images/staff/teacher-5.webp" },
  { photo: "/images/staff/teacher-6.webp" },
];
