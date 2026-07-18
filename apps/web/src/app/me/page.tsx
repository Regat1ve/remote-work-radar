import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@rwr/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your shortlist — remote-work-radar",
};

export default async function MePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const saved = await prisma.savedJob.findMany({
    where: { userId: session.user.id },
    orderBy: { savedAt: "desc" },
    take: 100,
  });

  const jobIds = saved.map((s) => s.jobId);
  const jobs = jobIds.length
    ? await prisma.job.findMany({
        where: { id: { in: jobIds } },
        include: { company: true },
      })
    : [];
  const jobMap = new Map(jobs.map((j) => [j.id, j]));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold">Your shortlist</h1>
          <p className="text-ink-500 text-sm mt-1">
            Signed in as {session.user.name ?? session.user.email}
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="text-sm text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 underline"
          >
            Sign out
          </button>
        </form>
      </header>

      {saved.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-200 dark:border-ink-700 p-8 text-center">
          <p className="text-ink-500 mb-4">You haven&apos;t starred any jobs yet.</p>
          <Link
            href="/jobs"
            className="inline-block rounded-md bg-accent-600 text-white px-4 py-2 text-sm font-semibold"
          >
            Browse jobs
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {saved.map((s) => {
            const j = jobMap.get(s.jobId);
            if (!j) return null;
            return (
              <li
                key={s.jobId}
                className="rounded-lg border border-ink-200 dark:border-ink-700 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/jobs/${j.id}`} className="font-semibold hover:underline">
                      {j.titleOriginal}
                    </Link>
                    <p className="text-sm text-ink-500 mt-0.5">
                      {j.company.name} · saved {s.savedAt.toISOString().slice(0, 10)}
                    </p>
                  </div>
                  {j.hourlyMinUsd != null && (
                    <p className="text-sm whitespace-nowrap">
                      <strong>${Number(j.hourlyMinUsd)}</strong>
                      {j.hourlyMaxUsd && Number(j.hourlyMaxUsd) !== Number(j.hourlyMinUsd)
                        ? `–$${Number(j.hourlyMaxUsd)}`
                        : ""}
                      <span className="text-ink-400"> /hr</span>
                    </p>
                  )}
                </div>
                {s.note && (
                  <p className="text-sm text-ink-600 dark:text-ink-300 mt-2 italic">
                    {s.note}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
