import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Container from "@/components/ui/Container";
import { blogPosts, formatPostDate, getPost } from "@/lib/blog-posts";
import { site } from "@/lib/site";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt || undefined,
    robots: { index: false, follow: true },
  };
}

/**
 * A single blog post.
 *
 * A post carries a category, a date, a photo, a title and a short summary — a
 * full article body is not part of the data model yet, so the page shows the
 * summary and says so rather than padding it out with invented text.
 *
 * The post list is empty until the school supplies its own news, so every slug
 * currently falls through to `notFound()` and `generateStaticParams` returns an
 * empty array, which is a valid result rather than an error.
 */
export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="blog-post">
      <Container className="blog-post__inner">
        <p className="blog-post__meta">
          <span className="blog-post__badge">{post.category}</span>
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
        </p>
        <h1 className="blog-post__title">{post.title}</h1>

        <div className="blog-post__photo">
          <Image
            src={post.image.src}
            alt=""
            width={post.image.width}
            height={post.image.height}
            sizes="(min-width: 1025px) 960px, 100vw"
            priority
          />
        </div>

        {post.excerpt ? <p className="blog-post__excerpt">{post.excerpt}</p> : null}

        <p className="blog-post__note">
          This is the summary shown for this post in the {site.name} news feed.
        </p>

        <Link href="/blog" className="blog-post__back">
          ← Back to the blog
        </Link>
      </Container>
    </article>
  );
}
