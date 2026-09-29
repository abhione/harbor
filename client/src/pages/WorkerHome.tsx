import { useHarbor } from "@/context/PersonaContext";
import { formatMoney, submitTime } from "@/data/store";
import { statusLabel, statusTone } from "@/lib/harbor";
import { PAYDAY_FRIDAY } from "@/types";
import { useState } from "react";

export default function WorkerHome() {
  const { state } = useHarbor();
  const engagement = state.engagements.find((e) => e.id === "e-sam-active");
  const time = state.timeEntries.find((t) => t.engagementId === "e-sam-active" && t.weekOf === "2026-10-12");
  const invoice = state.invoices.find((i) => i.engagementId === "e-sam-active");
  const payment = state.payments.find((p) => p.invoiceId === invoice?.id);
  const checklist = state.onboarding.filter((o) => o.personId === "p-sam");
  const [hours, setHours] = useState(time?.hours ?? 38);

  const payStatus = payment?.status ?? "scheduled";
  const promised = payment?.promisedDate ?? engagement?.promisedPayDate ?? PAYDAY_FRIDAY;

  return (
    <div className="space-y-5 pb-16">
      <header className="pt-2">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Sam Okonkwo</p>
        <h1 className="font-serif text-3xl tracking-tight">Week of Oct 12</h1>
        <p className="mt-1 text-sm text-muted-foreground">{engagement?.title}</p>
      </header>

      <section className="rounded-3xl bg-primary px-5 py-6 text-primary-foreground">
        <p className="text-xs uppercase tracking-[0.16em] opacity-80">Promised pay date</p>
        <p className="mt-1 font-serif text-3xl">Friday {promised.slice(5)}</p>
        <p className="mt-2 text-sm opacity-90">
          {payStatus === "paid"
            ? `Paid ${formatMoney(payment?.amount ?? 0)} ACH.`
            : payStatus === "scheduled"
              ? `${formatMoney(invoice?.amount ?? hours * (engagement?.rate ?? 105))} is scheduled. You will see it land Friday.`
              : "Time is in. Waiting on Priya to approve."}
        </p>
        <span className="mt-4 inline-block rounded-full bg-primary-foreground/15 px-3 py-1 text-xs">
          {statusLabel(payStatus === "scheduled" && time?.status !== "approved" ? time?.status ?? "draft" : payStatus)}
        </span>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="font-serif text-xl">Time</h2>
        <p className="mb-4 text-xs text-muted-foreground">Two taps. Not a sequence-of-entry maze.</p>
        <div className="flex items-end gap-3">
          <label className="flex-1">
            <span className="text-xs text-muted-foreground">Hours</span>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3 text-2xl tabular-nums"
            />
          </label>
          <button
            type="button"
            onClick={() => submitTime("e-sam-active", "p-sam", hours)}
            className="rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground"
          >
            {time?.status === "draft" || !time ? "Submit" : "Update"}
          </button>
        </div>
        {time && (
          <p className="mt-3 text-xs text-muted-foreground">
            {statusLabel(time.status)}
            {time.approvedBy ? ` · ${time.approvedBy}` : ""}
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="font-serif text-xl">Onboarding</h2>
        <ul className="mt-3 space-y-2">
          {checklist.map((item) => (
            <li key={item.id} className="flex items-center gap-3 text-sm">
              <span
                className={`grid size-5 place-items-center rounded-full text-[10px] ${
                  item.done ? "bg-foam text-primary" : "bg-secondary text-muted-foreground"
                }`}
              >
                {item.done ? "✓" : ""}
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="font-serif text-xl">Assignment</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row k="Engagement" v="1099 · Brightline Engineering" />
          <Row k="Manager" v="Priya Shah" />
          <Row k="Rate" v={`${formatMoney(engagement?.rate ?? 105)} / hour`} />
          <Row k="Dates" v={`${engagement?.startDate} → ${engagement?.endDate}`} />
        </dl>
      </section>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}
