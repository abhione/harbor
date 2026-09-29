import { useHarbor } from "@/context/PersonaContext";
import { COMPANY } from "@/data/seed";
import {
  attestClassification,
  formatMoney,
  personById,
  supplierById,
  userById,
} from "@/data/store";
import { isLive, statusLabel, statusTone, typeLabel } from "@/lib/harbor";
import { Link } from "wouter";

export default function PeopleOpsHome() {
  const { state } = useHarbor();
  const live = state.engagements.filter(isLive);
  const weekly =
    live.reduce((sum, e) => {
      if (e.rateUnit === "hour") return sum + (e.rate || 0) * (e.weeklyHours || 0);
      return sum + (e.projectFee || 0) / 8;
    }, 0);
  const flags = state.engagements.filter((e) => e.flagged);
  const openReq = state.requests.filter((r) => r.status !== "filled");

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Brightline ledger</p>
        <h1 className="font-serif text-4xl tracking-tight">Who is working.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          {COMPANY.employees} employees on payroll. {live.length} people not on payroll — in Harbor, not in
          a shared inbox.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-4">
        <Stat label="Working now" value={String(live.length)} note="Across four departments" />
        <Stat label="This week’s run-rate" value={formatMoney(weekly)} note="Hours + project burn" />
        <Stat label="Open requests" value={String(openReq.length)} note="Managers, not a program office" />
        <Stat label="Flags" value={String(flags.length)} note="Tenure, docs, classify, rate" />
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-serif text-2xl">Risk Maya would open first</h2>
          <span className="text-xs text-muted-foreground">Human decides. Harbor only nags.</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {flags.map((e) => {
            const p = personById(e.personId);
            return (
              <div key={e.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{p?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {typeLabel(e.type)} · {e.title}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${statusTone("exception")}`}>
                    {e.flagged}
                  </span>
                </div>
                <p className="mt-3 text-sm">{e.flagNote}</p>
                {e.flagged === "classification" && (
                  <button
                    type="button"
                    onClick={() => attestClassification(e.id)}
                    className="mt-3 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground"
                  >
                    Record human attest
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-2xl">Live engagements</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Person</th>
                <th className="px-4 py-3 font-medium">Work</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Manager</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Rate</th>
              </tr>
            </thead>
            <tbody>
              {live.map((e) => {
                const p = personById(e.personId);
                const m = userById(e.managerId);
                const s = e.supplierId ? supplierById(e.supplierId) : null;
                return (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Link href={`/engagements/${e.id}`} className="font-medium hover:text-primary">
                        {p?.name}
                      </Link>
                      <div className="text-[11px] text-muted-foreground">{p?.city}</div>
                    </td>
                    <td className="px-4 py-3">
                      {e.title}
                      {s && <div className="text-[11px] text-muted-foreground">{s.name}</div>}
                    </td>
                    <td className="px-4 py-3">{typeLabel(e.type)}</td>
                    <td className="px-4 py-3">{m?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${statusTone(e.status)}`}>
                        {statusLabel(e.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {e.rateUnit === "hour" ? `${formatMoney(e.rate)}/hr` : formatMoney(e.projectFee || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-3xl tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
