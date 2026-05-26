import { cn } from "@/lib/utils";

export function ConfidenceMeter({ value, className }: { value: number; className?: string }) {
  const getColor = (v: number) => {
    if (v >= 80) return "bg-green-500";
    if (v >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const v = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full transition-all", getColor(v))} style={{ width: `${v}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums text-muted-foreground">{v}%</span>
    </div>
  );
}
