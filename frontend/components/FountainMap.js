"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import FountainDetailModal from "./FountainDetailModal";

const UCI_CENTER = [33.6461, -117.8427];

// Custom water-drop pin (avoids Leaflet's broken default icon URLs in bundlers).
// Cached per rating tier so we only build a handful of icons.
const iconCache = new Map();
function getPinIcon(rating) {
  const tier = rating >= 4 ? "high" : rating > 0 ? "mid" : "none";
  if (!iconCache.has(tier)) {
    const fill =
      tier === "high" ? "#1c4e9e" : tier === "mid" ? "#3e6fb8" : "#9aa7b5";
    iconCache.set(
      tier,
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
  return iconCache.get(tier);
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

  useEffect(() => {
    let active = true;
    fetch("/api/fountains")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setFountains(data.fountains ?? []);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

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
  fontFamily: "system-ui, sans-serif",
  zIndex: 500,
};
