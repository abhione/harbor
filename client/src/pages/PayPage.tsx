import { useHarbor } from "@/context/PersonaContext";
import { formatMoney, personById, releasePayment, supplierById } from "@/data/store";
import { statusLabel, statusTone } from "@/lib/harbor";

export default function PayPage() {
  const { persona, state } = useHarbor();
  const invoices =
    persona === "supplier"
      ? state.invoices.filter((i) => i.supplierId === "s-northwind")
      : state.invoices;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="font-serif text-4xl tracking-tight">Pay</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If Harbor is optional in the payment path, it is not a system of record.
        </p>
      </header>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Worker</th>
              <th className="px-4 py-3 font-medium">Period</th>
              <th className="px-4 py-3 font-medium">Pay date</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              {persona !== "supplier" && <th className="px-4 py-3 font-medium" />}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const p = personById(inv.personId);
              const s = inv.supplierId ? supplierById(inv.supplierId) : null;
              return (
                <tr key={inv.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p?.name}</div>
                    <div className="text-[11px] text-muted-foreground">{s?.name ?? "Direct 1099"}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">{inv.period}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${statusTone(inv.status)}`}>
                      {statusLabel(inv.status)} · {inv.payDate}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatMoney(inv.amount)}</td>
                  {persona !== "supplier" && (
                    <td className="px-4 py-3 text-right">
                      {inv.status !== "paid" && inv.status !== "exception" && persona !== "worker" && (
                        <button
                          type="button"
                          onClick={() => releasePayment(inv.id)}
                          className="text-xs text-primary"
                        >
                          Release
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
