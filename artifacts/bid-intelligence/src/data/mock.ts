import { Bid, Portal } from "./types";

export const mockPortals: Portal[] = [
  { id: "1", name: "PlanetBids", customers: ["Jefferson County", "DART"], status: "Healthy", bidCount: 142, lastSync: "10m ago", type: "Structured", primaryCta: "Scrape Now" },
  { id: "2", name: "OpenGov", customers: ["MBTA", "RTA Cleveland"], status: "Healthy", bidCount: 89, lastSync: "25m ago", type: "Public", primaryCta: "Refresh" },
  { id: "3", name: "Oracle iSupplier", customers: ["OCTA Orange County", "City of Sacramento"], status: "Degraded", bidCount: 34, lastSync: "2h ago", type: "Login Required", primaryCta: "Connect" },
  { id: "4", name: "Fairmarkit", customers: ["SORTA Cincinnati", "King County Metro"], status: "Blocked", bidCount: 12, lastSync: "1d ago", type: "Restricted", primaryCta: "Review Manually" },
  { id: "5", name: "Bonfire / Euna Procurement", customers: ["OMNI Phoenix", "WMATA"], status: "Healthy", bidCount: 450, lastSync: "5m ago", type: "High Noise", primaryCta: "Upload Export" },
];

const generateBids = (): Bid[] => {
  const titles = [
    "2026 Single Axle Dump Truck Chassis", "2026 Tandem Axle Dump Truck Chassis",
    "Transit Bus Engine Rebuild Kits — Q3", "BALLSCREW, EQUIPMENT PART",
    "RING, RETAINING — RETAINING", "Heavy-Duty Brake Pad Assemblies",
    "ISX15 Turbocharger Replacement", "Bus HVAC Compressor Units",
    "Municipal Snowplow Hydraulic Pumps", "Fleet Fuel Filter Kits FY26",
    "Paratransit Wheelchair Lift Motors", "Aftermarket Alternators — 24V",
    "Cummins L9 Aftertreatment Modules", "Dump Body PTO Assemblies",
    "Transit Door Operator Mechanisms", "Articulated Bus Bellows Replacement",
    "ISL9 Fuel Injector Set", "School Bus DEF Tank Heaters",
    "Refuse Truck Hydraulic Cylinders", "Ambulance Chassis Wiring Harnesses",
    "Public Works Generator Sets — 60kW", "Light Rail Brake Caliper Rebuild"
  ];

  const customers = [
    "Jefferson County", "DART (Dallas Area Rapid Transit)", "MBTA", 
    "RTA Cleveland", "OCTA Orange County", "SORTA Cincinnati", "OMNI Phoenix", 
    "City of Sacramento", "King County Metro", "WMATA", "Port Authority NY/NJ", 
    "VIA San Antonio", "TriMet Portland", "City of Austin Fleet Services", "LA Metro"
  ];
  
  const sources: ("Email" | "Excel" | "External URL" | "Portal")[] = ["Email", "Excel", "External URL", "Portal"];
  const statuses: Bid["status"][] = ["New", "Needs Review", "Ready for Response", "Pending Approval", "Submitted", "Restricted", "Exception"];
  const stages: Bid["pipelineStage"][] = ["Identify", "Qualify", "Respond", "Post-Submission"];
  const recs: Bid["goNoGoRecommendation"][] = ["Go", "No-Go", "Review"];

  return Array.from({ length: 22 }).map((_, i) => {
    const is001 = i === 0;
    const is007 = i === 6;
    
    const id = `BID-2026-${(i + 1).toString().padStart(3, '0')}`;
    
    let parts = Math.floor(Math.random() * 20) + 1;
    let matchedParts = Math.floor(Math.random() * parts);
    
    if (is001 || is007) {
      parts = 12;
      matchedParts = 10;
    }
    
    return {
      id,
      rfqId: `RFQ-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.random() * 26)}`,
      externalId: `EXT-${Math.floor(100000 + Math.random() * 900000)}`,
      title: titles[i % titles.length],
      customer: customers[i % customers.length],
      customerType: ["Municipal", "Transit", "Federal"][i % 3],
      sourceType: sources[i % sources.length],
      portalName: mockPortals[i % mockPortals.length].name,
      createdDate: new Date(Date.now() - (Math.random() * 10) * 86400000).toISOString(),
      closeDate: new Date(Date.now() + (Math.random() * 20 + 2) * 86400000).toISOString(),
      status: statuses[i % statuses.length],
      pipelineStage: stages[i % stages.length],
      aiRelevanceScore: Math.floor(Math.random() * 63) + 35, // 35-98
      goNoGoRecommendation: recs[i % recs.length],
      confidenceLevel: Math.floor(Math.random() * 55) + 40, // 40-95
      priority: ["High", "Medium", "Low"][i % 3] as "High" | "Medium" | "Low",
      totalParts: parts,
      matchedParts,
      unmatchedParts: parts - matchedParts,
      pricingStatus: ["Ready", "Pending", "Exception"][i % 3] as "Ready" | "Pending" | "Exception",
      inventoryStatus: ["Clear", "At Risk", "Blocked"][i % 3] as "Clear" | "At Risk" | "Blocked",
      leadTimeStatus: ["Standard", "Expedited", "Exception"][i % 3] as "Standard" | "Expedited" | "Exception",
      assignedScout: "Priya Iyer",
      assignedAdmin: "Neeraj Sharma",
      assignedAE: "Marcus Chen",
      notes: "Generated test bid data for portal simulation.",
      riskFlags: Math.random() > 0.5 ? ["Tight turnaround time", "Unknown competitor"] : [],
      documents: ["Specs.pdf", "Terms.docx"],
      knowledgePackLinks: ["KB-102"],
      lineItems: (is001 || is007) ? Array.from({ length: 12 }).map((_, li) => ({
        lineNumber: li + 1,
        partNumber: `CUM-${["X15", "ISL9", "DEF-TANK", "B-SERIES"][li % 4]}-${2026 + li}`,
        description: `Cummins Engine Component ${li + 1}`,
        quantity: Math.floor(Math.random() * 20) + 1,
        matchedPart: li < 10 ? `CUM-MATCH-${li}` : undefined,
        availability: ["In Stock", "Low Stock", "Out of Stock"][li % 3] as any,
        price: Math.floor(40 + Math.random() * 44960),
        leadTime: `${li % 4 + 1} weeks`,
        sourceConfidence: Math.floor(Math.random() * 50) + 40,
        exceptionFlag: li >= 10
      })) : [
        { lineNumber: 1, partNumber: "UNKNOWN", description: "Generic Part", quantity: 5, sourceConfidence: 50 }
      ]
    };
  });
};

