import { Badge } from "@/components/ui/badge";

export function PageHeader({
  title,
  description,
  eyebrow = "AgentEval Lite"
}: {
  title: string;
  description: string;
  eyebrow?: string;
}) {
  return (
    <header className="mb-6">
      <Badge tone="accent">{eyebrow}</Badge>
      <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-normal text-slate-950 md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{description}</p>
        </div>
      </div>
    </header>
  );
}
