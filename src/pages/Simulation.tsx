import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/contexts/SessionContext";
import {
  createSession,
  evaluateResponse,
  getAllScenarios,
  getRandomScenario,
  type Scenario,
} from "@/lib/frontend-data";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
} from "recharts";
import {
  ArrowLeft,
  Briefcase,
  CircleCheck as CheckCircle,
  Clock3,
  Gauge,
  MessageSquare,
  Sparkles,
  Triangle,
  TriangleAlert as AlertTriangle,
  Users,
} from "lucide-react";

const difficultyColors = {
  easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

const categoryMeta = {
  workplace_conflict: { icon: Users, label: "Workplace Conflict" },
  leadership: { icon: Briefcase, label: "Leadership" },
  crisis_management: { icon: Triangle, label: "Crisis Management" },
  communication: { icon: MessageSquare, label: "Communication" },
};

const starterPrompts = [
  "I will first acknowledge stakeholder concerns and clarify the immediate objective.",
  "My next step is to map options, risks, and expected impact before deciding.",
  "I will communicate a clear action plan, owners, and timeline for follow-through.",
];

const qualityConfig = {
  score: { label: "Readiness", color: "var(--color-primary)" },
};

type RecommendedScenarioHint = {
  category: Scenario["category"];
  difficulty: Scenario["difficulty"];
  reason?: string;
};

export function Simulation() {
  const navigate = useNavigate();
  const { sessionId, userProfile } = useSession();

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState("");
  const [recommendedReason, setRecommendedReason] = useState("");

  useEffect(() => {
    const loadScenario = async () => {
      try {
        const difficulty = userProfile?.current_difficulty || "easy";
        let loaded: Scenario | null = null;

        const recommendationRaw = sessionStorage.getItem("recommendedScenarioHint");
        if (recommendationRaw) {
          try {
            const recommendation = JSON.parse(recommendationRaw) as RecommendedScenarioHint;
            const allScenarios = await getAllScenarios();
            const strictMatches = allScenarios.filter(
              (item) =>
                item.category === recommendation.category && item.difficulty === recommendation.difficulty,
            );
            const categoryMatches = allScenarios.filter(
              (item) => item.category === recommendation.category,
            );

            const pool = strictMatches.length > 0 ? strictMatches : categoryMatches;
            if (pool.length > 0) {
              loaded = pool[Math.floor(Math.random() * pool.length)];
              if (recommendation.reason) {
                setRecommendedReason(recommendation.reason);
              }
            }
          } catch {
            // Ignore invalid recommendation payload and fall back to random scenario.
          } finally {
            sessionStorage.removeItem("recommendedScenarioHint");
          }
        }

        if (!loaded) {
          loaded = await getRandomScenario(difficulty);
          setRecommendedReason("");
        }

        if (!loaded) {
          setError("No scenarios available");
          return;
        }
        setScenario(loaded);
      } catch (err) {
        console.error("Failed to load scenario:", err);
        setError("Failed to load scenario");
      } finally {
        setIsLoading(false);
      }
    };

    if (userProfile) {
      loadScenario();
    }
  }, [userProfile]);

  const handleSubmit = async () => {
    if (!response.trim() || !scenario) return;

    setIsEvaluating(true);
    setError("");

    try {
      const evaluation = await evaluateResponse(scenario.description, response);
      await createSession(scenario.id, response, sessionId, evaluation);

      sessionStorage.setItem(
        "lastEvaluation",
        JSON.stringify({
          scenario,
          response,
          evaluation,
        }),
      );

      navigate("/results");
    } catch (err) {
      console.error("Failed to evaluate:", err);
      setError(err instanceof Error ? err.message : "Failed to evaluate response");
      setIsEvaluating(false);
    }
  };

  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;
  const sentenceCount = response
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean).length;
  const charCount = response.length;

  const targetWords = scenario?.difficulty === "hard" ? 170 : scenario?.difficulty === "medium" ? 130 : 90;

  const readiness = useMemo(() => {
    const wordsScore = Math.min(45, (wordCount / targetWords) * 45);
    const structureScore = Math.min(30, (sentenceCount / 5) * 30);
    const rationaleScore = response.toLowerCase().includes("because") ? 15 : 0;
    const actionScore = /(next|plan|timeline|owner|follow-up)/i.test(response) ? 10 : 0;

    return Math.max(0, Math.min(100, Math.round(wordsScore + structureScore + rationaleScore + actionScore)));
  }, [response, sentenceCount, targetWords, wordCount]);

  const readinessBars = [
    { metric: "Depth", score: Math.min(100, Math.round((wordCount / targetWords) * 100)) },
    { metric: "Structure", score: Math.min(100, sentenceCount * 20) },
    { metric: "Actionability", score: /(next|plan|timeline|owner|follow-up)/i.test(response) ? 82 : 35 },
  ];

  const confidenceSignals = useMemo(() => {
    const clarity = Math.min(100, Math.round((sentenceCount / 5) * 100));
    const ownership = /(i will|i can|i should|my plan|i propose)/i.test(response) ? 85 : 35;
    const empathy = /(stakeholder|team|client|concern|impact|support)/i.test(response) ? 82 : 30;
    const actionability = /(next|plan|timeline|owner|within|follow-up)/i.test(response) ? 88 : 35;

    return [
      { metric: "Clarity", score: clarity },
      { metric: "Ownership", score: ownership },
      { metric: "Empathy", score: empathy },
      { metric: "Action", score: actionability },
    ];
  }, [response, sentenceCount]);

  const confidenceMeter = useMemo(() => {
    const avgSignal =
      confidenceSignals.reduce((acc, item) => acc + item.score, 0) / confidenceSignals.length;
    return Math.round((avgSignal + readiness) / 2);
  }, [confidenceSignals, readiness]);

  const checklist = [
    { label: "Clear first action", done: /(first|immediate|start)/i.test(response) },
    { label: "Stakeholder awareness", done: /(stakeholder|team|manager|client|people)/i.test(response) },
    { label: "Decision rationale", done: /(because|therefore|so that|reason)/i.test(response) },
    { label: "Execution timeline", done: /(today|this week|timeline|within|next)/i.test(response) },
  ];

  const isResponseValid = response.trim().length >= 20;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#84BD00]/15 via-background to-[#00A3E0]/15 px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#84BD00]/15 via-background to-[#00A3E0]/15 px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || "Failed to load scenario"}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const category = categoryMeta[scenario.category];
  const CategoryIcon = category.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#84BD00]/15 via-background to-[#00A3E0]/15">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="bg-background/70">
                    Simulation Studio
                  </Badge>
                  <Badge className={difficultyColors[scenario.difficulty]}>{scenario.difficulty.toUpperCase()}</Badge>
                  {recommendedReason && <Badge variant="secondary">Recommended Path</Badge>}
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{scenario.title}</h1>
                <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <CategoryIcon className="h-4 w-4" />
                  <span>{category.label}</span>
                </p>
                {recommendedReason && <p className="text-xs text-muted-foreground">{recommendedReason}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <MiniStat label="Target Words" value={String(targetWords)} icon={<Gauge className="h-4 w-4" />} />
                <MiniStat label="Est. Time" value="8-12 min" icon={<Clock3 className="h-4 w-4" />} />
                <MiniStat label="Confidence" value={`${confidenceMeter}%`} icon={<Sparkles className="h-4 w-4" />} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Scenario Brief</CardTitle>
              <CardDescription>Respond as if this is live and time-sensitive.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{scenario.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Response Quality</CardTitle>
              <CardDescription>Your draft updates confidence and signal scores instantly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Live Confidence Meter</span>
                  <span className="font-semibold">{confidenceMeter}%</span>
                </div>
                <Progress value={confidenceMeter} className="h-2.5" />
              </div>

              <ChartContainer config={qualityConfig} className="h-[180px] w-full">
                <BarChart data={readinessBars}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="metric" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="score" fill="var(--color-score)" radius={[8, 8, 2, 2]} />
                </BarChart>
              </ChartContainer>

              <div className="grid gap-2">
                {confidenceSignals.map((signal) => (
                  <div key={signal.metric} className="rounded-lg border border-border bg-card px-3 py-2">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{signal.metric}</span>
                      <span>{signal.score}%</span>
                    </div>
                    <Progress value={signal.score} className="h-2" />
                  </div>
                ))}
              </div>

              <div className="grid gap-2">
                {checklist.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm">
                    <span>{item.label}</span>
                    <Badge variant={item.done ? "default" : "outline"}>{item.done ? "Done" : "Pending"}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Response Workspace</CardTitle>
            <CardDescription>Less friction, more iteration. Build and submit when ready.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="compose">
              <TabsList variant="line" className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="compose">Compose</TabsTrigger>
                <TabsTrigger value="assist">Quick Assist</TabsTrigger>
              </TabsList>
              <TabsContent value="compose" className="space-y-3">
                <Textarea
                  placeholder="Write your response. Focus on immediate action, stakeholder impact, and clear execution steps."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="min-h-72 resize-y"
                  disabled={isEvaluating}
                />
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{charCount} characters</Badge>
                  <Badge variant="outline">{wordCount} words</Badge>
                  <Badge variant="outline">{sentenceCount} sentences</Badge>
                </div>
              </TabsContent>

              <TabsContent value="assist" className="space-y-3">
                <p className="text-sm text-muted-foreground">Tap a prompt to insert a strong opening line.</p>
                <div className="grid gap-2">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setResponse((prev) => (prev ? `${prev}\n\n${prompt}` : prompt))}
                      className="rounded-lg border border-border bg-background px-3 py-3 text-left text-sm transition-colors hover:bg-muted"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {response.length > 0 && response.length < 20 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Write at least 20 characters for meaningful evaluation.</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-3 pt-1">
              <Button onClick={handleSubmit} disabled={!isResponseValid || isEvaluating} size="lg" className="flex-1 min-w-44">
                {isEvaluating ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit for Evaluation
                  </>
                )}
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/")} disabled={isEvaluating} className="min-w-36">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back Home
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setResponse("")} disabled={isEvaluating} className="min-w-32">
                Clear Draft
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/35">
          <CardHeader>
            <CardTitle className="text-base">Fast Scoring Rubric</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Lead with the most critical action",
                "Explain why the action is appropriate",
                "Show impact on people and business",
                "Finish with timeline and ownership",
              ].map((item) => (
                <div key={item} className="rounded-lg border border-border bg-card p-3 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
