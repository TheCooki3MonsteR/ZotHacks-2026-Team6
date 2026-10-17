"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { addReview, deleteReview, listReviews } from "../lib/reviews";

const SERIF = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const SANS = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const BLUE = "#1c4e9e";

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

  const mine = reviews.find((r) => r.is_mine);

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
      await addReview(fountainId, stars, text.trim());
      setStars(0);
      setText("");
      await load();
      onChanged?.();
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
      <h3 style={heading}>Reviews</h3>

      {status === "loading" && <p style={muted}>Loading reviews…</p>}
      {status === "error" && <p style={muted}>Couldn&apos;t load reviews right now.</p>}

      {status === "ready" &&
        (reviews.length === 0 ? (
          <p style={muted}>No reviews yet — be the first to share one!</p>
        ) : (
          <ul style={list}>
            {reviews.map((r) => (
              <li key={r.review_id} style={item}>
                <div style={meta}>
                  <span>
                    <strong style={{ color: BLUE }}>{r.username}</strong>{" "}
                    {r.rating != null && <Stars value={r.rating} />}
                  </span>
                  <span style={date}>{formatDate(r.created_at)}</span>
                </div>
                <p style={bodyText}>{r.body}</p>
                {r.is_mine && (
                  <button
                    type="button"
                    onClick={() => handleDelete(r.review_id)}
                    disabled={busy}
                    style={deleteBtn}
                  >
                    Delete my review
                  </button>
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
                  style={{ ...starBtn, color: n <= stars ? "#f6c445" : "#d7e2ea" }}
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
const list = { listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 };
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
const errorStyle = { fontSize: 13, color: "#c0392b", margin: "8px 0 0" };
