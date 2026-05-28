import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider, useRole } from "@/lib/role";
import { AppShell } from "@/layouts/AppShell";

import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import BidIntake from "@/pages/BidIntake";
import BidMonitor from "@/pages/BidMonitor";
import BidEvaluation from "@/pages/BidEvaluation";
import ResponseWorkbench from "@/pages/ResponseWorkbench";
import PortalManager from "@/pages/PortalManager";
import ApprovalQueue from "@/pages/ApprovalQueue";
import ExecutiveSummary from "@/pages/ExecutiveSummary";
import KnowledgeBase from "@/pages/KnowledgeBase";
import PostSubmission from "@/pages/PostSubmission";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import AIWorkbench from "@/pages/AIWorkbench";
import Home from "@/pages/Home";

const queryClient = new QueryClient();

const DAILY_ALLOWED = new Set(["/", "/dashboard", "/monitor", "/workbench", "/ai-workbench", "/analytics"]);

function DailyGuard({ children, path }: { children: React.ReactNode; path: string }) {
  const { role } = useRole();
  if (role === "daily" && !DAILY_ALLOWED.has(path)) return <Redirect to="/" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/intake">{() => <DailyGuard path="/intake"><BidIntake /></DailyGuard>}</Route>
      <Route path="/monitor" component={BidMonitor} />
      <Route path="/evaluation">{() => <DailyGuard path="/evaluation"><BidEvaluation /></DailyGuard>}</Route>
      <Route path="/evaluation/:id">{(params) => <DailyGuard path="/evaluation"><BidEvaluation /></DailyGuard>}</Route>
      <Route path="/workbench" component={ResponseWorkbench} />
      <Route path="/workbench/:id" component={ResponseWorkbench} />
      <Route path="/portals">{() => <DailyGuard path="/portals"><PortalManager /></DailyGuard>}</Route>
      <Route path="/approvals">{() => <DailyGuard path="/approvals"><ApprovalQueue /></DailyGuard>}</Route>
      <Route path="/executive-summary">{() => <DailyGuard path="/executive-summary"><ExecutiveSummary /></DailyGuard>}</Route>
      <Route path="/executive-summary/:id">{() => <DailyGuard path="/executive-summary"><ExecutiveSummary /></DailyGuard>}</Route>
      <Route path="/knowledge">{() => <DailyGuard path="/knowledge"><KnowledgeBase /></DailyGuard>}</Route>
      <Route path="/post-submission">{() => <DailyGuard path="/post-submission"><PostSubmission /></DailyGuard>}</Route>
      <Route path="/analytics">{() => <DailyGuard path="/analytics"><Analytics /></DailyGuard>}</Route>
      <Route path="/ai-workbench" component={AIWorkbench} />
      <Route path="/settings">{() => <DailyGuard path="/settings"><Settings /></DailyGuard>}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppShell>
              <Router />
            </AppShell>
          </WouterRouter>
          <SonnerToaster richColors closeButton position="bottom-right" />
        </TooltipProvider>
      </RoleProvider>
    </QueryClientProvider>
  );
}

export default App;
