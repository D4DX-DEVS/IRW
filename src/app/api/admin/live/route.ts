import { getSession } from "@/lib/auth";
import { getStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

/** Server-sent events: pushes fresh dashboard stats every 3 seconds to signed-in admins. */
export async function GET(req: Request) {
  if (!(await getSession())) return new Response("Unauthorized", { status: 401 });

  const enc = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | undefined;
  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        try {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(await getStats())}\n\n`));
        } catch {
          clearInterval(timer);
          try { controller.close(); } catch { /* already closed */ }
        }
      };
      await send();
      timer = setInterval(send, 3000);
      req.signal.addEventListener("abort", () => {
        clearInterval(timer);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
    cancel() {
      clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" },
  });
}
