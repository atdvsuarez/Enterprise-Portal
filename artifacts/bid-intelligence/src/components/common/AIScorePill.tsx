import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export function AIScorePill({ score, className }: { score: number; className?: string }) {
  // Cummins palette: Pasture (high) · Gray (medium) · Cummins Red (low, signals risk)
  const getColors = (s: number) => {
    if (s >= 85) return "text-[#1f7a4a] bg-[#30A566]/10 border-[#30A566]/30";
    if (s >= 65) return "text-neutral-700 bg-neutral-100 border-neutral-300";
    return "text-[#DA291C] bg-[#DA291C]/10 border-[#DA291C]/30";
  };

  return (
    <Badge variant="outline" className={cn("font-semibold gap-1 items-center px-2 py-0.5 shadow-xs", getColors(score), className)}>
      <Sparkles className="w-3 h-3 text-muted-foreground" />
      {score}
    </Badge>
  );
}
