import Image from "next/image";

import Container from "@/components/ui/Container";

/**
 * post-1095 #574b62d / #ec551c8 — the decorative leaves and tree standing on
 * the path illustration. The whole section is `elementor-hidden-phone`.
 */
export default function CalendarScene() {
  return (
    <div className="calendar-scene" aria-hidden="true">
      <Container>
        <div className="calendar-scene__row">
          <div className="calendar-scene__left">
            <div className="calendar-scene__leaf-2" data-reveal="rotateInDownLeft">
              <Image src="/images/home/leaf-2.svg" alt="" width={25} height={42} unoptimized />
            </div>
            <div className="calendar-scene__leaf-1" data-reveal="rotateInDownRight">
              <Image src="/images/home/leaf-1.svg" alt="" width={46} height={111} unoptimized />
            </div>
          </div>
          <div className="calendar-scene__right" data-reveal="rotateInDownRight">
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
  );
}
