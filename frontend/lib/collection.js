// Visits and stickers, stored in the database through the FastAPI backend
// (/backend/... is proxied to it, see next.config.mjs).
//   user_visited      -> how many times you used each fountain
//   user_collectibles -> which stickers you own (the sticker art itself is a
//                        file in frontend/public/collectibles/)

import { errorMessage } from "./auth";

// "I used this fountain": +1 for the logged-in user. Returns { times_visited, last_visited }.
export async function recordVisit(fountainId) {
  const res = await fetch(`/backend/fountains/${fountainId}/visit`, {
    method: "POST",
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Couldn't log your refill."));
  return res.json();
}

async function getJSON(path, fallback) {
  try {
    const res = await fetch(path, { credentials: "same-origin", cache: "no-store" });
    return res.ok ? await res.json() : fallback;
  } catch {
    return fallback;
  }
}

export const listMyVisits = () => getJSON("/backend/me/visits", []);
export const listMyStickers = () => getJSON("/backend/me/collectibles", { total: 0, owned: [] });

// image_path in the database is "collectibles/petr.png" -> served from /public.
export function stickerSrc(imagePath) {
  return `/${String(imagePath).replace(/^\//, "")}`;
}
