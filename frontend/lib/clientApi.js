// Frontend data layer for the collectables feature.
//
// There is no backend yet, so visits and comments are stored in the browser
// (localStorage), scoped per username. When the real backend lands, replace the
// bodies of these three functions with calls to the API — the components and
// the collectables page only use this module, so nothing else needs to change.

import {
  localAddComment,
  localGetStats,
  localRecordVisit,
} from "./localStore";

export async function recordFountainVisit(fountainId, username) {
  return {
    times_visited: localRecordVisit(username, fountainId),
  };
}

export async function postFountainComment(fountainId, username, body) {
  return {
    comment: localAddComment(username, fountainId, body),
  };
}

export async function loadStats(username) {
  return localGetStats(username);
}
