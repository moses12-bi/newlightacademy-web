import Link from "next/link";

import PostEditor from "@/components/admin/PostEditor";

import { savePostAction } from "../../../actions";

export const metadata = { title: "New post" };

export default function NewPost() {
  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/blog" className="adm-small">
            ← Blog
          </Link>
          <h1>New post</h1>
        </div>
      </div>
      <PostEditor
        action={savePostAction}
        post={{
          title: "",
          slug: "",
          category: "News",
          excerpt: "",
          body: "",
          image_url: "",
          image_width: 0,
          image_height: 0,
          status: "draft",
          published_at: "",
        }}
      />
    </>
  );
}
