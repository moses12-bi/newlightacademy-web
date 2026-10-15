import type { GalleryPhoto } from "./photos";

/**
 * Gallery photographs served straight from the school's Cloudinary library.
 * The files are not in this repository: each `src` is a Cloudinary delivery
 * URL, and the gallery's next/image loader asks Cloudinary for each size
 * (cloudinaryUrlLoader in src/lib/cloudinary.ts).
 *
 * Chosen on 2026-10-15 from the 228 assets in the library: near-duplicates,
 * photos already on the site, close-ups of adult guests, readable names and
 * frames with toy weapons were left out. Width and height are the originals'
 * as Cloudinary reports them. Each alt text describes only what is visible.
 *
 * They follow the photos in photos.ts, in this order, so that no two
 * neighbouring tiles come from the same set.
 *
 * The live gallery now follows the whole Cloudinary library (src/lib/server/
 * gallery.ts); these two lists are what it shows while the site is being built
 * and whenever the library cannot be read.
 */
export const cloudinaryGalleryPhotos: GalleryPhoto[] = [
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1792077687/KARISIMBI_im_29.jpg.jpg",
    width: 6048,
    height: 4024,
    ratio: 6048 / 4024,
    alt: "Pupils in red and yellow shirts play volleyball across a net on an outdoor court while classmates sit and watch along the side.",
    label: "Volleyball game",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637195/new-light-academy/school/dsc8217.jpg",
    width: 2400,
    height: 1599,
    ratio: 2400 / 1599,
    alt: "A line of children in green and white football kits, with one in a black kit, dance in step on artificial grass in front of a watching crowd.",
    label: "Football kit dance",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637346/new-light-academy/school/dsc8756.jpg",
    width: 1598,
    height: 2400,
    ratio: 1598 / 2400,
    alt: "A girl in an orange top, pastel tulle skirt and pink shoes walks a grass runway under a tent, holding a pink handbag.",
    label: "Pink handbag",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1792077733/KARISIMBI_im_31.jpg.jpg",
    width: 6048,
    height: 4024,
    ratio: 6048 / 4024,
    alt: "Seen from above, pupils play volleyball on an outdoor court with the ball high in the air, while classmates watch from the sidelines beside a playground.",
    label: "Volleyball match",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789553581/KOLY3143.jpg",
    width: 4838,
    height: 3225,
    ratio: 4838 / 3225,
    alt: "A long line of young children in blue gowns and caps waves from a raised platform in front of a colourful school building.",
    label: "Graduates line-up",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789553587/KOLY3059.jpg",
    width: 4018,
    height: 2679,
    ratio: 4018 / 2679,
    alt: "A colourful two-storey building with balconies, where children in blue gowns stand, rises above palm trees and gardens under a clear blue sky.",
    label: "School buildings",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637357/new-light-academy/school/dsc8799.jpg",
    width: 1599,
    height: 2400,
    ratio: 1599 / 2400,
    alt: "A young girl in a leopard-print outfit and headwrap walks barefoot along a grass runway as other children follow and a crowd watches.",
    label: "Leading the parade",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789553600/KOLY2809.jpg",
    width: 3408,
    height: 2272,
    ratio: 3408 / 2272,
    alt: "Smiling pupils in red gowns, caps and bow ties walk down an orange-railed staircase beside palm leaves while an adult watches.",
    label: "Red-gown procession",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637050/new-light-academy/school/dsc7855.jpg",
    width: 2400,
    height: 1598,
    ratio: 2400 / 1598,
    alt: "A line of children in black T-shirts and white wraps with blue trim kneel on artificial grass, linking hands in a dance, as seated spectators watch.",
    label: "Dance in a line",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1790682829/new-light-academy/portal/e3xapjcjdtkwxfbkyued.png",
    width: 1122,
    height: 1402,
    ratio: 1122 / 1402,
    alt: "A smiling girl in glasses, a green school T-shirt and navy shorts stands on grass in front of a backdrop reading Quality Education Brighter Futures.",
    label: "Proud pupil",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637171/new-light-academy/school/dsc8129.jpg",
    width: 2400,
    height: 1599,
    ratio: 2400 / 1599,
    alt: "Young children in coloured T-shirts, blue shorts and white headbands walk in a line across a strip of artificial grass in a garden.",
    label: "Lining up",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1792077740/KARISIMBI_im_1.jpg.jpg",
    width: 6048,
    height: 4024,
    ratio: 6048 / 4024,
    alt: "A teacher in a white coat speaks to pupils in yellow, green and red shirts seated at wooden desks, in a classroom with picture charts on the walls.",
    label: "In the classroom",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789553590/KOLY3030.jpg",
    width: 3143,
    height: 2095,
    ratio: 3143 / 2095,
    alt: "Seen from above, two lines of young children in blue gowns and caps wait on a long walkway beside palm trees and a lawn.",
    label: "Waiting their turn",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637048/new-light-academy/school/dsc7869.jpg",
    width: 2400,
    height: 1599,
    ratio: 2400 / 1599,
    alt: "Children in black T-shirts and white wraps with blue patterns, some wearing ankle bells, dance forward together under a white and orange tent.",
    label: "Traditional dance",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637357/new-light-academy/school/dsc8780.jpg",
    width: 1599,
    height: 2400,
    ratio: 1599 / 2400,
    alt: "A boy in a fluffy beige coat, sunglasses and light jeans poses on a grass runway in front of a crowd.",
    label: "Runway pose",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637399/new-light-academy/school/dsc8958.jpg",
    width: 2400,
    height: 1598,
    ratio: 2400 / 1598,
    alt: "A large group of young children in blue gowns with yellow collars lift their mortarboards high on an open yard, with palm trees and buildings behind them.",
    label: "Caps in the air",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637147/new-light-academy/school/dsc8046.jpg",
    width: 2400,
    height: 1598,
    ratio: 2400 / 1598,
    alt: "A line of children in white T-shirts and white gloves raise their arms high during an outdoor performance on artificial grass.",
    label: "Hands up high",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637262/new-light-academy/school/dsc8411.jpg",
    width: 2400,
    height: 1599,
    ratio: 2400 / 1599,
    alt: "A brass and drum band marches across a paved courtyard below a basketball hoop, with spectators on the balconies of the surrounding buildings.",
    label: "Marching band",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637350/new-light-academy/school/dsc8789.jpg",
    width: 1598,
    height: 2400,
    ratio: 1598 / 2400,
    alt: "A child in a backwards cap, printed jacket and wide black cargo trousers walks a grass runway past watching children.",
    label: "Street style",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637235/new-light-academy/school/dsc8317.jpg",
    width: 2400,
    height: 1599,
    ratio: 2400 / 1599,
    alt: "Young children dressed as doctors and nurses, in white coats, scrubs, white caps and gloves, stand in a row on artificial grass. One holds a toy medical kit, and children at the left wear police-style uniforms.",
    label: "Little doctors",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637161/new-light-academy/school/dsc8109.jpg",
    width: 1599,
    height: 2400,
    ratio: 1599 / 2400,
    alt: "A boy in an orange T-shirt holds a microphone in front of a seated audience of children.",
    label: "Holding the mic",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637344/new-light-academy/school/dsc8738.jpg",
    width: 2400,
    height: 1599,
    ratio: 2400 / 1599,
    alt: "Four girls in stylish outfits pose with handbags on a grass runway lined with watching children.",
    label: "Runway line-up",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637167/new-light-academy/school/dsc8114.jpg",
    width: 1599,
    height: 2400,
    ratio: 1599 / 2400,
    alt: "A smiling little girl with braided hair speaks into a microphone while two boys sit and watch behind her.",
    label: "Speaking up",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637135/new-light-academy/school/dsc8053.jpg",
    width: 2400,
    height: 1599,
    ratio: 2400 / 1599,
    alt: "Children in white T-shirts and white gloves crouch and reach forward together in a dance on artificial grass.",
    label: "Group dance",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637349/new-light-academy/school/dsc8769.jpg",
    width: 1599,
    height: 2400,
    ratio: 1599 / 2400,
    alt: "A girl in a pink satin dress with a large bow walks along a grass runway in front of a blurred crowd of children.",
    label: "Runway walk",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789553607/KOLY2936.jpg",
    width: 5472,
    height: 3648,
    ratio: 5472 / 3648,
    alt: "Young children in blue gowns and caps walk down a zig-zag staircase in front of a yellow building.",
    label: "Down the stairs",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637161/new-light-academy/school/dsc8112.jpg",
    width: 1598,
    height: 2400,
    ratio: 1598 / 2400,
    alt: "A young girl in an orange dress and black velvet jacket holds a microphone with both hands in front of a seated audience.",
    label: "At the microphone",
  },
  {
    src: "https://res.cloudinary.com/mnrm0hly/image/upload/v1789637352/new-light-academy/school/dsc8774.jpg",
    width: 1598,
    height: 2400,
    ratio: 1598 / 2400,
    alt: "A boy in a white and green football kit carries a football along a grass runway past a crowd of watching children.",
    label: "Football kit walk",
  },
];
