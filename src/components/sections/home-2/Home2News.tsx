import Image from "next/image";
import Link from "next/link";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";
import { getPosts, homeTwoNewsSlugs } from "@/lib/blog-posts";

/**
 * The News row (post-1104 #189eee96): a cream band with the mountain in the
 * bottom-left corner, three post cards and the link through to the blog.
 *
 * The band exists only for real school news: with no posts to show there is
 * nothing to announce, so the whole section — heading, cards and "View all"
 * link — drops out rather than rendering an empty grid.
 */
export default function Home2News() {
  const posts = getPosts(homeTwoNewsSlugs);

  return posts.length > 0 ? (
    <section className="home2-news">
      <ShapeDivider position="top" />
      <ShapeDivider position="bottom" />

      <Container>
        <h2 className="home2-news__title">News</h2>

        <ul className="home2-news__grid">
          {posts.map((post) => (
            <li key={post.slug}>
              <article className="home2-news__card">
                <div className="home2-news__thumb">
                  <Image
                    src={post.image.src}
                    alt=""
                    fill
                    sizes="(min-width: 1025px) 33vw, 100vw"
                    className="home2-news__image"
                  />
                </div>
                <p className="home2-news__badge">{post.category}</p>
                <h3 className="home2-news__heading">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
              </article>
            </li>
          ))}
        </ul>

        <div className="home2-news__footer">
          <div className="home2-news__cta">
            <Button href="/blog" variant="outline">
              View all
            </Button>
          </div>
          <Image
            src="/images/home/illustration-tree-3.svg"
            alt=""
            width={124}
            height={140}
            unoptimized
            className="home2-news__tree"
            data-reveal="rotateInDownRight"
          />
        </div>
      </Container>
    </section>
  ) : null;
}
