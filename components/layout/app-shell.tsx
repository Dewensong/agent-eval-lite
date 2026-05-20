import Link from "next/link";
import {
  BarChart3,
  Bot,
  Braces,
  Database,
  GitCompare,
  LayoutDashboard,
  PlayCircle,
  Settings,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/prompts", label: "Prompt Studio", icon: Bot },
  { href: "/datasets", label: "Dataset", icon: Database },
  { href: "/assertions", label: "Assertions", icon: ShieldCheck },
  { href: "/evaluations", label: "Evaluation Run", icon: PlayCircle },
  { href: "/results", label: "Result Matrix", icon: BarChart3 },
  { href: "/reports", label: "Compare Report", icon: GitCompare },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({
  children,
  active
}: {
  children: React.ReactNode;
  active: string;
}) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 border-r bg-white/88 backdrop-blur xl:block">
        <div className="flex h-full flex-col">
          <Link href="/dashboard" className="flex items-center gap-3 px-6 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Braces className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">AgentEval Lite</div>
              <div className="text-xs text-muted-foreground">Prompt eval workbench</div>
            </div>
          </Link>
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.href;
              return (
                <Link
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950",
                    isActive && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white"
                  )}
                  href={item.href}
                  key={item.href}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t p-4">
            <div className="rounded-lg bg-teal-50 p-4 text-sm text-teal-900">
              <div className="font-semibold">Demo safe mode</div>
              <p className="mt-1 text-xs leading-5 text-teal-800">
                Mock provider is enabled, so the full eval loop works without an API key.
              </p>
            </div>
          </div>
        </div>
      </aside>
      <main className="xl:pl-64">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}

export function MobileNav() {
  return (
    <div className="mb-5 grid grid-cols-2 gap-2 xl:hidden">
      {navItems.slice(0, 8).map((item) => (
        <Link
          className="rounded-md border bg-white px-3 py-2 text-sm font-medium text-slate-700"
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
