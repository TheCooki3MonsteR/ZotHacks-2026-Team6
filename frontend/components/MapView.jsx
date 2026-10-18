"use client";

import SiteHeader from "./SiteHeader";
import FountainMapLoader from "./FountainMapLoader";
import { useIsMobile } from "../lib/useIsMobile";

// The /map page body. Kept in a client component so it can pick the mobile or
// desktop layout from the device scan without losing the page's metadata export.
const SERIF = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const SANS = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const BLUE = "#4D80AA";
const CREAM = "#fbf4dc";

export default function MapView() {
  const isMobile = useIsMobile();

  return (
    <div style={page}>
      <SiteHeader />

      <main style={isMobile ? contentMobile : content}>
        <h1 style={isMobile ? titleMobile : title}>Water Fountain Map</h1>
        <p style={isMobile ? subtitleMobile : subtitle}>
          Every bottle-filling station on the UC Irvine campus. Click a pin to see
          its name, location, and global user rating.
        </p>

        <div style={isMobile ? mapWrapMobile : mapWrap}>
          <FountainMapLoader
            height={isMobile ? 460 : 620}
            zoom={15}
            scrollWheelZoom={!isMobile}
          />
        </div>
      </main>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  background: CREAM,
  fontFamily: SANS,
  color: "#23395d",
};

const content = { padding: "28px 44px 72px" };

const title = {
  fontFamily: SERIF,
  fontSize: 42,
  fontWeight: 700,
  color: BLUE,
  margin: "8px 0 12px",
};

const subtitle = { margin: "0 0 24px", fontSize: 16, color: "#23395d" };

const mapWrap = {
  borderRadius: 18,
  overflow: "hidden",
  border: "3px solid transparent",
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  background: "#ffffff",
};

// ---- Mobile layout ----------------------------------------------------------
const contentMobile = { padding: "18px 16px 48px" };
const titleMobile = { ...title, fontSize: 30, margin: "4px 0 10px" };
const subtitleMobile = { ...subtitle, fontSize: 15, margin: "0 0 18px" };
const mapWrapMobile = { ...mapWrap, borderRadius: 14 };
