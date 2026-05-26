import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export function AIScorePill({ score, className }: { score: number; className?: string }) {
  const getColors = (s: number) => {
    if (s >= 85) return "text-green-700 bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
    if (s >= 65) return "text-amber-700 bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
    return "text-red-700 bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
  };

  return (
    <Badge variant="outline" className={cn("font-semibold gap-1 items-center px-2 py-0.5 shadow-xs", getColors(score), className)}>
      <Sparkles className="w-3 h-3 text-purple-500 dark:text-purple-400" />
      {score}
    </Badge>
  );
}
