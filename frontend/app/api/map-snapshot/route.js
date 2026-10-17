import sharp from "sharp";

// GET /api/map-snapshot?lat=..&lng=..[&r=rating][&w=][&h=][&z=]
//
// Renders a static "shot" of the map centered on a coordinate with a pin on it,
// by stitching OpenStreetMap tiles together with sharp. Used as the dynamic
// image for each popular water station card.
//
// The pin colour is derived from the fountain's global rating, so the backend
// ratings determine how each popular station's image looks:
//   rating >= 4  -> dark blue
//   rating  > 0  -> mid blue
//   no ratings   -> grey

export const runtime = "nodejs";

const TILE = 256;
const TILE_URL = "https://tile.openstreetmap.org";
const USER_AGENT =
  "ZotWaterHackathon/1.0 (UCI water fountain student project)";

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

function pinSvg(rating) {
  const fill = rating >= 4 ? "#1c4e9e" : rating > 0 ? "#3e6fb8" : "#9aa7b5";
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="46" viewBox="0 0 28 38">` +
      `<path d="M14 1C7.4 1 2 6.4 2 13c0 8.6 10.6 22.2 11.6 23.5a.9.9 0 0 0 1.5 0C16.1 35.2 26 21.6 26 13 26 6.4 20.6 1 14 1Z" ` +
      `fill="${fill}" stroke="#ffffff" stroke-width="2"/>` +
      `<circle cx="14" cy="13" r="5" fill="#ffffff"/></svg>`,
  );
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const lat = Number(latParam);
  const lng = Number(lngParam);

  // Note: `Number(null)`/`Number("")` is 0, so check the raw params too.
  if (
    !latParam ||
    !lngParam ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return new Response("lat and lng are required", { status: 400 });
  }

  const width = clamp(Math.round(Number(searchParams.get("w")) || 600), 120, 1200);
  const height = clamp(Math.round(Number(searchParams.get("h")) || 340), 120, 800);
  const zoom = clamp(Math.round(Number(searchParams.get("z")) || 16), 12, 18);
  const rating = Number(searchParams.get("r")) || 0;

  try {
    const n = 2 ** zoom;
    const latRad = (lat * Math.PI) / 180;
    const worldX = ((lng + 180) / 360) * n * TILE;
    const worldY =
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      n *
      TILE;

    // Pixel window (in world pixels) centered on the fountain.
    const left = Math.round(worldX - width / 2);
    const top = Math.round(worldY - height / 2);

    const minTx = Math.floor(left / TILE);
    const maxTx = Math.floor((left + width - 1) / TILE);
    const minTy = Math.floor(top / TILE);
    const maxTy = Math.floor((top + height - 1) / TILE);

    const cols = maxTx - minTx + 1;
    const rows = maxTy - minTy + 1;

    // Fetch the tiles that cover the window (x wraps around the globe).
    const tiles = await Promise.all(
      Array.from({ length: cols * rows }, async (_, i) => {
        const tx = minTx + (i % cols);
        const ty = minTy + Math.floor(i / cols);
        if (ty < 0 || ty >= n) return null;
        const wrappedX = ((tx % n) + n) % n;
        try {
          const res = await fetch(`${TILE_URL}/${zoom}/${wrappedX}/${ty}.png`, {
            headers: { "User-Agent": USER_AGENT, Accept: "image/png" },
            signal: AbortSignal.timeout(6000),
          });
          if (!res.ok) return null;
          return {
            input: Buffer.from(await res.arrayBuffer()),
            left: (tx - minTx) * TILE,
            top: (ty - minTy) * TILE,
          };
        } catch {
          return null;
        }
      }),
    );

    const tileComposites = tiles.filter(Boolean);

    // Pass 1: stitch the tiles onto one canvas.
    const stitched = await sharp({
      create: {
        width: cols * TILE,
        height: rows * TILE,
        channels: 4,
        background: { r: 231, g: 241, b: 251, alpha: 1 },
      },
    })
      .composite(tileComposites)
      .png()
      .toBuffer();

    // Pass 2: crop to the window and drop the pin at the center.
    const windowLeft = left - minTx * TILE;
    const windowTop = top - minTy * TILE;

    const png = await sharp(stitched)
      .extract({ left: windowLeft, top: windowTop, width, height })
      .composite([
        {
          input: pinSvg(rating),
          left: Math.round(width / 2) - 17,
          top: Math.round(height / 2) - 46,
        },
      ])
      .png({ compressionLevel: 9 })
      .toBuffer();

    return new Response(png, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control":
          "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("[map-snapshot] failed:", err);
    return new Response("Failed to render map snapshot", { status: 500 });
  }
}
