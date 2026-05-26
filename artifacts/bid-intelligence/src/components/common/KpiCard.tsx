import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: "blue" | "green" | "amber" | "red" | "purple" | "slate";
  className?: string;
}

// Map legacy color names → Cummins brand hexes
const BRAND: Record<NonNullable<KpiCardProps["color"]>, string> = {
  blue:   "#55A1D3", // Tide
  green:  "#30A566", // Pasture
  amber:  "#F1C194", // Canyon
  red:    "#DA291C", // Cummins Red
  purple: "#787877", // Gray (purple isn't part of the brand — map to neutral)
  slate:  "#787877", // Gray
};

export function KpiCard({ title, value, icon: Icon, trend, trendUp, color = "blue", className }: KpiCardProps) {
  const accent = BRAND[color];

  return (
    <Card className={cn("shadow-sm border-l-2", className)} style={{ borderLeftColor: accent }}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-2 tabular-nums">{value}</h3>
            {trend && (
              <p className={cn("text-xs mt-1 font-medium", trendUp ? "text-[#1f7a4a]" : "text-muted-foreground")}>
                {trend}
              </p>
            )}
          </div>
          <div className="p-2 rounded-md" style={{ background: `${accent}1A`, color: accent }}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
