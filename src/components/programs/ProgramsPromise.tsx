import Image from "next/image";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { site } from "@/lib/site";

/** The scroll scale Elementor puts on the oversized "Our", desktop only. */
const SENSEI_FX = '{"scale":{"direction":"in-out","speed":2,"range":{"start":0,"end":40}}}';

/**
 * post-46 #59486fb and #7c9c3eb: "Our promise to families." followed by the
 * decorative leaves-and-tree strip that overlaps it.
 */
export default function ProgramsPromise() {
  return (
    <>
      <section className="programs-promise" aria-labelledby="programs-promise-title">
        <Container>
          <div className="programs-promise__row">
            <div className="programs-promise__word">
              <p
                className="program-sensei program-sensei--tight"
                data-fx={SENSEI_FX}
                data-fx-devices="desktop"
              >
                Our
              </p>
            </div>

            <div className="programs-promise__copy">
              <h2 id="programs-promise-title">promise to families.</h2>
              <p>
                At {site.name}, we know childhood is a short and precious season. We believe it is our
                responsibility to give children a school that is safe, orderly and kind: classrooms
                where they are known by name, lessons that follow the Rwanda national curriculum,
                and teachers who care about who a child is becoming as well as what they can do.
              </p>
              <div>
                <Button href="/location" variant="outline">
                  Find us
                </Button>
              </div>
              <div className="programs-promise__gap" aria-hidden="true" />
            </div>
          </div>
        </Container>
      </section>

      <div className="programs-foliage" aria-hidden="true">
        <Container>
          <div className="programs-foliage__row">
            <div className="programs-foliage__leaves">
              <div className="programs-foliage__leaf-2" data-reveal="rotateInDownLeft">
                <Image src="/images/home/leaf-2.svg" alt="" width={25} height={42} unoptimized />
              </div>
              <div className="programs-foliage__leaf-1" data-reveal="rotateInDownRight">
                <Image src="/images/home/leaf-1.svg" alt="" width={46} height={111} unoptimized />
              </div>
            </div>

            <div className="programs-foliage__tree" data-reveal="rotateInDownRight">
              <Image
                src="/images/home/illustration-tree-2.svg"
                alt=""
                width={141}
                height={148}
                unoptimized
              />
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
