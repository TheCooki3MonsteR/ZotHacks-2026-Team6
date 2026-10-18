"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMockUser } from "../../../lib/useMockUser";
import SiteHeader from "../../../components/SiteHeader";
import FountainMapLoader from "../../../components/FountainMapLoader";
import FountainActions from "../../../components/FountainActions";
import { listMyVisits } from "../../../lib/collection";
import FountainDetailModal from "../../../components/FountainDetailModal";
import { Stars } from "../../../components/Stars";
import { useIsMobile } from "../../../lib/useIsMobile";

const SERIF = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const SANS = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';

const BLUE = "#4D80AA";
const CREAM = "#fbf4dc";
const POPULAR_COUNT = 6;

// Stars + average + count for a Popular card (e.g. ★★★★☆ 4.4 (12)).
function StarRating({ value, count }) {
  return (
    <div style={starRow}>
      <Stars value={value} />
      <span style={{ fontWeight: 700 }}>{count > 0 ? Number(value).toFixed(1) : "No ratings yet"}</span>
      {count > 0 && <span style={{ color: "#6b7b8a" }}>({count})</span>}
    </div>
  );
}

// Little bubbles float up from wherever the mouse moves over `e.currentTarget`, which needs an empty
// <span className="bubble-layer" /> inside it. Used on the profile drawing and on the Popular cards.
let lastBubbleAt = 0;
function trailBubbles(e) {
  const host = e.currentTarget;
  const layer = host.querySelector(".bubble-layer");
  const now = performance.now();
  if (!layer || now - lastBubbleAt <= 70 || layer.childElementCount > 40) return;
  lastBubbleAt = now;

  const box = host.getBoundingClientRect();
  const px = e.clientX - box.left;
  const py = e.clientY - box.top;
  const size = 8 + Math.random() * 16;
  const bubble = document.createElement("span");
  bubble.className = "mouse-bubble";
  bubble.style.cssText =
    `left:${px - size / 2 + (Math.random() * 16 - 8)}px;top:${py - size / 2}px;` +
    `width:${size}px;height:${size}px;` +
    `--dx:${Math.round(Math.random() * 44 - 22)}px;--rise:${Math.round(60 + Math.random() * 70)}px`;
  bubble.addEventListener("animationend", () => bubble.remove());
  layer.appendChild(bubble);
}

// Over the profile drawing, the "Go to Profile" label hangs off the cursor (its top-left corner sits
// right under the pointer, so it reads as bottom-right of the mouse), plus the bubble trail.
function followMouse(e) {
  const box = e.currentTarget.getBoundingClientRect();
  const tip = e.currentTarget.querySelector(".profile-tip");
  if (tip) {
    tip.style.left = `${Math.min(Math.max(e.clientX - box.left - 8, 0), box.width - tip.offsetWidth)}px`;
    tip.style.top = `${Math.min(Math.max(e.clientY - box.top - 6, 0), box.height - tip.offsetHeight)}px`;
    tip.style.bottom = "auto";
    tip.style.transform = "none";
  }
  trailBubbles(e);
}
function resetTip(e) {
  const tip = e.currentTarget.querySelector(".profile-tip");
  if (tip) ["left", "top", "bottom", "transform"].forEach((k) => tip.style.removeProperty(k));
}

