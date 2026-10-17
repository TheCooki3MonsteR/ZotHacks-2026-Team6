// Client-only demo persistence, used when Supabase is not configured so the
// "used it", comments, and collectables features still work offline.
// Data is scoped per username in localStorage.

const VISITS_KEY = (u) => `zothydrate_visits:${u}`;
const COMMENTS_KEY = (u) => `zothydrate_comments:${u}`;

function readJSON(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage disabled — ignore for the demo
  }
}

export function localRecordVisit(username, fountainId) {
  const key = VISITS_KEY(username);
  const visits = readJSON(key, {});
  const current = visits[fountainId] ?? { times_visited: 0 };
  visits[fountainId] = {
    times_visited: (current.times_visited ?? 0) + 1,
    last_visited: new Date().toISOString(),
  };
  writeJSON(key, visits);
  return visits[fountainId].times_visited;
}

export function localGetVisit(username, fountainId) {
  return readJSON(VISITS_KEY(username), {})[fountainId] ?? null;
}

export function localAddComment(username, fountainId, body) {
  const key = COMMENTS_KEY(username);
  const all = readJSON(key, {});
  const comment = {
    comment_id: `local-${Date.now()}`,
    username,
    body: String(body).trim().slice(0, 500),
    created_at: new Date().toISOString(),
  };
  all[fountainId] = [comment, ...(all[fountainId] ?? [])];
  writeJSON(key, all);
  return comment;
}

export function localGetComments(username, fountainId) {
  return readJSON(COMMENTS_KEY(username), {})[fountainId] ?? [];
}

export function localGetStats(username) {
  const visits = readJSON(VISITS_KEY(username), {});
  const list = Object.entries(visits).map(([id, v]) => ({
    fountain_id: Number(id),
    times_visited: v.times_visited ?? 0,
    last_visited: v.last_visited ?? null,
  }));

  const commentCount = Object.values(readJSON(COMMENTS_KEY(username), {})).reduce(
    (n, arr) => n + arr.length,
    0,
  );

  return {
    total_visits: list.reduce((n, v) => n + v.times_visited, 0),
    fountains_visited: list.length,
    comments_count: commentCount,
    visits: list.sort(
      (a, b) => new Date(b.last_visited ?? 0) - new Date(a.last_visited ?? 0),
    ),
  };
}
