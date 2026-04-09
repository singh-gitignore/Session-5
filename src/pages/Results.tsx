import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EvaluationResponse, Scenario } from "@/lib/supabase";
import {
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
  CircleCheck,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

const difficultyColors = {
  easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

const radarConfig = {
  score: { label: "Score", color: "var(--color-primary)" },
};

const barConfig = {
  score: { label: "Score", color: "var(--color-secondary)" },
};

type StoredEvaluation = {
  scenario: Scenario;
  response: string;
  evaluation: EvaluationResponse;
};

export function Results() {
  const navigate = useNavigate();

  const stored = sessionStorage.getItem("lastEvaluation");
  const evaluationData = stored ? (JSON.parse(stored) as StoredEvaluation) : null;
  const scenario = evaluationData?.scenario;
  const evaluation = evaluationData?.evaluation;
  const userResponse = evaluationData?.response || "";

  if (!scenario || !evaluation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#84BD00]/15 via-background to-[#00A3E0]/15 px-4 py-8">
        <div className="mx-auto max-w-2xl space-y-4">
          <Alert variant="destructive">
            <AlertDescription>No evaluation data found. Please complete a simulation first.</AlertDescription>
          </Alert>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const chartData = [
    { dimension: "Clarity", score: evaluation.scores.clarity },
    { dimension: "Logic", score: evaluation.scores.logic },
    { dimension: "EI", score: evaluation.scores.emotional_intelligence },
    { dimension: "Communication", score: evaluation.scores.communication },
    { dimension: "Decision", score: evaluation.scores.decision_quality },
  ];

  const overallPercentage = Math.round((evaluation.scores.overall / 10) * 100);

  const topDimension = useMemo(() => {
    return [...chartData].sort((a, b) => b.score - a.score)[0];
  }, [chartData]);

  const bottomDimension = useMemo(() => {
    return [...chartData].sort((a, b) => a.score - b.score)[0];
  }, [chartData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#84BD00]/15 via-background to-[#00A3E0]/15">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border-primary/25 bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="pt-6">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-3">
                <Badge variant="outline" className="w-fit bg-background/70">Evaluation Complete</Badge>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Performance Command Center</h1>
                <p className="text-sm text-muted-foreground">
                  Scenario: {scenario.title}
                </p>
                <div className="flex items-center gap-3">
                  <Badge className={difficultyColors[scenario.difficulty]}>{scenario.difficulty.toUpperCase()}</Badge>
                  <Badge variant="secondary">{evaluation.adaptation.next_difficulty.toUpperCase()} next</Badge>
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 bg-background/80 p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Overall Score</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-5xl font-black text-primary">{evaluation.scores.overall}</span>
                  <span className="pb-2 text-lg text-muted-foreground">/10</span>
                </div>
                <Progress value={overallPercentage} className="mt-3 h-3" />
                <p className="mt-2 text-sm text-muted-foreground">Readiness {overallPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Top Strength" value={topDimension.dimension} helper={`${topDimension.score}/10`} icon={<CircleCheck className="h-4 w-4" />} />
          <MetricCard label="Focus Area" value={bottomDimension.dimension} helper={`${bottomDimension.score}/10`} icon={<Target className="h-4 w-4" />} />
          <MetricCard label="Key Improvement" value={evaluation.comparison.key_improvement_area} helper="Priority" icon={<TrendingUp className="h-4 w-4" />} />
          <MetricCard label="Next Challenge" value={evaluation.adaptation.next_difficulty} helper="Adaptive" icon={<Sparkles className="h-4 w-4" />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Skill Radar</CardTitle>
              <CardDescription>How your response scored across key dimensions.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={radarConfig} className="h-[280px] w-full">
                <RadarChart data={chartData} outerRadius="72%">
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
                  <Radar
                    dataKey="score"
                    stroke="var(--color-score)"
                    fill="var(--color-score)"
                    fillOpacity={0.35}
                    strokeWidth={2}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dimension Scores</CardTitle>
              <CardDescription>Bar view for quick comparison.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={barConfig} className="h-[280px] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="dimension" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="score" fill="var(--color-score)" radius={[8, 8, 2, 2]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Interactive Feedback</CardTitle>
            <CardDescription>Switch between Reflect, Refine, and Coaching insights.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="reflect">
              <TabsList variant="line" className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="reflect">Reflect</TabsTrigger>
                <TabsTrigger value="refine">Refine</TabsTrigger>
                <TabsTrigger value="coach">Coach</TabsTrigger>
              </TabsList>

              <TabsContent value="reflect" className="space-y-4 pt-3">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="border-border/70 bg-muted/30">
                    <CardHeader>
                      <CardTitle className="text-base">Core Issue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{evaluation.reflect.core_issue}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-muted/30">
                    <CardHeader>
                      <CardTitle className="text-base">Detailed Lens</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{evaluation.reflect.detailed_feedback}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="refine" className="space-y-4 pt-3">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="border-emerald-300/60 bg-emerald-500/5 dark:border-emerald-800 dark:bg-emerald-950/20">
                    <CardHeader>
                      <CardTitle className="text-base">Your Response</CardTitle>
                      <CardDescription>Original draft snapshot</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="max-h-56 overflow-auto text-sm leading-relaxed">{userResponse || "No stored response."}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-primary/30 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-base">AI Refined Version</CardTitle>
                      <CardDescription>Strategy: {evaluation.refine.strategy_used}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="max-h-56 overflow-auto text-sm leading-relaxed whitespace-pre-wrap">
                        {evaluation.refine.improved_response}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="coach" className="space-y-4 pt-3">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="bg-muted/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        Action Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {evaluation.coaching.tips.map((tip, index) => (
                          <div key={tip} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
                            <span className="mr-2 font-semibold text-primary">{index + 1}.</span>
                            {tip}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/30">
                    <CardHeader>
                      <CardTitle className="text-base">Recommended Framework</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="rounded-lg border border-border bg-card p-3 text-sm leading-relaxed">
                        {evaluation.coaching.framework_suggestion}
                      </p>
                      <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                        <p className="font-medium">Expected Change</p>
                        <p className="mt-1 text-muted-foreground">{evaluation.comparison.expected_change}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-r from-card to-primary/5">
          <CardContent className="pt-6">
            <p className="text-base italic">"{evaluation.next_action}"</p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3 pb-2">
          <Button onClick={() => navigate("/simulation")} size="lg" className="flex-1 min-w-44">
            <ArrowRight className="mr-2 h-4 w-4" />
            Next Scenario
          </Button>
          <Button variant="outline" size="lg" className="flex-1 min-w-44" onClick={() => navigate("/")}>
            Back to Home
          </Button>
          <Button variant="secondary" size="lg" className="flex-1 min-w-44" onClick={() => navigate("/simulation")}>
            Try Better Score
          </Button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="text-lg font-bold capitalize leading-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{helper}</p>
          </div>
          <div className="text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
