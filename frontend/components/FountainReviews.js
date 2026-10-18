"use client";

import { LegendaryStyle, isLegendary } from "./legendaryFx";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { addReview, deleteReview, listReviews, updateReview } from "../lib/reviews";
import { stickerSrc } from "../lib/collection";
import { useIsMobile } from "../lib/useIsMobile";

const SERIF = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const SANS = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const BLUE = "#4D80AA";

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function Stars({ value }) {
  const n = Math.round(Number(value) || 0);
  return (
    <span aria-label={`${n} out of 5 stars`} style={{ color: "#f6c445", letterSpacing: 1 }}>
      {"★".repeat(n)}
      <span style={{ color: "#d7e2ea" }}>{"★".repeat(5 - n)}</span>
    </span>
  );
}

// Reviews for one fountain: list + (for logged-in users) a stars-and-text form.
export default function FountainReviews({ fountainId, loggedIn, onChanged }) {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reward, setReward] = useState(null); // what the last review unlocked
  const [editingId, setEditingId] = useState(null); // review being edited, if any
  const [editStars, setEditStars] = useState(0);
  const [editText, setEditText] = useState("");
  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    try {
      setReviews(await listReviews(fountainId));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [fountainId]);

  // Reload when the fountain changes or when login state changes (is_mine depends on it).
  useEffect(() => {
    setStatus("loading");
    load();
  }, [load, loggedIn]);

  // Only a written review hides the form (a stars-only rating can still become a review).
  const mine = reviews.find((r) => r.is_mine && r.review_id != null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    if (stars < 1) {
      setError("Pick a star rating first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const posted = await addReview(fountainId, stars, text.trim());
      setStars(0);
      setText("");
      setReward({ stickers: posted.stickers ?? [], times: posted.times_visited });
      await load();
      onChanged?.(posted);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(r) {
    setEditingId(r.review_id);
    setEditStars(Math.round(Number(r.rating)) || 0);
    setEditText(r.body);
    setError("");
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (busy || editingId == null) return;
    if (editStars < 1) {
      setError("Pick a star rating first.");
      return;
    }
    if (!editText.trim()) {
      setError("Review can't be blank.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await updateReview(editingId, editStars, editText.trim());
      setEditingId(null);
      await load();
      onChanged?.(); // refresh the average rating / map pin
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(reviewId) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await deleteReview(reviewId);
      await load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h3 style={isMobile ? headingMobile : heading}>Reviews</h3>

      {reward && (
        <div style={rewardBox} role="status">
          {reward.stickers.length > 0 ? (
            reward.stickers.map((s) => (
              <div
                key={s.collectible_id}
                style={isLegendary(s) ? { ...rewardRow, ...legendRow } : rewardRow}
                className={isLegendary(s) ? "legendary-fx" : undefined}
              >
                {isLegendary(s) && <LegendaryStyle />}
                <img
                  src={stickerSrc(s.image_path)}
                  alt={s.name}
                  style={rewardImg}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div>
                  <strong style={{ color: isLegendary(s) ? "#ffffff" : BLUE, position: "relative", zIndex: 1 }}>
                    {isLegendary(s) ? "Legendary sticker unlocked!" : "Sticker unlocked!"}
                  </strong>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{s.name}</div>
                  {s.rarity && (
                    <span style={{ ...rarityPill, ...(RARITY[s.rarity] ?? RARITY.common) }}>
                      {s.rarity}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <strong style={{ color: BLUE }}>Review posted!</strong>
          )}
          <div style={rewardNote}>
            Refill logged — you&apos;ve now used this fountain {reward.times}{" "}
            {reward.times === 1 ? "time" : "times"}.
          </div>
        </div>
      )}

      {status === "loading" && <p style={muted}>Loading reviews…</p>}
      {status === "error" && <p style={muted}>Couldn&apos;t load reviews right now.</p>}

      {status === "ready" &&
        (reviews.length === 0 ? (
          <p style={muted}>No reviews yet — be the first to share one!</p>
        ) : (
          <ul style={isMobile ? listMobile : list}>
            {reviews.map((r) => (
              <li key={r.review_id ?? `rating-${r.username}`} style={isMobile ? itemMobile : item}>
                <div style={isMobile ? metaMobile : meta}>
                  <span>
                    <strong style={{ color: BLUE }}>{r.username}</strong>{" "}
                    {r.rating != null && <Stars value={r.rating} />}
                  </span>
                  <span style={date}>{formatDate(r.created_at)}</span>
                </div>
                {r.is_mine && r.review_id != null && editingId === r.review_id ? (
                  <form onSubmit={handleSaveEdit} style={form}>
                    <div role="radiogroup" aria-label="Star rating" style={starRow}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={editStars === n}
                          aria-label={`${n} star${n === 1 ? "" : "s"}`}
                          onClick={() => setEditStars(n)}
                          style={{
                            ...(isMobile ? starBtnMobile : starBtn),
                            color: n <= editStars ? "#f6c445" : "#d7e2ea",
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      maxLength={1000}
                      rows={3}
                      style={textarea}
                    />
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <button type="submit" disabled={busy || !editText.trim()} style={submitBtn}>
                        {busy ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setEditingId(null)}
                        style={{ ...deleteBtn, marginTop: 0, color: "#6b7b8a", fontSize: 14 }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {r.body ? <p style={bodyText}>{r.body}</p> : null}
                    {r.is_mine && r.review_id != null && (
                      <div style={{ display: "flex", gap: 14 }}>
                        <button
                          type="button"
                          onClick={() => startEdit(r)}
                          disabled={busy}
                          style={{ ...deleteBtn, color: BLUE }}
                        >
                          Edit my review
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(r.review_id)}
                          disabled={busy}
                          style={deleteBtn}
                        >
                          Delete my review
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        ))}

      {!loggedIn ? (
        <Link href="/login" style={loginBtn}>
          Log in to write a review
        </Link>
      ) : mine ? null : (
        status === "ready" && (
          <form onSubmit={handleSubmit} style={form}>
            <div role="radiogroup" aria-label="Star rating" style={starRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={stars === n}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  onClick={() => setStars(n)}
                  style={{
                    ...(isMobile ? starBtnMobile : starBtn),
                    color: n <= stars ? "#f6c445" : "#d7e2ea",
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="How was it? Water pressure, temperature, crowds…"
              maxLength={1000}
              rows={3}
              style={textarea}
            />
            <button type="submit" disabled={busy || !text.trim()} style={submitBtn}>
              Post review
            </button>
          </form>
        )
      )}

      {error && (
        <p role="alert" style={errorStyle}>
          {error}
        </p>
      )}
    </section>
  );
}

const heading = {
  fontFamily: SERIF,
  fontSize: 20,
  color: BLUE,
  margin: "22px 0 10px",
  borderTop: "1px solid #e7eef5",
  paddingTop: 16,
};
const muted = { color: "#6b7b8a", fontSize: 14, margin: "8px 0" };
// The list scrolls on its own, so every review is reachable and the write-a-review form stays in view.
const list = {
  listStyle: "none",
  margin: 0,
  padding: "0 6px 0 0",
  display: "grid",
  gap: 12,
  maxHeight: 280,
  overflowY: "auto",
  overscrollBehavior: "contain",
};
const item = { background: "#f6f9fc", borderRadius: 10, padding: "10px 14px" };
const meta = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: 12,
  fontSize: 14,
};
const date = { color: "#8a97a3", fontSize: 12 };
const bodyText = { margin: "6px 0 0", fontSize: 14, lineHeight: 1.45 };
const deleteBtn = {
  marginTop: 8,
  background: "none",
  border: "none",
  padding: 0,
  color: "#c0392b",
  fontSize: 13,
  cursor: "pointer",
  fontFamily: SANS,
};
const form = { display: "grid", gap: 8, marginTop: 14 };
const starRow = { display: "flex", gap: 2 };
const starBtn = {
  background: "none",
  border: "none",
  padding: 0,
  fontSize: 28,
  lineHeight: 1,
  cursor: "pointer",
};
const textarea = {
  width: "100%",
  boxSizing: "border-box",
  resize: "vertical",
  border: "1px solid #d7e2ea",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  fontFamily: SANS,
  outline: "none",
};
const submitBtn = {
  justifySelf: "start",
  border: "none",
  borderRadius: 10,
  background: "#ffc72c",
  color: BLUE,
  padding: "9px 18px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: SANS,
};
const loginBtn = {
  display: "inline-block",
  marginTop: 14,
  border: "none",
  borderRadius: 10,
  background: BLUE,
  color: "#ffffff",
  padding: "10px 18px",
  fontSize: 14,
  fontWeight: 700,
  textDecoration: "none",
  fontFamily: SANS,
};
const RARITY = {
  common: { background: "#e7eef5", color: "#4a5b6b" },
  rare: { background: "#d6e6fa", color: "#1c4e9e" },
  epic: { background: "#e8dcf8", color: "#6a3fa8" },
  legendary: { background: "#fde7a8", color: "#8a5a00" },
};
const rewardBox = {
  background: "#fff9e3",
  border: "1px solid #f3e1a0",
  borderRadius: 12,
  padding: "12px 14px",
  margin: "0 0 12px",
  display: "grid",
  gap: 8,
};
const rewardRow = { display: "flex", alignItems: "center", gap: 14 };
const legendRow = { padding: "10px 14px", borderRadius: 10 };
const rewardImg = { width: 84, height: 84, objectFit: "contain" };
const rarityPill = {
  display: "inline-block",
  marginTop: 4,
  padding: "2px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  textTransform: "capitalize",
};
const rewardNote = { fontSize: 13, color: "#6b5d1e" };
const errorStyle = { fontSize: 13, color: "#c0392b", margin: "8px 0 0" };

// ---- Mobile layout ----------------------------------------------------------
const headingMobile = { ...heading, fontSize: 18 };
const listMobile = { ...list, maxHeight: 240 };
const itemMobile = { ...item, padding: "10px 12px" };
const metaMobile = { ...meta, flexWrap: "wrap", rowGap: 4 };
const starBtnMobile = { ...starBtn, fontSize: 34 };
