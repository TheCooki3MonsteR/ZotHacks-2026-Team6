import SiteHeader from "../../../components/SiteHeader";
import FountainMapLoader from "../../../components/FountainMapLoader";

export const metadata = {
  title: "Water Fountain Map — Zot Water",
};

const SERIF = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const SANS = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const BLUE = "#1c4e9e";
const CREAM = "#fbf4dc";

export default function MapPage() {
  return (
    <div style={page}>
      <SiteHeader />

      <main style={content}>
        <h1 style={title}>Water Fountain Map</h1>
        <p style={subtitle}>
          Every bottle-filling station on the UC Irvine campus. Click a pin to see
          its name, location, and global user rating.
        </p>

        <div style={mapWrap}>
          <FountainMapLoader height={620} zoom={15} scrollWheelZoom />
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