export default function Homepage() {
  const { loggedIn, user } = useMockUser();
  const isMobile = useIsMobile();
  const [fountains, setFountains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null); // popular card whose pop-up is open
  const [refreshKey, setRefreshKey] = useState(0); // bump to re-rank after a new review
  const [visitCounts, setVisitCounts] = useState(() => new Map()); // fountain_id -> how many times I've used it

  // Which fountains this user has already used, so each card's button can say "Used it again".
  useEffect(() => {
    if (!loggedIn) {
      setVisitCounts(new Map());
      return;
    }
    let active = true;
    listMyVisits().then((visits) => {
      if (active) setVisitCounts(new Map(visits.map((v) => [v.fountain_id, v.times_visited])));
    });
    return () => {
      active = false;
    };
  }, [loggedIn]);

  // Popular list: the 6 highest-rated fountains. Ratings come live from the
  // database (the FastAPI backend); fountains nobody has rated yet are ordered
  // alphabetically, so an empty database still fills the list.
  useEffect(() => {
    let active = true;

    async function load() {
      const res = await fetch("/api/fountains");
      const data = await res.json();
      let list = data.fountains ?? [];

      try {
        const live = await fetch("/backend/fountains", { cache: "no-store" });
        if (live.ok) {
          const byId = new Map((await live.json()).map((f) => [f.fountain_id, f]));
          list = list.map((f) => {
            const l = byId.get(f.fountain_id);
            return {
              ...f,
              avg_rating: l?.avg_rating ?? 0,
              rating_count: l?.rating_count ?? 0,
            };
          });
        }
      } catch {
        // backend unreachable: keep the ratings that came with the list
      }

      return [...list]
        .sort(
          (a, b) =>
            b.avg_rating - a.avg_rating ||
            b.rating_count - a.rating_count ||
            a.name.localeCompare(b.name),
        )
        .slice(0, POPULAR_COUNT);
    }

    load()
      .then((top) => {
        if (active) setFountains(top);
      })
      .catch(() => {
        if (active) setFountains([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <div style={page}>
      <style>{POPULAR_CSS}</style>
      <SiteHeader />

      <main style={isMobile ? contentMobile : content}>
        {/* Cards */}
        <div
          style={
            isMobile
              ? cardsMobile
              : loggedIn
                ? cardsLoggedIn
                : cardsLoggedOut
          }
        >
          {/* Map card — live map of every fountain */}
          <div style={card}>
            <FountainMapLoader
              // Desktop: tall enough that the map fills the screen, so "See where's popular!"
              // starts just below the fold (header + padding ~80px). Never shorter than 420px.
              height={isMobile ? 220 : "max(420px, calc(100vh - 80px))"}
              zoom={15}
            />
          </div>

          {/* Profile link — logged-in only: just the drawing, with a label on hover */}
          {loggedIn && (
            <Link
              href="/profile"
              className="profile-art"
              aria-label="Go to Profile"
              style={isMobile ? profileArtMobile : profileArt}
              onMouseMove={followMouse}
              onMouseLeave={resetTip}
            >
              {/* Drawing + "Click me!" share one SVG, so the curved text stays lined up with the head at any size.
                  The arc is a circle (center 430,300 / radius 360) that rides just above the top of the head. */}
              <svg
                viewBox="0 -140 700 1123"
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label="Anteater mascot holding a glass of water"
                style={profileArtImg}
              >
                <defs>
                  <path id="profile-arc" d="M 130 101 A 360 360 0 0 1 730 101" />
                </defs>
                <image href="/images/collectables.png" x="0" y="0" width="700" height="983" />
                <text
                  fill={BLUE}
                  stroke={CREAM}
                  strokeWidth="14"
                  strokeLinejoin="round"
                  paintOrder="stroke"
                  fontFamily={SERIF}
                  fontWeight="800"
                  fontSize="92"
                  letterSpacing="4"
                  textAnchor="middle"
                >
                  <textPath href="#profile-arc" startOffset="50%">
                    Click me!
                  </textPath>
                </text>
              </svg>
              <span className="bubble-layer" aria-hidden="true" />
              <span className="profile-tip" aria-hidden="true">
                Go to Profile
              </span>
            </Link>
          )}
        </div>

        {/* Popular */}
        <h2 style={isMobile ? popularHeadingMobile : popularHeading}>See where&apos;s popular!</h2>

        {loading ? (
          <p style={muted}>Loading…</p>
        ) : fountains.length === 0 ? (
          <p style={muted}>No fountains to show yet.</p>
        ) : (
          <div style={isMobile ? popularGridMobile : popularGridDesk}>
            {fountains.map((fountain) => {
              const hasCoords =
                Number.isFinite(fountain.latitude) &&
                Number.isFinite(fountain.longitude);
              // Dynamic image: a map shot centered on the fountain with a pin
              // coloured by its global rating. Real photos (image_url) win when
              // they exist.
              const imageSrc = fountain.image_url
                ? fountain.image_url
                : hasCoords
                  ? `/api/map-snapshot?lat=${fountain.latitude}&lng=${fountain.longitude}&r=${fountain.avg_rating}&w=760&h=440&z=18`
                  : "/images/fountain-placeholder.svg";

              return (
                <article
                  key={fountain.fountain_id}
                  className="popular-card"
                  style={popularCard}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${fountain.name}`}
                  onMouseMove={trailBubbles}
                  onClick={() => setSelectedId(fountain.fountain_id)}
                  onKeyDown={(e) => {
                    // Enter / Space open it (only when the card itself has focus)
                    if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      setSelectedId(fountain.fountain_id);
                    }
                  }}
                >
                  <div style={isMobile ? popularTitleMobile : popularTitleDesk}>
                    {fountain.name}
                  </div>
                  <div style={{ position: "relative" }}>
                    <img
                      src={imageSrc}
                      alt={`Map pin at ${fountain.name}`}
                      loading="lazy"
                      style={isMobile ? popularImageMobile : popularImageDesk}
                    />
                    <div
                      style={{
                        ...quoteBubble,
                        ...(isMobile ? quoteBubbleMobile : quoteBubbleDesk),
                        bottom: 10,
                        // stars on top, then the text (the text row does its own line clamp)
                        display: "grid",
                        gap: 4,
                        overflow: "visible",
                      }}
                    >
                      <StarRating value={fountain.avg_rating} count={fountain.rating_count} />
                      <div
                        style={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: isMobile ? 3 : 2,
                          overflow: "hidden",
                        }}
                      >
                        {fountain.quote || fountain.description}
                      </div>
                    </div>
                  </div>
                  <div style={isMobile ? popularFooter : popularFooterDesk}>
                    {loggedIn && (
                      /* Clicking the refill button shouldn't also open the pop-up. */
                      <div
                        style={popularAction}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <FountainActions
                          fountainId={fountain.fountain_id}
                          username={user?.username}
                          initialTimesVisited={visitCounts.get(fountain.fountain_id) ?? 0}
                          onVisited={(times) =>
                            setVisitCounts((m) => new Map(m).set(fountain.fountain_id, times))
                          }
                          compact
                        />
                      </div>
                    )}
                  </div>
                  <span className="bubble-layer" aria-hidden="true" />
                </article>
              );
            })}
          </div>
        )}

        {!loading && fountains.length > 0 && (
          <p style={attribution}>Map imagery © OpenStreetMap contributors</p>
        )}
      </main>

      {/* Same pop-up as clicking a pin on the map */}
      {selectedId != null && (
        <FountainDetailModal
          fountainId={selectedId}
          onClose={() => setSelectedId(null)}
          onRatingChanged={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}

// Popular cards are clickable: pointer cursor, a small lift on hover, focus ring for keyboard users.
const POPULAR_CSS = `
.popular-card { cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease; }
.popular-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.14) !important; }
.popular-card:focus-visible { outline: 3px solid #2f6bd8; outline-offset: 2px; }
.profile-art svg { transition: transform 0.2s ease; }
.profile-art:hover svg, .profile-art:focus-visible svg { transform: scale(1.03); }
.profile-art:focus-visible { outline: 3px solid #2f6bd8; outline-offset: 4px; }
.bubble-layer { position: absolute; inset: 0; pointer-events: none; overflow: visible; }
.mouse-bubble {
  position: absolute; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(190,225,250,0.55) 62%);
  border: 2px solid rgba(111,177,227,0.85);
  animation: mouse-bubble-rise 1.3s ease-out forwards;
}
@keyframes mouse-bubble-rise {
  0%   { opacity: 0;    transform: translate(0, 0) scale(0.4); }
  15%  { opacity: 0.95; }
  100% { opacity: 0;    transform: translate(var(--dx), calc(-1 * var(--rise))) scale(1.2); }
}
@media (prefers-reduced-motion: reduce) { .mouse-bubble { display: none; } }
.profile-tip {
  position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%);
  background: #4D80AA; color: #ffffff; font-weight: 700; font-size: 16px;
  padding: 9px 20px; border-radius: 999px; white-space: nowrap; pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.18); opacity: 0; transition: opacity 0.15s ease;
}
.profile-art:hover .profile-tip, .profile-art:focus-visible .profile-tip { opacity: 1; }
`;

const page = {
  minHeight: "100vh",
  background: CREAM,
  fontFamily: SANS,
  color: "#23395d",
};

const content = { padding: "28px 44px 72px" };

const cardsLoggedOut = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 28,
};

const cardsLoggedIn = {
  display: "grid",
  gridTemplateColumns: "1.25fr 1fr",
  gap: 28,
  alignItems: "stretch",
};

const card = {
  display: "flex",
  flexDirection: "column",
  background: "#ffffff",
  borderRadius: 18,
  overflow: "hidden",
  textDecoration: "none",
  border: "3px solid transparent",
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
};

// The drawing fills its grid cell (taking the map card's height) without changing the row height.
const profileArt = {
  position: "relative",
  display: "block",
  minHeight: 320,
  textDecoration: "none",
  borderRadius: 18,
};
const profileArtMobile = { ...profileArt, minHeight: 340 };
// 88% of the cell, centered (a little smaller than filling it completely).
const profileArtImg = {
  position: "absolute",
  top: "6%",
  left: "6%",
  width: "88%",
  height: "88%",
  display: "block",
  overflow: "visible",
};

const popularHeading = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  fontFamily: SERIF,
  fontSize: 42,
  fontWeight: 700,
  color: BLUE,
  margin: "48px 0 24px",
};

const muted = { color: "#23395d", opacity: 0.8, fontSize: 16 };

const popularCard = {
  position: "relative",
  background: "#ffffff",
  borderRadius: 18,
  overflow: "hidden",
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
};

const popularImage = {
  width: "100%",
  height: 220,
  objectFit: "cover",
  display: "block",
};

const quoteBubble = {
  position: "absolute",
  left: 22,
  right: 22,
  bottom: 78,
  background: "rgba(255,255,255,0.72)",
  borderRadius: 10,
  padding: "12px 16px",
  fontSize: 13,
  lineHeight: 1.35,
  color: "#333333",
  textAlign: "center",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const starRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  fontSize: 13,
  color: "#23395d",
};

const popularFooter = {
  padding: "14px 18px",
  textAlign: "center",
  background: "#ffffff",
  display: "grid",
  gap: 10,
  justifyItems: "center",
};

const popularAction = { display: "flex" };

const attribution = {
  margin: "14px 0 0",
  fontSize: 12,
  color: "#8a97a3",
};

// ---- Desktop popular cards: compact (mobile keeps the original sizes below) ----
const popularGridDesk = {
  display: "grid",
  // 3 equal columns spanning the full width -> the 6 popular fountains sit in an even 3x2 grid
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 28,
};

const popularImageDesk = { ...popularImage, height: 200 };

const quoteBubbleDesk = {
  left: 14,
  right: 14,
  padding: "8px 12px",
  fontSize: 11.5,
  lineHeight: 1.3,
  WebkitLineClamp: 2,
};

const popularFooterDesk = { ...popularFooter, padding: "10px 14px", gap: 8 };

const popularTitleDesk = {
  padding: "10px 14px",
  textAlign: "center",
  fontWeight: 600,
  fontSize: 15,
  color: "#23395d",
  background: "#ffffff",
};
const popularTitleMobile = { ...popularTitleDesk, padding: "14px 18px", fontSize: 16 };

// ---- Mobile layout ----------------------------------------------------------
const contentMobile = { padding: "18px 16px 48px" };

const cardsMobile = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 18,
  alignItems: "stretch",
};

const popularHeadingMobile = {
  ...popularHeading,
  fontSize: 30,
  gap: 10,
  margin: "32px 0 16px",
};

const popularGridMobile = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 18,
};

const popularImageMobile = { ...popularImage, height: 180 };

const quoteBubbleMobile = { left: 14, right: 14, fontSize: 12.5 };

