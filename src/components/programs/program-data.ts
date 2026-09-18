import { site } from "@/lib/site";
/**
 * The six program detail pages are one Elementor template with six sets of
 * copy. post-1050 / 1054 / 1056 / 1058 / 1060 / 1062 were diffed against each
 * other: same widget order, same colours, same age cards — only the text, the
 * three photos and a few paddings differ. Everything shared lives at the top of
 * this file; `PROGRAMS` carries only what actually varies.
 *
 * The routes keep the template's slugs, but the labels are New Light Academy's
 * own levels: infants = Baby Class, toddlers = Middle Class, preschool = Top
 * Class, kindergarten = Primary School (P1-P6), flex-care = Character &
 * Values, art-program = Creativity & Sport.
 */

export interface ProgramPhoto {
  src: string;
  width: number;
  height: number;
}

export interface Program {
  /** Route segment, which is also the key used by the six page files. */
  slug: "infants" | "toddlers" | "preschool" | "kindergarten" | "flex-care" | "art-program";
  /** The page h1. */
  title: string;
  /** The hero's lead paragraph. */
  lead: string;
  /** The h2 in the "About" band. */
  aboutHeading: string;
  /** The h2 in the "<program> program" band. */
  programHeading: string;
  /** The short paragraph under that band's long one — the one line that varies. */
  programNote: string;
  /** Beside "Care for every child". */
  carePhoto: ProgramPhoto;
  /** Beside the "<program> program" copy. */
  programPhoto: ProgramPhoto;
  /** Beside "How we teach". */
  signaturePhoto: ProgramPhoto;
}

/** The YouTube id every one of the six hero play buttons opens. */
export const HERO_VIDEO_ID = "67ouh2PgUfk";

/** "About" band, identical on all six pages. */
export const ABOUT_PARAGRAPHS: readonly string[] = [
  `The early years shape everything that follows. ${site.name} is a private Christian day school in Kinyinya, Gasabo, offering nursery and primary education to children from the neighbourhood.`,
  "We are accredited by NESA for pre-primary and primary education and we follow the Rwanda national curriculum, from Baby Class through to P6. Within that framework we work to be an inclusive school, where every child is known by name and encouraged to grow in confidence, character and faith.",
];

export const ABOUT_INVITE =
  "If you would like to know more, we would be glad to welcome you for a visit";

/** "Care for every child" band, identical on all six pages. */
export const CARE_INTRO = "In our classrooms, children can expect:";

export const CARE_ITEMS: readonly string[] = [
  "Lessons that follow the Rwanda national curriculum, taught in a calm and orderly classroom",
  "Teaching that gives every child both guidance and room to think for themselves",
  "Teaching that adapts to the child in front of it and builds on each pupil’s strengths and interests",
  "Reading, writing, numbers and language practised a little every day",
  "A belief that young children learn with their whole bodies, and not by sitting still",
  `Attention to each child’s character and faith, in keeping with the motto on our crest, “${site.motto}”`,
];

/** The long paragraph in the "<program> program" band, identical on all six. */
export const PROGRAM_LEAD =
  "Every stage of school matters, and we plan each one with care. Our aim is that parents feel confident about the whole of their child’s day: a welcoming classroom, lessons that follow the Rwanda national curriculum, and teachers who take time with every child. Each level builds on the one before it, so that by the end of P6 pupils are prepared for the Primary Leaving Examination and for the years that follow.";

/** "How we teach" band, identical on all six pages. */
export const SIGNATURE_INTRO = `A few practices run right through ${site.name}, whichever class a child is in:`;

export const SIGNATURE_ITEMS: readonly string[] = [
  "Numbers in daily life: counting, measuring and problem solving drawn from what children already know",
  "Daily reading and storytelling: books and stories shared aloud, so children hear language long before they write it",
  "Writing by hand: steady, unhurried practice, from first letters to full compositions",
  "Speaking and listening: children encouraged to explain their thinking and to listen well to one another",
  "Hands-on discovery: observing, sorting and asking questions about the world around them",
  "Creativity and movement: children encouraged to express themselves, and not only to read and write",
  "Character and faith: we are a Christian school, and kindness and responsibility matter to us as much as marks",
];

/** The one paragraph that is not shared: five pages repeat a care bullet here. */
const SHARED_PROGRAM_NOTE =
  "Parents are welcome to ask questions at any point. Please speak to the school office, and we will be glad to help.";

