"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, CheckCircle2, Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { Select } from "@/components/ui/Select";
import { DISTRICTS, TOPICS } from "@/lib/utils";
import { inquirySchema, type InquiryInput } from "@/lib/validation";
import { submitInquiry } from "@/app/(site)/contact-us/actions";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold">
      {label}
      {children}
      {error && <span role="alert" className="text-[13px] font-medium text-red">{error}</span>}
    </label>
  );
}

export function ContactForm({ defaultTopic }: { defaultTopic: string }) {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register, control, handleSubmit, setError, reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { name: "", email: "", phone: "", topic: (defaultTopic in TOPICS ? defaultTopic : "VOLUNTEER") as InquiryInput["topic"], district: "", message: "", website: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");
    const res = await submitInquiry(values);
    if (res.ok) {
      setDone(true);
      reset();
      return;
    }
    setServerError(res.error);
    for (const [k, m] of Object.entries(res.fieldErrors ?? {})) setError(k as keyof InquiryInput, { message: m });
  });

  if (done) {
    return (
      <div className="surface flex min-w-0 flex-[999_1_560px] flex-col items-start gap-4 p-8 sm:p-10" role="status">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700"><CheckCircle2 size={28} /></span>
        <h2 className="text-[30px] font-extrabold">Message sent</h2>
        <p className="max-w-md text-muted">Thank you for reaching out. A member of the IRW team will get back to you soon. For emergencies please call the lines on the left.</p>
        <button className="btn btn-ghost" onClick={() => setDone(false)}>Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="surface flex min-w-0 flex-[999_1_560px] flex-col gap-5 p-8 sm:p-10">
      <h2 className="text-[30px] font-extrabold">Send us a message</h2>
      <div className="grid gap-[18px] sm:grid-cols-2">
        <Field label="Full name" error={errors.name?.message}>
          <input className="input" aria-invalid={!!errors.name} placeholder="Your name" {...register("name")} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <input className="input" type="tel" placeholder="+91" {...register("phone")} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input className="input" type="email" aria-invalid={!!errors.email} placeholder="you@example.com" {...register("email")} />
        </Field>
        <Field label="Enquiry type" error={errors.topic?.message}>
          <Controller control={control} name="topic" render={({ field }) => (
            <Select ariaLabel="Enquiry type" value={field.value} onValueChange={field.onChange} options={Object.entries(TOPICS).map(([value, label]) => ({ value, label }))} />
          )} />
        </Field>
        <Field label="District">
          <Controller control={control} name="district" render={({ field }) => (
            <Select ariaLabel="District" value={field.value || undefined} onValueChange={field.onChange} placeholder="Select district" options={DISTRICTS.map((d) => ({ value: d, label: d }))} />
          )} />
        </Field>
      </div>
      <Field label="Message" error={errors.message?.message}>
        <textarea className="input min-h-[150px] resize-y" rows={6} aria-invalid={!!errors.message} placeholder="How can we help?" {...register("message")} />
      </Field>
      {/* honeypot — hidden from people */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" {...register("website")} />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2.5 text-sm leading-snug text-muted">
          <Controller control={control} name="consent" render={({ field }) => (
            <Checkbox.Root id="consent" checked={field.value === true} onCheckedChange={(c) => field.onChange(c === true ? true : undefined)} className="mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded border border-line2 bg-white data-[state=checked]:border-red data-[state=checked]:bg-red">
              <Checkbox.Indicator className="text-white"><Check size={13} /></Checkbox.Indicator>
            </Checkbox.Root>
          )} />
          <label htmlFor="consent">I agree to be contacted by IRW about this enquiry.</label>
        </div>
        {errors.consent && <span role="alert" className="text-[13px] font-medium text-red">{errors.consent.message}</span>}
      </div>
      {serverError && <p role="alert" className="rounded-lg bg-red-tint px-4 py-3 text-sm font-medium text-red-dark">{serverError}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3.5">
        <span className="text-[13px] text-muted">Protected by rate limiting and a spam check.</span>
        <button type="submit" disabled={isSubmitting} className="btn btn-red !min-h-[52px] !px-7 !text-base">
          {isSubmitting && <Loader2 size={16} className="animate-spin" />} {isSubmitting ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
