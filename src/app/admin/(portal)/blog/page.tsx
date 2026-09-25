import Link from "next/link";

import Flash from "@/components/admin/Flash";
import { formatDate } from "@/lib/admin/format";
import { listPosts } from "@/lib/server/posts";

export const metadata = { title: "Blog" };

export default async function BlogAdmin({ searchParams }: PageProps<"/admin/blog">) {
  const params = await searchParams;
  const posts = listPosts();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Blog</h1>
          <p>News and stories published at /blog on the website.</p>
        </div>
        <Link href="/admin/blog/new" className="adm-btn">
          New post
        </Link>
      </div>
      <Flash ok={params.ok} error={params.error} />
      {posts.length === 0 ? (
        <div className="adm-card adm-empty">No posts yet. The blog page on the website stays empty until the first one is published.</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const { scheduled } = post;
                return (
                  <tr key={post.id}>
                    <td>
                      <Link href={`/admin/blog/${post.id}`}>
                        <b>{post.title}</b>
                      </Link>
                      <div className="adm-muted adm-small">/blog/{post.slug}</div>
                    </td>
                    <td>{post.category}</td>
                    <td>
                      {scheduled ? (
                        <span className="adm-pill adm-pill--warn">Scheduled</span>
                      ) : post.status === "published" ? (
                        <span className="adm-pill adm-pill--ok">Published</span>
                      ) : (
                        <span className="adm-pill">Draft</span>
                      )}
                    </td>
                    <td>{formatDate(post.published_at ?? post.updated_at)}</td>
                    <td>
                      {post.status === "published" && !scheduled ? (
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                          View ↗
                        </a>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
