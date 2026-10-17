// Frontend data layer for the collectables feature.
//
// There is no backend yet, so visits are stored in the browser
// (localStorage), scoped per username. When the real backend lands, replace the
// bodies of these functions with calls to the API — the components and
// the collectables page only use this module, so nothing else needs to change.

import { localGetStats, localRecordVisit } from "./localStore";
import { countMyReviews } from "./reviews";

export async function recordFountainVisit(fountainId, username) {
  return {
    times_visited: localRecordVisit(username, fountainId),
  };
}

export async function loadStats(username) {
  // Visits are still local; the review count comes from the database.
  const stats = localGetStats(username);
  return { ...stats, comments_count: await countMyReviews() };
}
