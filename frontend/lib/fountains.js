import { createClient } from "@supabase/supabase-js";
import seed from "./uci-fountains.json";
import { DEMO_RATINGS, DEMO_COMMENTS } from "./demo-data";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}

// Shape the raw rows into the object the UI expects: normalised numbers plus
// the aggregated global rating for each fountain.
function withRatings(fountains, ratings) {
  const stats = new Map();
  for (const r of ratings ?? []) {
    const value = Number(r.rating);
    if (!Number.isFinite(value)) continue;
    const entry = stats.get(r.fountain_id) ?? { sum: 0, count: 0 };
    entry.sum += value;
    entry.count += 1;
    stats.set(r.fountain_id, entry);
  }

  return (fountains ?? []).map((f) => {
    const s = stats.get(f.fountain_id);
    return {
      fountain_id: f.fountain_id,
      name: f.name,
      description: f.description,
      // Postgres `numeric` comes back over PostgREST as a string.
      latitude: f.latitude == null ? null : Number(f.latitude),
      longitude: f.longitude == null ? null : Number(f.longitude),
      image_url: f.image_url ?? null,
      avg_rating: s ? Number((s.sum / s.count).toFixed(2)) : 0,
      rating_count: s ? s.count : 0,
    };
  });
}

// Returns every fountain with its global rating. Falls back to the bundled UCI
// seed data + demo ratings when Supabase is not configured or unreachable, so
// the map, popular list, and pop-ups still render during development.
export async function getFountainsWithRatings() {
  const supabase = getSupabase();
  if (!supabase) {
    return { fountains: withRatings(seed, DEMO_RATINGS), source: "fallback" };
  }

  try {
    const [{ data: fountains, error: fError }, { data: ratings, error: rError }] =
      await Promise.all([
        supabase.from("water_fountains").select("*"),
        supabase.from("ratings").select("fountain_id, rating"),
      ]);

    if (fError) throw fError;
    if (rError) throw rError;

    return { fountains: withRatings(fountains, ratings), source: "supabase" };
  } catch (err) {
    console.error("[lib/fountains] Supabase query failed:", err);
    return {
      fountains: withRatings(seed, DEMO_RATINGS),
      source: "fallback",
      error: err?.message ?? String(err),
    };
  }
}

// The fountain pop-up only shows the newest few comments.
export const POPUP_COMMENT_LIMIT = 4;

// Newest-first user comments for one fountain, capped at `limit`.
export async function getCommentsForFountain(
  fountainId,
  limit = POPUP_COMMENT_LIMIT,
) {
  const demoComments = () =>
    DEMO_COMMENTS.filter((c) => c.fountain_id === fountainId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);

  const supabase = getSupabase();
  if (!supabase) return { comments: demoComments(), source: "fallback" };

  try {
    const { data, error } = await supabase
      .from("comments")
      .select("comment_id, body, created_at, users(username)")
      .eq("fountain_id", fountainId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      comments: (data ?? []).map((c) => ({
        comment_id: c.comment_id,
        body: c.body,
        created_at: c.created_at,
        username: c.users?.username ?? "Anteater",
      })),
      source: "supabase",
    };
  } catch (err) {
    console.error("[lib/fountains] comments query failed:", err);
    return {
      comments: demoComments(),
      source: "fallback",
      error: err?.message ?? String(err),
    };
  }
}

// Highest average rating first, then most-rated, then alphabetical.
export function sortByPopularity(fountains) {
  return [...fountains].sort(
    (a, b) =>
      b.avg_rating - a.avg_rating ||
      b.rating_count - a.rating_count ||
      a.name.localeCompare(b.name),
  );
}
