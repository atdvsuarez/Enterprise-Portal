import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BidStatus } from "@/data/types";

export function StatusBadge({ status, className }: { status: BidStatus | string; className?: string }) {
  const getColors = (s: string) => {
    switch (s) {
      case "New":
      case "Ready for Response":
      case "Submitted":
        return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      case "Approved":
      case "Ready":
      case "Complete":
      case "Won":
        return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "Needs Review":
      case "Pending Approval":
      case "Customer Follow-up":
      case "Clarification Requested":
        return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
      case "Restricted":
      case "Exception":
      case "Rejected":
      case "Lost":
      case "Escalated":
        return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
  };

  return (
    <Badge variant="outline" className={cn("font-medium", getColors(status), className)}>
      {status}
    </Badge>
  );
}
