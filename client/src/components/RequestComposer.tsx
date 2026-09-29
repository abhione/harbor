import { useHarbor } from "@/context/PersonaContext";
import {
  approveRequest,
  createRequestFromComposer,
  formatMoney,
  personById,
  rehireKnown,
} from "@/data/store";
import { typeLabel } from "@/lib/harbor";
import type { Request } from "@/types";
import { useState } from "react";

const STARTER =
  "Need a contract data engineer, NYC or remote US, 3 months, our stack is dbt + Snowflake, cap $110/hr, start whenever.";

export default function RequestComposer({ compact }: { compact?: boolean }) {
  const { state } = useHarbor();
  const [text, setText] = useState(STARTER);
  const [draft, setDraft] = useState<Request | null>(null);

  const onDraft = () => {
    const req = createRequestFromComposer({
      managerId: "u-priya",
      departmentId: "eng",
      rawText: text,
    });
    setDraft(req);
  };

  const live = draft ? (state.requests.find((r) => r.id === draft.id) ?? draft) : null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_1px_0_rgba(28,25,21,0.04)]">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="grid size-6 place-items-center rounded-full bg-foam text-[10px] font-semibold text-primary">
            PS
          </span>
          Message Harbor
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={compact ? 3 : 4}
          className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onDraft}
            className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground"
          >
            Draft the request
          </button>
        </div>
      </div>

      {draft && (
        live && live.status === "filled" ? (
          <div className="rounded-2xl border border-primary/20 bg-foam p-5">
            <p className="font-serif text-lg">Filled · on the ledger</p>
            <p className="text-sm text-muted-foreground">
              {personById(live.filledPersonId ?? "")?.name ?? "Worker"} is offered. Switch seats to see Maya,
              Jordan, or Sam.
            </p>
          </div>
        ) : (
        <div className="rounded-2xl border border-primary/20 bg-foam p-5">
          <p className="font-serif text-lg text-foreground">{live?.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {live?.location} · {live?.durationWeeks} weeks · cap {formatMoney(live?.capRate ?? 0)}/hr
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-card px-3 py-1 text-xs">
              Suggested {typeLabel(live!.suggestedType)}
            </span>
            <span className="rounded-full bg-card px-3 py-1 text-xs">
              Rate band {formatMoney(live!.rateBand[0])}–{formatMoney(live!.rateBand[1])}
            </span>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {live!.suggestedReasons.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                {r}
              </li>
            ))}
          </ul>
          {live!.knownMatches.length > 0 && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Ask known first</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {live!.knownMatches.map((id) => {
                  const p = personById(id);
                  if (!p) return null;
                  return (
                    <button
                      type="button"
                      key={id}
                      onClick={() => rehireKnown(live!.id, id)}
                      className="rounded-xl border border-border bg-card px-3 py-2 text-left text-sm"
                    >
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Rehire · last {formatMoney(p.lastBillRate)}/hr
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Harbor drafted this. Priya still decides the person, type, and rate.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                live!.knownMatches[0]
                  ? rehireKnown(live!.id, live!.knownMatches[0])
                  : approveRequest(live!.id, true)
              }
              className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground"
            >
              Ask known first
            </button>
            <button
              type="button"
              onClick={() => approveRequest(live!.id, false)}
              className="rounded-full border border-border bg-card px-4 py-1.5 text-sm"
            >
              Open to Northwind
            </button>
          </div>
        </div>
        )
      )}
    </div>
  );
}
