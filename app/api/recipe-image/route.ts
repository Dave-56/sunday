import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const OPENAI_IMAGE_ENDPOINT = "https://api.openai.com/v1/images/generations";
const MAX_FIELD_LENGTH = 120;
const IMAGE_RATE_LIMIT_PER_MINUTE = 6;
const IMAGE_REQUEST_TIMEOUT_MS = 45_000;

// Allow enough runtime on Vercel for slower image generations.
export const maxDuration = 60;

function cleanInput(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_FIELD_LENGTH);
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `recipe-image:${clientIp}`,
    limit: IMAGE_RATE_LIMIT_PER_MINUTE,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many image requests. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 503 }
    );
  }

  let dishName = "";
  let cuisine = "";

  try {
    const body = (await request.json()) as {
      dishName?: unknown;
      cuisine?: unknown;
    };
    dishName = cleanInput(body.dishName);
    cuisine = cleanInput(body.cuisine);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!dishName) {
    return NextResponse.json(
      { error: "dishName is required." },
      { status: 400 }
    );
  }

  const prompt = `Create a realistic food photo of "${dishName}"${
    cuisine ? ` (${cuisine} cuisine)` : ""
  }. The dish should be plated and appetizing, with natural lighting and no text, logos, labels, or watermarks.`;

  try {
    const response = await fetch(OPENAI_IMAGE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024",
      }),
      signal: AbortSignal.timeout(IMAGE_REQUEST_TIMEOUT_MS),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          error?: { message?: string };
          data?: Array<{ b64_json?: string; url?: string }>;
        }
      | null;

    if (!response.ok) {
      const message =
        payload?.error?.message ||
        "Image generation failed. Please try again later.";
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const firstImage = Array.isArray(payload?.data) ? payload?.data[0] : null;
    if (!firstImage) {
      return NextResponse.json(
        { error: "Image generation returned no image." },
        { status: 502 }
      );
    }

    if (firstImage.b64_json) {
      return NextResponse.json({
        imageDataUrl: `data:image/png;base64,${firstImage.b64_json}`,
      });
    }

    if (firstImage.url) {
      return NextResponse.json({ imageUrl: firstImage.url });
    }

    return NextResponse.json(
      { error: "Image generation response format was unexpected." },
      { status: 502 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    ) {
      return NextResponse.json(
        { error: "Image generation timed out. Please try again." },
        { status: 504 }
      );
    }

    console.error("Recipe image generation failed.", error);
    return NextResponse.json(
      { error: "Image generation is unavailable right now." },
      { status: 502 }
    );
  }
}
