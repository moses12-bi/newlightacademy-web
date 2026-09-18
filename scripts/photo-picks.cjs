/**
 * The curated New Light Academy photographs, selected from the 551-frame
 * library by reviewing the contact sheets in artifacts/contact/.
 *
 * Frame ids (P… / U…) refer to those sheets. `alt` describes only what is
 * visibly in the frame — no names, and no claim about the occasion beyond what
 * the picture itself shows.
 *
 * Shared by scripts/process-photos.cjs (writes them into public/) and
 * scripts/cloudinary-upload.cjs (uploads them), so one list drives both.
 *
 * Deliberately excluded from the library: frames U83-U92, children in
 * camouflage holding toy guns; ~35 near-identical parent-and-certificate
 * frames; and the adult audience shots, which show nothing of the school.
 */
module.exports = [
  // --- gallery, in display order -----------------------------------------
  { id: "U27", slug: "nursery-pupils-outdoors", alt: "Young pupils in gold and navy uniform standing together outdoors", tags: ["gallery", "nursery"] },
  { id: "U69", slug: "pupil-white-coat-microphone", alt: "A pupil in a white coat speaking into a microphone", tags: ["gallery", "careers"] },
  { id: "U139", slug: "nursery-graduation-gowns", alt: "Nursery pupils in blue and gold graduation gowns and caps", tags: ["gallery", "graduation"] },
  { id: "P97", slug: "graduates-red-gowns", alt: "Pupils in red graduation gowns and caps gathered together", tags: ["gallery", "graduation"] },
  { id: "U54", slug: "football-team-green-kit", alt: "Pupils in green football kit on the pitch", tags: ["gallery", "sport"] },
  { id: "U95", slug: "karate-demonstration", alt: "Pupils in white karate uniforms with coloured belts, mid-demonstration", tags: ["gallery", "sport"] },
  { id: "U80", slug: "brass-band", alt: "Pupils playing brass instruments and a bass drum", tags: ["gallery", "music"] },
  { id: "P108", slug: "traditional-dance", alt: "Pupils performing a traditional dance in patterned costume", tags: ["gallery", "culture"] },
  { id: "U76", slug: "role-play-activity-table", alt: "Children in white coats and chefs' hats at an activity table", tags: ["gallery", "careers"] },
  { id: "P44", slug: "school-building", alt: "The school building, painted pink and green, with an open walkway", tags: ["gallery", "campus"] },
  { id: "U22", slug: "pupils-with-certificates", alt: "Pupils in uniform holding framed certificates", tags: ["gallery", "primary"] },
  { id: "P99", slug: "graduation-assembly", alt: "A large group of pupils in blue graduation gowns seated together", tags: ["gallery", "graduation"] },

  // --- page slots ---------------------------------------------------------
  { id: "U26", slug: "children-in-uniform-line", alt: "Young pupils in uniform standing in a line outdoors", tags: ["hero", "nursery"] },
  { id: "U29", slug: "nursery-pair", alt: "Two young pupils in gold and navy uniform", tags: ["nursery"] },
  { id: "U30", slug: "nursery-group-small", alt: "A small group of nursery pupils in uniform", tags: ["nursery"] },
  { id: "U21", slug: "primary-pupils-certificates", alt: "Primary pupils in uniform holding certificates", tags: ["primary"] },
  { id: "U24", slug: "primary-pupils-group", alt: "Primary pupils in uniform standing together outdoors", tags: ["primary"] },
  { id: "U53", slug: "football-match", alt: "Pupils in football kit during a match", tags: ["sport"] },
  { id: "U96", slug: "karate-line", alt: "Pupils in karate uniforms standing in a line", tags: ["sport"] },
  { id: "U136", slug: "band-procession", alt: "Pupils marching with brass instruments and drums", tags: ["music"] },
  { id: "U75", slug: "role-play-pair", alt: "Two children in dress-up costume holding microphones", tags: ["careers"] },
  { id: "U140", slug: "nursery-graduation-group", alt: "Nursery pupils in graduation gowns raising their arms", tags: ["graduation"] },
  { id: "P41", slug: "campus-walkway", alt: "A walkway alongside the school building", tags: ["campus"] },
  { id: "P45", slug: "campus-courtyard", alt: "The school courtyard, with classroom blocks around it", tags: ["campus"] },
  { id: "P110", slug: "dance-performance", alt: "Pupils performing a dance in front of an audience", tags: ["culture"] },
  { id: "P21", slug: "graduation-board", alt: "A board of pupil photographs displayed at a graduation ceremony", tags: ["graduation"] },
];
