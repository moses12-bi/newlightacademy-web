import VideoLightbox from "@/components/programs/VideoLightbox";
import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";

/**
 * post-46 #f948bec: a full-width band whose Elementor background is a YouTube
 * clip, with a single play button in the middle that opens a second clip in a
 * lightbox. Nothing may reach youtube.com before a gesture, so the band keeps
 * the theme's deep teal and only the button loads a player. The clip id is
 * still the template's own and is waiting on the school's own footage.
 */
export default function ProgramsVideoBand() {
  return (
    <section className="programs-video">
      <ShapeDivider position="top" />
      <ShapeDivider position="bottom" />
      <Container>
        <div className="programs-video__inner">
          <VideoLightbox videoId="67ouh2PgUfk" label="Play the video" />
        </div>
      </Container>
    </section>
  );
}
