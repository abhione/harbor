import DemoCue from "@/components/DemoCue";
import { useHarbor } from "@/context/PersonaContext";
import { COMPANY } from "@/data/seed";
import {
  acceptMilestone,
  formatMoney,
  personById,
  releaseFridayBatch,
  releasePayment,
  supplierById,
} from "@/data/store";
import { statusLabel, statusTone } from "@/lib/harbor";
import { PAYDAY_FRIDAY } from "@/types";

export default function FinanceHome() {
  const { state } = useHarbor();
  const friday = state.invoices.filter((i) => i.payDate === PAYDAY_FRIDAY && i.status !== "paid");
  const paidOnTime = state.payments.filter((p) => p.status === "paid").length;
  const scheduled = state.payments.filter((p) => p.status === "scheduled").length;
  const held = state.payments.filter((p) => p.status === "failed");
  const fridayTotal = friday.reduce((s, i) => s + i.amount, 0);
  const blocked = state.milestones.filter((m) => m.status === "submitted");
  const readyCount = state.invoices.filter((i) => ["ready", "scheduled"].includes(i.status)).length;

  const byDept: Record<string, number> = { Engineering: 0, Operations: 0, Marketing: 0, Finance: 0 };
  for (const inv of state.invoices) {
    const e = state.engagements.find((x) => x.id === inv.engagementId);
    const name =
      e?.departmentId === "eng"
        ? "Engineering"
        : e?.departmentId === "ops"
          ? "Operations"
          : e?.departmentId === "mkt"
            ? "Marketing"
            : "Finance";
    if (inv.status !== "paid") byDept[name] += inv.amount;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Elena Ruiz · Controller</p>
        <h1 className="font-serif text-4xl tracking-tight">Friday payday</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {PAYDAY_FRIDAY} ACH. Late pay is a P0. Harbor is the payable — not a spreadsheet reconstruction.
        </p>
      </header>

      <DemoCue />

      {blocked.length > 0 && (
        <section className="rounded-2xl border border-[#E8C9BE] bg-[#FBF1ED] p-5">
          <h2 className="font-serif text-xl">Held until acceptance</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Harbor will not move cash on a project milestone nobody signed.
          </p>
          {blocked.map((m) => {
            const e = state.engagements.find((x) => x.id === m.engagementId);
            const p = e ? personById(e.personId) : undefined;
            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {p?.name} · {m.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatMoney(m.amount)} · due {m.due}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => acceptMilestone(m.id)}
                  className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground"
                >
                  Accept deliverable
                </button>
              </div>
            );
          })}
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-4">
        <Tile label="Releasing Friday" value={formatMoney(fridayTotal)} note={`${friday.length} invoices`} />
        <Tile label="Scheduled ACH" value={String(scheduled)} note="Promised date shown to workers" />
        <Tile label="Paid on the date we showed" value={String(paidOnTime)} note="This demo window" />
        <Tile label="Held" value={String(held.length)} note="Exception before cash moves" />
      </section>

      {readyCount > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => releaseFridayBatch()}
            className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground"
          >
            Release Friday ACH ({readyCount})
          </button>
        </div>
      )}

      <section>
        <h2 className="mb-3 font-serif text-2xl">Department open payables</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {Object.entries(byDept).map(([name, amt]) => (
            <div key={name} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">{name}</p>
              <p className="font-serif text-2xl tabular-nums">{formatMoney(amt)}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-2xl">Invoices</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Worker</th>
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3 font-medium">GL</th>
                <th className="px-4 py-3 font-medium">Pay date</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {state.invoices.map((inv) => {
                const p = personById(inv.personId);
                const s = inv.supplierId ? supplierById(inv.supplierId) : null;
                return (
                  <tr key={inv.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p?.name}</div>
                      <div className="text-[11px] text-muted-foreground">{s?.name ?? "Direct"}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">{inv.period}</td>
                    <td className="px-4 py-3 text-xs">{inv.gl}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${statusTone(inv.status)}`}>
                        {statusLabel(inv.status)} · {inv.payDate}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatMoney(inv.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      {inv.status !== "paid" && inv.status !== "exception" && (
                        <button
                          type="button"
                          onClick={() => releasePayment(inv.id)}
                          className="text-xs text-primary"
                        >
                          Release ACH
                        </button>
                      )}
                      {inv.status === "exception" && (
                        <span className="text-xs text-clay">Acceptance missing</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {COMPANY.name} close does not wait on a VMS export. These payables already have department and
          worker ID.
        </p>
      </section>
    </div>
  );
}

function Tile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-3xl tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
