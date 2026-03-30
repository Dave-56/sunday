import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@anthropic-ai/sdk/resources/messages/messages";
import { NextRequest, NextResponse } from "next/server";
import { getFallbackSuggestions, normalizeDishes } from "@/lib/dishes";
import { checkRateLimit } from "@/lib/rate-limit";

const client = new Anthropic({ maxRetries: 0 });
const SUGGEST_TOOL_NAME = "return_suggestions";
const MAX_RECENT_DISHES = 20;
const MAX_RECENT_DISH_NAME_LENGTH = 120;
const SUGGEST_RATE_LIMIT_PER_MINUTE = 12;
const SUGGESTION_TIMEOUT_MS = 8000;

const SUGGESTION_TOOL = {
  name: SUGGEST_TOOL_NAME,
  description:
    "Return exactly three meal suggestions with full recipe details in structured JSON.",
  input_schema: {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      dishes: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            cuisine: { type: "string" },
            why: { type: "string" },
            difficulty: { type: "string" },
            prepTime: { type: "string" },
            servings: { type: "string" },
            ingredients: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
            },
            steps: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
            },
          },
          required: [
            "name",
            "cuisine",
            "why",
            "difficulty",
            "prepTime",
            "servings",
            "ingredients",
            "steps",
          ],
        },
      },
    },
    required: ["dishes"],
  },
};

function sanitizeRecentDishes(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter((dish): dish is string => typeof dish === "string")
    .map((dish) => dish.trim())
    .filter((dish) => dish.length > 0)
    .map((dish) => dish.slice(0, MAX_RECENT_DISH_NAME_LENGTH))
    .slice(0, MAX_RECENT_DISHES);
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function getToolDishesInput(message: Message): unknown {
  for (const block of message.content) {
    if (block.type === "tool_use" && block.name === SUGGEST_TOOL_NAME) {
      if (typeof block.input !== "object" || block.input === null) {
        return null;
      }

      return (block.input as { dishes?: unknown }).dishes;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  let recentDishes: string[] = [];
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `suggest:${clientIp}`,
    limit: SUGGEST_RATE_LIMIT_PER_MINUTE,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  try {
    const body = (await request.json()) as { recentDishes?: unknown };
    recentDishes = sanitizeRecentDishes(body.recentDishes);

    const avoidList =
      recentDishes.length > 0
        ? `\n\nIMPORTANT: Do NOT suggest any of these recently cooked dishes (or close variants): ${recentDishes.join(", ")}`
        : "";

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2200,
      stream: false,
      tool_choice: { type: "tool", name: SUGGEST_TOOL_NAME },
      tools: [SUGGESTION_TOOL],
      messages: [
        {
          role: "user",
          content: `You are a meal planning assistant for a couple (2 people) who batch-cook every Sunday for the week ahead (5–6 days of dinners).

DIETARY CONSTRAINTS (strict):
- No dairy whatsoever (lactose intolerant). No milk, cheese, butter, cream, yogurt, ghee.
- No fish unless it is grilled. Prawns, crab, shrimp, and other shellfish are fine in any preparation.
- All dishes must reheat well — batch-cookable. Cook once on Sunday, portion and refrigerate, reheat throughout the week.

CUISINE PREFERENCES (in priority order):
1. Nigerian / West African dishes first
2. Then Asian (Chinese, Thai, Japanese, Korean, Indian — dairy-free)
3. Then anything else that's delicious

SKILL & TIME:
- Easy to intermediate difficulty
- Total Sunday cook time: 2–3 hours
- Portions: enough for 2 people × 5–6 dinners (10–12 servings total)

${avoidList}

Return exactly 3 different dinner options using the provided tool schema.
For each dish:
- Keep instructions practical for weeknight reheating.
- Ingredients must be scaled for 10–12 servings.
	- Steps MUST be practical and clear for someone who has never cooked this dish before. Each step MUST include:
	  * The exact quantities being used in that step (e.g. "Add the 4 tbsp tomato paste" not just "add tomato paste")
	  * Specific heat levels and temperatures (e.g. "medium-high heat, about 200°C/400°F")
	  * Precise timing (e.g. "cook for 8–10 minutes" not "cook until done")
	  * Visual and sensory cues so the cook knows it's working (e.g. "until the onions are translucent and soft", "the oil should float on top of the sauce", "it will sizzle vigorously")
	  * Reheating instructions in the final step (microwave time/power, or stovetop method)
	- Aim for 6–8 clear steps per recipe. Never write vague one-line steps.`,
        },
      ],
    }, { timeout: SUGGESTION_TIMEOUT_MS });

    const dishes = normalizeDishes(getToolDishesInput(message));
    if (dishes.length === 3) {
      return NextResponse.json(dishes);
    }

    console.warn(
      "Structured model response incomplete; serving local fallback suggestions."
    );
    return NextResponse.json(getFallbackSuggestions(recentDishes), {
      status: 200,
      headers: { "x-suggestions-source": "fallback-incomplete-response" },
    });
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : undefined;

    const message =
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string"
        ? (error as { message: string }).message
        : "";

    if (
      status === 400 &&
      message.toLowerCase().includes("credit balance is too low")
    ) {
      return NextResponse.json(
        {
          error:
            "Anthropic credits are exhausted. Add credits in Anthropic Plans & Billing, then try again.",
        },
        { status: 402 }
      );
    }

    console.error("Suggestion generation failed; serving local fallback.", error);
    return NextResponse.json(getFallbackSuggestions(recentDishes), {
      status: 200,
      headers: { "x-suggestions-source": "fallback-error" },
    });
  }
}
