import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BidStatus } from "@/data/types";

export function StatusBadge({ status, className }: { status: BidStatus | string; className?: string }) {
  const getColors = (s: string) => {
    switch (s) {
      case "New":
      case "Ready for Response":
      case "Submitted":
        // In-progress / informational → Tide blue accent on neutral
        return "text-[#2d6a8b] bg-[#55A1D3]/10 border-[#55A1D3]/30";
      case "Approved":
      case "Ready":
      case "Complete":
      case "Won":
        // Validated / good → Pasture green
        return "text-[#1f7a4a] bg-[#30A566]/10 border-[#30A566]/30";
      case "Needs Review":
      case "Pending Approval":
      case "Customer Follow-up":
      case "Clarification Requested":
        // Attention but not blocked → neutral gray (avoid red overuse)
        return "text-neutral-700 bg-neutral-100 border-neutral-300";
      case "Restricted":
      case "Exception":
      case "Rejected":
      case "Lost":
      case "Escalated":
        // Blocked / urgent → Cummins Red accent
        return "text-[#DA291C] bg-[#DA291C]/10 border-[#DA291C]/30";
      default:
        return "text-neutral-600 bg-neutral-50 border-neutral-200";
    }
  };

  return (
    <Badge variant="outline" className={cn("font-medium", getColors(status), className)}>
      {status}
    </Badge>
  );
}
