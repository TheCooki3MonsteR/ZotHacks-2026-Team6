"use client";

import { useState } from "react";
import { recordFountainVisit, postFountainComment } from "../lib/clientApi";

// "I used this fountain" + comment form.
// `compact` renders just the button (used on the homepage cards).
export default function FountainActions({
  fountainId,
  username,
  initialTimesVisited = 0,
  compact = false,
  onVisited,
  onComment,
}) {
  const [times, setTimes] = useState(initialTimesVisited);
  const [used, setUsed] = useState(initialTimesVisited > 0);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const [note, setNote] = useState("");

  if (!username) {
    return <p style={hint}>Log in to log your refills and leave comments.</p>;
  }

  async function handleUsed() {
    if (busy) return;
    setBusy(true);
    setNote("");
    const res = await recordFountainVisit(fountainId, username);
    setTimes(res.times_visited);
    setUsed(true);
    setBusy(false);
    setNote("Refill logged! 💧");
    onVisited?.(res.times_visited);
  }

  async function handleComment(e) {
    e.preventDefault();
    if (busy || !text.trim()) return;
    setBusy(true);
    setNote("");
    const res = await postFountainComment(fountainId, username, text);
    setBusy(false);
    setText("");
    setNote("Comment posted!");
    onComment?.(res.comment);
  }

  return (
    <div style={compact ? wrapCompact : wrap}>
      <div style={row}>
        <button
          type="button"
          onClick={handleUsed}
          disabled={busy}
          style={compact ? compactBtn : used ? secondaryBtn : primaryBtn}
        >
          {used ? "Used it again 💧" : "I used this fountain 💧"}
        </button>

        {!compact && (
          <span style={count}>
            {times > 0
              ? `You've used this ${times} time${times === 1 ? "" : "s"}`
              : "Not used yet"}
          </span>
        )}
      </div>

      {!compact &&
        (used ? (
          <form onSubmit={handleComment} style={form}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="How was it? Water pressure, temperature, crowds…"
              maxLength={500}
              rows={3}
              style={textarea}
            />
            <button
              type="submit"
              disabled={busy || !text.trim()}
              style={submitBtn}
            >
              Post comment
            </button>
          </form>
        ) : (
          <p style={hint}>Use this fountain first to leave a comment.</p>
        ))}

      {note && <p style={noteStyle}>{note}</p>}
    </div>
  );
}

const wrap = { display: "grid", gap: 12, marginTop: 18 };
const wrapCompact = { display: "grid", gap: 6, justifyItems: "center" };
const row = { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" };

const baseBtn = {
  border: "none",
  borderRadius: 10,
  padding: "10px 18px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
};

const primaryBtn = { ...baseBtn, background: "#1c4e9e", color: "#ffffff" };
const secondaryBtn = { ...baseBtn, background: "#e7f1fb", color: "#1c4e9e" };
const compactBtn = {
  ...baseBtn,
  background: "#1c4e9e",
  color: "#ffffff",
  padding: "8px 14px",
  fontSize: 13,
};

const count = { fontSize: 13, color: "#6b7b8a" };

const form = { display: "grid", gap: 8 };
const textarea = {
  width: "100%",
  resize: "vertical",
  border: "1px solid #d7e2ea",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  outline: "none",
};
const submitBtn = {
  ...baseBtn,
  justifySelf: "start",
  background: "#ffc72c",
  color: "#1c4e9e",
  padding: "9px 18px",
};

const hint = { fontSize: 13, color: "#6b7b8a", margin: "4px 0 0" };
const noteStyle = { fontSize: 13, color: "#1c7a3e", margin: 0 };
