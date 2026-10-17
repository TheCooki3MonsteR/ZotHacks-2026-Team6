"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMockUser } from "../../../lib/useMockUser";
import { loadStats } from "../../../lib/clientApi";
import SiteHeader from "../../../components/SiteHeader";
import WaterDrop from "../../../components/WaterDrop";

const SERIF = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const SANS = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const BLUE = "#1c4e9e";
const CREAM = "#fbf4dc";

// Little milestone rewards — the "collectable" side of the page.
const BADGES = [
  { id: "first", label: "First Sip ", need: 1 },
  { id: "hydrated", label: "Hydrated ", need: 5 },
  { id: "quench", label: "Quenched ", need: 10 },
  { id: "poisoned", label: "Water Poisoned ", need: 25 },
];

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CollectablesPage() {
  const { user, loggedIn } = useMockUser();
  const username = user?.username;

  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState("idle");
  const [stats, setStats] = useState(null);
  const [fountains, setFountains] = useState([]);

  useEffect(() => setMounted(true), []);

  // Load the user's usage + the fountain catalogue (for names on local data).
  useEffect(() => {
    if (!username) return;
    let active = true;
    setStatus("loading");

    Promise.all([
      loadStats(username),
      fetch("/api/fountains")
        .then((res) => (res.ok ? res.json() : { fountains: [] }))
        .catch(() => ({ fountains: [] })),
    ])
      .then(([statsData, fountainsData]) => {
        if (!active) return;
        setStats(statsData);
        setFountains(fountainsData.fountains ?? []);
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));

    return () => {
      active = false;
    };
  }, [username]);

  // Fill in names/coords for local (offline) visit records.
  const visits = useMemo(() => {
    if (!stats?.visits) return [];
    const byId = new Map(fountains.map((f) => [f.fountain_id, f]));
    return stats.visits.map((v) => {
      const f = byId.get(v.fountain_id);
      return {
        ...v,
        name: v.name ?? f?.name ?? `Fountain #${v.fountain_id}`,
        latitude: v.latitude ?? f?.latitude ?? null,
        longitude: v.longitude ?? f?.longitude ?? null,
      };
    });
  }, [stats, fountains]);

  const totalVisits = stats?.total_visits ?? 0;
  const collected = stats?.fountains_visited ?? 0;
  const commentsCount = stats?.comments_count ?? 0;

  return (
    <div style={page}>
      <SiteHeader />

      <main style={content}>
        <h1 style={title}>
          Collectables <WaterDrop height={34} style={{ marginLeft: 4 }} />
        </h1>
        <p style={subtitle}>Hydrate and Level up!</p>

        {!mounted ? null : !loggedIn ? (
          <div style={emptyCard}>
            <p style={{ margin: 0, fontSize: 16 }}>
              Log in to see your collected fountains and refill stats.
            </p>
            <Link href="/login" style={cta}>
              Log in
            </Link>
          </div>
        ) : status === "loading" ? (
          <p style={muted}>Loading your collectables…</p>
        ) : status === "error" ? (
          <p style={muted}>Couldn&apos;t load your collectables. Try again.</p>
        ) : (
          <>
            {/* Stat tiles */}
            <div style={statGrid}>
              <Stat label="Total refills" value={totalVisits} />
              <Stat label="Fountains collected" value={collected} />
              <Stat label="Reviews written" value={commentsCount} />
            </div>

            {/* Milestones */}
            <h2 style={sectionTitle}>Milestones</h2>
            <div style={badgeRow}>
              {BADGES.map((badge) => {
                const earned = totalVisits >= badge.need;
                return (
                  <div
                    key={badge.id}
                    style={{ ...badge, opacity: earned ? 1 : 0.4 }}
                  >
                    <WaterDrop height={26} />
                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                      {badge.label}
                    </span>
                    <span style={{ fontSize: 12, color: "#6b7b8a" }}>
                      {earned ? "Earned" : `${badge.need} refills`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Per-fountain breakdown */}
            <h2 style={sectionTitle}>Your fountains</h2>

            {visits.length === 0 ? (
              <div style={emptyCard}>
                <p style={{ margin: 0, fontSize: 16 }}>
                  You haven&apos;t collected any fountains yet.
                </p>
                <p style={{ margin: "6px 0 0", color: "#6b7b8a", fontSize: 14 }}>
                  Open a fountain on the map or a Popular card and tap{" "}
                  <strong>“I used this fountain”</strong> to start your collection.
                </p>
                <Link href="/homepage" style={cta}>
                  Find a fountain
                </Link>
              </div>
            ) : (
              <div style={visitGrid}>
                {visits.map((v) => (
                  <article key={v.fountain_id} style={visitCard}>
                    <div style={visitTop}>
                      <h3 style={visitName}>{v.name}</h3>
                      <span style={countPill}>
                        {v.times_visited}×
                      </span>
                    </div>
                    <p style={visitMeta}>
                      Last used {formatDate(v.last_visited)}
                    </p>
                    {Number.isFinite(v.latitude) && Number.isFinite(v.longitude) && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${v.latitude},${v.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        style={mapLink}
                      >
                        Open in Google Maps ↗
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={statCard}>
      <WaterDrop height={26} />
      <span style={statValue}>{value}</span>
      <span style={statLabel}>{label}</span>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  background: CREAM,
  fontFamily: SANS,
  color: "#23395d",
};

const content = { padding: "28px 44px 72px", maxWidth: 1180, margin: "0 auto" };

const title = {
  fontFamily: SERIF,
  fontSize: 42,
  fontWeight: 700,
  color: BLUE,
  margin: "8px 0 6px",
};

const subtitle = { margin: "0 0 26px", fontSize: 16, color: "#4a5b6b" };

const muted = { color: "#4a5b6b", fontSize: 16 };

const statGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 20,
};

const statCard = {
  background: "#ffffff",
  borderRadius: 16,
  padding: "20px 22px",
  display: "grid",
  gap: 2,
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
};

const statValue = {
  fontFamily: SERIF,
  fontSize: 38,
  fontWeight: 700,
  color: BLUE,
  lineHeight: 1.1,
};

const statLabel = { fontSize: 13, color: "#6b7b8a", textTransform: "uppercase", letterSpacing: 0.6 };

const sectionTitle = {
  fontFamily: SERIF,
  fontSize: 28,
  fontWeight: 700,
  color: BLUE,
  margin: "38px 0 16px",
};

const badgeRow = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 16,
};

const badge = {
  background: "#ffffff",
  borderRadius: 14,
  border: "2px solid #e7eef5",
  padding: "16px 12px",
  display: "grid",
  justifyItems: "center",
  gap: 4,
  textAlign: "center",
};

const visitGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
};

const visitCard = {
  background: "#ffffff",
  borderRadius: 16,
  padding: "18px 20px",
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  display: "grid",
  gap: 6,
};

const visitTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: 12,
};

const visitName = {
  fontFamily: SERIF,
  fontSize: 20,
  color: BLUE,
  margin: 0,
};

const countPill = {
  background: "#e7f1fb",
  color: BLUE,
  borderRadius: 999,
  padding: "3px 10px",
  fontSize: 13,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const visitMeta = { margin: 0, fontSize: 13, color: "#6b7b8a" };

const mapLink = {
  fontSize: 13,
  fontWeight: 600,
  color: BLUE,
  textDecoration: "none",
};

const emptyCard = {
  background: "#ffffff",
  borderRadius: 16,
  padding: "26px 28px",
  display: "grid",
  gap: 12,
  justifyItems: "start",
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
};

const cta = {
  display: "inline-block",
  marginTop: 4,
  background: BLUE,
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 14,
  padding: "10px 18px",
  borderRadius: 10,
};
