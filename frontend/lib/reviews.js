// Reviews, talking to the FastAPI backend through the /backend proxy
// (see next.config.mjs). Stars are stored in the `ratings` table and the text in
// `reviews`; the backend saves both together.

import { errorMessage } from "./auth";

export async function listReviews(fountainId) {
  const res = await fetch(`/backend/fountains/${fountainId}/reviews`, {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Couldn't load reviews."));
  return res.json();
}

export async function addReview(fountainId, rating, body) {
  const res = await fetch(`/backend/fountains/${fountainId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ rating, body }),
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Couldn't post your review."));
  return res.json();
}

// Edit your own review (new stars + new text). Returns { review_id, fountain_id, rating, body, created_at }.
export async function updateReview(reviewId, rating, body) {
  const res = await fetch(`/backend/reviews/${reviewId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ rating, body }),
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Couldn't save your changes."));
  return res.json();
}

export async function deleteReview(reviewId) {
  const res = await fetch(`/backend/reviews/${reviewId}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Couldn't delete your review."));
}

// Live average + count from the database. Returns null if the backend is unreachable.
export async function fetchRatingSummary(fountainId) {
  try {
    const res = await fetch(`/backend/fountains/${fountainId}/rating`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

// Every review the logged-in user has written: [{ review_id, fountain_id, rating, body, created_at }]
export async function listMyReviews() {
  try {
    const res = await fetch("/backend/me/reviews", {
      credentials: "same-origin",
      cache: "no-store",
    });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}
