export interface GalleryPhoto {
  /** Local file under public/images/school/. */
  src: string;
  width: number;
  height: number;
  /** Aspect ratio the justified layout lays each row out from. */
  ratio: number;
  /**
   * What the picture shows, for screen readers. Each line describes only what
   * is visibly in the frame — no names, and no claim about the occasion beyond
   * what the photograph itself shows.
   */
  alt?: string;
}

/**
 * New Light Academy's own photographs, curated from the school's library and
 * written here by scripts/process-photos.cjs. Do not hand-edit: change
 * scripts/photo-picks.cjs and re-run it, so the dimensions stay tied to the
 * files on disk.
 *
 * The school has confirmed it holds parental consent for these images. The
 * gallery page carries a route for a parent to ask for a photograph of their
 * child to be removed, which Rwanda's Law 058/2021 requires alongside consent.
 */
export const galleryPhotos: GalleryPhoto[] = [
  {
    src: "/images/school/nursery-pupils-outdoors.jpg",
    width: 1800,
    height: 1199,
    ratio: 1800 / 1199,
    alt: "Young pupils in gold and navy uniform standing together outdoors",
  },
  {
    src: "/images/school/pupil-white-coat-microphone.jpg",
    width: 1199,
    height: 1800,
    ratio: 1199 / 1800,
    alt: "A pupil in a white coat speaking into a microphone",
  },
  {
    src: "/images/school/nursery-graduation-gowns.jpg",
    width: 1800,
    height: 1199,
    ratio: 1800 / 1199,
    alt: "Nursery pupils in blue and gold graduation gowns and caps",
  },
  {
    src: "/images/school/graduates-red-gowns.jpg",
    width: 1800,
    height: 1200,
    ratio: 1800 / 1200,
    alt: "Pupils in red graduation gowns and caps gathered together",
  },
  {
    src: "/images/school/football-team-green-kit.jpg",
    width: 1800,
    height: 1199,
    ratio: 1800 / 1199,
    alt: "Pupils in green football kit on the pitch",
  },
  {
    src: "/images/school/karate-demonstration.jpg",
    width: 1800,
    height: 1199,
    ratio: 1800 / 1199,
    alt: "Pupils in white karate uniforms with coloured belts, mid-demonstration",
  },
  {
    src: "/images/school/brass-band.jpg",
    width: 1800,
    height: 1199,
    ratio: 1800 / 1199,
    alt: "Pupils playing brass instruments and a bass drum",
  },
  {
    src: "/images/school/traditional-dance.jpg",
    width: 1800,
    height: 1200,
    ratio: 1800 / 1200,
    alt: "Pupils performing a traditional dance in patterned costume",
  },
  {
    src: "/images/school/role-play-activity-table.jpg",
    width: 1800,
    height: 1199,
    ratio: 1800 / 1199,
    alt: "Children in white coats and chefs' hats at an activity table",
  },
  {
    src: "/images/school/school-building.jpg",
    width: 1800,
    height: 1200,
    ratio: 1800 / 1200,
    alt: "The school building, painted pink and green, with an open walkway",
  },
  {
    src: "/images/school/pupils-with-certificates.jpg",
    width: 1800,
    height: 1199,
    ratio: 1800 / 1199,
    alt: "Pupils in uniform holding framed certificates",
  },
  {
    src: "/images/school/graduation-assembly.jpg",
    width: 1800,
    height: 1200,
    ratio: 1800 / 1200,
    alt: "A large group of pupils in blue graduation gowns seated together",
  },
];
