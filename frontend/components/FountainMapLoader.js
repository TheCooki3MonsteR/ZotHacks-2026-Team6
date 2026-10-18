"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window`, so the map must never render on the server. This
// wrapper is a Client Component (required for `ssr: false`) and can be imported
// from either Server or Client Components.
const FountainMap = dynamic(() => import("./FountainMap"), {
  ssr: false,
  loading: () => null,
});

export default function FountainMapLoader({ height = 340, ...props }) {
  return (
    <div
      style={{
        height,
        width: "100%",
        background: "#e7f1fb",
        display: "grid",
        placeItems: "center",
        color: "#4D80AA",
        fontSize: 14,
        fontFamily: "Epilogue, -apple-system, Roboto, Helvetica, sans-serif",
      }}
    >
      <FountainMap height={height} {...props} />
    </div>
  );
}
