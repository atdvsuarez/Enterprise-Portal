import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRole } from "@/lib/role";
import { User, Bell, Briefcase, Globe, Download, Sparkles, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "role", label: "Role Preferences", icon: Briefcase },
  { id: "portals", label: "Portal Connections", icon: Globe },
  { id: "export", label: "Export Preferences", icon: Download },
  { id: "ai", label: "AI Behavior", icon: Sparkles },
  { id: "thresholds", label: "Thresholds", icon: SlidersHorizontal },
];

export default function Settings() {
  const [active, setActive] = useState("profile");
  const { user } = useRole();
  const [relevance, setRelevance] = useState(70);
  const [qualification, setQualification] = useState(65);

  const save = () => toast.success("Settings saved");

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile, notification preferences, and AI behavior.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <nav className="lg:col-span-3 space-y-1">
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-left ${active === s.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"}`}
              >
                <Icon className="w-4 h-4" /> {s.label}
              </button>
            );
          })}
        </nav>

        <div className="lg:col-span-9">
          {active === "profile" && (
            <Card>
              <CardHeader><CardTitle>Profile</CardTitle><CardDescription>Your account details.</CardDescription></CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <div><Label>Full name</Label><Input className="mt-1.5" defaultValue={user.name} /></div>
                <div><Label>Title</Label><Input className="mt-1.5" defaultValue={user.title} /></div>
                <div><Label>Email</Label><Input className="mt-1.5" defaultValue={`${user.name.split(" ")[0].toLowerCase()}@cummins.com`} /></div>
                <div><Label>Team</Label><Input className="mt-1.5" defaultValue="Aftermarket Daily Bids" /></div>
                <Button onClick={save}>Save changes</Button>
              </CardContent>
            </Card>
          )}

          {active === "notifications" && (
            <Card>
              <CardHeader><CardTitle>Notifications</CardTitle><CardDescription>Where and when we ping you.</CardDescription></CardHeader>
              <CardContent className="space-y-5 max-w-2xl">
                {[
                  ["New bids matching my segment", true],
                  ["Approval requests requiring my action", true],
                  ["Portal sync failures", true],
                  ["Daily digest email at 8:00 AM", true],
                  ["AI confidence drops below threshold", false],
                  ["Customer follow-ups received", false],
                ].map(([label, val], i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Label className="font-normal">{label as string}</Label>
                    <Switch defaultChecked={val as boolean} />
                  </div>
                ))}
                <Separator />
                <Button onClick={save}>Save</Button>
              </CardContent>
            </Card>
          )}

          {active === "role" && (
            <Card>
              <CardHeader><CardTitle>Role Preferences</CardTitle><CardDescription>Default landing pages and visible columns.</CardDescription></CardHeader>
              <CardContent className="space-y-5 max-w-2xl">
                <div><Label>Default landing page</Label><Input className="mt-1.5" defaultValue="Dashboard" /></div>
                <div><Label>Bid Monitor default filter</Label><Input className="mt-1.5" defaultValue="Needs Review" /></div>
                <div className="flex items-center justify-between"><Label className="font-normal">Show AI relevance scores</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label className="font-normal">Show SLA timers</Label><Switch defaultChecked /></div>
                <Button onClick={save}>Save</Button>
              </CardContent>
            </Card>
          )}

          {active === "portals" && (
            <Card>
              <CardHeader><CardTitle>Portal Connections</CardTitle><CardDescription>Manage credentials and sync cadence.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {["PlanetBids", "OpenGov", "Oracle iSupplier", "Fairmarkit", "Bonfire / Euna"].map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-bold">{p.charAt(0)}</div>
                      <div>
                        <p className="font-medium text-sm">{p}</p>
                        <p className="text-xs text-muted-foreground">Sync every 15 min</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={i === 3 ? "text-red-600 bg-red-50 border-red-200" : "text-green-600 bg-green-50 border-green-200"}>
                        {i === 3 ? "Disconnected" : "Connected"}
                      </Badge>
                      <Button size="sm" variant="outline">Configure</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {active === "export" && (
            <Card>
              <CardHeader><CardTitle>Export Preferences</CardTitle><CardDescription>Default formats and templates for exports.</CardDescription></CardHeader>
              <CardContent className="space-y-5 max-w-2xl">
                <div><Label>Default CSV format</Label><Input className="mt-1.5" defaultValue="Cummins Standard (UTF-8)" /></div>
                <div><Label>Default email template</Label><Input className="mt-1.5" defaultValue="Aftermarket Response Template v3" /></div>
                <div className="flex items-center justify-between"><Label className="font-normal">Include AI confidence in exports</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label className="font-normal">Auto-attach knowledge pack PDFs</Label><Switch /></div>
                <Button onClick={save}>Save</Button>
              </CardContent>
            </Card>
          )}

          {active === "ai" && (
            <Card>
              <CardHeader><CardTitle>AI Behavior</CardTitle><CardDescription>Control how AI assists you. Humans remain in the loop.</CardDescription></CardHeader>
              <CardContent className="space-y-5 max-w-2xl">
                {[
                  ["Generate draft responses automatically when ready", true],
                  ["Suggest similar prior bids on evaluation", true],
                  ["Auto-flag high-risk bids for review", true],
                  ["Show AI reasoning tooltips", true],
                  ["Allow AI to skip manual mapping on >95% confidence matches", false],
                ].map(([label, val], i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Label className="font-normal">{label as string}</Label>
                    <Switch defaultChecked={val as boolean} />
                  </div>
                ))}
                <Button onClick={save}>Save</Button>
              </CardContent>
            </Card>
          )}

          {active === "thresholds" && (
            <Card>
              <CardHeader><CardTitle>Thresholds</CardTitle><CardDescription>Tune the AI's signal sensitivity.</CardDescription></CardHeader>
              <CardContent className="space-y-8 max-w-2xl">
                <div>
                  <div className="flex justify-between mb-2"><Label>Relevance score threshold</Label><span className="text-sm font-semibold tabular-nums">{relevance}</span></div>
                  <Slider value={[relevance]} onValueChange={([v]) => setRelevance(v)} max={100} step={1} />
                  <p className="text-xs text-muted-foreground mt-2">Bids scoring below {relevance} are auto-suppressed from your queue.</p>
                </div>
                <div>
                  <div className="flex justify-between mb-2"><Label>Qualification confidence threshold</Label><span className="text-sm font-semibold tabular-nums">{qualification}</span></div>
                  <Slider value={[qualification]} onValueChange={([v]) => setQualification(v)} max={100} step={1} />
                  <p className="text-xs text-muted-foreground mt-2">Bids below {qualification}% confidence are flagged for human review.</p>
                </div>
                <Button onClick={save}>Save thresholds</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
