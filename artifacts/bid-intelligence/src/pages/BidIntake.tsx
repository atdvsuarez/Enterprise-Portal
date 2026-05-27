import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, FileText, Database, Globe, Loader2, ArrowRight } from "lucide-react";
import { PortalTypeBadge } from "@/components/common/PortalTypeBadge";
import { Link } from "wouter";

export default function BidIntake({ embedded = false }: { embedded?: boolean } = {}) {
  const [activeTab, setActiveTab] = useState("email");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");

  const handleProcess = () => {
    setIsProcessing(true);
    setIsComplete(false);
    setLogs(["Initializing extraction pipeline..."]);
    
    const steps = [
      "Parsing content blocks...",
      "Identifying line items and quantities...",
      "Running semantic match against Cummins catalog...",
      "Extracting SLA and terms...",
      "Generating AI confidence scores..."
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setLogs(prev => [...prev, steps[stepIndex]]);
        stepIndex++;
      } else {
        clearInterval(interval);
        setIsProcessing(false);
        setIsComplete(true);
      }
    }, 600); // simulate delay
  };

  const getPortalBadge = (url: string) => {
    if (url.includes("planetbids")) return <PortalTypeBadge type="Structured" className="ml-2" />;
    if (url.includes("opengov")) return <PortalTypeBadge type="Public" className="ml-2" />;
    if (url.includes("bonfire")) return <PortalTypeBadge type="High Noise" className="ml-2" />;
    return null;
  };

  return (
    <div className={embedded ? "space-y-6" : "p-4 md:p-8 max-w-6xl mx-auto space-y-6"}>
      {!embedded && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Bid Intake</h1>
          <p className="text-muted-foreground mt-1">Manually ingest bids via text, document, or external link.</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="email" className="gap-2"><FileText className="h-4 w-4" /> Email</TabsTrigger>
          <TabsTrigger value="excel" className="gap-2"><Database className="h-4 w-4" /> Excel</TabsTrigger>
          <TabsTrigger value="url" className="gap-2"><Globe className="h-4 w-4" /> URL</TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-6">
            <TabsContent value="email" className="mt-0">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Email Body Extraction</CardTitle>
                  <CardDescription>Paste raw email content to extract bid details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Content</Label>
                    <Textarea placeholder="Paste email body here..." className="min-h-[250px] font-mono text-sm" />
                  </div>
                  <Button onClick={handleProcess} disabled={isProcessing} className="w-full">
                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : "Run Extraction"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="excel" className="mt-0">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Excel Attachment</CardTitle>
                  <CardDescription>Upload customer spreadsheets for bulk mapping.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <Database className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">.xlsx, .xls, or .csv up to 10MB</p>
                  </div>
                  <Button onClick={handleProcess} disabled={isProcessing} className="w-full">
                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : "Upload & Map"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="url" className="mt-0">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>External URL Scan</CardTitle>
                  <CardDescription>Auto-pull details from supported portals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      Portal URL
                      {urlInput && getPortalBadge(urlInput.toLowerCase())}
                    </Label>
                    <Input 
                      placeholder="https://..." 
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleProcess} disabled={isProcessing || !urlInput} className="w-full">
                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning...</> : "Start Scan"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm h-full flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle>Extraction Results</CardTitle>
                <CardDescription>AI processing log and matched output</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="bg-slate-900 rounded-md p-4 text-slate-300 font-mono text-xs flex-1 overflow-auto max-h-[300px]">
                  {logs.length === 0 && !isComplete && (
                    <div className="text-slate-600 italic">Waiting for input...</div>
                  )}
                  {logs.map((log, i) => (
                    <div key={i} className="mb-2">
                      <span className="text-slate-500 mr-2">{new Date().toISOString().split('T')[1].substring(0, 8)}</span>
                      {log}
                    </div>
                  ))}
                  {isComplete && (
                    <div className="text-green-400 mt-4">
                      ✓ Extraction complete.
                    </div>
                  )}
                </div>

                {isComplete && (
                  <div className="mt-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 text-green-900 dark:text-green-400">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Successfully extracted bid data</p>
                          <p className="text-xs opacity-90 mt-1">Found 12 line items (10 matched to catalog). Confidence score: 92%.</p>
                        </div>
                      </div>
                    </div>
                    <Link href="/evaluation/BID-2026-001">
                      <Button className="w-full mt-4 gap-2">
                        Continue to Bid Evaluation <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
