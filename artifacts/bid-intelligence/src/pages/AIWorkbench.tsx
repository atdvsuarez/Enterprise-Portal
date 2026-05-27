import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Inbox, BookOpen } from "lucide-react";
import BidIntake from "./BidIntake";
import KnowledgeBase from "./KnowledgeBase";

export default function AIWorkbench() {
  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Workbench</h1>
          <p className="text-muted-foreground mt-1">
            Ingest new bids and search the knowledge base — all AI-assisted, in one place.
          </p>
        </div>
      </div>

      <Tabs defaultValue="intake" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="intake" className="gap-2">
            <Inbox className="h-4 w-4" /> Bid Intake
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2">
            <BookOpen className="h-4 w-4" /> Knowledge
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intake" className="mt-6">
          <BidIntake embedded />
        </TabsContent>

        <TabsContent value="knowledge" className="mt-6">
          <KnowledgeBase embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
