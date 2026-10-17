"use client";

import { useEffect, useState } from "react";
import { recordFountainVisit } from "../lib/clientApi";
import WaterDrop from "./WaterDrop";

// "I used this fountain" button (reviews live in FountainReviews).
// `compact` renders just the button (used on the homepage cards).
export default function FountainActions({
  fountainId,
  username,
  initialTimesVisited = 0,
  compact = false,
  onVisited,
}) {
  const [times, setTimes] = useState(initialTimesVisited);
  const [used, setUsed] = useState(initialTimesVisited > 0);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  // Keep in sync when the parent learns a newer count (e.g. after posting a review).
  useEffect(() => {
    setTimes(initialTimesVisited);
    setUsed(initialTimesVisited > 0);
  }, [initialTimesVisited]);

  // Logged-out visitors get the "log in" prompt from the reviews section instead.
  if (!username) {
    return compact ? <p style={hint}>Log in to log your refills.</p> : null;
  }

  async function handleUsed() {
    if (busy) return;
    setBusy(true);
    setNote("");
    try {
      const res = await recordFountainVisit(fountainId);
      setTimes(res.times_visited);
      setUsed(true);
      setNote("Refill logged!");
      onVisited?.(res.times_visited);
    } catch (err) {
      setNote(err.message || "Couldn't log your refill.");
    } finally {
      setBusy(false);
    }
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
          {used ? "Used it again" : "I used this fountain"}
          <WaterDrop height={16} style={{ marginLeft: 6 }} />
        </button>

        {!compact && (
          <span style={count}>
            {times > 0
              ? `You've used this ${times} time${times === 1 ? "" : "s"}`
              : "Not used yet"}
          </span>
        )}
      </div>

      {note && (
        <p style={noteStyle}>
          {note} <WaterDrop height={13} />
        </p>
      )}
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
  fontFamily: 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif',
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

const hint = { fontSize: 13, color: "#6b7b8a", margin: "4px 0 0" };
const noteStyle = { fontSize: 13, color: "#1c7a3e", margin: 0 };
