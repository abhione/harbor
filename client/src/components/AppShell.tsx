import { PERSONAS } from "@/data/seed";
import { resetDemo } from "@/data/store";
import { useHarbor } from "@/context/PersonaContext";
import type { PersonaId } from "@/types";
import {
  Banknote,
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  RotateCcw,
  Send,
  Users,
} from "lucide-react";
import { Link, useLocation } from "wouter";

const NAV: Record<PersonaId, { href: string; label: string; icon: typeof Users }[]> = {
  peopleops: [
    { href: "/", label: "Ledger", icon: LayoutDashboard },
    { href: "/people", label: "People", icon: Users },
    { href: "/requests", label: "Requests", icon: ClipboardList },
    { href: "/pay", label: "Pay", icon: Banknote },
  ],
  manager: [
    { href: "/", label: "Home", icon: LayoutDashboard },
    { href: "/requests/new", label: "Ask for someone", icon: Send },
    { href: "/approvals", label: "Approvals", icon: ClipboardList },
  ],
  finance: [
    { href: "/", label: "Payday", icon: Banknote },
    { href: "/pay", label: "Invoices", icon: Briefcase },
    { href: "/people", label: "Workers", icon: Users },
  ],
  supplier: [
    { href: "/", label: "Reqs", icon: ClipboardList },
    { href: "/pay", label: "Invoices", icon: Banknote },
  ],
  worker: [{ href: "/", label: "My work", icon: Briefcase }],
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { persona, setPersona, meta } = useHarbor();
  const [loc] = useLocation();
  const worker = persona === "worker";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-[color:var(--background)]/95 backdrop-blur">
        <div className="flex items-center gap-4 px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src="/harbor-mark.png"
              alt=""
              className="size-8"
              width={32}
              height={32}
            />
            <div className="leading-tight">
              <div className="font-serif text-lg tracking-tight">Harbor</div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Brightline
              </div>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2 overflow-x-auto">
            {(Object.keys(PERSONAS) as PersonaId[]).map((id) => {
              const p = PERSONAS[id];
              const on = persona === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPersona(id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-left text-sm transition-colors ${
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <span
                    className={`grid size-6 place-items-center rounded-full text-[10px] font-semibold ${
                      on ? "bg-primary-foreground/15" : "bg-foam text-primary"
                    }`}
                  >
                    {p.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <span className="hidden whitespace-nowrap sm:block">
                    <span className="block text-xs font-medium leading-none">{p.name}</span>
                    <span className={`block text-[10px] leading-tight mt-0.5 ${on ? "opacity-80" : "text-muted-foreground"}`}>
                      {p.role}
                    </span>
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => resetDemo()}
              className="hidden md:inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
              title="Reset synthetic data"
            >
              <RotateCcw className="size-3" />
              Reset
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border bg-foam px-4 py-2 md:px-6">
          <p className="text-xs text-[#0A4F4D]">
            <span className="font-semibold">Presenting as {meta.name}</span>
            <span className="mx-2 text-border">·</span>
            {meta.hint}
          </p>
          <p className="hidden text-[11px] text-muted-foreground lg:block">
            Same ledger. Switch seats anytime — no login.
          </p>
        </div>
      </header>

      <div className={worker ? "mx-auto max-w-[430px] px-4 py-6" : "flex min-h-[calc(100vh-108px)]"}>
        {!worker && (
          <aside className="hidden w-52 shrink-0 border-r border-border bg-card/60 md:block">
            <nav className="flex flex-col gap-1 p-3">
              {NAV[persona].map((item) => {
                const Icon = item.icon;
                const active = loc === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      active
                        ? "bg-foam text-primary font-medium"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}
        <main className={worker ? "" : "min-w-0 flex-1 px-4 py-6 md:px-8"}>{children}</main>
      </div>

      {worker && (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card px-6 py-3 md:hidden">
          <p className="text-center text-[11px] text-muted-foreground">Sam · week of Oct 12</p>
        </nav>
      )}
    </div>
  );
}
