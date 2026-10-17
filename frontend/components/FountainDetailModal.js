"use client";

import { useEffect, useState } from "react";

const SERIF = 'Georgia, "Times New Roman", Cambria, serif';
const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const BLUE = "#1c4e9e";

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function FountainDetailModal({ fountainId, onClose }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  // Load the detail from the per-fountain API whenever the selection changes.
  useEffect(() => {
    if (!fountainId) return;
    let active = true;
    setStatus("loading");
    setData(null);

    fetch(`/api/fountains/${fountainId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("not found"))))
      .then((json) => {
        if (!active) return;
        setData(json);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [fountainId]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!fountainId) return null;

  const fountain = data?.fountain;
  const comments = data?.comments ?? [];

  return (
    <div style={backdrop} onClick={onClose}>
      <div
        style={modal}
        role="dialog"
        aria-modal="true"
        aria-label="Water fountain details"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} style={closeBtn} aria-label="Close">
          ✕
        </button>

        {status === "loading" && <p style={muted}>Loading fountain details…</p>}
        {status === "error" && (
          <p style={muted}>Couldn&apos;t load this fountain. Please try again.</p>
        )}

        {status === "ready" && fountain && (
          <>
            <h2 style={title}>💧 {fountain.name}</h2>

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
                📍 {fountain.latitude.toFixed(5)}, {fountain.longitude.toFixed(5)}
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

            <h3 style={commentsTitle}>Comments</h3>

            {comments.length === 0 ? (
              <p style={muted}>No comments yet — be the first to share one!</p>
            ) : (
              <ul style={commentList}>
                {comments.map((c) => (
                  <li key={c.comment_id} style={commentItem}>
                    <div style={commentMeta}>
                      <strong style={{ color: BLUE }}>{c.username}</strong>
                      <span style={commentDate}>{formatDate(c.created_at)}</span>
                    </div>
                    <p style={commentBody}>{c.body}</p>
                  </li>
                ))}
              </ul>
            )}
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

const commentsTitle = {
  fontFamily: SERIF,
  fontSize: 20,
  color: BLUE,
  margin: "22px 0 10px",
  borderTop: "1px solid #e7eef5",
  paddingTop: 16,
};

const muted = { color: "#6b7b8a", fontSize: 14, margin: "8px 0" };

const commentList = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "grid",
  gap: 12,
};

const commentItem = {
  background: "#f6f9fc",
  borderRadius: 10,
  padding: "10px 14px",
};

const commentMeta = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: 12,
  fontSize: 14,
};

const commentDate = { color: "#8a97a3", fontSize: 12 };

const commentBody = { margin: "6px 0 0", fontSize: 14, lineHeight: 1.45 };
