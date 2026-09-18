import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import HomeExperience from "@/components/sections/HomeExperience";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";
import VideoFrame from "@/components/ui/VideoFrame";
import { displayPhone, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Welcome",
  description: `${site.tagline}. ${site.name} is a nursery and primary day school in Kinyinya, Kigali, where children are encouraged to learn, grow, discover and build strong character.`,
};

const programs = [
  { title: "Baby Class", image: "/images/home/h-17.jpg", text: "Our youngest children settle in gently, learning to play, to share and to explore with confidence.", meta: "Ages 3–4 years", href: "/infants" },
  { title: "Middle Class", image: "/images/home/h-19.jpg", text: "Children grow in language, curiosity and early number sense through guided play.", meta: "Ages 4–5 years", href: "/toddlers" },
  { title: "Top Class", image: "/images/home/h-16.jpg", text: "Children prepare for Primary 1 with early reading, writing and counting.", meta: "Ages 5–6 years", href: "/preschool" },
  { title: "Primary", image: "/images/home/h-20.jpg", text: "Pupils follow the Rwanda national curriculum and work towards the Primary Leaving Examination.", meta: "P1 to P6", href: "/kindergarten" },
] as const;

const posts = [
  { tag: "Learning", title: "Why play matters so much in the early years", image: "/images/home/blog-photo-2.jpg" },
  { tag: "Parents", title: "Helping your child settle happily into a new class", image: "/images/home/h-20.jpg" },
  { tag: "Reading", title: "Simple ways to read together with your child at home", image: "/images/home/blog-photo-1.jpg" },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="home-one-hero">
        <ShapeDivider position="top" />
        <ShapeDivider position="bottom" />
        <div className="home-one-hero-shade" />
        <div className="home-one-floral">
          <Image data-reveal="zoomIn" data-delay="700" src="/images/home/bird.svg" alt="" width={112} height={86} priority unoptimized className="home-one-bird" />
          <div className="home-one-title">
            <h1 className="sr-only">Welcome to {site.name} — {site.tagline}</h1>
            <p data-reveal="fadeInUp" data-delay="900">The Home of</p>
            <strong data-reveal="zoomInDown" data-delay="400">Happiness</strong>
            <p data-reveal="fadeInDown" data-delay="900">for Your Children</p>
          </div>
          <div data-reveal="zoomIn" data-delay="700" className="home-one-people"><Button href="/about">Explore Our School</Button></div>
        </div>
        <Image data-reveal="rubberBand" data-delay="300" data-motion="home-dots" src="/images/home/dots.svg" alt="" width={771} height={445} unoptimized className="home-one-dots" />
      </section>

      <section className="home-passion">
        <Container>
          <div className="home-passion-heading">
            <span data-reveal="fadeIn">We</span>
            <div><h2>are a nursery and primary school, and children are our passion.</h2><p>{site.name} is a Christian day school in Kinyinya, Kigali, offering nursery and primary education under the Rwanda national curriculum. We are an inclusive school, and we know every child by name — encouraging each one to learn, grow, discover and build strong character.</p></div>
          </div>
          <HomeExperience />
          <div className="home-passion-illustration" data-motion="home-people"><Image src="/images/home/illustration-people-1.svg" alt="" width={210} height={268} unoptimized /></div>
        </Container>
      </section>

      <section className="home-programs">
        <Container>
          <div className="home-section-heading"><span>Ages</span><h2>we meet children where they are.</h2></div>
          <div className="home-program-grid">
            {programs.map((program) => (
              <Link href={program.href} key={program.title} className="home-program-card">
                <div className="home-program-photo"><Image src={program.image} alt="" fill sizes="(min-width: 1025px) 25vw, (min-width: 768px) 50vw, 100vw" /></div>
                <h3>{program.title}</h3><p>{program.text}</p><span>{program.meta}</span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="home-tour">
        <Container className="home-tour-layout">
          <div className="home-tour-person" data-motion="home-person"><Image src="/images/home/illustration-people-2.svg" alt="" width={227} height={400} unoptimized /></div>
          <div className="home-tour-copy">
            <div className="home-section-heading"><span>Come</span><h2>over and look around.</h2></div>
            <p>We would be glad to welcome you and to show you where your child would learn and play. If you have any questions, please get in touch with the school office.</p>
            <div className="home-tour-actions"><Button href="/schedule-a-tour">Schedule a Visit</Button><span>or</span><Link href="/how-to-apply">See How to Apply</Link></div>
          </div>
        </Container>
      </section>

      <section className="home-contact"><Container className="home-contact-grid">
        <div><h4>{site.addressLines[0]}</h4><p>{site.addressLines[1]}</p></div><div><h4>Find us at:</h4><p>{site.addressDetail}</p></div><div><h4>Phone:</h4><a href={site.phoneHref}>{displayPhone()}</a></div><div><h4>Email:</h4><a href={`mailto:${site.email}`}>{site.email}</a></div>
      </Container></section>

      <section className="home-news">
        <ShapeDivider position="top" /><ShapeDivider position="bottom" />
        <Container>
          <div className="home-section-heading"><span>News</span></div>
          <div className="home-news-grid">{posts.map((post) => (
            <article key={post.title} className="home-news-card"><Link href="/blog"><div className="home-news-photo"><Image src={post.image} alt="" fill sizes="(min-width: 1025px) 33vw, 100vw" /></div></Link><span>{post.tag}</span><h3><Link href="/blog">{post.title}</Link></h3></article>
          ))}</div>
          <div className="home-news-more"><Button href="/blog" variant="outline">View all</Button></div>
        </Container>
      </section>

      <section className="home-testimonials"><Container className="home-testimonial-layout">
        <div className="home-testimonial-tv" data-reveal="jello"><Image src="/images/tv-top.svg" alt="" width={266} height={129} unoptimized className="home-tv-top" /><div className="home-tv-screen"><VideoFrame videoId="SXNboPPEQKI" title="A short video about early learning" poster="/images/home/parents-1.jpg" /></div><Image src="/images/tv-bottom.svg" alt="" width={205} height={53} unoptimized className="home-tv-bottom" /></div>
        <div className="home-testimonial-copy"><div className="home-section-heading"><span>Happy</span><h2>children. That is what we<br />hope for every child.</h2></div><p>Learning begins early, and it begins with feeling safe and cared for. That is the work we set ourselves at {site.name}: curiosity, kindness and steady progress, day after day.</p><Button href="/about" variant="outline">More About Our School</Button></div>
        <Image src="/images/home/illustration-people-3.svg" alt="" width={320} height={250} unoptimized className="home-testimonial-people" />
      </Container></section>

      <section className="home-cta"><Container className="home-cta-grid">
        <Link href="/faq"><span>?</span><div><h3>Any Questions?</h3><p>Make an Enquiry</p></div></Link><Link href="/schedule-a-tour"><span>⌂</span><div><h3>See it Yourself!</h3><p>Book a visit</p></div></Link><Link href="/how-to-apply"><span>✓</span><div><h3>Ready to Join?</h3><p>How to apply</p></div></Link>
      </Container></section>
    </>
  );
}
