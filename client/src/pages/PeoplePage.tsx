import { useHarbor } from "@/context/PersonaContext";
import { formatMoney } from "@/data/store";
import { isLive, typeLabel } from "@/lib/harbor";
import { Link } from "wouter";

export default function PeoplePage() {
  const { state } = useHarbor();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="font-serif text-4xl tracking-tight">People</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          One person record. Agency, 1099, or project is just the engagement type.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {state.people.map((p) => {
          const eng = state.engagements.filter((e) => e.personId === p.id);
          const live = eng.find(isLive);
          return (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.city}
                    {p.alumni ? " · alumni" : ""}
                  </p>
                </div>
                <span className="rounded-full bg-foam px-2 py-0.5 text-[11px] text-primary">
                  {typeLabel(p.preferredType)}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{p.skills.join(" · ")}</p>
              <p className="mt-3 text-sm">
                Last {formatMoney(p.lastBillRate)}
                {p.lastBillRate ? "/hr" : ""}
                {live ? ` · now ${live.title}` : ""}
              </p>
              {live && (
                <Link href={`/engagements/${live.id}`} className="mt-2 inline-block text-xs text-primary">
                  Open engagement
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
