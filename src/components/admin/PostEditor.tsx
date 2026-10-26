"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toaster";
import { POST_TYPES } from "@/lib/utils";
import { postSchema, type PostInput } from "@/lib/validation";
import { savePost } from "@/app/admin/actions/posts";

export interface EditorPost {
  id: string | null;
  values: PostInput;
  coverUrl: string | null;
  status: string;
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 text-[13px] font-semibold">
      <label>{label}{children}</label>
      {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
      {error && <span role="alert" className="text-[13px] font-medium text-red">{error}</span>}
    </div>
  );
}

export function PostEditor({ post, listHref }: { post: EditorPost; listHref: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(post.coverUrl);
  const [removeCover, setRemoveCover] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);

  const { register, control, handleSubmit, setError, watch, formState: { errors, isDirty } } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: post.values,
  });
  const featured = watch("featured");

  const submit = (intent: "draft" | "publish") =>
    handleSubmit(async (values) => {
      setSaving(intent);
      const fd = new FormData();
      fd.set("json", JSON.stringify(values));
      fd.set("intent", intent);
      if (post.id) fd.set("id", post.id);
      if (cover) fd.set("cover", cover);
      if (removeCover) fd.set("removeCover", "1");
      const res = await savePost(fd);
      setSaving(null);
      if (!res.ok) {
        toast(res.error, { tone: "error" });
        for (const [k, m] of Object.entries(res.fieldErrors ?? {})) setError(k as keyof PostInput, { message: m });
        return;
      }
      toast(res.message ?? "Saved");
      if (!post.id && res.data) router.replace(`/admin/news/${res.data.id}`);
      else router.refresh();
    });

  const onFile = (f: File | undefined) => {
    if (!f) return;
    setCover(f);
    setRemoveCover(false);
    setPreview(URL.createObjectURL(f));
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3.5">
        <div className="flex flex-col gap-1">
          <nav aria-label="Breadcrumb" className="text-[13px] text-muted"><Link href={listHref} className="hover:text-red">Posts</Link> / {post.id ? "Edit" : "New"}</nav>
          <h1 className="text-[28px] font-extrabold tracking-tight">{post.id ? "Edit post" : "New post"}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {isDirty && <span className="text-[13px] text-muted">Unsaved changes</span>}
          {post.id && post.status === "PUBLISHED" && <Link href={`/news-events/${post.values.slug}`} target="_blank" className="btn btn-ghost">View on site</Link>}
          <button type="button" className="btn btn-ghost" disabled={!!saving} onClick={submit("draft")}>
            {saving === "draft" && <Loader2 size={15} className="animate-spin" />} Save draft
          </button>
          <button type="button" className="btn btn-red" disabled={!!saving} onClick={() => setConfirmPublish(true)}>
            {saving === "publish" && <Loader2 size={15} className="animate-spin" />} {post.status === "PUBLISHED" ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-4">
          <div className="card flex flex-col gap-[18px] rounded-[18px] p-6">
            <Field label="Title" error={errors.title?.message}>
              <input className="input ml mt-2 !min-h-[54px] !text-xl !font-bold" aria-invalid={!!errors.title} {...register("title")} />
            </Field>
            <Field label="Slug" error={errors.slug?.message} hint="Leave empty to generate from the title.">
              <div className="mt-2 flex items-center overflow-hidden rounded-[10px] border border-line2 bg-white focus-within:border-navy">
                <span className="self-stretch border-r border-line bg-[#f7fafd] px-3 py-3 text-[13px] font-normal text-muted">/news-events/</span>
                <input className="min-w-0 flex-1 px-3 py-2.5 text-sm font-normal outline-none" {...register("slug")} />
              </div>
            </Field>
            <Field label="Summary" error={errors.excerpt?.message} hint="Shown on cards and search results (max 400 characters).">
              <textarea className="input ml mt-2 min-h-[80px] resize-y font-normal" rows={2} {...register("excerpt")} />
            </Field>
            <Field label="Content" error={errors.body?.message} hint="Separate paragraphs with a blank line. Start a line with “## ” for a heading or “> ” for a quote. Links are detected automatically.">
              <textarea className="input ml mt-2 min-h-[320px] resize-y font-normal leading-8" rows={14} {...register("body")} />
            </Field>
          </div>
        </div>

        <aside className="flex min-w-[300px] flex-[1_1_320px] flex-col gap-4">
          <div className="card flex flex-col gap-4 rounded-[18px] p-[22px]">
            <h2 className="text-base font-bold">Publish settings</h2>
            <Field label="Type">
              <div className="mt-2">
                <Controller control={control} name="type" render={({ field }) => (
                  <Select ariaLabel="Type" value={field.value} onValueChange={field.onChange} options={Object.entries(POST_TYPES).map(([value, label]) => ({ value, label }))} />
                )} />
              </div>
            </Field>
            <Field label="Tags" hint="Comma separated, e.g. Wayanad, Landslide">
              <input className="input mt-2 font-normal" {...register("tags")} />
            </Field>
            <Field label="Publish date" error={errors.publishedAt?.message} hint="Future date schedules the post.">
              <input type="datetime-local" className="input mt-2 font-normal" {...register("publishedAt")} />
            </Field>
            <div className="flex items-center justify-between text-sm font-semibold">
              Feature on home page
              <Controller control={control} name="featured" render={({ field }) => <Switch label="Feature on home page" checked={!!field.value} onCheckedChange={field.onChange} />} />
            </div>
            {featured && <p className="text-xs text-muted">Featured achievements appear in the home page highlight.</p>}
          </div>

          <div className="card flex flex-col gap-3 rounded-[18px] p-[22px]">
            <h2 className="text-base font-bold">Cover image</h2>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Cover preview" className="h-[170px] w-full rounded-xl object-cover" />
            ) : (
              <div className="ph flex h-[170px] items-center justify-center rounded-xl text-xs uppercase tracking-wider text-white/80">No cover</div>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" aria-label="Upload cover image" onChange={(e) => onFile(e.target.files?.[0])} />
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost flex-1 !min-h-10" onClick={() => fileRef.current?.click()}><ImagePlus size={16} /> {preview ? "Replace" : "Upload"}</button>
              {preview && <button type="button" aria-label="Remove cover" className="btn btn-ghost !min-h-10 !px-3" onClick={() => { setPreview(null); setCover(null); setRemoveCover(true); }}><Trash2 size={16} /></button>}
            </div>
            <Field label="Alt text">
              <input className="input mt-2 font-normal" placeholder="Describe the photo" {...register("alt")} />
            </Field>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmPublish}
        onOpenChange={setConfirmPublish}
        tone="primary"
        title={post.status === "PUBLISHED" ? "Update this post?" : "Publish this post?"}
        description="It goes live on the public site right away (or at the chosen future date). Pages refresh within seconds."
        confirmLabel={post.status === "PUBLISHED" ? "Update now" : "Publish now"}
        onConfirm={() => submit("publish")()}
      />
    </form>
  );
}
