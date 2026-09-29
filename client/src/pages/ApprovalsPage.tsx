import { useHarbor } from "@/context/PersonaContext";
import { approveTime, formatMoney, personById } from "@/data/store";
import { statusLabel, statusTone } from "@/lib/harbor";

export default function ApprovalsPage() {
  const { state } = useHarbor();
  const pending = state.timeEntries.filter((t) => t.status === "submitted");
  const rest = state.timeEntries.filter((t) => t.status !== "submitted");
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="font-serif text-4xl tracking-tight">Approvals</h1>
        <p className="mt-2 text-sm text-muted-foreground">Time first. Classification never auto-approves.</p>
      </header>
      <section className="space-y-2">
        {pending.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Nothing waiting. Switch to Sam, submit hours, then come back.
          </p>
        )}
        {pending.map((t) => {
          const p = personById(t.personId);
          const e = state.engagements.find((x) => x.id === t.engagementId);
          return (
            <div key={t.id} className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
              <div>
                <p className="font-medium">{p?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.hours}h · {formatMoney((e?.rate || 0) * t.hours)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => approveTime(t.id, "Priya Shah")}
                className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground"
              >
                Approve time
              </button>
            </div>
          );
        })}
      </section>
      <section>
        <h2 className="mb-3 font-serif text-xl">Earlier this month</h2>
        <div className="space-y-2">
          {rest.map((t) => {
            const p = personById(t.personId);
            return (
              <div key={t.id} className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
                <p className="text-sm">
                  {p?.name} · {t.hours}h
                </p>
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${statusTone(t.status)}`}>
                  {statusLabel(t.status)}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
