import Image from "next/image";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-accent-8 py-[100px] min-[1025px]:py-[130px]">
      <ShapeDivider position="top" />
      <ShapeDivider position="bottom" />
      <Container className="relative z-[2]">
        <div className="mx-auto flex max-w-[720px] flex-col items-center text-center">
          <Image
            src="/images/fox-color.svg"
            alt=""
            width={157}
            height={145}
            unoptimized
            className="h-auto w-[120px]"
          />
          <p className="mt-6 text-sm font-semibold tracking-[0.2em] text-accent-1 uppercase">
            Error 404
          </p>
          <h1 className="mt-4">This page has gone out to play</h1>
          <p className="mt-5 text-[20px]">
            We could not find the page you were looking for. It may have moved, or the link may have
            a typo in it. Try the menu above, or head back to the {site.name} home page — we are
            always happy to help you find your way.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/">Back home</Button>
            <Button href="/about" variant="outline">
              About us
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
