import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
} from "recharts";
import {
  ArrowRight,
  Clock3,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

type TrackKey = "leadership" | "communication" | "crisis";

type TrackStats = {
  avgScore: number;
  completion: number;
  confidence: number;
  cohortRank: string;
};

type TrackModel = {
  label: string;
  focus: string;
  stats: TrackStats;
  weekly: Array<{ week: string; score: number; benchmark: number }>;
  skills: Array<{ skill: string; value: number }>;
  simulations: Array<{ title: string; intensity: "Easy" | "Medium" | "High"; eta: string }>;
};

const trackData: Record<TrackKey, TrackModel> = {
  leadership: {
    label: "Leadership Decisions",
    focus: "Drive alignment under pressure with timely, accountable decisions.",
    stats: {
      avgScore: 84,
      completion: 78,
      confidence: 73,
      cohortRank: "Top 18%",
    },
    weekly: [
      { week: "W1", score: 62, benchmark: 58 },
      { week: "W2", score: 68, benchmark: 60 },
      { week: "W3", score: 74, benchmark: 63 },
      { week: "W4", score: 79, benchmark: 66 },
      { week: "W5", score: 82, benchmark: 68 },
      { week: "W6", score: 84, benchmark: 70 },
    ],
    skills: [
      { skill: "Clarity", value: 86 },
      { skill: "Logic", value: 82 },
      { skill: "Empathy", value: 74 },
      { skill: "Composure", value: 79 },
      { skill: "Ownership", value: 88 },
    ],
    simulations: [
      { title: "Stakeholder Escalation Brief", intensity: "High", eta: "12 min" },
      { title: "Cross-Functional Conflict Call", intensity: "Medium", eta: "9 min" },
      { title: "Priority Trade-Off Review", intensity: "Easy", eta: "7 min" },
    ],
  },
  communication: {
    label: "Strategic Communication",
    focus: "Deliver concise, clear messages across audiences and contexts.",
    stats: {
      avgScore: 81,
      completion: 71,
      confidence: 77,
      cohortRank: "Top 24%",
    },
    weekly: [
      { week: "W1", score: 60, benchmark: 58 },
      { week: "W2", score: 66, benchmark: 60 },
      { week: "W3", score: 70, benchmark: 62 },
      { week: "W4", score: 75, benchmark: 64 },
      { week: "W5", score: 79, benchmark: 67 },
      { week: "W6", score: 81, benchmark: 69 },
    ],
    skills: [
      { skill: "Clarity", value: 88 },
      { skill: "Logic", value: 76 },
      { skill: "Empathy", value: 81 },
      { skill: "Composure", value: 74 },
      { skill: "Ownership", value: 79 },
    ],
    simulations: [
      { title: "Executive Update Drill", intensity: "Medium", eta: "10 min" },
      { title: "Difficult Feedback Dialogue", intensity: "High", eta: "11 min" },
      { title: "Meeting Recap Precision", intensity: "Easy", eta: "6 min" },
    ],
  },
  crisis: {
    label: "Crisis Response",
    focus: "Respond quickly, protect trust, and stabilize outcomes under uncertainty.",
    stats: {
      avgScore: 79,
      completion: 69,
      confidence: 71,
      cohortRank: "Top 29%",
    },
    weekly: [
      { week: "W1", score: 57, benchmark: 55 },
      { week: "W2", score: 61, benchmark: 58 },
      { week: "W3", score: 67, benchmark: 61 },
      { week: "W4", score: 73, benchmark: 64 },
      { week: "W5", score: 77, benchmark: 66 },
      { week: "W6", score: 79, benchmark: 68 },
    ],
    skills: [
      { skill: "Clarity", value: 72 },
      { skill: "Logic", value: 79 },
      { skill: "Empathy", value: 76 },
      { skill: "Composure", value: 85 },
      { skill: "Ownership", value: 80 },
    ],
    simulations: [
      { title: "Incident Command Standup", intensity: "High", eta: "14 min" },
      { title: "Client Escalation Handling", intensity: "Medium", eta: "10 min" },
      { title: "Rapid Alignment Huddle", intensity: "Easy", eta: "8 min" },
    ],
  },
};

const weeklyChartConfig = {
  score: {
    label: "Your Score",
    color: "var(--color-primary)",
  },
  benchmark: {
    label: "Benchmark",
    color: "var(--color-secondary)",
  },
};

const skillChartConfig = {
  value: {
    label: "Skill Score",
    color: "var(--color-primary)",
  },
};

const simulationIntensityClass: Record<TrackModel["simulations"][number]["intensity"], string> = {
  Easy: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  Medium: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  High: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

export function Landing() {
  const navigate = useNavigate();
  const [activeTrack, setActiveTrack] = useState<TrackKey>("leadership");

  const model = useMemo(() => trackData[activeTrack], [activeTrack]);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -left-24 top-[-160px] h-[360px] w-[360px] rounded-full bg-secondary/25 blur-3xl" />
          <div className="absolute -right-16 top-[-120px] h-[320px] w-[320px] rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute bottom-[-180px] left-1/2 h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-16">
          <div className="space-y-6">
            <Badge variant="outline" className="w-fit bg-background/70 backdrop-blur">
              Aramco Performance Lab
            </Badge>

            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Train. Measure. Improve.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                A live simulation hub that turns real workplace moments into measurable leadership
                gains.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate("/simulation")} className="gap-2">
                Launch Simulation <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/results")}>
                Explore Results
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-primary/20 bg-background/80 backdrop-blur">
                <CardContent className="pt-5">
                  <p className="text-xs text-muted-foreground">Active Learners</p>
                  <p className="mt-1 text-2xl font-extrabold">2,340</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-background/80 backdrop-blur">
                <CardContent className="pt-5">
                  <p className="text-xs text-muted-foreground">Weekly Sessions</p>
                  <p className="mt-1 text-2xl font-extrabold">8,120</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-background/80 backdrop-blur">
                <CardContent className="pt-5">
                  <p className="text-xs text-muted-foreground">Average Lift</p>
                  <p className="mt-1 text-2xl font-extrabold">+23%</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border-primary/20 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                Featured Visual
              </CardTitle>
              <CardDescription>Aramco identity, optimized for training interface.</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src="/aramco-logo-cropped.png"
                alt="Aramco visual"
                className="h-auto w-full rounded-xl border border-border object-cover"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Interactive Readiness Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Switch tracks to compare performance trends and simulation availability.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Data Refresh: Live Snapshot
          </div>
        </div>

        <Tabs value={activeTrack} onValueChange={(v) => setActiveTrack(v as TrackKey)}>
          <TabsList className="w-full justify-start overflow-x-auto" variant="line">
            <TabsTrigger value="leadership">Leadership</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="crisis">Crisis</TabsTrigger>
          </TabsList>

          <TabsContent value="leadership" className="space-y-6" />
          <TabsContent value="communication" className="space-y-6" />
          <TabsContent value="crisis" className="space-y-6" />
        </Tabs>

        <Card className="border-primary/20">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">{model.label}</CardTitle>
            <CardDescription>{model.focus}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Average Score" value={`${model.stats.avgScore}%`} icon={TrendingUp} />
              <MetricCard label="Track Completion" value={`${model.stats.completion}%`} icon={Target} />
              <MetricCard label="Confidence" value={`${model.stats.confidence}%`} icon={ShieldCheck} />
              <MetricCard label="Cohort Rank" value={model.stats.cohortRank} icon={Users} />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Progress vs Benchmark</CardTitle>
              <CardDescription>Weekly progression in your selected track.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={weeklyChartConfig} className="h-[260px] w-full">
                <AreaChart data={model.weekly}>
                  <defs>
                    <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-score)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-score)" stopOpacity={0.06} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-score)"
                    fill="url(#scoreFill)"
                    strokeWidth={2.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="benchmark"
                    stroke="var(--color-benchmark)"
                    fill="transparent"
                    strokeWidth={2}
                    strokeDasharray="8 5"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skill Radar</CardTitle>
              <CardDescription>Strength profile for targeted coaching.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={skillChartConfig} className="h-[260px] w-full">
                <RadarChart data={model.skills} outerRadius="72%">
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                  <Radar
                    name="Skill Score"
                    dataKey="value"
                    stroke="var(--color-value)"
                    fill="var(--color-value)"
                    fillOpacity={0.35}
                    strokeWidth={2}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Live Simulation Queue</CardTitle>
              <CardDescription>Pick a scenario and continue immediately.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {model.simulations.map((sim) => (
                <button
                  key={sim.title}
                  onClick={() => navigate("/simulation")}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left transition-all hover:border-primary/40 hover:bg-muted"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{sim.title}</p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      Estimated duration: {sim.eta}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${simulationIntensityClass[sim.intensity]}`}
                  >
                    {sim.intensity}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Momentum</CardTitle>
              <CardDescription>Completion trend by category.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  completion: {
                    label: "Completion",
                    color: "var(--color-secondary)",
                  },
                }}
                className="h-[300px] w-full"
              >
                <BarChart
                  data={[
                    { category: "Conflict", completion: 65 },
                    { category: "Leadership", completion: 78 },
                    { category: "Crisis", completion: 69 },
                    { category: "Communication", completion: 74 },
                  ]}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="completion" fill="var(--color-completion)" radius={[8, 8, 2, 2]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 text-2xl font-extrabold">{value}</p>
    </div>
  );
}
