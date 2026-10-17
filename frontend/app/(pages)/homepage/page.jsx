"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMockUser } from "../../../lib/useMockUser";
import SiteHeader from "../../../components/SiteHeader";
import FountainMapLoader from "../../../components/FountainMapLoader";
import FountainActions from "../../../components/FountainActions";

const SERIF = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const SANS = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';

const BLUE = "#1c4e9e";
const CREAM = "#fbf4dc";
const STAR = "#f6c445";
const POPULAR_COUNT = 6;

export default function Homepage() {
  const { loggedIn, user } = useMockUser();
  const [fountains, setFountains] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  return (
    <div style={page}>
      <SiteHeader />

      <main style={content}>
        <h1 style={pageTitle}>Water Fountains - Near You</h1>

        {/* Cards */}
        <div style={loggedIn ? cardsLoggedIn : cardsLoggedOut}>
          {/* Map card — live map of every fountain */}
          <div style={loggedIn ? { ...card, ...mapCardActive } : card}>
            <FountainMapLoader height={loggedIn ? 300 : 360} zoom={15} />
            <div style={cardFooter}>
              <h2 style={cardTitle}>Water Fountains 💧</h2>
              <p style={cardSubtitle}>
                A map of all the water fountains on the University of California,
                Irvine Campus
              </p>
            </div>
          </div>

          {/* Collectables card — logged-in only */}
          {loggedIn && (
            <Link href="/collectables" style={{ ...card, background: "#f3ecd4" }}>
              <img
                src="/images/collectables.png"
                alt="Anteater mascot holding a glass of water"
                style={{ ...cardImageShort, objectFit: "contain", background: "#f3ecd4" }}
              />
              <div style={cardFooter}>
                <h2 style={cardTitle}>Collectables 💧✨</h2>
                <p style={cardSubtitle}>See your experience</p>
              </div>
            </Link>
          )}
        </div>

        {/* Popular */}
        <h2 style={popularHeading}>
          <span style={star} aria-hidden="true">
            ★
          </span>
          Popular
        </h2>

        {loading ? (
          <p style={muted}>Loading…</p>
        ) : fountains.length === 0 ? (
          <p style={muted}>No fountains to show yet.</p>
        ) : (
          <div style={popularGrid}>
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
                  ? `/api/map-snapshot?lat=${fountain.latitude}&lng=${fountain.longitude}&r=${fountain.avg_rating}&w=760&h=440`
                  : "/images/fountain-placeholder.svg";

              return (
                <article key={fountain.fountain_id} style={popularCard}>
                  <img
                    src={imageSrc}
                    alt={`Map pin at ${fountain.name}`}
                    loading="lazy"
                    style={popularImage}
                  />
                  <div style={{ ...quoteBubble, bottom: loggedIn ? 134 : 78 }}>
                    “{fountain.quote || fountain.description}”
                  </div>
                  <div style={popularFooter}>
                    <span style={popularName}>{fountain.name}</span>
                    {loggedIn && (
                      <div style={popularAction}>
                        <FountainActions
                          fountainId={fountain.fountain_id}
                          username={user?.username}
                          compact
                        />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && fountains.length > 0 && (
          <p style={attribution}>Map imagery © OpenStreetMap contributors</p>
        )}
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

const pageTitle = {
  fontFamily: SERIF,
  fontSize: 42,
  fontWeight: 700,
  color: BLUE,
  margin: "8px 0 26px",
};

const cardsLoggedOut = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 28,
};

const cardsLoggedIn = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
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

// Blue outline on the active map card in the logged-in layout.
const mapCardActive = { border: "3px solid #2f6bd8" };

const cardImageShort = {
  width: "100%",
  height: 300,
  objectFit: "cover",
  display: "block",
};

const cardFooter = { padding: "18px 24px 22px", background: "#ffffff" };

const cardTitle = {
  fontFamily: SERIF,
  fontSize: 30,
  fontWeight: 700,
  color: BLUE,
  margin: 0,
};

const cardSubtitle = { margin: "8px 0 0", fontSize: 14, color: "#23395d" };

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

const star = { color: STAR, fontSize: 40, lineHeight: 1 };

const muted = { color: "#23395d", opacity: 0.8, fontSize: 16 };

const popularGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
  gap: 28,
};

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
  background: "rgba(255,255,255,0.92)",
  borderRadius: 10,
  padding: "12px 16px",
  fontStyle: "italic",
  fontSize: 15,
  lineHeight: 1.35,
  color: "#333333",
  textAlign: "center",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
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

const popularName = { fontWeight: 600, fontSize: 17, color: "#23395d" };

const attribution = {
  margin: "14px 0 0",
  fontSize: 12,
  color: "#8a97a3",
};
