import { cloneSeed } from "./seed";
import type {
  Candidate,
  Engagement,
  HarborState,
  Invoice,
  Payment,
  Request,
  TimeEntry,
} from "@/types";
import { PAYDAY_FRIDAY } from "@/types";

const KEY = "harbor-demo-v2";

function load(): HarborState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as HarborState;
      if (parsed?.people?.length && parsed.engagements?.length) return parsed;
    }
  } catch {
    /* seed */
  }
  return cloneSeed();
}

function save(state: HarborState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

let state = typeof window === "undefined" ? cloneSeed() : load();
const listeners = new Set<() => void>();

function commit(next: HarborState) {
  state = next;
  save(state);
  listeners.forEach((l) => l());
}

export function getState(): HarborState {
  return state;
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function resetDemo() {
  localStorage.removeItem(KEY);
  commit(cloneSeed());
}

function nid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createRequestFromComposer(input: {
  managerId: string;
  departmentId: Request["departmentId"];
  rawText: string;
}): Request {
  const text = input.rawText;
  const lower = text.toLowerCase();
  const isWarehouse =
    lower.includes("warehouse") || lower.includes("nights") || lower.includes("dc");
  const suggestedType = isWarehouse ? "agency_temp" : "ic_1099";
  const known = state.people
    .filter((p) =>
      suggestedType === "ic_1099"
        ? p.alumni && p.skills.some((s) => /dbt|snowflake|python|ios|react/i.test(s))
        : p.preferredType === "agency_temp"
    )
    .slice(0, 2)
    .map((p) => p.id);

  const req: Request = {
    id: nid("r"),
    createdAt: new Date().toISOString(),
    managerId: input.managerId,
    departmentId: input.departmentId,
    rawText: text,
    title: isWarehouse
      ? "Warehouse support"
      : /ios/i.test(text)
        ? "iOS contractor"
        : "Contract specialist",
    location: /nyc|brooklyn|new york/i.test(text)
      ? "NYC or remote US"
      : /phoenix/i.test(text)
        ? "Phoenix DC"
        : "Remote US",
    durationWeeks: 12,
    capRate: suggestedType === "agency_temp" ? 34 : 110,
    suggestedType,
    suggestedReasons:
      suggestedType === "agency_temp"
        ? [
            "Supervised shift work. Harbor will not issue a 1099.",
            "Northwind and Helix can fill from the existing panel.",
          ]
        : [
            "Specialist skill, short horizon — 1099 is in family with similar roles.",
            "Ask known people first before opening the agency panel.",
          ],
    rateBand: suggestedType === "agency_temp" ? [28, 34] : [95, 115],
    knownMatches: known,
    status: "draft",
    supplierIds: ["s-northwind"],
  };
  commit({ ...state, requests: [req, ...state.requests] });
  return req;
}

export function approveRequest(requestId: string, askKnownFirst: boolean) {
  const req = state.requests.find((r) => r.id === requestId);
  if (!req) return;
  const nextReq: Request = {
    ...req,
    status: askKnownFirst && req.knownMatches.length ? "approved" : "sourcing",
  };
  let engagements = state.engagements;
  if (askKnownFirst && req.knownMatches[0] === "p-sam") {
    engagements = engagements.map((e) =>
      e.id === "e-sam-active" ? { ...e, status: "active" as const } : e
    );
    nextReq.status = "filled";
    nextReq.filledPersonId = "p-sam";
    nextReq.filledEngagementId = "e-sam-active";
  }
  commit({
    ...state,
    requests: state.requests.map((r) => (r.id === requestId ? nextReq : r)),
    engagements,
  });
}

export function submitCandidate(input: {
  requestId: string;
  supplierId: string;
  name: string;
  billRate: number;
  note: string;
}): Candidate {
  const c: Candidate = {
    id: nid("c"),
    requestId: input.requestId,
    supplierId: input.supplierId,
    name: input.name,
    billRate: input.billRate,
    note: input.note,
    status: "submitted",
  };
  commit({ ...state, candidates: [c, ...state.candidates] });
  return c;
}

export function shortlistCandidate(id: string) {
  commit({
    ...state,
    candidates: state.candidates.map((c) =>
      c.id === id ? { ...c, status: "shortlisted" } : c
    ),
  });
}

export function submitTime(engagementId: string, personId: string, hours: number) {
  const entry: TimeEntry = {
    id: nid("t"),
    engagementId,
    personId,
    weekOf: "2026-10-12",
    hours,
    status: "submitted",
    submittedAt: new Date().toISOString(),
  };
  const existing = state.timeEntries.find(
    (t) => t.engagementId === engagementId && t.weekOf === "2026-10-12"
  );
  const timeEntries = existing
    ? state.timeEntries.map((t) => (t.id === existing.id ? { ...entry, id: existing.id } : t))
    : [entry, ...state.timeEntries];
  const engagements = state.engagements.map((e) =>
    e.id === engagementId ? { ...e, status: "time_due" as const } : e
  );
  commit({ ...state, timeEntries, engagements });
}

export function approveTime(id: string, approver: string) {
  const entry = state.timeEntries.find((t) => t.id === id);
  if (!entry) return;
  const timeEntries = state.timeEntries.map((t) =>
    t.id === id ? { ...t, status: "approved" as const, approvedBy: approver } : t
  );
  const eng = state.engagements.find((e) => e.id === entry.engagementId);
  const person = state.people.find((p) => p.id === entry.personId);
  let invoices = state.invoices;
  let payments = state.payments;
  if (eng && person) {
    const amount = Math.round(entry.hours * (eng.rate || 0));
    const invoice: Invoice = {
      id: nid("inv"),
      engagementId: eng.id,
      personId: person.id,
      supplierId: eng.supplierId,
      amount,
      period: `Week of Oct 12 · ${entry.hours}h × $${eng.rate}`,
      status: "scheduled",
      payDate: PAYDAY_FRIDAY,
      gl: `CC-${eng.departmentId === "eng" ? "410" : "220"} · 6100 Contingent`,
    };
    const payment: Payment = {
      id: nid("pay"),
      invoiceId: invoice.id,
      amount,
      method: "ACH",
      status: "scheduled",
      promisedDate: PAYDAY_FRIDAY,
    };
    invoices = [invoice, ...invoices.filter((i) => i.engagementId !== eng.id || i.period !== invoice.period)];
    payments = [payment, ...payments];
  }
  commit({
    ...state,
    timeEntries,
    invoices,
    payments,
    engagements: state.engagements.map((e) =>
      e.id === entry.engagementId ? { ...e, status: "pending_pay", promisedPayDate: PAYDAY_FRIDAY } : e
    ),
  });
}

export function releasePayment(invoiceId: string) {
  const invoices = state.invoices.map((i) =>
    i.id === invoiceId ? { ...i, status: "paid" as const } : i
  );
  const payments = state.payments.map((p) =>
    p.invoiceId === invoiceId
      ? { ...p, status: "paid" as const, paidOn: PAYDAY_FRIDAY }
      : p
  );
  const inv = invoices.find((i) => i.id === invoiceId);
  const engagements: Engagement[] = state.engagements.map((e) =>
    e.id === inv?.engagementId ? { ...e, status: "paid", payDate: PAYDAY_FRIDAY } : e
  );
  commit({ ...state, invoices, payments, engagements });
}

export function attestClassification(engagementId: string) {
  commit({
    ...state,
    engagements: state.engagements.map((e) =>
      e.id === engagementId
        ? {
            ...e,
            classification: "ic_1099",
            flagged: undefined,
            flagNote: undefined,
            status: e.status === "onboarding" ? "onboarding" : e.status,
            classifyReasons: ["Human attest recorded. Counsel may still review."],
          }
        : e
    ),
  });
}

export function resolveFlag(engagementId: string) {
  const e = state.engagements.find((x) => x.id === engagementId);
  if (!e) return;
  commit({
    ...state,
    engagements: state.engagements.map((x) =>
      x.id === engagementId
        ? {
            ...x,
            flagged: undefined,
            flagNote: undefined,
            classifyReasons:
              e.flagged === "tenure"
                ? [...x.classifyReasons, "Tenure reviewed. End date documented."]
                : e.flagged === "docs"
                  ? [...x.classifyReasons, "COI collected."]
                  : e.flagged === "rate"
                    ? [...x.classifyReasons, "Rate exception approved inside cap."]
                    : x.classifyReasons,
          }
        : x
    ),
    onboarding: state.onboarding.map((o) =>
      o.engagementId === engagementId && !o.done ? { ...o, done: true } : o
    ),
  });
}

export function activateEngagement(engagementId: string) {
  commit({
    ...state,
    onboarding: state.onboarding.map((o) =>
      o.engagementId === engagementId ? { ...o, done: true } : o
    ),
    engagements: state.engagements.map((e) =>
      e.id === engagementId
        ? { ...e, status: "active", flagged: undefined, flagNote: undefined }
        : e
    ),
  });
}

export function completeOnboardingItem(id: string) {
  const item = state.onboarding.find((o) => o.id === id);
  if (!item) return;
  const onboarding = state.onboarding.map((o) => (o.id === id ? { ...o, done: true } : o));
  const remaining = onboarding.filter((o) => o.engagementId === item.engagementId && !o.done);
  commit({
    ...state,
    onboarding,
    engagements: remaining.length
      ? state.engagements
      : state.engagements.map((e) =>
          e.id === item.engagementId && e.status === "onboarding" ? { ...e, status: "active" } : e
        ),
  });
}

export function rehireKnown(requestId: string, personId: string) {
  const req = state.requests.find((r) => r.id === requestId);
  const person = state.people.find((p) => p.id === personId);
  if (!req || !person) return;
  const existing = state.engagements.find(
    (e) => e.personId === personId && !["closed", "paid"].includes(e.status)
  );
  const engagementId = existing?.id ?? nid("e");
  const engagement: Engagement = existing
    ? { ...existing, status: "offered", title: req.title, rate: person.lastBillRate || req.capRate }
    : {
        id: engagementId,
        personId,
        managerId: req.managerId,
        departmentId: req.departmentId,
        type: req.suggestedType,
        title: req.title,
        location: req.location,
        status: "offered",
        startDate: "2026-10-20",
        endDate: "2027-01-09",
        rate: person.lastBillRate || req.capRate,
        rateUnit: "hour",
        weeklyHours: 40,
        classification: req.suggestedType === "agency_temp" ? "w2_agency" : "ic_1099",
        classifiedBy: "Maya Chen",
        classifyReasons: ["Alumni rehire. Same work pattern as last assignment."],
        tenureDays: 0,
      };
  const onboarding = existing
    ? state.onboarding
    : [
        ...state.onboarding,
        {
          id: nid("o"),
          personId,
          engagementId,
          label: "Accept offer",
          done: false,
        },
        {
          id: nid("o"),
          personId,
          engagementId,
          label: "W-9 / direct deposit",
          done: false,
        },
      ];
  commit({
    ...state,
    engagements: existing
      ? state.engagements.map((e) => (e.id === existing.id ? engagement : e))
      : [engagement, ...state.engagements],
    onboarding,
    requests: state.requests.map((r) =>
      r.id === requestId
        ? { ...r, status: "filled", filledPersonId: personId, filledEngagementId: engagementId }
        : r
    ),
  });
}

export function offerCandidate(candidateId: string) {
  const c = state.candidates.find((x) => x.id === candidateId);
  const req = c ? state.requests.find((r) => r.id === c.requestId) : undefined;
  if (!c || !req) return;
  const personId = c.personId ?? nid("p");
  const people = c.personId
    ? state.people
    : [
        {
          id: personId,
          name: c.name,
          initials: c.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2),
          city: req.location,
          skills: ["Submitted by Northwind"],
          preferredType: req.suggestedType,
          lastBillRate: c.billRate,
          alumni: false,
          email: `${c.name.toLowerCase().replace(/\s+/g, ".")}@northwind.example`,
          phone: "512-555-0100",
        },
        ...state.people,
      ];
  const engagementId = nid("e");
  const engagement: Engagement = {
    id: engagementId,
    personId,
    managerId: req.managerId,
    departmentId: req.departmentId,
    supplierId: c.supplierId,
    type: req.suggestedType,
    title: req.title,
    location: req.location,
    status: "offered",
    startDate: "2026-10-20",
    endDate: "2026-12-31",
    rate: c.billRate,
    rateUnit: "hour",
    weeklyHours: 36,
    classification: req.suggestedType === "agency_temp" ? "w2_agency" : "ic_1099",
    classifiedBy: "Maya Chen",
    classifyReasons: ["Agency W-2 through Northwind. Supervised shift work."],
    tenureDays: 0,
  };
  commit({
    ...state,
    people,
    candidates: state.candidates.map((x) =>
      x.id === candidateId ? { ...x, status: "offered", personId } : x
    ),
    engagements: [engagement, ...state.engagements],
    onboarding: [
      {
        id: nid("o"),
        personId,
        engagementId,
        label: "Accept offer",
        done: false,
      },
      {
        id: nid("o"),
        personId,
        engagementId,
        label: "I-9 / badge",
        done: false,
      },
      ...state.onboarding,
    ],
    requests: state.requests.map((r) =>
      r.id === req.id
        ? { ...r, status: "filled", filledPersonId: personId, filledEngagementId: engagementId }
        : r
    ),
  });
}

export function acceptOffer(engagementId: string) {
  const e = state.engagements.find((x) => x.id === engagementId);
  if (!e) return;
  commit({
    ...state,
    onboarding: state.onboarding.map((o) =>
      o.engagementId === engagementId && o.label.toLowerCase().includes("accept")
        ? { ...o, done: true }
        : o
    ),
    engagements: state.engagements.map((x) =>
      x.id === engagementId ? { ...x, status: "onboarding" } : x
    ),
  });
}

export function acceptMilestone(milestoneId: string) {
  const m = state.milestones.find((x) => x.id === milestoneId);
  if (!m) return;
  const invoice = state.invoices.find(
    (i) => i.engagementId === m.engagementId && i.status === "exception"
  );
  commit({
    ...state,
    milestones: state.milestones.map((x) =>
      x.id === milestoneId ? { ...x, status: "accepted" } : x
    ),
    invoices: invoice
      ? state.invoices.map((i) => (i.id === invoice.id ? { ...i, status: "scheduled" } : i))
      : state.invoices,
    payments: invoice
      ? state.payments.map((p) =>
          p.invoiceId === invoice.id ? { ...p, status: "scheduled" } : p
        )
      : state.payments,
  });
}

export function releaseFridayBatch() {
  const ready = state.invoices.filter((i) =>
    ["ready", "scheduled"].includes(i.status)
  );
  const ids = new Set(ready.map((i) => i.id));
  commit({
    ...state,
    invoices: state.invoices.map((i) => (ids.has(i.id) ? { ...i, status: "paid" } : i)),
    payments: state.payments.map((p) =>
      ids.has(p.invoiceId) ? { ...p, status: "paid", paidOn: PAYDAY_FRIDAY } : p
    ),
    engagements: state.engagements.map((e) =>
      ready.some((i) => i.engagementId === e.id)
        ? { ...e, status: e.status === "pending_pay" || e.status === "time_due" ? "paid" : e.status, payDate: PAYDAY_FRIDAY }
        : e
    ),
  });
}

export function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function personById(id: string) {
  return state.people.find((p) => p.id === id);
}

export function userById(id: string) {
  return state.users.find((u) => u.id === id);
}

export function deptById(id: string) {
  return state.departments.find((d) => d.id === id);
}

export function supplierById(id: string) {
  return state.suppliers.find((s) => s.id === id);
}

export function engagementLabel(type: Engagement["type"]) {
  if (type === "agency_temp") return "Agency W-2";
  if (type === "ic_1099") return "1099";
  return "Project";
}