export const PROGRAMS: readonly Program[] = [
  {
    slug: "infants",
    title: "Baby Class",
    lead: "Our youngest class, where children of about three to four settle into school life, learn to play alongside others and meet their first letters, numbers and songs.",
    aboutHeading: `the Baby Class at ${site.name}.`,
    programHeading: "Baby Class",
    programNote:
      "A first year of school should be gentle. If you would like to talk about how your child might settle in, the school office would be glad to hear from you.",
    carePhoto: {
      src: "/images/infants/h-03-pj0d6xqzbkiofvjc5r6na485jlm6dov13w75q99y8k.jpg",
      width: 500,
      height: 450,
    },
    programPhoto: {
      src: "/images/infants/h-05-pj0d6d2p8hlzbt4r2qimxoerxihc8mr7fc22sv5ci0.jpg",
      width: 1000,
      height: 500,
    },
    signaturePhoto: {
      src: "/images/infants/h-04-pj0d6ner8e4t4gmi061za8r37a98nypkp7rqgoyrns.jpg",
      width: 500,
      height: 500,
    },
  },
  {
    slug: "toddlers",
    title: "Middle Class",
    lead: "Children of about four to five grow more independent here, with a little more structure to the day and steady practice in speaking, listening, counting and early writing.",
    aboutHeading: `the Middle Class at ${site.name}`,
    programHeading: "Middle Class",
    programNote: SHARED_PROGRAM_NOTE,
    carePhoto: {
      src: "/images/toddlers/pic-24-pj0d2phanon9bvsm9cc0kd79q6mghq6qqygooivwb0.jpg",
      width: 1000,
      height: 750,
    },
    programPhoto: {
      src: "/images/toddlers/h-03-pj0d6xr5eueaf8appzgfgj6wzznexz1au6ercyaop4.jpg",
      width: 1000,
      height: 500,
    },
    signaturePhoto: {
      src: "/images/toddlers/pic-23-pj0d2w22bykyd7qv4fyi2gfg4bnugy6ujohzom0vnk.jpg",
      width: 700,
      height: 800,
    },
  },
  {
    slug: "preschool",
    title: "Top Class",
    lead: "The last of the nursery years, for children of about five to six, where reading, writing and number work are built up ready for the step into P1.",
    aboutHeading: `the Top Class at ${site.name}`,
    programHeading: "Top Class",
    programNote: SHARED_PROGRAM_NOTE,
    carePhoto: {
      src: "/images/preschool/pic-25-pj0d2iwcw4u8jhr501rz5exc2krxl5zyioyp27zo0o.jpg",
      width: 800,
      height: 700,
    },
    programPhoto: {
      src: "/images/preschool/h-16-pj0d4fikr1egp8ylv5ed443ya614demtbo3n0jl09s.jpg",
      width: 800,
      height: 400,
    },
    signaturePhoto: {
      src: "/images/preschool/pic-26-pj0d2bdndgl2vsqmw3vvnoho36pefd4h0mqh9xcrhk.jpg",
      width: 800,
      height: 900,
    },
  },
  {
    slug: "kindergarten",
    title: "Primary School",
    lead: "From P1 to P6, pupils follow the Rwanda national curriculum and work steadily towards the Primary Leaving Examination at the end of P6.",
    aboutHeading: `primary school at ${site.name}`,
    programHeading: "Primary school, P1 to P6",
    programNote: SHARED_PROGRAM_NOTE,
    carePhoto: {
      src: "/images/kindergarten/pic-27-pj0d25qm8gc80ya94w376i8vr6kslejpsvtwccj6fs.jpg",
      width: 800,
      height: 700,
    },
    programPhoto: {
      src: "/images/kindergarten/h-20-pj0d3b3il5v4u0lbf5xemwb4qlkc6f6cu41rdn8xpc.jpg",
      width: 800,
      height: 400,
    },
    signaturePhoto: {
      src: "/images/kindergarten/pic-28-pj0d1xa2iy1htcmz0eg8uq4qzheskykwny7a2ao6k4.jpg",
      width: 800,
      height: 850,
    },
  },
  {
    slug: "flex-care",
    title: "Character & Values",
    lead: "We are a Christian school, and the shaping of character sits alongside the lessons: kindness, honesty, responsibility and respect for other people.",
    aboutHeading: `character and values at ${site.name}`,
    programHeading: "Character and values",
    programNote: SHARED_PROGRAM_NOTE,
    carePhoto: {
      src: "/images/flex-care/pic-30-pj0d1skvkru7ietd9qef7lkffsdnln3h32p3mh2ouw.jpg",
      width: 800,
      height: 700,
    },
    programPhoto: {
      src: "/images/flex-care/h-02-pj0d767mon5kkaz8uu26vx7cnmintmimp8lmelio4g.jpg",
      width: 800,
      height: 400,
    },
    signaturePhoto: {
      src: "/images/flex-care/pic-29-pj0d1l2623l1upsv5sibpv4rgeb4fu7zl0gvu6fsbs.jpg",
      width: 800,
      height: 900,
    },
  },
  {
    slug: "art-program",
    title: "Creativity & Sport",
    lead: "Alongside their lessons, we want children to have room to be creative and active: another way to express themselves and to grow strong and healthy.",
    aboutHeading: `creativity and sport at ${site.name}`,
    programHeading: "Creativity and sport",
    programNote: SHARED_PROGRAM_NOTE,
    carePhoto: {
      src: "/images/art-program/pic-24-pj0d2ph87z38srhkxmmd4v9k89vi31q2vlj3f5pwt4.jpg",
      width: 800,
      height: 700,
    },
    programPhoto: {
      src: "/images/art-program/h-15-pj0d3vryrinfxfra2ev75r39t2qevrgg8yefxqe9wg.jpg",
      width: 800,
      height: 400,
    },
    signaturePhoto: { src: "/images/art-program/pic-05.jpg", width: 800, height: 920 },
  },
];

export function getProgram(slug: Program["slug"]): Program {
  const program = PROGRAMS.find((entry) => entry.slug === slug);
  if (!program) throw new Error(`Unknown program: ${slug}`);
  return program;
}
