import { useRole } from "@/lib/role";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Inbox, Activity, CheckSquare, Wrench, BookOpen, Send, BarChart2, Settings, Globe, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { role, user } = useRole();
  const [location] = useLocation();

  const getLinks = () => {
    const common = [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/monitor", label: "Bid Monitor", icon: Activity },
      { href: "/evaluation", label: "Bid Evaluation", icon: CheckSquare },
      { href: "/knowledge", label: "Knowledge Base", icon: BookOpen },
      { href: "/analytics", label: "Analytics", icon: BarChart2 },
      { href: "/settings", label: "Settings", icon: Settings },
    ];

    if (role === "daily") {
      return [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/monitor", label: "Bid Monitor", icon: Activity },
        { href: "/workbench", label: "Response Workbench", icon: Wrench },
        { href: "/ai-workbench", label: "AI Workbench", icon: Sparkles },
      ];
    }

    if (role === "admin") {
      return [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/intake", label: "Bid Intake", icon: Inbox },
        { href: "/monitor", label: "Bid Monitor", icon: Activity },
        { href: "/evaluation", label: "Bid Evaluation", icon: CheckSquare },
        { href: "/workbench", label: "Response Workbench", icon: Wrench },
        { href: "/knowledge", label: "Knowledge Base", icon: BookOpen },
        { href: "/post-submission", label: "Post Submission", icon: Send },
        { href: "/analytics", label: "Analytics", icon: BarChart2 },
        { href: "/settings", label: "Settings", icon: Settings },
      ];
    }
    
    if (role === "scout") {
      return [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/portals", label: "Portal Manager", icon: Globe },
        { href: "/monitor", label: "Bid Monitor", icon: Activity },
        { href: "/evaluation", label: "Bid Evaluation", icon: CheckSquare },
        { href: "/knowledge", label: "Knowledge Base", icon: BookOpen },
        { href: "/analytics", label: "Analytics", icon: BarChart2 },
        { href: "/settings", label: "Settings", icon: Settings },
      ];
    }

    if (role === "ae") {
      return [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/approvals", label: "Bid Approval Queue", icon: CheckSquare },
        { href: "/executive-summary", label: "Executive Summary", icon: LayoutDashboard },
        { href: "/post-submission", label: "Post Submission", icon: Send },
        { href: "/analytics", label: "Analytics", icon: BarChart2 },
        { href: "/settings", label: "Settings", icon: Settings },
      ];
    }

    return common;
  };

  const links = getLinks();

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground w-64 border-r border-sidebar-border shadow-lg">
      <div className="p-4 md:p-6 border-b border-sidebar-border">
        <h1 className="text-lg font-bold tracking-tight text-sidebar-primary-foreground flex items-center gap-2">
          Bid Intelligence
        </h1>
        <p className="text-xs text-sidebar-foreground/70 mt-1 uppercase tracking-wider font-semibold">Cummins Aftermarket</p>
        <div className="mt-4 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-xs text-sidebar-foreground/80 font-medium">Live Monitoring · Active</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/"
              ? location === "/"
              : location === link.href || location.startsWith(link.href + "/");
            return (
              <Link key={link.href} href={link.href}>
                <span className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-sidebar-accent text-white before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r-sm before:bg-sidebar-primary"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-white"
                )}>
                  <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-sidebar-primary" : "")} />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold text-xs shadow-inner">
            {user.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-medium text-sidebar-foreground leading-tight">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/70">{user.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
