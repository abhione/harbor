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

const KEY = "harbor-demo-v1";

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
