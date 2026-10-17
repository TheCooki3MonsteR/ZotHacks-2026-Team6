// Frontend data layer for the collectables feature. Everything now lives in the
// database (through the FastAPI backend); see lib/collection.js and lib/reviews.js.

import { listMyStickers, listMyVisits, recordVisit } from "./collection";
import { countMyReviews } from "./reviews";

export async function recordFountainVisit(fountainId) {
  return recordVisit(fountainId); // { times_visited, last_visited }
}

export async function loadStats() {
  const [visits, stickers, reviewCount] = await Promise.all([
    listMyVisits(),
    listMyStickers(),
    countMyReviews(),
  ]);
  return {
    total_visits: visits.reduce((n, v) => n + v.times_visited, 0),
    fountains_visited: visits.length,
    comments_count: reviewCount,
    visits,
    stickers, // { total, owned: [...] }
  };
}
