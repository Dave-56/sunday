"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Suspense, useEffect, useMemo, useState } from "react";
import { normalizeDish } from "@/lib/dishes";

function RecipeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const dishParam = searchParams.get("dish");
  const dish = useMemo(() => {
    if (!dishParam) return null;
    try {
      return normalizeDish(JSON.parse(dishParam));
    } catch {
      return null;
    }
  }, [dishParam]);

  useEffect(() => {
    if (!dish) return;

    const cacheKey = `recipe_image_${dish.name.toLowerCase()}_${dish.cuisine.toLowerCase()}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setImageSrc(cached);
      setImageError(null);
      return;
    }

    const controller = new AbortController();
    const loadImage = async () => {
      setImageLoading(true);
      setImageError(null);
      setImageSrc(null);

      try {
        const response = await fetch("/api/recipe-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dishName: dish.name, cuisine: dish.cuisine }),
          signal: controller.signal,
        });

        const data = (await response.json().catch(() => null)) as
          | { imageDataUrl?: string; imageUrl?: string; error?: string }
          | null;

        if (!response.ok) {
          throw new Error(
            data?.error || "Could not generate a recipe image right now."
          );
        }

        const src = data?.imageDataUrl || data?.imageUrl || "";
        if (!src) {
          throw new Error("No image was returned for this recipe.");
        }

        sessionStorage.setItem(cacheKey, src);
        setImageSrc(src);
      } catch (error) {
        if (controller.signal.aborted) return;
        const message =
          error instanceof Error
            ? error.message
            : "Could not generate a recipe image right now.";
        setImageError(message);
      } finally {
        if (!controller.signal.aborted) {
          setImageLoading(false);
        }
      }
    };

    loadImage();
    return () => controller.abort();
  }, [dish]);

  if (!dishParam) {
    return (
      <main className="min-h-dvh px-5 py-8 max-w-lg mx-auto">
        <p className="text-[var(--color-text-secondary)]">
          No recipe selected.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-sm underline underline-offset-2"
        >
          ← Back to home
        </button>
      </main>
    );
  }

  if (!dish) {
    return (
      <main className="min-h-dvh px-5 py-8 max-w-lg mx-auto">
        <p className="text-[var(--color-text-secondary)]">
          Invalid recipe data.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-sm underline underline-offset-2"
        >
          ← Back to home
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-5 py-8 max-w-lg mx-auto pb-20">
      <button
        onClick={() => router.push("/")}
        className="text-sm text-[var(--color-text-muted)] mb-6 card-selectable"
      >
        ← Back
      </button>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium uppercase tracking-wider bg-[var(--color-accent)] text-white px-2 py-0.5 rounded-full">
          {dish.cuisine}
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">
          {dish.difficulty}
        </span>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight mb-2">
        {dish.name}
      </h1>
      <p className="text-[var(--color-text-secondary)] mb-6">{dish.why}</p>

      <section className="mb-8">
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
          {imageLoading && (
            <div className="skeleton w-full aspect-[4/3]" aria-hidden="true" />
          )}

          {!imageLoading && imageSrc && (
            <Image
              src={imageSrc}
              alt={`Generated photo of ${dish.name}`}
              width={1200}
              height={900}
              unoptimized
              className="w-full aspect-[4/3] object-cover"
            />
          )}

          {!imageLoading && !imageSrc && (
            <div className="w-full aspect-[4/3] flex items-center justify-center text-sm text-[var(--color-text-muted)] px-4 text-center">
              {imageError || "Recipe image unavailable for this dish."}
            </div>
          )}
        </div>
      </section>

      <div className="flex gap-4 text-sm text-[var(--color-text-muted)] mb-8 pb-8 border-b border-[var(--color-border)]">
        <span>⏱ {dish.prepTime}</span>
        <span>🍽 {dish.servings}</span>
      </div>

      {/* Ingredients */}
      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-4">
          Ingredients
        </h2>
        <ul className="space-y-2">
          {dish.ingredients.map((ing, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] flex-shrink-0" />
              {ing}
            </li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section>
        <h2 className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-4">
          Steps
        </h2>
        <ol className="space-y-4">
          {dish.steps.map((step, i) => (
            <li key={i} className="flex gap-4 text-sm">
              <span className="text-[var(--color-text-muted)] font-mono text-xs mt-0.5 flex-shrink-0 w-5 text-right">
                {(i + 1).toString().padStart(2, "0")}
              </span>
              <p className="leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
        <button
          onClick={() => router.push("/")}
          className="w-full py-4 border border-[var(--color-border)] rounded-xl text-sm font-medium card-selectable"
        >
          ← Back to this week
        </button>
      </div>
    </main>
  );
}

export default function RecipePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh px-5 py-8 max-w-lg mx-auto">
          <div className="skeleton h-8 w-48 mb-4" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-3/4 mb-8" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-4 w-full" />
            ))}
          </div>
        </main>
      }
    >
      <RecipeContent />
    </Suspense>
  );
}
