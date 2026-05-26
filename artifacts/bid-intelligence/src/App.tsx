import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/lib/role";
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

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/intake" component={BidIntake} />
      <Route path="/monitor" component={BidMonitor} />
      <Route path="/evaluation" component={BidEvaluation} />
      <Route path="/evaluation/:id" component={BidEvaluation} />
      <Route path="/workbench" component={ResponseWorkbench} />
      <Route path="/workbench/:id" component={ResponseWorkbench} />
      <Route path="/portals" component={PortalManager} />
      <Route path="/approvals" component={ApprovalQueue} />
      <Route path="/executive-summary" component={ExecutiveSummary} />
      <Route path="/executive-summary/:id" component={ExecutiveSummary} />
      <Route path="/knowledge" component={KnowledgeBase} />
      <Route path="/post-submission" component={PostSubmission} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/settings" component={Settings} />
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
