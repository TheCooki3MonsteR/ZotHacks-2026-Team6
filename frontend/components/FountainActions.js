"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { recordFountainVisit } from "../lib/clientApi";
import WaterDrop from "./WaterDrop";
import { useIsMobile } from "../lib/useIsMobile";

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
  const [toast, setToast] = useState(null); // { id, kind: "ok" | "cooldown" }
  const isMobile = useIsMobile();

  // Keep in sync when the parent learns a newer count (e.g. after posting a review).
  useEffect(() => {
    setTimes(initialTimesVisited);
    setUsed(initialTimesVisited > 0);
  }, [initialTimesVisited]);

  // Hide the "+1" pop-up a couple of seconds after it appears.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

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
      setToast({ id: Date.now(), kind: "ok" });
      onVisited?.(res.times_visited);
    } catch (err) {
      if (err.cooldown) {
        setToast({ id: Date.now(), kind: "cooldown" });
        return;
      }
      setNote(err.message || "Couldn't log your refill.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={compact ? wrapCompact : isMobile ? wrapMobile : wrap}>
      <div style={compact ? row : isMobile ? rowMobile : row}>
        <button
          type="button"
          onClick={handleUsed}
          disabled={busy}
          style={
            compact
              ? used
                ? compactBtnUsed
                : compactBtn
              : used
                ? isMobile
                  ? secondaryBtnMobile
                  : secondaryBtn
                : isMobile
                  ? primaryBtnMobile
                  : primaryBtn
          }
        >
          {used ? "Used it again" : "I used this fountain"}
          <WaterDrop height={16} style={{ marginLeft: 6 }} />
        </button>

        {!compact && (
          <span style={isMobile ? countMobile : count}>
            {times > 0
              ? `You've used this ${times} time${times === 1 ? "" : "s"}`
              : "Not used yet"}
          </span>
        )}
      </div>

      {note && <p style={errorStyle}>{note}</p>}

      {/* Top-right pop-up. Portaled to <body> so card/modal transforms can't move it. */}
      {toast &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            style={toastStyle}
          >
            <style>{TOAST_CSS}</style>
            {toast.kind === "cooldown" ? (
              <span style={{ fontWeight: 700 }}>Cooldown!</span>
            ) : (
              <>
                <span style={{ fontWeight: 700 }}>+1</span>
                <WaterDrop height={18} />
                <span>Refill logged</span>
              </>
            )}
          </div>,
          document.body
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

const primaryBtn = { ...baseBtn, background: "#4D80AA", color: "#ffffff" };
const secondaryBtn = { ...baseBtn, background: "#e7f1fb", color: "#4D80AA" };
const compactBtn = {
  ...baseBtn,
  background: "#4D80AA",
  color: "#ffffff",
  padding: "8px 14px",
  fontSize: 13,
};

// After you've used the fountain, the small card button turns light blue (like the pop-up's).
const compactBtnUsed = { ...compactBtn, background: "#e7f1fb", color: "#4D80AA" };

const count = { fontSize: 13, color: "#6b7b8a" };

const hint = { fontSize: 13, color: "#6b7b8a", margin: "4px 0 0" };
const errorStyle = { fontSize: 13, color: "#b3261e", margin: 0 };

const TOAST_CSS =
  "@keyframes zw-toast{0%{opacity:0;transform:translateY(-10px)}12%{opacity:1;transform:none}85%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-6px)}}";
const toastStyle = {
  position: "fixed",
  top: 70,
  right: 20,
  zIndex: 10000,
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 16px",
  borderRadius: 999,
  background: "#ffffff",
  color: "#23395d",
  fontSize: 14,
  fontFamily: 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif',
  boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
  border: "1px solid #cfe0f3",
  animation: "zw-toast 2.2s ease forwards",
  pointerEvents: "none",
};

// ---- Mobile layout ----------------------------------------------------------
const wrapMobile = { ...wrap, marginTop: 16 };
const rowMobile = {
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: 8,
};
const primaryBtnMobile = {
  ...primaryBtn,
  width: "100%",
  padding: "12px 18px",
  fontSize: 15,
};
const secondaryBtnMobile = {
  ...secondaryBtn,
  width: "100%",
  padding: "12px 18px",
  fontSize: 15,
};
const countMobile = { ...count, textAlign: "center" };
