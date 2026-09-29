import Link from "next/link";
import { notFound } from "next/navigation";

import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import Flash from "@/components/admin/Flash";
import PostEditor from "@/components/admin/PostEditor";
import { isoToKigaliDate } from "@/lib/admin/format";
import { getPostById } from "@/lib/server/posts";

import { deletePostAction, savePostAction } from "../../../actions";
import { requireUser } from "@/lib/server/auth";

export const metadata = { title: "Edit post" };

export default async function EditPost({ params, searchParams }: PageProps<"/admin/blog/[id]">) {
  await requireUser();
  const { id } = await params;
  const flash = await searchParams;
  const post = getPostById(Number(id));
  if (!post) notFound();

  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/blog" className="adm-small">
            ← Blog
          </Link>
          <h1>{post.title}</h1>
        </div>
        <div className="adm-actions">
          {post.status === "published" ? (
            <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="adm-btn adm-btn--ghost">
              View on website ↗
            </a>
          ) : null}
          <form action={deletePostAction}>
            <input type="hidden" name="id" value={post.id} />
            <ConfirmSubmit message="Delete this post? This cannot be undone.">Delete</ConfirmSubmit>
          </form>
        </div>
      </div>
      <Flash ok={flash.ok} error={flash.error} />
      <PostEditor
        key={post.updated_at}
        action={savePostAction}
        post={{ ...post, published_at: isoToKigaliDate(post.published_at) }}
      />
    </>
  );
}
