import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";
import { site } from "@/lib/site";

/**
 * "Education for your child at <school>" — post-2461 #b6b0197.
 *
 * Cream band with the mountain illustration pinned to the bottom-left corner
 * and a wavy white edge at the bottom. Two columns, 40/60 on desktop and
 * 25/75 on tablet.
 */
export default function AdmissionsEducation() {
  return (
    <section className="adm-band adm-band--cream adm-education" aria-labelledby="admissions-education">
      <ShapeDivider position="bottom" />
      <Container>
        <div className="adm-row adm-row--wide">
          <div className="adm-education__heading">
            <h2 id="admissions-education">Education for your child at {site.name}</h2>
          </div>

          <div className="adm-education__body adm-copy">
            <p>
              We are a Christian day school in Kinyinya offering nursery and primary education,
              following the Rwanda national curriculum from Baby Class through to P6. Children learn
              here through curiosity, care and steady foundational skills, and they leave us
              confident and ready for the next step. If you would like to know whether we are the
              right school for your child, the best thing to do is come and talk to us.
            </p>
            <div className="mt-[30px]">
              <Button href="/about">Read more</Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
