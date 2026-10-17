"use client";

import { useCallback, useEffect, useState } from "react";
import { useMockUser } from "../lib/useMockUser";
import { listMyVisits } from "../lib/collection";
import { fetchRatingSummary } from "../lib/reviews";
import FountainActions from "./FountainActions";
import FountainReviews from "./FountainReviews";
import WaterDrop from "./WaterDrop";
import { useIsMobile } from "../lib/useIsMobile";

const SERIF = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const SANS = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const BLUE = "#1c4e9e";

export default function FountainDetailModal({ fountainId, onClose, onRatingChanged }) {
  const { user } = useMockUser();
  const username = user?.username;
  const isMobile = useIsMobile();

  const [payload, setPayload] = useState(null);
  const [status, setStatus] = useState("loading");

  // Load detail from the per-fountain API whenever the selection changes.
  useEffect(() => {
    if (!fountainId) return;
    let active = true;
    setStatus("loading");
    setPayload(null);

    fetch(`/api/fountains/${fountainId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("not found"))))
      .then(async (json) => {
        // How many times this user has used the fountain (from the database).
        let times = 0;
        if (username) {
          const mine = (await listMyVisits()).find((v) => v.fountain_id === fountainId);
          times = mine?.times_visited ?? 0;
        }
        if (!active) return;

        setPayload({ fountain: json.fountain, times });
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [fountainId, username]);

  // Pull the live average + count from the database (the backend), so a new
  // review is reflected right away. If the backend is down we keep the numbers
  // from the fountain API above.
  const refreshRating = useCallback(async () => {
    const summary = await fetchRatingSummary(fountainId);
    if (!summary) return;
    setPayload((p) =>
      p
        ? {
            ...p,
            fountain: {
              ...p.fountain,
              avg_rating: summary.average ?? 0,
              rating_count: summary.count ?? 0,
            },
          }
        : p,
    );
  }, [fountainId]);

  useEffect(() => {
    if (status === "ready") refreshRating();
  }, [status, refreshRating]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!fountainId) return null;

  const fountain = payload?.fountain;

  return (
    <div style={isMobile ? backdropMobile : backdrop} onClick={onClose}>
      <div
        style={isMobile ? modalMobile : modal}
        role="dialog"
        aria-modal="true"
        aria-label="Water fountain details"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={isMobile ? closeBtnMobile : closeBtn}
          aria-label="Close"
        >
          ✕
        </button>

        {status === "loading" && <p style={muted}>Loading fountain details…</p>}
        {status === "error" && (
          <p style={muted}>Couldn&apos;t load this fountain. Please try again.</p>
        )}

        {status === "ready" && fountain && (
          <>
            <h2 style={isMobile ? titleMobile : title}>
              <WaterDrop height={26} style={{ marginRight: 8 }} />
              {fountain.name}
            </h2>

            <div style={ratingRow}>
              <span style={{ color: "#f6c445" }}>★</span>
              <span style={ratingValue}>
                {fountain.avg_rating > 0 ? fountain.avg_rating.toFixed(1) : "—"}
              </span>
              <span style={ratingCount}>
                ({fountain.rating_count}{" "}
                {fountain.rating_count === 1 ? "rating" : "ratings"})
              </span>
            </div>

            {Number.isFinite(fountain.latitude) && (
              <p style={locationLine}>
                <WaterDrop height={15} style={{ marginRight: 6 }} />
                {fountain.latitude.toFixed(5)}, {fountain.longitude.toFixed(5)}
              </p>
            )}

            {fountain.description && <p style={description}>{fountain.description}</p>}

            {Number.isFinite(fountain.latitude) && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${fountain.latitude},${fountain.longitude}`}
                target="_blank"
                rel="noreferrer"
                style={mapLink}
              >
                Open in Google Maps ↗
              </a>
            )}

            <FountainReviews
              fountainId={fountainId}
              loggedIn={Boolean(username)}
              onChanged={(posted) => {
                // Posting a review also counts as a refill: show the new count.
                if (posted?.times_visited != null) {
                  setPayload((p) => (p ? { ...p, times: posted.times_visited } : p));
                }
                refreshRating();
                onRatingChanged?.(); // lets the map recolor its pin
              }}
            />

            {/* Log a refill + leave a comment */}
            <FountainActions
              fountainId={fountainId}
              username={username}
              initialTimesVisited={payload?.times ?? 0}
              onVisited={(times) =>
                setPayload((p) => (p ? { ...p, times } : p))
              }
            />
          </>
        )}
      </div>
    </div>
  );
}

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(6, 25, 48, 0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  zIndex: 2000,
};

const modal = {
  position: "relative",
  width: "100%",
  maxWidth: 560,
  maxHeight: "82vh",
  overflowY: "auto",
  background: "#ffffff",
  borderRadius: 18,
  padding: "28px 28px 24px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.30)",
  fontFamily: SANS,
  color: "#23395d",
};

const closeBtn = {
  position: "absolute",
  top: 14,
  right: 16,
  border: "none",
  background: "transparent",
  fontSize: 18,
  lineHeight: 1,
  cursor: "pointer",
  color: "#6b7b8a",
};

const title = {
  fontFamily: SERIF,
  fontSize: 26,
  fontWeight: 700,
  color: BLUE,
  margin: "0 32px 8px 0",
};

const ratingRow = { display: "flex", alignItems: "center", gap: 8 };
const ratingValue = { fontWeight: 700, fontSize: 18 };
const ratingCount = { color: "#6b7b8a", fontSize: 14 };

const locationLine = { margin: "10px 0 0", fontSize: 14, color: "#33434f" };
const description = { margin: "10px 0 0", fontSize: 14, color: "#33434f" };

const mapLink = {
  display: "inline-block",
  marginTop: 10,
  fontSize: 14,
  fontWeight: 600,
  color: BLUE,
  textDecoration: "none",
};

const muted = { color: "#6b7b8a", fontSize: 14, margin: "8px 0" };

// ---- Mobile layout: full-width bottom sheet ---------------------------------
const backdropMobile = { ...backdrop, padding: 0, alignItems: "flex-end" };

const modalMobile = {
  ...modal,
  boxSizing: "border-box",
  width: "100%",
  maxWidth: "100%",
  maxHeight: "92vh",
  borderRadius: "18px 18px 0 0",
  padding: "22px 16px 24px",
};

const titleMobile = { ...title, fontSize: 22, margin: "0 30px 8px 0" };

const closeBtnMobile = { ...closeBtn, top: 12, right: 12 };
