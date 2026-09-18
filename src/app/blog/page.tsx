import type { Metadata } from "next";

import BlogFeed from "@/components/sections/blog/BlogFeed";
import PageHero from "@/components/ui/PageHero";
import { blogArchiveSlugs, getPosts } from "@/lib/blog-posts";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description:
    `News and updates from ${site.name} in Kinyinya, Kigali — life at school, learning and the children we care for.`,
};

export default function BlogPage() {
  return (
    <>
      {/*
        post-595 #602da732: 140px/60px block padding instead of the shared hero's
        100px/0, and a 50%-white overlay over the cream (var(--color-accent-8) -> var(--color-surface-warm)) so the
        cream bottom wave reads against the cream band that follows. Both arrive
        as inline values rather than as overrides of the shared `w-hero` rules;
        `--blog-hero-pad` is re-declared per breakpoint in styles/misc.css.
      */}
      <PageHero
        title="Blog"
        titleReveal="fadeIn"
        titleDelay="100"
        className="blog-hero"
        style={{ padding: "var(--blog-hero-pad)", background: "var(--color-surface-warm)" }}
        dividerFill={{ bottom: "var(--color-accent-8)" }}
      />
      <BlogFeed posts={getPosts(blogArchiveSlugs)} />
    </>
  );
}
