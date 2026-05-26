import { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Topbar } from "@/components/topbar/Topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20 selection:text-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto bg-slate-50/50 dark:bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
