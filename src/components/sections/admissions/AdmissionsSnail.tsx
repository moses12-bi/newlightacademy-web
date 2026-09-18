/**
 * The snail strip — post-2461 #10d2c83.
 *
 * A full-width cream band whose only content is a 62px spacer; the snail is the
 * section's background image, pinned to the bottom edge, and it slides sideways
 * with the scroll (Elementor `background_motion_fx_translateX`, desktop only).
 *
 * The saved speed is 10, which in Elementor's formula is a +/-500px swing. The
 * band is 62px tall and clipped, so at that speed the snail leaves the frame
 * entirely; this uses the project's existing `snail` shorthand instead, the same
 * translateX speed already used for this illustration on /about.
 */
export default function AdmissionsSnail() {
  return (
    <div className="adm-snail" aria-hidden="true">
      <div className="adm-snail__layer" data-motion="snail" />
      <div className="adm-snail__spacer" />
    </div>
  );
}
