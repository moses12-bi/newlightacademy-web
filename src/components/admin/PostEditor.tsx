"use client";

import ActionForm, { type FormAction } from "@/components/admin/ActionForm";
import MediaField from "@/components/admin/MediaField";

export interface PostEditorValues {
  id?: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body: string;
  image_url: string;
  image_width: number;
  image_height: number;
  image_focus: string;
  status: "draft" | "published";
  published_at: string;
}

export default function PostEditor({ action, post }: { action: FormAction; post: PostEditorValues }) {
  return (
    <ActionForm
      action={action}
      submitLabel="Save"
      pendingLabel="Saving…"
      extraButtons={
        <button type="submit" name="share" value="1" className="adm-btn adm-btn--ghost">
          Save &amp; share on social media
        </button>
      }
    >
      {post.id ? <input type="hidden" name="id" value={post.id} /> : null}
      <div className="adm-grid-2">
        <div className="adm-form">
          <label className="adm-field">
            <span>Title</span>
            <input type="text" name="title" defaultValue={post.title} required maxLength={200} />
          </label>
          <label className="adm-field">
            <span>Summary</span>
            <textarea name="excerpt" defaultValue={post.excerpt} rows={3} maxLength={600} />
            <small>Shown on the blog card and in search results. One or two sentences.</small>
          </label>
          <label className="adm-field">
            <span>Article</span>
            <textarea name="body" defaultValue={post.body} rows={16} />
            <small>
              Leave a blank line between paragraphs. Start a line with <code>## </code> for a heading and <code>- </code> for a
              bullet point.
            </small>
          </label>
        </div>
        <div className="adm-form">
          <label className="adm-field">
            <span>Status</span>
            <select name="status" defaultValue={post.status}>
              <option value="draft">Draft — not on the website</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className="adm-field">
            <span>Date</span>
            <input type="date" name="published_at" defaultValue={post.published_at} />
            <small>A future date keeps a published post hidden until that day.</small>
          </label>
          <label className="adm-field">
            <span>Category</span>
            <input type="text" name="category" defaultValue={post.category} list="post-categories" maxLength={40} />
            <datalist id="post-categories">
              <option value="News" />
              <option value="Events" />
              <option value="Admissions" />
              <option value="Learning" />
              <option value="Community" />
            </datalist>
          </label>
          <label className="adm-field">
            <span>Web address</span>
            <input type="text" name="slug" defaultValue={post.slug} placeholder="made from the title" />
            <small>newlight-academy.rw/blog/…</small>
          </label>
          <MediaField
            name="image"
            label="Cover photo"
            accept="image/*"
            initial={post.image_url ? { url: post.image_url, type: "image", width: post.image_width, height: post.image_height } : undefined}
            focus={post.image_focus}
          />
        </div>
      </div>
    </ActionForm>
  );
}
