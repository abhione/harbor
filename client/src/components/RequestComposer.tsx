import { useHarbor } from "@/context/PersonaContext";
import { approveRequest, createRequestFromComposer, formatMoney, personById } from "@/data/store";
import { typeLabel } from "@/lib/harbor";
import type { Request } from "@/types";
import { useState } from "react";

const STARTER =
  "Need a contract data engineer, NYC or remote US, 3 months, our stack is dbt + Snowflake, cap $110/hr, start whenever.";

export default function RequestComposer({ compact }: { compact?: boolean }) {
  const { state } = useHarbor();
  const [text, setText] = useState(STARTER);
  const [draft, setDraft] = useState<Request | null>(
    state.requests.find((r) => r.id === "r-de") ?? null
  );

  const onDraft = () => {
    const req = createRequestFromComposer({
      managerId: "u-priya",
      departmentId: "eng",
      rawText: text,
    });
    setDraft(req);
  };

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
        <div className="rounded-2xl border border-primary/20 bg-foam p-5">
          <p className="font-serif text-lg text-foreground">{draft.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {draft.location} · {draft.durationWeeks} weeks · cap {formatMoney(draft.capRate)}/hr
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-card px-3 py-1 text-xs">
              Suggested {typeLabel(draft.suggestedType)}
            </span>
            <span className="rounded-full bg-card px-3 py-1 text-xs">
              Rate band {formatMoney(draft.rateBand[0])}–{formatMoney(draft.rateBand[1])}
            </span>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {draft.suggestedReasons.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                {r}
              </li>
            ))}
          </ul>
          {draft.knownMatches.length > 0 && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Ask known first</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {draft.knownMatches.map((id) => {
                  const p = personById(id);
                  if (!p) return null;
                  return (
                    <div key={id} className="rounded-xl border border-border bg-card px-3 py-2 text-sm">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Alumni · last {formatMoney(p.lastBillRate)}/hr
                      </div>
                    </div>
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
              onClick={() => approveRequest(draft.id, true)}
              className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground"
            >
              Ask known first
            </button>
            <button
              type="button"
              onClick={() => approveRequest(draft.id, false)}
              className="rounded-full border border-border bg-card px-4 py-1.5 text-sm"
            >
              Open to Northwind
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
