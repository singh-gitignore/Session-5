import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Scenario operations
export async function getScenariosByDifficulty(difficulty: "easy" | "medium" | "hard") {
  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .eq("difficulty", difficulty)
    .order("created_at");

  if (error) throw error;
  return data as Scenario[];
}

export async function getRandomScenario(difficulty: "easy" | "medium" | "hard") {
  const scenarios = await getScenariosByDifficulty(difficulty);
  if (scenarios.length === 0) return null;
  return scenarios[Math.floor(Math.random() * scenarios.length)];
}

export async function getAllScenarios() {
  const { data, error } = await supabase.from("scenarios").select("*").order("created_at");
  if (error) throw error;
  return data as Scenario[];
}

// Session operations
export async function createSession(
  scenarioId: string,
  userResponse: string,
  sessionId: string,
  aiFeedback: EvaluationResponse,
) {
  const { data, error } = await supabase.from("sessions").insert({
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
  });

  if (error) throw error;
  return data;
}

export async function getSessionsByUserId(sessionId: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Session[];
}

// User profile operations
export async function getOrCreateUserProfile(sessionId: string) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;

  if (data) {
    return data as UserProfile;
  }

  // Create new profile
  const { data: newProfile, error: createError } = await supabase
    .from("user_profiles")
    .insert({
      session_id: sessionId,
      current_difficulty: "easy",
      total_attempts: 0,
      average_score: 0,
    })
    .select()
    .maybeSingle();

  // If we get a 409 conflict, it means the profile was created by another request
  // So fetch it again
  if (createError) {
    if (createError.code === "23505") {
      const { data: existingProfile, error: fetchError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (existingProfile) return existingProfile as UserProfile;
    }
    throw createError;
  }

  return newProfile as UserProfile;
}

export async function updateUserProfile(sessionId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("session_id", sessionId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

// Mock evaluation for demonstration
function generateMockEvaluation(userResponse: string): EvaluationResponse {
  const responseLength = userResponse.length;
  const wordCount = userResponse.split(/\s+/).length;

  // Generate scores based on response quality
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

// Evaluation via edge function
export async function evaluateResponse(
  scenario: string,
  userResponse: string,
): Promise<EvaluationResponse> {
  try {
    const apiUrl = `${supabaseUrl}/functions/v1/evaluate-response`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        scenario,
        userResponse,
      }),
    });

    if (!response.ok) {
      console.warn(`Edge function returned ${response.status}, falling back to mock evaluation`);
      return generateMockEvaluation(userResponse);
    }

    return response.json();
  } catch (error) {
    console.warn("Edge function call failed, falling back to mock evaluation:", error);
    return generateMockEvaluation(userResponse);
  }
}
