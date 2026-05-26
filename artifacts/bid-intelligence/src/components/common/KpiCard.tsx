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

export function KpiCard({ title, value, icon: Icon, trend, trendUp, color = "blue", className }: KpiCardProps) {
  const getBorderColor = () => {
    switch(color) {
      case "blue": return "border-l-blue-500";
      case "green": return "border-l-green-500";
      case "amber": return "border-l-amber-500";
      case "red": return "border-l-red-500";
      case "purple": return "border-l-purple-500";
      default: return "border-l-slate-500";
    }
  };
  
  const getIconColors = () => {
    switch(color) {
      case "blue": return "text-blue-500 bg-blue-50 dark:bg-blue-900/20";
      case "green": return "text-green-500 bg-green-50 dark:bg-green-900/20";
      case "amber": return "text-amber-500 bg-amber-50 dark:bg-amber-900/20";
      case "red": return "text-red-500 bg-red-50 dark:bg-red-900/20";
      case "purple": return "text-purple-500 bg-purple-50 dark:bg-purple-900/20";
      default: return "text-slate-500 bg-slate-50 dark:bg-slate-800";
    }
  };

  return (
    <Card className={cn("border-l-4 shadow-sm", getBorderColor(), className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-2 tabular-nums">{value}</h3>
            {trend && (
              <p className={cn("text-xs mt-1 font-medium", trendUp ? "text-green-600" : "text-muted-foreground")}>
                {trend}
              </p>
            )}
          </div>
          <div className={cn("p-2 rounded-md", getIconColors())}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
