export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: "workplace_conflict" | "leadership" | "crisis_management" | "communication";
  difficulty: "easy" | "medium" | "hard";
  created_at: string;
}

export interface Session {
  id: string;
  scenario_id: string;
  user_response: string;
  ai_feedback: EvaluationResponse | null;
  clarity_score: number | null;
  logic_score: number | null;
  emotional_intelligence_score: number | null;
  communication_score: number | null;
  decision_quality_score: number | null;
  overall_score: number | null;
  next_difficulty: "easy" | "medium" | "hard" | null;
  session_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  session_id: string;
  current_difficulty: "easy" | "medium" | "hard";
  total_attempts: number;
  average_score: number;
  created_at: string;
  updated_at: string;
}

export interface EvaluationResponse {
  scores: {
    clarity: number;
    logic: number;
    emotional_intelligence: number;
    communication: number;
    decision_quality: number;
    overall: number;
  };
  reflect: {
    core_issue: string;
    detailed_feedback: string;
  };
  refine: {
    improved_response: string;
    strategy_used: string;
  };
  coaching: {
    tips: string[];
    framework_suggestion: string;
  };
  adaptation: {
    next_difficulty: "easy" | "medium" | "hard";
    reason: string;
  };
  comparison: {
    key_improvement_area: string;
    expected_change: string;
  };
  next_action: string;
}

const SESSIONS_KEY = "ai_coach_sessions";
const PROFILES_KEY = "ai_coach_profiles";

const seededScenarios: Scenario[] = [
  {
    id: "scenario-001",
    title: "Disagreement with Colleague",
    description:
      "Your colleague frequently dismisses your ideas in team meetings without listening. Today, they interrupted you again and said your suggestion was \"the same thing we tried before.\" You're frustrated and want to address this behavior.",
    category: "workplace_conflict",
    difficulty: "easy",
    created_at: "2026-04-09T07:29:39.000Z",
  },
  {
    id: "scenario-002",
    title: "Conflict with Remote Team Member",
    description:
      "A remote team member has stopped responding to messages and missed two deadlines without explanation. The rest of the team is frustrated. You need to address this professionally without jumping to conclusions about what's happening.",
    category: "workplace_conflict",
    difficulty: "medium",
    created_at: "2026-04-09T07:30:39.000Z",
  },
  {
    id: "scenario-003",
    title: "Managing Underperformance During Restructuring",
    description:
      "Your direct report's performance has declined significantly since the company restructuring. They're avoiding feedback and seem withdrawn. You discover through casual conversation they're worried about job security. You need to support them while maintaining team standards.",
    category: "workplace_conflict",
    difficulty: "hard",
    created_at: "2026-04-09T07:31:39.000Z",
  },
  {
    id: "scenario-004",
    title: "First Time Delegation Challenge",
    description:
      "You've been promoted to team lead and need to delegate a critical project for the first time. Your team has mixed experience levels. You're worried about overloading your junior team member, but you also want to develop them. How do you approach this?",
    category: "leadership",
    difficulty: "easy",
    created_at: "2026-04-09T07:32:39.000Z",
  },
  {
    id: "scenario-005",
    title: "Balancing Team Morale with Business Urgency",
    description:
      "Your team is exhausted from back-to-back projects. A major client just submitted an urgent request that requires weekend work. You need to deliver, but you're concerned about burnout. How do you communicate this to your team?",
    category: "leadership",
    difficulty: "medium",
    created_at: "2026-04-09T07:33:39.000Z",
  },
  {
    id: "scenario-006",
    title: "Difficult Feedback to Influential Employee",
    description:
      "Your most productive employee is behaving in ways that undermine team cohesion-they're dismissive of others' contributions and create an intimidating presence in meetings. Senior leadership values their output but the culture is suffering. How do you approach this?",
    category: "leadership",
    difficulty: "hard",
    created_at: "2026-04-09T07:34:39.000Z",
  },
  {
    id: "scenario-007",
    title: "System Outage Communication",
    description:
      "Your application went down unexpectedly for 2 hours. Customers are complaining and stakeholders are asking for explanations. It's now back up, but you need to communicate clearly about what happened and next steps.",
    category: "crisis_management",
    difficulty: "easy",
    created_at: "2026-04-09T07:35:39.000Z",
  },
  {
    id: "scenario-008",
    title: "Budget Cut Mid-Project",
    description:
      "Your executive sponsor just informed you that project budget will be cut by 30% due to company-wide cost-cutting. The project timeline remains the same. You must communicate this to your team and deliver a revised plan within 24 hours.",
    category: "crisis_management",
    difficulty: "medium",
    created_at: "2026-04-09T07:36:39.000Z",
  },
  {
    id: "scenario-009",
    title: "Public Customer Complaint and Team Blame",
    description:
      "A major customer publicly posted a complaint on social media about your product. Initial investigation shows it was a user error, but your team made the setup process confusing. The post is getting shared. You need to respond publicly while internally addressing team accountability.",
    category: "crisis_management",
    difficulty: "hard",
    created_at: "2026-04-09T07:37:39.000Z",
  },
  {
    id: "scenario-010",
    title: "Explaining Technical Concepts to Non-Technical Stakeholders",
    description:
      "You need to present a technical architecture decision to senior leaders who don't have engineering backgrounds. They're skeptical about the approach. You have 15 minutes to convince them it's the right choice.",
    category: "communication",
    difficulty: "easy",
    created_at: "2026-04-09T07:38:39.000Z",
  },
  {
    id: "scenario-011",
    title: "Delivering Bad News to Disappointed Team",
    description:
      "The big project your team worked on for 3 months just got canceled due to business priorities. The team was excited about it and spent considerable effort. You need to break this news and help them understand the reasoning.",
    category: "communication",
    difficulty: "medium",
    created_at: "2026-04-09T07:39:39.000Z",
  },
  {
    id: "scenario-012",
    title: "Navigating Cross-Cultural Misunderstanding",
    description:
      "You made a comment in a global meeting that was unintentionally offensive to a team member from a different cultural background. They've gone quiet and others noticed the tension. You need to address this genuinely and move forward without making it awkward.",
    category: "communication",
    difficulty: "hard",
    created_at: "2026-04-09T07:40:39.000Z",
  },
];

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function getProfilesStore(): Record<string, UserProfile> {
  return readJson<Record<string, UserProfile>>(PROFILES_KEY, {});
}

