/**
 * Runs once when the server starts. Starts the minute timer that publishes
 * scheduled social posts — this site runs as one long-lived Node process, so an
 * in-process timer is enough and no external cron is needed.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  /* Skip during `next build`, which also loads this file. */
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { recoverInterruptedPosts, runDueSocialPosts } = await import("@/lib/server/social");
  try {
    recoverInterruptedPosts();
  } catch (error) {
    console.warn("[social] could not open the portal database:", error);
    return;
  }
  const tick = () => {
    runDueSocialPosts().catch((error) => console.warn("[social] scheduler error:", error));
  };
  setInterval(tick, 60_000).unref();
  setTimeout(tick, 5_000).unref();
}
