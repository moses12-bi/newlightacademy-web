import Image from "next/image";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { site } from "@/lib/site";

/**
 * post-1091 #238b138 — a cream band with the snail illustration along its
 * bottom edge: the photo on the left slides under the white copy card.
 */
export default function PaymentIntro() {
  return (
    <section className="payment-intro">
      <Container>
        <div className="payment-split">
          <div className="payment-photo payment-photo--left">
            <Image
              src="/images/make-a-payment/h-15-pj0d3vs1788ldqqw29xrngp02odru7vhbabp90m7hg.jpg"
              alt="Three children crouching on a woodland path, examining the ground through magnifying glasses"
              width={1000}
              height={650}
              sizes="(max-width: 1024px) 100vw, 50vw"
              data-fx='{"translateY":{"speed":4,"affectedRange":{"start":0,"end":100}}}'
              data-fx-range="page"
              data-fx-devices="desktop"
            />
          </div>

          <div className="payment-card">
            <h2 data-reveal="fadeIn" data-delay="200">
              Paying school fees at {site.name}
            </h2>
            <div>
              <p>
                We know that school fees are a serious commitment for a family, and we would rather
                explain them to you properly than leave you to work them out from a web page.
              </p>
              <p>
                Please contact the school office for the current fee details and the ways you can
                pay. We will be glad to talk them through with you and to answer any question you
                have.
              </p>
            </div>
            <Button href="/location">Contact the school office</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
