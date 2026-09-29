export type PersonaId =
  | "peopleops"
  | "manager"
  | "finance"
  | "supplier"
  | "worker";

export type EngagementType = "agency_temp" | "ic_1099" | "simple_project";

export type EngagementStatus =
  | "draft"
  | "pending_approval"
  | "sourcing"
  | "offered"
  | "onboarding"
  | "active"
  | "time_due"
  | "pending_pay"
  | "paid"
  | "closed";

export type ClassifyDecision = "w2_agency" | "ic_1099" | "needs_review";

export type DepartmentId = "eng" | "ops" | "mkt" | "fin";

export interface Department {
  id: DepartmentId;
  name: string;
  costCenter: string;
}

export interface CompanyUser {
  id: string;
  name: string;
  title: string;
  departmentId?: DepartmentId;
  email: string;
  initials: string;
}

export interface Supplier {
  id: string;
  name: string;
  kind: "staffing" | "direct";
  contactName: string;
  city: string;
}

export interface Person {
  id: string;
  name: string;
  initials: string;
  city: string;
  skills: string[];
  preferredType: EngagementType;
  lastBillRate: number;
  lastEngagementId?: string;
  alumni: boolean;
  email: string;
  phone: string;
}

export interface Engagement {
  id: string;
  personId: string;
  managerId: string;
  departmentId: DepartmentId;
  supplierId?: string;
  type: EngagementType;
  title: string;
  location: string;
  status: EngagementStatus;
  startDate: string;
  endDate: string;
  rate: number;
  rateUnit: "hour" | "project";
  weeklyHours?: number;
  projectFee?: number;
  classification: ClassifyDecision;
  classifiedBy: string;
  classifyReasons: string[];
  tenureDays: number;
  flagged?: "tenure" | "classification" | "docs" | "rate";
  flagNote?: string;
  payDate?: string;
  promisedPayDate?: string;
}

export interface Request {
  id: string;
  createdAt: string;
  managerId: string;
  departmentId: DepartmentId;
  rawText: string;
  title: string;
  location: string;
  durationWeeks: number;
  capRate: number;
  suggestedType: EngagementType;
  suggestedReasons: string[];
  rateBand: [number, number];
  knownMatches: string[];
  status: "draft" | "approved" | "sourcing" | "filled";
  supplierIds: string[];
  filledPersonId?: string;
  filledEngagementId?: string;
}

export interface Candidate {
  id: string;
  requestId: string;
  supplierId: string;
  personId?: string;
  name: string;
  billRate: number;
  note: string;
  status: "submitted" | "shortlisted" | "rejected" | "offered";
}

export interface OnboardingItem {
  id: string;
  personId: string;
  engagementId: string;
  label: string;
  done: boolean;
}

export interface TimeEntry {
  id: string;
  engagementId: string;
  personId: string;
  weekOf: string;
  hours: number;
  status: "draft" | "submitted" | "approved" | "rejected";
  submittedAt?: string;
  approvedBy?: string;
}

export interface Milestone {
  id: string;
  engagementId: string;
  label: string;
  amount: number;
  due: string;
  status: "open" | "submitted" | "accepted" | "paid";
}

export interface Invoice {
  id: string;
  engagementId: string;
  personId: string;
  supplierId?: string;
  amount: number;
  period: string;
  status: "draft" | "ready" | "scheduled" | "paid" | "exception";
  payDate: string;
  gl: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: "ACH";
  status: "scheduled" | "paid" | "failed";
  paidOn?: string;
  promisedDate: string;
}

export interface HarborState {
  departments: Department[];
  users: CompanyUser[];
  suppliers: Supplier[];
  people: Person[];
  engagements: Engagement[];
  requests: Request[];
  candidates: Candidate[];
  onboarding: OnboardingItem[];
  timeEntries: TimeEntry[];
  milestones: Milestone[];
  invoices: Invoice[];
  payments: Payment[];
}

export const DEMO_TODAY = "2026-10-15";
export const PAYDAY_FRIDAY = "2026-10-17";
