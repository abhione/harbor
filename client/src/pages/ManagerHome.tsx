import RequestComposer from "@/components/RequestComposer";
import { useHarbor } from "@/context/PersonaContext";
import { approveTime, formatMoney, personById } from "@/data/store";
import { statusLabel, statusTone } from "@/lib/harbor";
import { Link } from "wouter";

export default function ManagerHome() {
  const { state } = useHarbor();
  const mine = state.engagements.filter((e) => e.managerId === "u-priya");
  const pending = state.timeEntries.filter(
    (t) => t.status === "submitted" && mine.some((e) => e.id === t.engagementId)
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Priya Shah · Engineering</p>
        <h1 className="font-serif text-4xl tracking-tight">Need someone by Monday?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Describe the work. Harbor drafts type, rate band, and known people. You still hire.
        </p>
      </header>

      <RequestComposer />

      {pending.length > 0 && (
        <section className="rounded-2xl border border-amber/30 bg-[#FBF4E8] p-5">
          <h2 className="font-serif text-xl">Time to approve</h2>
          <p className="mb-3 text-xs text-muted-foreground">This is the Slack ping. Two taps.</p>
          <div className="space-y-2">
            {pending.map((t) => {
              const p = personById(t.personId);
              const e = mine.find((x) => x.id === t.engagementId);
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{p?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.hours}h · week of Oct 12 {e ? `· ${formatMoney((e.rate || 0) * t.hours)}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => approveTime(t.id, "Priya Shah")}
                    className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground"
                  >
                    Approve
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-2xl">Your people</h2>
          <Link href="/approvals" className="text-xs text-primary">
            Approvals
          </Link>
        </div>
        <div className="space-y-2">
          {mine
            .filter((e) => !["closed", "paid"].includes(e.status) || e.id === "e-sam-prior")
            .slice(0, 8)
            .map((e) => {
              const p = personById(e.personId);
              return (
                <Link
                  key={e.id}
                  href={`/engagements/${e.id}`}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{p?.name}</p>
                    <p className="text-xs text-muted-foreground">{e.title}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${statusTone(e.status)}`}>
                    {statusLabel(e.status)}
                  </span>
                </Link>
              );
            })}
        </div>
      </section>
    </div>
  );
}