export const mockBids: Bid[] = generateBids();

export const mockActivityLog = [
  { timestamp: "10:42 AM", type: "Scan URL", message: "PlanetBids RFQ-449102 completed. Found 12 line items." },
  { timestamp: "10:15 AM", type: "Excel Upload", message: "MBTA_Q3_Parts.xlsx mapped successfully. 1 unmatched part flagged." },
  { timestamp: "09:30 AM", type: "Email Extract", message: "Partial match on BALLSCREW. Added to Needs Review queue." },
  { timestamp: "09:12 AM", type: "Portal Sync", message: "OpenGov synced successfully. 3 new bids found." },
  { timestamp: "08:45 AM", type: "Exception", message: "Failed to scrape Oracle iSupplier. Login expired." },
  { timestamp: "08:22 AM", type: "Approval", message: "BID-2026-004 approved by Marcus Chen." },
  { timestamp: "08:00 AM", type: "New Upload", message: "DART_Specs.pdf processed with 88% confidence." },
  { timestamp: "07:30 AM", type: "Email Extract", message: "Tandem Axle request mapped. 5 parts found." },
  { timestamp: "07:15 AM", type: "Scan URL", message: "Bonfire portal scrape complete. 0 relevant bids." },
  { timestamp: "06:50 AM", type: "System", message: "Daily AI model refresh complete." },
  { timestamp: "06:10 AM", type: "Portal Sync", message: "Fairmarkit access blocked. Retrying..." },
  { timestamp: "05:45 AM", type: "Scan URL", message: "PlanetBids RFQ-901123 found. Handed to review." }
];

export const mockKnowledgeArticles = [
  { id: 1, category: "Prior Bids", title: "Jefferson County Chassis Win 2024" },
  { id: 2, category: "Pricing Guidance", title: "X15 Engine Fleet Discount Matrix" },
  { id: 3, category: "Win/Loss Notes", title: "DART 2023 - Loss Analysis (Lead Time)" },
  { id: 4, category: "Customer Terms", title: "MBTA Standard T&Cs - Liquidated Damages" },
  { id: 5, category: "Templates", title: "Standard Exception Letter Template" },
  { id: 6, category: "Prior Bids", title: "SORTA Brake Pads - 2025 Retrospective" },
  { id: 7, category: "Pricing Guidance", title: "Municipal Volume Tier Guide Q2" },
  { id: 8, category: "Customer Terms", title: "King County Metro - Buy America Requirements" },
  { id: 9, category: "Templates", title: "Executive Summary Go/No-Go Template" },
  { id: 10, category: "Win/Loss Notes", title: "VIA San Antonio 2025 - Win (Stock Availability)" }
];

