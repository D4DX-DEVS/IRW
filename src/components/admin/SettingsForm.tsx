"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/Toaster";
import { settingsSchema, type SettingsInput } from "@/lib/validation";
import { saveSettings } from "@/app/admin/actions/settings";

type Name = keyof SettingsInput;

function F({ name, label, reg, error, textarea, type = "text" }: { name: Name; label: string; reg: ReturnType<ReturnType<typeof useForm<SettingsInput>>["register"]>; error?: string; textarea?: boolean; type?: string }) {
  return (
    <label className="flex flex-col gap-2 text-[13px] font-semibold" htmlFor={name}>
      {label}
      {textarea ? <textarea id={name} className="input min-h-[84px] resize-y font-normal" rows={3} aria-invalid={!!error} {...reg} /> : <input id={name} type={type} className="input font-normal" aria-invalid={!!error} {...reg} />}
      {error && <span role="alert" className="font-medium text-red">{error}</span>}
    </label>
  );
}

export function SettingsForm({ values }: { values: SettingsInput }) {
  const router = useRouter();
  const { toast } = useToast();
  const { register, handleSubmit, reset, setError, formState: { errors, isDirty, isSubmitting } } = useForm<SettingsInput>({ resolver: zodResolver(settingsSchema), defaultValues: values });
  const r = (n: Name) => register(n);
  const e = (n: Name) => errors[n]?.message as string | undefined;

  const onSubmit = handleSubmit(async (v) => {
    const res = await saveSettings(v);
    if (!res.ok) {
      for (const [k, m] of Object.entries(res.fieldErrors ?? {})) setError(k as Name, { message: m });
      return toast(res.error, { tone: "error" });
    }
    toast(res.message ?? "Saved");
    reset(v);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <section className="card flex flex-col gap-4 rounded-[18px] p-6">
        <h2 className="text-[17px] font-bold">Organisation</h2>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <F name="orgName" label="Organisation name" reg={r("orgName")} error={e("orgName")} />
          <F name="tagline" label="Tagline" reg={r("tagline")} error={e("tagline")} />
          <F name="founded" label="Founded (year)" reg={r("founded")} error={e("founded")} />
        </div>
        <F name="about" label="Footer about text" reg={r("about")} error={e("about")} textarea />
      </section>
      <section className="card flex flex-col gap-4 rounded-[18px] p-6">
        <h2 className="text-[17px] font-bold">Contact &amp; phones</h2>
        <F name="address" label="Address" reg={r("address")} error={e("address")} textarea />
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <F name="phone1" label="Emergency phone" reg={r("phone1")} error={e("phone1")} type="tel" />
          <F name="phone2" label="Phone 2" reg={r("phone2")} error={e("phone2")} type="tel" />
          <F name="phone3" label="Phone 3" reg={r("phone3")} error={e("phone3")} type="tel" />
          <F name="email" label="Email" reg={r("email")} error={e("email")} type="email" />
          <F name="whatsapp" label="WhatsApp number (digits only, with country code)" reg={r("whatsapp")} error={e("whatsapp")} />
        </div>
      </section>
      <section className="card flex flex-col gap-4 rounded-[18px] p-6">
        <h2 className="text-[17px] font-bold">Social links</h2>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <F name="facebook" label="Facebook URL" reg={r("facebook")} error={e("facebook")} />
          <F name="youtube" label="YouTube URL" reg={r("youtube")} error={e("youtube")} />
        </div>
      </section>
      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl border border-line bg-white/95 p-3 shadow-pop backdrop-blur">
        {isDirty && <span className="mr-auto pl-2 text-[13px] text-muted">Unsaved changes</span>}
        <button type="button" className="btn btn-ghost" disabled={!isDirty} onClick={() => reset(values)}>Discard</button>
        <button type="submit" className="btn btn-navy" disabled={!isDirty || isSubmitting}>{isSubmitting && <Loader2 size={15} className="animate-spin" />} Save changes</button>
      </div>
    </form>
  );
}
