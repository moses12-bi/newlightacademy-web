import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Container from "@/components/ui/Container";
import PostBody from "@/components/sections/blog/PostBody";
import { formatPostDate } from "@/lib/blog-posts";
import { publishedPost } from "@/lib/server/public-blog";
import { site } from "@/lib/site";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

/* Posts come from the staff portal's database, so each is rendered per request. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = publishedPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || undefined,
      images: post.image ? [post.image.src] : undefined,
    },
    /* A card-only post is thin content; a full article is worth indexing. */
    robots: post.body ? undefined : { index: false, follow: true },
  };
}

/**
 * A single blog post.
 *
 * A post carries a category, a date, a photo, a title, a short summary and —
 * for posts written in the staff portal — the full article. A post with no
 * article shows the summary and says so rather than padding it out.
 */
export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = publishedPost(slug);
  if (!post) notFound();

  return (
    <article className="blog-post">
      <Container className="blog-post__inner">
        <p className="blog-post__meta">
          <span className="blog-post__badge">{post.category}</span>
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
        </p>
        <h1 className="blog-post__title">{post.title}</h1>

        {post.image ? (
          /* A fixed landscape frame, so a tall phone photo does not fill several
             screens; the focus point chosen in the portal stays in view. */
          <div className="blog-post__photo">
            <Image
              src={post.image.src}
              alt=""
              fill
              sizes="(min-width: 1025px) 960px, 100vw"
              style={{ objectPosition: post.image.focus }}
              priority
            />
          </div>
        ) : null}

        {post.excerpt ? <p className="blog-post__excerpt">{post.excerpt}</p> : null}

        {post.body ? (
          <PostBody text={post.body} />
        ) : (
          <p className="blog-post__note">
            This is the summary shown for this post in the {site.name} news feed.
          </p>
        )}

        <Link href="/blog" className="blog-post__back">
          ← Back to the blog
        </Link>
      </Container>
    </article>
  );
}
