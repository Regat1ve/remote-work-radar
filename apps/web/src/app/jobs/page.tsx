import { jobsCount, listJobs } from "@/lib/jobs-query";
import { JobsClient } from "./jobs-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jobs — remote-work-radar",
  description:
    "Live remote job postings from WeWorkRemotely, RemoteOK, and HN Who is hiring. US-only postings hidden by default. Suspected scams flagged.",
};

export default async function JobsPage() {
  const [jobs, totalCount] = await Promise.all([listJobs({ limit: 50 }), jobsCount()]);
  return <JobsClient jobs={jobs} totalCount={totalCount} />;
}
