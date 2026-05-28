import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, Sparkles, Wrench } from "lucide-react";
import cumminsLogo from "@assets/image_1779990350671.png";

const FEATURES = [
  {
    icon: Activity,
    title: "Unified Bid Monitor",
    body: "Every incoming RFQ — from email, Excel, or external portals — in one queue, automatically triaged.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    body: "Summaries, part extraction, pricing analysis, and risk flags generated in seconds, not hours.",
  },
  {
    icon: Wrench,
    title: "One-Click Response",
    body: "AI-drafted email replies with line-item attachments, sent directly through Outlook.",
  },
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-white via-neutral-50 to-neutral-100">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#DA291C] text-white">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 0px, transparent 1px), radial-gradient(circle at 70% 70%, white 0px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Cummins Aftermarket · Internal Tool
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Bid Intelligence
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-xl leading-relaxed">
              A single workspace for the Daily Bids team to monitor incoming RFQs, evaluate
              opportunities with AI, and respond to customers faster — without losing the
              accuracy that wins business.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-white text-[#DA291C] hover:bg-white/90 gap-2 shadow-lg"
                >
                  Enter Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/monitor">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white"
                >
                  Browse Bid Monitor
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl ring-1 ring-black/5">
              <img
                src={cumminsLogo}
                alt="Cummins"
                className="w-48 md:w-64 h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What it does */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-20">
        <div className="max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-[#2A2A2A] tracking-tight">
            What Bid Intelligence does
          </h2>
          <p className="mt-3 text-base md:text-lg text-neutral-600 leading-relaxed">
            Cummins receives hundreds of aftermarket parts RFQs every week across email,
            spreadsheets, and government procurement portals. Bid Intelligence centralizes
            the inbox, uses AI to match parts and surface insights, and lets the Daily Bids
            team turn requests into priced, attachment-ready responses in minutes.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-[#DA291C]/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-[#DA291C]" />
                </div>
                <h3 className="font-semibold text-[#2A2A2A] mb-1.5">{f.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{f.body}</p>
              </div>
            );
          })}
        </div>

        {/* CTA strip */}
        <div className="mt-12 rounded-xl bg-[#2A2A2A] text-white p-6 md:p-8 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-lg md:text-xl font-semibold">Ready to start your shift?</h3>
            <p className="text-sm text-white/70 mt-1">
              Jump into today's queue or ask the AI assistant about any active bid.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button className="bg-[#DA291C] hover:bg-[#b32016] gap-2">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/ai-workbench">
              <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                Open Insights Chat
              </Button>
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-neutral-400 uppercase tracking-wider">
          © Cummins Inc. · Aftermarket Bid Intelligence · Internal Demo
        </p>
      </section>
    </div>
  );
}
