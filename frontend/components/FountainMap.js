"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import FountainDetailModal from "./FountainDetailModal";

const UCI_CENTER = [33.6461, -117.8427];

// Pin color follows the average star rating: unrated = light grey, then
// getting steadily darker blue the higher the rating (5 stars = dark blue).
const NO_RATING = [154, 167, 181]; // #9aa7b5 light grey
const ONE_STAR = [184, 205, 228]; // pale blue
const FIVE_STARS = [18, 54, 122]; // #12367a dark blue

function pinColor(rating) {
  if (!(rating > 0)) return `rgb(${NO_RATING.join(",")})`;
  const t = Math.min(Math.max((rating - 1) / 4, 0), 1);
  const rgb = ONE_STAR.map((c, i) => Math.round(c + (FIVE_STARS[i] - c) * t));
  return `rgb(${rgb.join(",")})`;
}

// Custom water-drop pin (avoids Leaflet's broken default icon URLs in bundlers).
// Cached per half-star step so we only build a handful of icons.
const iconCache = new Map();
function getPinIcon(rating) {
  const step = rating > 0 ? Math.round(rating * 2) / 2 : 0;
  if (!iconCache.has(step)) {
    const fill = pinColor(step);
    iconCache.set(
      step,
      L.divIcon({
        className: "fountain-pin",
        html:
          `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">` +
          `<path d="M14 1C7.4 1 2 6.4 2 13c0 8.6 10.6 22.2 11.6 23.5a.9.9 0 0 0 1.5 0C16.1 35.2 26 21.6 26 13 26 6.4 20.6 1 14 1Z" ` +
          `fill="${fill}" stroke="#ffffff" stroke-width="2"/>` +
          `<circle cx="14" cy="13" r="5" fill="#ffffff"/></svg>`,
        iconSize: [28, 38],
        iconAnchor: [14, 38],
        popupAnchor: [0, -34],
      }),
    );
  }
  return iconCache.get(step);
}

export default function FountainMap({
  height = 340,
  zoom = 15,
  center = UCI_CENTER,
  scrollWheelZoom = false,
}) {
  const [fountains, setFountains] = useState([]);
  const [status, setStatus] = useState("loading");
  const [selectedId, setSelectedId] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Live star ratings from the database (the FastAPI backend). If the backend
  // is unreachable we just keep the ratings that came with the fountain list.
  const loadRatings = useCallback(async () => {
    try {
      const res = await fetch("/backend/fountains", { cache: "no-store" });
      if (!res.ok) return;
      const live = new Map((await res.json()).map((f) => [f.fountain_id, f]));
      setFountains((prev) =>
        prev.map((f) => {
          const l = live.get(f.fountain_id);
          return l ? { ...f, avg_rating: l.avg_rating, rating_count: l.rating_count } : f;
        }),
      );
    } catch {
      // keep what we have
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/fountains")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setFountains(data.fountains ?? []);
        setStatus("ready");
        loadRatings();
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [loadRatings]);

  const points = fountains.filter(
    (f) => Number.isFinite(f.latitude) && Number.isFinite(f.longitude),
  );

  return (
    <div style={{ position: "relative", zIndex: 0, height, width: "100%" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map((fountain) => (
          <Marker
            key={fountain.fountain_id}
            position={[fountain.latitude, fountain.longitude]}
            icon={getPinIcon(fountain.avg_rating)}
            eventHandlers={{
              click: () => setSelectedId(fountain.fountain_id),
            }}
          />
        ))}
      </MapContainer>

      {status !== "ready" && (
        <div style={overlay}>
          {status === "loading"
            ? "Loading UCI water fountain map…"
            : "Couldn't load the fountain map."}
        </div>
      )}

      {/* Portal the detail pop-up to <body> so it escapes the map's stacking
          context and any overflow clipping on the card. */}
      {mounted &&
        selectedId != null &&
        createPortal(
          <FountainDetailModal
            fountainId={selectedId}
            onClose={() => setSelectedId(null)}
            onRatingChanged={loadRatings}
          />,
          document.body,
        )}
    </div>
  );
}

const overlay = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  background: "rgba(231, 241, 251, 0.85)",
  color: "#1c4e9e",
  fontSize: 14,
  fontFamily: "Epilogue, -apple-system, Roboto, Helvetica, sans-serif",
  zIndex: 500,
};
