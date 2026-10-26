"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { loginSchema } from "@/lib/validation";
import { loginAction } from "../actions/auth";

type Values = { email: string; password: string; remember?: boolean };

export function LoginForm() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const {
    register, control, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "", remember: false } });

  const onSubmit = handleSubmit(async (v) => {
    setError("");
    const res = await loginAction(v);
    if (res.ok) {
      router.replace("/admin");
      router.refresh();
    } else setError(res.error);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-full max-w-[420px] flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-[32px] font-extrabold">Sign in</h2>
        <p className="text-muted">Admins and editors only.</p>
      </div>
      <label className="flex flex-col gap-2 text-sm font-semibold">
        Email
        <input className="input !min-h-12" type="email" autoComplete="username" aria-invalid={!!errors.email} placeholder="admin@irwkerala.org" {...register("email")} />
        {errors.email && <span role="alert" className="text-[13px] font-medium text-red">{errors.email.message}</span>}
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold">
        Password
        <span className="relative">
          <input className="input !min-h-12 !pr-12" type={show ? "text" : "password"} autoComplete="current-password" aria-invalid={!!errors.password} placeholder="••••••••" {...register("password")} />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-muted hover:text-navy">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </span>
        {errors.password && <span role="alert" className="text-[13px] font-medium text-red">{errors.password.message}</span>}
      </label>
      <div className="flex items-center gap-2.5 text-sm text-muted">
        <Controller control={control} name="remember" render={({ field }) => (
          <Checkbox.Root id="remember" checked={!!field.value} onCheckedChange={(c) => field.onChange(c === true)} className="flex h-[18px] w-[18px] items-center justify-center rounded border border-line2 bg-white data-[state=checked]:border-navy data-[state=checked]:bg-navy">
            <Checkbox.Indicator className="text-white"><Check size={13} /></Checkbox.Indicator>
          </Checkbox.Root>
        )} />
        <label htmlFor="remember">Keep me signed in on this device</label>
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-tint px-4 py-3 text-sm font-medium text-red-dark">{error}</p>}
      <button type="submit" disabled={isSubmitting} className="btn btn-red !min-h-[52px] !text-base">
        {isSubmitting && <Loader2 size={16} className="animate-spin" />} Sign in
      </button>
      <p className="text-[13px] leading-relaxed text-muted">Sessions use an httpOnly cookie. Repeated failed sign-ins are temporarily blocked.</p>
    </form>
  );
}
