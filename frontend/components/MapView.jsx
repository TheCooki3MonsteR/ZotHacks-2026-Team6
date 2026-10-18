"use client";

import SiteHeader from "./SiteHeader";
import FountainMapLoader from "./FountainMapLoader";

// The /map page body. Kept in a client component so it can pick the mobile or
// desktop layout from the device scan without losing the page's metadata export.
const SANS = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const CREAM = "#fbf4dc";

export default function MapView() {
  return (
    <div style={page}>
      <SiteHeader />

      {/* Full-screen map: fills everything under the header. */}
      <main style={content}>
        <div style={mapWrap}>
          <FountainMapLoader height="100%" zoom={15} scrollWheelZoom />
        </div>
      </main>
    </div>
  );
}

const page = {
  height: "100dvh",
  display: "flex",
  flexDirection: "column",
  background: CREAM,
  fontFamily: SANS,
  color: "#23395d",
};

const content = { flex: 1, minHeight: 0, position: "relative" };

const mapWrap = { position: "absolute", inset: 0 };
