import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PortalTypeBadge({ type, className }: { type: string; className?: string }) {
  const getColors = (t: string) => {
    switch (t) {
      case "Structured":
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
      case "Public":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case "Login Required":
        return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
      case "High Noise":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
      case "Restricted":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Badge variant="outline" className={cn("uppercase text-[10px] tracking-wider font-semibold", getColors(type), className)}>
      {type}
    </Badge>
  );
}
