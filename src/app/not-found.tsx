import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <span className="text-sm font-bold uppercase tracking-[.14em] text-red">404</span>
      <h1 className="text-4xl font-extrabold tracking-tight">Page not found</h1>
      <p className="max-w-md text-muted">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="btn btn-red">Back to home</Link>
    </div>
  );
}
