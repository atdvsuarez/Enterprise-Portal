export type Role = "admin" | "scout" | "ae";

export interface User {
  name: string;
  role: Role;
  title: string;
}

export const USERS: Record<Role, User> = {
  admin: { name: "Neeraj Sharma", role: "admin", title: "Bid Admin" },
  scout: { name: "Priya Iyer", role: "scout", title: "Bid Scout" },
  ae: { name: "Marcus Chen", role: "ae", title: "Account Executive" },
};

export type BidStatus = "New" | "Needs Review" | "Ready for Response" | "Pending Approval" | "Submitted" | "Restricted" | "Exception";
export type SourceType = "Email" | "Excel" | "External URL" | "Portal";
export type PipelineStage = "Identify" | "Qualify" | "Respond" | "Post-Submission";
export type Recommendation = "Go" | "No-Go" | "Review";

export interface LineItem {
  lineNumber: number;
  partNumber: string;
  description: string;
  quantity: number;
  matchedPart?: string;
  availability?: "In Stock" | "Low Stock" | "Out of Stock";
  price?: number;
  leadTime?: string;
  sourceConfidence: number;
  exceptionFlag?: boolean;
}

export interface Bid {
  id: string;
  rfqId: string;
  externalId: string;
  title: string;
  customer: string;
  customerType: string;
  sourceType: SourceType;
  portalName?: string;
  intakePattern?: string;
  createdDate: string;
  closeDate: string;
  status: BidStatus;
  pipelineStage: PipelineStage;
  aiRelevanceScore: number;
  goNoGoRecommendation: Recommendation;
  confidenceLevel: number;
  priority: "High" | "Medium" | "Low";
  totalParts: number;
  matchedParts: number;
  unmatchedParts: number;
  pricingStatus: "Ready" | "Pending" | "Exception";
  inventoryStatus: "Clear" | "At Risk" | "Blocked";
  leadTimeStatus: "Standard" | "Expedited" | "Exception";
  assignedScout?: string;
  assignedAdmin?: string;
  assignedAE?: string;
  notes: string;
  riskFlags: string[];
  documents: string[];
  knowledgePackLinks: string[];
  submissionState?: string;
  outcomeState?: string;
  lineItems: LineItem[];
  valueBand?: string;
}

export interface Portal {
  id: string;
  name: string;
  customers: string[];
  status: "Healthy" | "Degraded" | "Blocked";
  bidCount: number;
  lastSync: string;
  type: "Structured" | "Public" | "Login Required" | "High Noise" | "Restricted";
  primaryCta: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: string;
  message: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: "Prior Bids" | "Win/Loss Notes" | "Pricing Guidance" | "Customer Terms" | "Templates";
  summary: string;
  matchScore: number;
}

export interface Submission {
  id: string;
  bidId: string;
  customer: string;
  submittedDate: string;
  status: "Submitted" | "Customer Follow-up" | "Clarification Requested" | "Won" | "Lost" | "No Response" | "Escalated";
  owner: string;
  outcomeNotes: string;
  winLossTag?: string;
}
