import Image from "next/image";

import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";

/**
 * post-1091 #6f2904b — the second cream band, closed by a wavy edge. It carries
 * `elementor-reverse-mobile`, so the photo leads on phones.
 */
export default function PaymentOnline() {
  return (
    <section className="payment-online">
      <ShapeDivider position="bottom" />

      <Container>
        <div className="payment-split">
          <div className="payment-card">
            <h2 data-reveal="fadeIn" data-delay="200">
              Fees and payments
            </h2>
            <p>
              We publish no figures and no account details on this page. Anything to do with money
              is best taken up with the school itself, so that you always know exactly what you are
              paying and who you are paying.
            </p>
            <div>
              <p>
                Questions about what is due for your child’s class, when it is due and the ways you
                may pay are all best put to the school office. If anything is unclear, ask us — it
                is a fair question and we are happy to answer it.
              </p>
              <p>
                If you ever receive payment instructions that do not appear to come from us, please
                check with the school office before acting on them.
              </p>
            </div>

            <h2 data-reveal="fadeIn" data-delay="200">
              Asking us a question
            </h2>
            <div>
              {/* No amounts, accounts or payment codes belong on a public page:
                  the school gives those to each family directly. */}
              <p>
                If there is anything about fees or payments you would like to ask, please put it to
                us directly. Questions about money are normal ones, and we would rather you asked
                than wondered.
              </p>
              <p>
                You can use the form below, or contact the school office using the details on our
                contact page, and we will get back to you.
              </p>
            </div>
          </div>

          <div className="payment-photo payment-photo--right">
            <Image
              src="/images/make-a-payment/h-17-pj0d456cnv2kzwqrvtnaz41xab8w4aei06wmuc48cg.jpg"
              alt="A toddler in dungarees kneeling on a rug, pushing a wooden train around a track"
              width={800}
              height={800}
              sizes="(max-width: 1024px) 100vw, 50vw"
              data-fx='{"translateY":{"speed":4,"affectedRange":{"start":0,"end":100}}}'
              data-fx-range="page"
              data-fx-devices="desktop"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
