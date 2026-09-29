import type { HarborState, PersonaId } from "@/types";

export type Cue = {
  title: string;
  body: string;
  done?: boolean;
};

export function nextCue(persona: PersonaId, state: HarborState): Cue {
  if (persona === "peopleops") {
    const classify = state.engagements.find((e) => e.flagged === "classification");
    const docs = state.engagements.find((e) => e.flagged === "docs");
    const tenure = state.engagements.find((e) => e.flagged === "tenure");
    const rate = state.engagements.find((e) => e.flagged === "rate");
    const onboard = state.engagements.find((e) => e.status === "onboarding");
    if (classify) {
      return {
        title: "Clear Omar’s classification",
        body: "Harbor flagged employee-like answers. Record a human attest — do not let the model decide.",
      };
    }
    if (docs) {
      return {
        title: "Collect Miles’s COI",
        body: "W-9 is in. Certificate of insurance expired. Tick it collected so he can stay on assignment.",
      };
    }
    if (tenure) {
      return {
        title: `Review ${tenure.personId === "p-kenji" ? "Kenji" : "Cleo"} tenure`,
        body: "Past or approaching 90 days. Document an end date or conversion path.",
      };
    }
    if (rate) {
      return {
        title: "Sign Luis’s rate exception",
        body: "$125 vs band $110–118, still under Priya’s cap. Record the exception.",
      };
    }
    if (onboard) {
      return {
        title: "Release Omar to work",
        body: "Classification is attested. Activate the engagement so Priya’s team can start.",
      };
    }
    return {
      title: "Ledger is clean",
      body: "No open flags. Switch to Priya, Jordan, or Elena for the next job.",
      done: true,
    };
  }

  if (persona === "manager") {
    const pending = state.timeEntries.find(
      (t) => t.status === "submitted" && state.engagements.some((e) => e.id === t.engagementId && e.managerId === "u-priya")
    );
    const inbox = state.candidates.find(
      (c) =>
        (c.status === "submitted" || c.status === "shortlisted") &&
        state.requests.some((r) => r.id === c.requestId && r.managerId === "u-priya")
    );
    const open = state.requests.find((r) => r.managerId === "u-priya" && r.status === "sourcing");
    if (pending) {
      return {
        title: "Approve this week’s time",
        body: "Two taps. That creates the payable Elena will release Friday.",
      };
    }
    if (inbox) {
      return {
        title: "Shortlist or offer a candidate",
        body: "Northwind already submitted. Offer puts a person on the ledger — Harbor does not hire for you.",
      };
    }
    if (open) {
      return {
        title: "Fill the open req",
        body: "Ask a known alumni first, or wait for Jordan’s submissions.",
      };
    }
    return {
      title: "Need someone else?",
      body: "Describe the work in the composer. Harbor drafts type, rate band, and known people.",
      done: true,
    };
  }

  if (persona === "finance") {
    const held = state.invoices.find((i) => i.status === "exception");
    const ready = state.invoices.filter((i) => ["ready", "scheduled"].includes(i.status));
    if (held) {
      return {
        title: "Unblock Nina’s milestone",
        body: "Acceptance is missing. Confirm deliverable 2, then ACH can move.",
      };
    }
    if (ready.length) {
      return {
        title: `Release Friday ACH (${ready.length})`,
        body: "One batch. Workers already see the promised pay date.",
      };
    }
    return {
      title: "Payday complete",
      body: "On-time ACH. Switch to Sam to show the worker the money landed.",
      done: true,
    };
  }

  if (persona === "supplier") {
    const open = state.requests.find(
      (r) => r.supplierIds.includes("s-northwind") && r.status === "sourcing"
    );
    const offered = state.candidates.find(
      (c) => c.supplierId === "s-northwind" && c.status === "offered"
    );
    if (open) {
      return {
        title: `Submit against ${open.title}`,
        body: "Structured req, visible status. No 40-field portal.",
      };
    }
    if (offered) {
      return {
        title: "Offer out — wait on the worker",
        body: "Priya offered your candidate. Status is on this page, not an email black hole.",
      };
    }
    return {
      title: "Invoices are the job now",
      body: "When Elena releases Friday, these rows flip to Paid without a second system.",
      done: true,
    };
  }

  const offered = state.engagements.find((e) => e.personId === "p-sam" && e.status === "offered");
  const time = state.timeEntries.find((t) => t.engagementId === "e-sam-active");
  const inv = state.invoices.find((i) => i.engagementId === "e-sam-active");
  const pay = state.payments.find((p) => p.invoiceId === inv?.id);
  if (offered) {
    return { title: "Accept the assignment", body: "One tap. Then finish the two-item checklist." };
  }
  if (!time || time.status === "draft") {
    return { title: "Submit this week’s hours", body: "Two taps. You will see Friday as the promised pay date." };
  }
  if (time.status === "submitted") {
    return { title: "Waiting on Priya", body: "Hours are in. Switch to Priya to approve — then Elena pays." };
  }
  if (pay?.status !== "paid") {
    return { title: "Payday is Friday", body: "Approved and scheduled. Switch to Elena to release ACH, then come back." };
  }
  return { title: "Paid on the date we showed", body: "That is the product. Managers who pay on time get Sam next month.", done: true };
}
