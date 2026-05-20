import { RunDetailPage } from "@/components/workbench/run-detail-page";

export default async function RunDetailRoute({
  params
}: {
  params: Promise<{ runId: string }>;
}) {
  const resolvedParams = await params;
  return <RunDetailPage runId={resolvedParams.runId} />;
}
