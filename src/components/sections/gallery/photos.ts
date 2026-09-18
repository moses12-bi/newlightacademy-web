export interface GalleryPhoto {
  /** Local file. Every gallery image in the save resolved to a local asset. */
  src: string;
  width: number;
  height: number;
  /**
   * The ratio the justified layout is built from, taken from the saved
   * `data-width` / `data-height` on each `.e-gallery-image` (1024x682 for the
   * first photo, 1024x630 for the other eleven).
   */
  ratio: number;
  /**
   * What the picture shows, for screen readers. These are still the template's
   * stock photographs, so each line describes the scene in front of the camera
   * and nothing more: no photograph here shows this school, its pupils, its
   * staff or an event of its own. Rewrite each line when the photo is replaced.
   */
  alt?: string;
}

const WIDE = 1024 / 630;

/**
 * The twelve photos of #5f571d4, in the order the saved markup lists them.
 *
 * Note on the two h-10 entries: the source links
 * `2020/01/h-10.jpg` and `2020/02/h-10.jpg`, two uploads of the same
 * photograph cropped differently. The asset downloader keyed files by base
 * name, so both full-size uploads collapsed onto `/images/gallery/h-10.jpg`;
 * the second entry therefore uses the 1024px variant of the February upload,
 * which is the file the saved gallery markup itself referenced.
 */
export const galleryPhotos: GalleryPhoto[] = [
  {
    src: "/images/home/blog-photo-2.jpg",
    width: 1200,
    height: 799,
    ratio: 1024 / 682,
    alt: "Children painting a small model together, with brushes and paint pots on the table",
  },
  {
    src: "/images/gallery/h-10.jpg",
    width: 1300,
    height: 800,
    ratio: WIDE,
    alt: "A young child in a knitted hat, smiling",
  },
  {
    src: "/images/history-poster.jpg",
    width: 1300,
    height: 800,
    ratio: WIDE,
    alt: "A child standing in front of a brightly painted mural",
  },
  {
    src: "/images/blog/h-10-1024x630.jpg",
    width: 1024,
    height: 630,
    ratio: WIDE,
    alt: "A close-up of a smiling young child in a knitted hat",
  },
  {
    src: "/images/home/h-05.jpg",
    width: 1300,
    height: 800,
    ratio: WIDE,
    alt: "A teacher showing a toy fruit to a small group of children sitting together",
  },
  {
    src: "/images/shared/h-04.jpg",
    width: 1300,
    height: 800,
    ratio: WIDE,
    alt: "A teacher sitting and talking with two young children",
  },
  {
    src: "/images/gallery/h-03.jpg",
    width: 1300,
    height: 800,
    ratio: WIDE,
    alt: "Children playing with wooden blocks while their teacher looks on",
  },
  {
    src: "/images/gallery/h-02.jpg",
    width: 1300,
    height: 800,
    ratio: WIDE,
    alt: "An adult smiling at a baby lying in a cot",
  },
  {
    src: "/images/shared/h-07.jpg",
    width: 1300,
    height: 800,
    ratio: WIDE,
    alt: "A child writing in a notebook beside shelves of books",
  },
  {
    src: "/images/home/h-20.jpg",
    width: 1300,
    height: 800,
    ratio: WIDE,
    alt: "Children building a model out of coloured sticks at a table",
  },
  {
    src: "/images/home/h-15.jpg",
    width: 1300,
    height: 800,
    ratio: WIDE,
    alt: "Three children crouching outdoors, looking at the ground through magnifying glasses",
  },
  {
    src: "/images/home/h-18.jpg",
    width: 1300,
    height: 800,
    ratio: WIDE,
    alt: "A child reaching towards a smiling face card held up by an adult",
  },
];