export const mockSubmissions = [
  { id: "BID-2026-001", customer: "Jefferson County", submittedDate: "2026-05-20", status: "Submitted", owner: "Marcus Chen", outcome: "Pending", outcomeNotes: "Waiting on board approval.", tags: ["competitive"] },
  { id: "BID-2026-010", customer: "DART", submittedDate: "2026-05-15", status: "Won", owner: "Marcus Chen", outcome: "Won", outcomeNotes: "Competitor failed technical eval.", tags: ["technical-win", "high-margin"] },
  { id: "BID-2026-012", customer: "MBTA", submittedDate: "2026-05-10", status: "Lost", owner: "Marcus Chen", outcome: "Lost", outcomeNotes: "Underbid by 15% by aftermarket supplier.", tags: ["price-loss"] },
  { id: "BID-2026-015", customer: "RTA Cleveland", submittedDate: "2026-05-01", status: "Clarification Requested", owner: "Marcus Chen", outcome: "Pending", outcomeNotes: "Need to clarify lead time on item 4.", tags: ["clarification"] },
  { id: "BID-2026-018", customer: "OCTA", submittedDate: "2026-04-20", status: "No Response", owner: "Marcus Chen", outcome: "Expired", outcomeNotes: "Customer cancelled RFP.", tags: ["cancelled"] },
  { id: "BID-2026-003", customer: "SORTA", submittedDate: "2026-04-10", status: "Escalated", owner: "Marcus Chen", outcome: "Pending", outcomeNotes: "Legal review on terms.", tags: ["legal"] },
  { id: "BID-2026-005", customer: "OMNI", submittedDate: "2026-03-15", status: "Won", owner: "Marcus Chen", outcome: "Won", outcomeNotes: "Strong relationship.", tags: ["relationship"] },
  { id: "BID-2026-020", customer: "WMATA", submittedDate: "2026-03-01", status: "Customer Follow-up", owner: "Marcus Chen", outcome: "Pending", outcomeNotes: "Meeting scheduled for next week.", tags: ["active"] },
  { id: "BID-2026-021", customer: "VIA", submittedDate: "2026-02-15", status: "Lost", owner: "Marcus Chen", outcome: "Lost", outcomeNotes: "Could not meet delivery timeline.", tags: ["lead-time-loss"] },
  { id: "BID-2026-022", customer: "TriMet", submittedDate: "2026-02-01", status: "Won", owner: "Marcus Chen", outcome: "Won", outcomeNotes: "Only compliant bidder.", tags: ["sole-source"] },
  { id: "BID-2026-011", customer: "Austin Fleet", submittedDate: "2026-01-20", status: "Submitted", owner: "Marcus Chen", outcome: "Pending", outcomeNotes: "Under review.", tags: [] },
  { id: "BID-2026-019", customer: "LA Metro", submittedDate: "2026-01-05", status: "Won", owner: "Marcus Chen", outcome: "Won", outcomeNotes: "Multi-year contract secured.", tags: ["multi-year"] }
];

export const mockAnalyticsData = {
  sourceType: [
    { name: 'Portal', value: 450 },
    { name: 'Email', value: 320 },
    { name: 'External URL', value: 210 },
    { name: 'Excel', value: 150 },
  ],
  trends: [
    { name: 'W1', value: 45 }, { name: 'W2', value: 52 }, { name: 'W3', value: 48 }, { name: 'W4', value: 61 },
    { name: 'W5', value: 59 }, { name: 'W6', value: 68 }, { name: 'W7', value: 72 }, { name: 'W8', value: 85 },
  ],
  recommendation: [
    { name: 'Go', value: 65, fill: '#22c55e' },
    { name: 'Review', value: 25, fill: '#f59e0b' },
    { name: 'No-Go', value: 10, fill: '#ef4444' },
  ],
  funnel: [
    { name: 'Identify', value: 1000 },
    { name: 'Qualify', value: 400 },
    { name: 'Draft', value: 250 },
    { name: 'Submit', value: 180 },
    { name: 'Won', value: 60 },
  ],
  matchedParts: [
    { name: 'W1', matched: 80, unmatched: 20 },
    { name: 'W2', matched: 82, unmatched: 18 },
    { name: 'W3', matched: 85, unmatched: 15 },
    { name: 'W4', matched: 88, unmatched: 12 },
    { name: 'W5', matched: 89, unmatched: 11 },
    { name: 'W6', matched: 91, unmatched: 9 },
    { name: 'W7', matched: 93, unmatched: 7 },
    { name: 'W8', matched: 95, unmatched: 5 },
  ],
  outcomes: [
    { name: 'Won', value: 45, fill: '#22c55e' },
    { name: 'Lost (Price)', value: 25, fill: '#ef4444' },
    { name: 'Lost (Tech)', value: 10, fill: '#f97316' },
    { name: 'Cancelled', value: 5, fill: '#64748b' },
  ]
};

export const getBidById = (id: string) => mockBids.find(b => b.id === id);
export const getBidsByStatus = (status: string) => mockBids.filter(b => b.status === status);
export const getBidsByRole = (role: string) => mockBids;
