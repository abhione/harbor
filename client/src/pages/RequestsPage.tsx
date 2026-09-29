import RequestComposer from "@/components/RequestComposer";
import { useHarbor } from "@/context/PersonaContext";
import { formatMoney, userById } from "@/data/store";
import { statusLabel, statusTone, typeLabel } from "@/lib/harbor";

export default function RequestsPage() {
  const { persona, state } = useHarbor();
  const showComposer = persona === "manager";
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="font-serif text-4xl tracking-tight">Requests</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Intake is a paragraph, not a 40-field form.
        </p>
      </header>
      {showComposer && <RequestComposer compact />}
      <div className="space-y-3">
        {state.requests.map((r) => {
          const m = userById(r.managerId);
          return (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {m?.name} · {r.location} · {typeLabel(r.suggestedType)} · cap {formatMoney(r.capRate)}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${statusTone(r.status)}`}>
                  {statusLabel(r.status)}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">“{r.rawText}”</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
