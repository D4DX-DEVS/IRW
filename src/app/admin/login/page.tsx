import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  const s = await getSettings();
  return (
    <div className="flex min-h-screen flex-wrap">
      <div className="relative flex min-w-[320px] flex-[1_1_520px] flex-col justify-between gap-12 overflow-hidden bg-navy p-8 text-white sm:p-14">
        {s.logoWhiteUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.logoWhiteUrl} alt={s.orgName} width={592} height={148} className="h-14 w-auto self-start" />
        ) : (
          <div className="flex items-center gap-3">
            <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full border-[3px] border-[#ff4d5e] text-[13px] font-black">IRW</span>
            <span className="text-[19px] font-extrabold">Ideal Relief Wing Kerala</span>
          </div>
        )}
        <div className="flex max-w-[520px] flex-col gap-4">
          <h1 className="text-[clamp(36px,4.4vw,52px)] font-extrabold leading-[1.05] tracking-tight">Content console</h1>
          <p className="text-lg leading-relaxed text-[#c9d2e0]">Publish news, upload gallery albums, manage the team and reports — the public site updates instantly.</p>
        </div>
        <p className="text-sm text-[#9aa6b8]">Authorised admins and editors only.</p>
      </div>
      <div className="flex min-w-[320px] flex-[1_1_520px] items-center justify-center bg-bg p-8">
        <LoginForm />
      </div>
    </div>
  );
}
