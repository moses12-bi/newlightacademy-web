export interface NavLink {
  label: string;
  href: string;
}

export interface NavItem extends NavLink {
  children?: NavLink[];
  /** Rainbow hover colour applied to this top-level item by the header. */
  accent?: string;
}

/**
 * Primary header navigation. The `accent` values are the theme's "rainbow"
 * hover colours, applied to the top-level items in order (1-based in the kit).
 */
export const mainNav: NavItem[] = [
  {
    label: "Home",
    href: "/",
    accent: "var(--color-accent-1)",
    children: [
      { label: "Home", href: "/" },
      { label: "Welcome", href: "/home-2" },
    ],
  },
  {
    label: "About",
    href: "/about",
    accent: "var(--color-accent-2)",
    children: [
      { label: "About Us", href: "/about" },
      { label: "Gallery", href: "/gallery" },
      { label: "Our Teachers", href: "/our-teachers" },
      { label: "Careers", href: "/careers" },
      { label: "A Day at School", href: "/daily-schedule" },
    ],
  },
  {
    label: "Programs",
    href: "/programs",
    accent: "var(--color-nav-3)",
    children: [
      { label: "All Programs", href: "/programs" },
      { label: "Baby Class", href: "/infants" },
      { label: "Middle Class", href: "/toddlers" },
      { label: "Top Class", href: "/preschool" },
      { label: "Primary School", href: "/kindergarten" },
      { label: "Character & Values", href: "/flex-care" },
      { label: "Creativity & Sport", href: "/art-program" },
    ],
  },
  {
    label: "Admissions",
    href: "/admissions",
    accent: "var(--color-nav-4)",
    children: [
      { label: "Admissions", href: "/admissions" },
      { label: "Fees Information", href: "/tuition" },
      { label: "How to Apply", href: "/how-to-apply" },
      { label: "FAQ", href: "/faq" },
      { label: "Book a Visit", href: "/schedule-a-tour" },
      { label: "Coming Soon", href: "/coming-soon" },
    ],
  },
  {
    label: "Parents",
    href: "/parents",
    accent: "var(--color-nav-5)",
    children: [
      { label: "For Our Parents", href: "/parents" },
      { label: "Attendance", href: "/attendance-policy" },
      { label: "Paying School Fees", href: "/make-a-payment" },
      { label: "Pupil Handbook", href: "/student-handbook" },
      { label: "School Calendar", href: "/school-calendar" },
      { label: "Blog", href: "/blog" },
    ],
  },
  { label: "Location", href: "/location", accent: "var(--color-nav-7)" },
];

/** Footer band B, first navigation column. */
export const footerNavPrimary: NavLink[] = [
  { label: "Admissions", href: "/admissions" },
  { label: "Programs", href: "/programs" },
  { label: "School Calendar", href: "/school-calendar" },
];

/** Footer band B, second navigation column. */
export const footerNavSecondary: NavLink[] = [
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
  { label: "Location", href: "/location" },
];
