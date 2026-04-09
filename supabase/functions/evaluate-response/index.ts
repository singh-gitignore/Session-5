import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Polyfill Deno namespace for IDE TypeScript in standard web project
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EvaluationRequest {
  scenario: string;
  userResponse: string;
}

interface EvaluationResponse {
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

const systemPrompt = `You are an elite AI Simulation Coach powering a scenario-based training game for corporate skill development.

Your purpose is to evaluate user responses and drive measurable improvement using a structured learning loop based on:

3R Framework:
1. Reflect → Diagnose gaps in thinking, communication, and decision-making
2. Refine → Provide a significantly improved version of the response
3. Respond → Encourage iteration and skill improvement

EVALUATION DIMENSIONS (Score each from 0–10):
1. Clarity → Is the response clear and understandable?
2. Logic → Is the reasoning structured and sensible?
3. Emotional Intelligence → Does it consider people, tone, empathy?
4. Communication → Is it professional and well-articulated?
5. Decision Quality → Is the decision effective and appropriate?

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "scores": {
    "clarity": number,
    "logic": number,
    "emotional_intelligence": number,
    "communication": number,
    "decision_quality": number,
    "overall": number
  },
  "reflect": {
    "core_issue": "Main weakness in response",
    "detailed_feedback": "Deeper explanation of what is missing or ineffective"
  },
  "refine": {
    "improved_response": "A significantly improved, professional, structured answer",
    "strategy_used": "Explain what strategy was applied"
  },
  "coaching": {
    "tips": ["tip 1", "tip 2", "tip 3"],
    "framework_suggestion": "Suggest a thinking framework"
  },
  "adaptation": {
    "next_difficulty": "easy | medium | hard",
    "reason": "Why difficulty should increase/decrease"
  },
  "comparison": {
    "key_improvement_area": "Biggest area user must improve",
    "expected_change": "What improvement should look like"
  },
  "next_action": "A motivating instruction encouraging retry with improvement"
}

STRICT RULES:
* Return ONLY valid JSON (no extra text)
* Be precise, not generic
* Avoid unnecessary praise
* Focus on actionable improvement
* Refined response must be clearly superior
* Maintain professional tone

ADAPTIVE INTELLIGENCE:
* If overall score < 5: Provide simpler guidance and structured steps
* If overall score between 5–8: Provide targeted improvements
* If overall score > 8: Suggest advanced strategies and edge-case thinking`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { scenario, userResponse }: EvaluationRequest = await req.json();

    if (!scenario || !userResponse) {
      return new Response(JSON.stringify({ error: "Missing scenario or userResponse" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userMessage = `Scenario:
${scenario}

User Response:
${userResponse}

Evaluate this response using the 3R Framework and return ONLY valid JSON.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 3000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Claude API error:", response.status, response.statusText);
      return new Response(JSON.stringify({ error: "Failed to evaluate response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let responseText = data.content[0].text;

    // Extract JSON from response if it contains markdown code blocks
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      responseText = jsonMatch[1];
    }

    let evaluation: EvaluationResponse;
    try {
      evaluation = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse Claude response as JSON:", responseText);
      return new Response(
        JSON.stringify({
          error: "Invalid response format from AI",
          raw: responseText,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate required fields
    if (
      !evaluation.scores ||
      !evaluation.reflect ||
      !evaluation.refine ||
      !evaluation.coaching ||
      !evaluation.adaptation ||
      !evaluation.comparison ||
      !evaluation.next_action
    ) {
      console.error("Incomplete evaluation structure:", evaluation);
      return new Response(JSON.stringify({ error: "Incomplete evaluation structure" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(evaluation), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
