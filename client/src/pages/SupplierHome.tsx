import { useHarbor } from "@/context/PersonaContext";
import { formatMoney, personById, submitCandidate } from "@/data/store";
import { statusLabel, statusTone } from "@/lib/harbor";
import { useState } from "react";

export default function SupplierHome() {
  const { state } = useHarbor();
  const mine = state.requests.filter((r) => r.supplierIds.includes("s-northwind"));
  const cands = state.candidates.filter((c) => c.supplierId === "s-northwind");
  const invoices = state.invoices.filter((i) => i.supplierId === "s-northwind");
  const [name, setName] = useState("Riley Cho");
  const [rate, setRate] = useState("31");
  const [note, setNote] = useState("Available Monday. Phoenix nights.");
  const openReq = mine.find((r) => r.status === "sourcing") ?? mine[0];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Jordan Hale · Northwind Staffing
        </p>
        <h1 className="font-serif text-4xl tracking-tight">Brightline reqs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          One login. Status you can see. Invoices that do not disappear.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-3">
          {mine.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.location} · cap {formatMoney(r.capRate)} · {r.durationWeeks} weeks
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${statusTone(r.status)}`}>
                  {statusLabel(r.status)}
                </span>
              </div>
              <p className="mt-3 rounded-xl bg-secondary px-3 py-2 text-sm text-muted-foreground">
                “{r.rawText}”
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          <h2 className="font-serif text-xl">Submit a candidate</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            To {openReq?.title ?? "open req"}. No 40-field portal.
          </p>
          <label className="block text-xs text-muted-foreground">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <label className="block text-xs text-muted-foreground">Bill rate</label>
          <input
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="mb-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <label className="block text-xs text-muted-foreground">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={!openReq}
            onClick={() =>
              openReq &&
              submitCandidate({
                requestId: openReq.id,
                supplierId: "s-northwind",
                name,
                billRate: Number(rate) || 0,
                note,
              })
            }
            className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground"
          >
            Submit
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-2xl">Submissions</h2>
        <div className="space-y-2">
          {cands.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
            >
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatMoney(c.billRate)}/hr · {c.note}
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${statusTone(c.status)}`}>
                {statusLabel(c.status)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-2xl">Invoices</h2>
        <div className="space-y-2">
          {invoices.map((i) => {
            const p = personById(i.personId);
            return (
              <div
                key={i.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="font-medium">{p?.name}</p>
                  <p className="text-xs text-muted-foreground">{i.period}</p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums">{formatMoney(i.amount)}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {statusLabel(i.status)} · {i.payDate}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
