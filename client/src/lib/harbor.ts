import type { Engagement, EngagementStatus, EngagementType } from "@/types";

export function statusLabel(s: EngagementStatus | string) {
  const map: Record<string, string> = {
    draft: "Draft",
    pending_approval: "In review",
    sourcing: "Sourcing",
    offered: "Offered",
    onboarding: "Onboarding",
    active: "Working",
    time_due: "Time due",
    pending_pay: "Payday",
    paid: "Paid",
    closed: "Closed",
    submitted: "Submitted",
    approved: "Approved",
    scheduled: "Scheduled",
    ready: "Ready",
    exception: "Exception",
    failed: "Held",
    filled: "Filled",
    shortlisted: "Shortlisted",
    rejected: "Rejected",
    open: "Open",
    accepted: "Accepted",
  };
  return map[s] ?? s;
}

export function statusTone(s: string) {
  if (["paid", "approved", "filled", "accepted"].includes(s))
    return "bg-[#E7F3F2] text-[#0A4F4D]";
  if (["pending_pay", "scheduled", "ready", "time_due", "submitted"].includes(s))
    return "bg-[#F6E8D4] text-[#8A5A16]";
  if (["exception", "failed", "needs_review"].includes(s) || s.startsWith("flag"))
    return "bg-[#F8E7E2] text-[#8A3B2A]";
  if (["sourcing", "onboarding", "draft", "pending_approval"].includes(s))
    return "bg-[#EEEAE2] text-[#5C574E]";
  return "bg-[#E7F3F2] text-[#0A4F4D]";
}

export function typeLabel(t: EngagementType) {
  if (t === "agency_temp") return "Agency W-2";
  if (t === "ic_1099") return "1099";
  return "Project";
}

export function activeStatuses(): EngagementStatus[] {
  return ["onboarding", "active", "time_due", "pending_pay"];
}

export function isLive(e: Engagement) {
  return activeStatuses().includes(e.status);
}
