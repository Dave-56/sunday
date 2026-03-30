"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  type Dish,
  getFallbackSuggestions,
  normalizeDishes,
} from "@/lib/dishes";

interface WeekEntry {
  weekLabel: string;
  weekKey: string;
  dish: Dish;
  lockedAt: string;
}

interface SuggestionCache {
  weekKey: string;
  recentDishesKey: string;
  dishes: Dish[];
  savedAt: string;
}

const SUGGESTION_CACHE_KEY = "sunday_suggestions_v1";

function getWeekLabel(): string {
  const now = new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay());
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return `${fmt(sunday)} – ${fmt(saturday)}`;
}

function getWeekKey(): string {
  const now = new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay());
  const year = sunday.getFullYear();
  const month = String(sunday.getMonth() + 1).padStart(2, "0");
  const day = String(sunday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRecentDishes(): string[] {
  try {
    const history: WeekEntry[] = JSON.parse(
      localStorage.getItem("sunday_history") || "[]"
    );
    return history.map((e) => e.dish.name);
  } catch {
    return [];
  }
}

function toRecentDishesKey(dishes: string[]): string {
  return dishes
    .map((dish) => dish.trim().toLowerCase())
    .sort()
    .join("|");
}

function getCachedSuggestions(recentDishes: string[]): Dish[] | null {
  try {
    const cache: SuggestionCache = JSON.parse(
      localStorage.getItem(SUGGESTION_CACHE_KEY) || "null"
    );
    if (!cache) return null;

    const sameWeek = cache.weekKey === getWeekKey();
    const sameRecentDishes =
      cache.recentDishesKey === toRecentDishesKey(recentDishes);
    if (!sameWeek || !sameRecentDishes || !Array.isArray(cache.dishes)) {
      return null;
    }

    const normalized = normalizeDishes(cache.dishes);
    return normalized.length > 0 ? normalized : null;
  } catch {
    return null;
  }
}

function saveSuggestionCache(recentDishes: string[], dishes: Dish[]): void {
  const cache: SuggestionCache = {
    weekKey: getWeekKey(),
    recentDishesKey: toRecentDishesKey(recentDishes),
    dishes,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(SUGGESTION_CACHE_KEY, JSON.stringify(cache));
}

function getHistory(): WeekEntry[] {
  try {
    return JSON.parse(localStorage.getItem("sunday_history") || "[]");
  } catch {
    return [];
  }
}

function saveToHistory(dish: Dish): void {
  const history = getHistory();
  const entry: WeekEntry = {
    weekLabel: getWeekLabel(),
    weekKey: getWeekKey(),
    dish,
    lockedAt: new Date().toISOString(),
  };

  // Replace if same week exists
  const idx = history.findIndex((e) => e.weekKey === entry.weekKey);
  if (idx >= 0) {
    history[idx] = entry;
  } else {
    history.unshift(entry);
  }

  // Keep only last 8 weeks
  localStorage.setItem(
    "sunday_history",
    JSON.stringify(history.slice(0, 8))
  );
}

function getCurrentWeekDish(): Dish | null {
  const history = getHistory();
  const currentWeek = getWeekKey();
  const entry = history.find((e) => e.weekKey === currentWeek);
  return entry?.dish || null;
}

function SkeletonCard() {
  return (
    <div className="border border-[var(--color-border)] rounded-xl p-5 bg-[var(--color-bg-card)]">
      <div className="flex items-center gap-2 mb-3">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-4 w-12" />
      </div>
      <div className="skeleton h-6 w-3/4 mb-2" />
      <div className="skeleton h-4 w-full mb-4" />
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-4 w-16" />
        </div>
        <div className="skeleton h-4 w-20" />
      </div>
    </div>
  );
}

export default function Home() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locking, setLocking] = useState(false);
  const [lockedDish, setLockedDish] = useState<Dish | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const didRunInitialLoad = useRef(false);

  const fetchSuggestions = useCallback(async (forceRefresh = false) => {
    const recentDishes = getRecentDishes();
    const fallback = getFallbackSuggestions(recentDishes);

    if (!forceRefresh) {
      const cached = getCachedSuggestions(recentDishes);
      if (cached && cached.length > 0) {
        setError(null);
        setSelectedIndex(null);
        setDishes(cached);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Show quick local options immediately while live suggestions load.
      setError(null);
      setSelectedIndex(null);
      setDishes(fallback);
      setLoading(false);
    }

    setRefreshing(true);
    setError(null);
    setSelectedIndex(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recentDishes }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const errorMessage =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Couldn't load suggestions. Check your connection and try again.";
        throw new Error(errorMessage);
      }

      const normalized = normalizeDishes(data);
      if (normalized.length === 0) {
        throw new Error("Unexpected response format from suggestion service.");
      }

      setDishes(normalized);
      saveSuggestionCache(recentDishes, normalized);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Couldn't load suggestions. Check your connection and try again.";

      setDishes(fallback);
      saveSuggestionCache(recentDishes, fallback);

      if (message.toLowerCase().includes("credits are exhausted")) {
        setError(
          "Anthropic credits are exhausted. Showing local fallback suggestions."
        );
        return;
      }

      if (forceRefresh) {
        setError(
          "Live suggestions are taking too long. Showing quick local suggestions."
        );
      } else {
        setError(null);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (didRunInitialLoad.current) return;
    didRunInitialLoad.current = true;

    const existing = getCurrentWeekDish();
    if (existing) {
      setLockedDish(existing);
      setLoading(false);
    } else {
      fetchSuggestions(false);
    }
  }, [fetchSuggestions]);

  const handleLock = async () => {
    if (selectedIndex === null || !dishes[selectedIndex]) return;
    setLocking(true);
    const dish = dishes[selectedIndex];
    saveToHistory(dish);
    setLockedDish(dish);
    setLocking(false);
  };

  const handleUnlock = () => {
    setLockedDish(null);
    fetchSuggestions(true);
  };

  const [history, setHistory] = useState<WeekEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, [lockedDish]);

  // Locked state
  if (lockedDish && !loading) {
    return (
      <main className="min-h-dvh px-5 py-8 max-w-lg mx-auto">
        <header className="flex items-start justify-between mb-1">
          <h1 className="text-xl font-bold tracking-tight">sunday.</h1>
          <span className="text-sm text-[var(--color-text-muted)]">
            {getWeekLabel()}
          </span>
        </header>

        <h2 className="text-3xl font-extrabold tracking-tight mt-4 mb-1">
          This week&apos;s dish
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-8">
          Locked in and ready to cook.
        </p>

        <div className="border-2 border-[var(--color-accent)] rounded-xl p-5 bg-[var(--color-bg-card)] mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider bg-[var(--color-accent)] text-white px-2 py-0.5 rounded-full">
              {lockedDish.cuisine}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              {lockedDish.difficulty}
            </span>
          </div>
          <h3 className="text-xl font-bold mb-1">{lockedDish.name}</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            {lockedDish.why}
          </p>
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <div className="flex gap-3">
              <span>⏱ {lockedDish.prepTime}</span>
              <span>🍽 {lockedDish.servings}</span>
            </div>
          </div>
        </div>

        <Link
          href={`/recipe?dish=${encodeURIComponent(JSON.stringify(lockedDish))}`}
          className="block w-full text-center py-4 bg-[var(--color-accent)] text-white font-semibold rounded-xl mb-3 card-selectable"
        >
          View full recipe
        </Link>

        <button
          onClick={handleUnlock}
          className="w-full py-4 border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-secondary)] card-selectable"
        >
          Pick a different dish
        </button>

        {history.length > 0 && (
          <div className="mt-10">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-4"
            >
              Recent weeks
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                className={`transition-transform ${showHistory ? "rotate-180" : ""}`}
              >
                <path
                  d="M2 4L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </button>
            {showHistory && (
              <div className="space-y-2">
                {history.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0"
                  >
                    <div>
                      <span className="text-sm font-medium">
                        {entry.dish.name}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)] ml-2">
                        {entry.dish.cuisine}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {entry.weekLabel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    );
  }

  // Selection state
  return (
    <main className="min-h-dvh px-5 py-8 max-w-lg mx-auto">
      <header className="flex items-start justify-between mb-1">
        <h1 className="text-xl font-bold tracking-tight">sunday.</h1>
        <span className="text-sm text-[var(--color-text-muted)]">
          {getWeekLabel()}
        </span>
      </header>

      <h2 className="text-3xl font-extrabold tracking-tight mt-4 mb-1">
        What&apos;s cooking this week?
      </h2>
      <p className="text-[var(--color-text-secondary)] mb-8">
        Pick one dish to prep on Sunday. Portions for two, all week.
      </p>

      <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-4">
        This week&apos;s options
      </p>

      {error && (
        <p className="text-sm text-[var(--color-text-secondary)] mb-6 py-8 text-center">
          {error}
        </p>
      )}

      {loading && dishes.length === 0 && (
        <div className="space-y-4 mb-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!loading && dishes.length > 0 && (
        <div className="space-y-4 mb-8">
          {dishes.map((dish, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i === selectedIndex ? null : i)}
              className={`card-selectable w-full text-left border rounded-xl p-5 bg-[var(--color-bg-card)] transition-all ${
                selectedIndex === i
                  ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider bg-[var(--color-accent)] text-white px-2 py-0.5 rounded-full">
                  {dish.cuisine}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {dish.difficulty}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-1">{dish.name}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                {dish.why}
              </p>
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                <div className="flex gap-3">
                  <span>⏱ {dish.prepTime}</span>
                  <span>🍽 {dish.servings}</span>
                </div>
                <span className="underline underline-offset-2">
                  view recipe →
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={handleLock}
        disabled={selectedIndex === null || locking}
        className={`w-full py-4 rounded-xl font-semibold mb-3 transition-all card-selectable ${
          selectedIndex !== null
            ? "bg-[var(--color-accent)] text-white"
            : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)] border border-[var(--color-border)] cursor-not-allowed"
        }`}
      >
        {locking ? "Locking in..." : "Lock in this dish"}
      </button>

      <button
        onClick={() => fetchSuggestions(true)}
        disabled={refreshing}
        className="w-full py-4 border border-[var(--color-border)] rounded-xl text-sm font-medium card-selectable flex items-center justify-center gap-2"
      >
        {refreshing ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                opacity="0.25"
              />
              <path
                d="M12 2a10 10 0 019.95 9"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            Generating...
          </>
        ) : (
          "Suggest different dishes ↻"
        )}
      </button>

      {history.length > 0 && (
        <div className="mt-10">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-4"
          >
            Recent weeks
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              className={`transition-transform ${showHistory ? "rotate-180" : ""}`}
            >
              <path
                d="M2 4L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </button>
          {showHistory && (
            <div className="space-y-2">
              {history.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium">
                      {entry.dish.name}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] ml-2">
                      {entry.dish.cuisine}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {entry.weekLabel}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