function getSessionsStore(): Session[] {
  return readJson<Session[]>(SESSIONS_KEY, []);
}

export async function getScenariosByDifficulty(difficulty: "easy" | "medium" | "hard") {
  const scenarios = seededScenarios
    .filter((item) => item.difficulty === difficulty)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  return scenarios;
}

export async function getRandomScenario(difficulty: "easy" | "medium" | "hard") {
  const scenarios = await getScenariosByDifficulty(difficulty);
  if (scenarios.length === 0) return null;
  return scenarios[Math.floor(Math.random() * scenarios.length)];
}

export async function getAllScenarios() {
  return [...seededScenarios].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function createSession(
  scenarioId: string,
  userResponse: string,
  sessionId: string,
  aiFeedback: EvaluationResponse,
) {
  const sessions = getSessionsStore();
  const created: Session = {
    id: createId("attempt"),
    scenario_id: scenarioId,
    user_response: userResponse,
    ai_feedback: aiFeedback,
    clarity_score: aiFeedback.scores.clarity,
    logic_score: aiFeedback.scores.logic,
    emotional_intelligence_score: aiFeedback.scores.emotional_intelligence,
    communication_score: aiFeedback.scores.communication,
    decision_quality_score: aiFeedback.scores.decision_quality,
    overall_score: aiFeedback.scores.overall,
    next_difficulty: aiFeedback.adaptation.next_difficulty,
    session_id: sessionId,
    created_at: nowIso(),
  };

  sessions.push(created);
  writeJson(SESSIONS_KEY, sessions);
  return created;
}

export async function getSessionsByUserId(sessionId: string) {
  const sessions = getSessionsStore()
    .filter((item) => item.session_id === sessionId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return sessions;
}

export async function getOrCreateUserProfile(sessionId: string) {
  const profiles = getProfilesStore();
  const existing = profiles[sessionId];
  if (existing) {
    return existing;
  }

  const created: UserProfile = {
    id: createId("profile"),
    session_id: sessionId,
    current_difficulty: "easy",
    total_attempts: 0,
    average_score: 0,
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  profiles[sessionId] = created;
  writeJson(PROFILES_KEY, profiles);
  return created;
}

export async function updateUserProfile(sessionId: string, updates: Partial<UserProfile>) {
  const profiles = getProfilesStore();
  const current = profiles[sessionId] ?? (await getOrCreateUserProfile(sessionId));
  const updated: UserProfile = {
    ...current,
    ...updates,
    session_id: sessionId,
    updated_at: nowIso(),
  };
  profiles[sessionId] = updated;
  writeJson(PROFILES_KEY, profiles);
  return updated;
}

function generateMockEvaluation(userResponse: string): EvaluationResponse {
  const responseLength = userResponse.length;
  const wordCount = userResponse.split(/\s+/).filter(Boolean).length;

  const clarity = Math.min(10, 3 + Math.floor(responseLength / 100));
  const logic = Math.min(10, 3 + Math.floor(wordCount / 15));
  const emotional_intelligence = Math.min(10, 2 + Math.floor(wordCount / 20));
  const communication = Math.min(10, 4 + Math.floor(responseLength / 80));
  const decision_quality = Math.min(10, 3 + Math.floor(wordCount / 18));
  const overall = Math.round(
    (clarity + logic + emotional_intelligence + communication + decision_quality) / 5,
  );

  return {
    scores: {
      clarity,
      logic,
      emotional_intelligence,
      communication,
      decision_quality,
      overall,
    },
    reflect: {
      core_issue:
        wordCount < 20
          ? "Response is too brief to provide meaningful feedback"
          : "Consider adding more specific examples and stakeholder perspectives",
      detailed_feedback:
        "Your response shows " +
        (wordCount > 50 ? "good depth and " : "limited ") +
        "consideration of the situation. " +
        (responseLength > 300
          ? "The length demonstrates thorough thinking. "
          : "Consider expanding your response with more details. ") +
        "Focus on clarity and actionable next steps.",
    },
    refine: {
      improved_response:
        "I would begin by gathering information from all stakeholders to understand their concerns and perspectives. " +
        "Then, I would develop a structured action plan that addresses immediate needs while considering long-term implications. " +
        "Finally, I would communicate transparently, seek feedback, and adjust my approach based on the team's input.",
      strategy_used: "Collaborative problem-solving with stakeholder engagement",
    },
    coaching: {
      tips: [
        "Always start with listening and understanding before proposing solutions",
        "Use specific examples and data to support your decisions",
        "Consider multiple perspectives and communicate trade-offs clearly",
      ],
      framework_suggestion:
        "Use the SITUATION-ANALYSIS-ACTION-COMMUNICATION (SAAC) framework: Describe the situation, analyze key factors, propose your action, and explain how you'll communicate it.",
    },
    adaptation: {
      next_difficulty: overall > 7 ? "hard" : overall > 4 ? "medium" : "easy",
      reason:
        overall > 7
          ? "You demonstrated excellent skills - time for a more challenging scenario"
          : overall > 4
            ? "Good progress - continue practicing with medium difficulty scenarios"
            : "Build foundational skills with easier scenarios before advancing",
    },
    comparison: {
      key_improvement_area:
        clarity < 5
          ? "Response clarity and structure"
          : emotional_intelligence < 5
            ? "Emotional intelligence and stakeholder awareness"
            : "Strategic decision-making and long-term thinking",
      expected_change:
        clarity < 5
          ? "Next attempt should have clearer, more organized structure"
          : emotional_intelligence < 5
            ? "Next attempt should show greater awareness of people's perspectives and concerns"
            : "Next attempt should demonstrate deeper strategic thinking",
    },
    next_action:
      "Excellent! You've completed your first evaluation. Review the feedback carefully, study the improved response, and use the coaching tips to refine your approach. Ready to try again? Each attempt helps you build these critical leadership skills.",
  };
}

export async function evaluateResponse(
  _scenario: string,
  userResponse: string,
): Promise<EvaluationResponse> {
  return generateMockEvaluation(userResponse);
}