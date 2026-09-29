import { useHarbor } from "@/context/PersonaContext";
import { formatMoney, personById, supplierById, userById } from "@/data/store";
import { statusLabel, statusTone, typeLabel } from "@/lib/harbor";
import { Link, useParams } from "wouter";

export default function EngagementPage() {
  const params = useParams<{ id: string }>();
  const { state } = useHarbor();
  const e = state.engagements.find((x) => x.id === params.id);
  if (!e) {
    return <p className="p-8 text-sm text-muted-foreground">Engagement not on the ledger.</p>;
  }
  const p = personById(e.personId);
  const m = userById(e.managerId);
  const s = e.supplierId ? supplierById(e.supplierId) : null;
  const times = state.timeEntries.filter((t) => t.engagementId === e.id);
  const invoices = state.invoices.filter((i) => i.engagementId === e.id);
  const onboarding = state.onboarding.filter((o) => o.engagementId === e.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/" className="text-xs text-primary">
        ← Ledger
      </Link>
      <header>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[11px] ${statusTone(e.status)}`}>
            {statusLabel(e.status)}
          </span>
          <span className="text-xs text-muted-foreground">{typeLabel(e.type)}</span>
        </div>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">{p?.name}</h1>
        <p className="text-sm text-muted-foreground">{e.title}</p>
      </header>
      <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
        <Item k="Manager" v={m?.name ?? "—"} />
        <Item k="Department" v={e.departmentId} />
        <Item k="Location" v={e.location} />
        <Item k="Supplier" v={s?.name ?? "Direct"} />
        <Item
          k="Rate"
          v={e.rateUnit === "hour" ? `${formatMoney(e.rate)}/hr` : formatMoney(e.projectFee || 0)}
        />
        <Item k="Dates" v={`${e.startDate} → ${e.endDate}`} />
        <Item k="Tenure" v={`${e.tenureDays} days`} />
        <Item k="Classified by" v={e.classifiedBy} />
      </dl>
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="font-serif text-xl">Why this type</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {e.classifyReasons.map((r) => (
            <li key={r}>· {r}</li>
          ))}
        </ul>
        {e.flagNote && <p className="mt-3 text-sm text-clay">{e.flagNote}</p>}
      </section>
      {onboarding.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-serif text-xl">Onboarding</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {onboarding.map((o) => (
              <li key={o.id}>
                {o.done ? "✓" : "○"} {o.label}
              </li>
            ))}
          </ul>
        </section>
      )}
      {times.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-serif text-xl">Time</h2>
          {times.map((t) => (
            <p key={t.id} className="text-sm">
              Week {t.weekOf} · {t.hours}h · {statusLabel(t.status)}
            </p>
          ))}
        </section>
      )}
      {invoices.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-serif text-xl">Money</h2>
          {invoices.map((i) => (
            <p key={i.id} className="text-sm">
              {i.period} · {formatMoney(i.amount)} · {statusLabel(i.status)} · {i.payDate}
            </p>
          ))}
        </section>
      )}
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
