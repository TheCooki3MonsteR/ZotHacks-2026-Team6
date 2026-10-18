"use client";

import { LegendaryStyle, isLegendary, isEpic, isRare } from "../../../components/legendaryFx";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMockUser } from "../../../lib/useMockUser";
import { loadStats } from "../../../lib/clientApi";
import { deleteReview, updateReview } from "../../../lib/reviews";
import { stickerSrc } from "../../../lib/collection";
import SiteHeader from "../../../components/SiteHeader";
import WaterDrop from "../../../components/WaterDrop";
import { useIsMobile } from "../../../lib/useIsMobile";

const SERIF = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const SANS = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const BLUE = "#4D80AA";
const CREAM = "#fbf4dc";

// Little milestone rewards — the "collectable" side of the page.
const BADGES = [
  { id: "first", label: "First Sip", need: 1, image: "/BronzePetr.png" },
  { id: "hydrated", label: "Hydrated", need: 5, image: "/SilverPetr.png" },
  { id: "quench", label: "Quenched", need: 10, image: "/GoldPetr.png" },
  { id: "poisoned", label: "Water Poisoned", need: 25, image: "/GalaxyPetr.png" },
];

const RARITY_ORDER = { legendary: 0, epic: 1, rare: 2, common: 3 };

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

export default function ProfilePage() {
  const { user, loggedIn } = useMockUser();
  const isMobile = useIsMobile();
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

  // Fountains this user has reviewed, with names filled in from the catalogue.
  const reviewed = useMemo(() => {
    if (!stats?.reviews) return [];
    const byId = new Map(fountains.map((f) => [f.fountain_id, f]));
    return stats.reviews.map((r) => {
      const f = byId.get(r.fountain_id);
      return {
        ...r,
        name: f?.name ?? `Fountain #${r.fountain_id}`,
        latitude: f?.latitude ?? null,
        longitude: f?.longitude ?? null,
      };
    });
  }, [stats, fountains]);

  // Keep the page in step with the database after an edit or delete (no full reload needed).
  function handleReviewSaved(updated) {
    setStats((s) =>
      s ? { ...s, reviews: s.reviews.map((r) => (r.review_id === updated.review_id ? { ...r, ...updated } : r)) } : s
    );
  }
  function handleReviewDeleted(reviewId) {
    setStats((s) => {
      if (!s) return s;
      const reviews = s.reviews.filter((r) => r.review_id !== reviewId);
      return { ...s, reviews, comments_count: reviews.length };
    });
  }

  // Stickers sorted rarest first: legendary, epic, rare, common (then A-Z within each group).
  const sortedStickers = useMemo(() => {
    const rank = (s) => RARITY_ORDER[String(s.rarity ?? "").toLowerCase()] ?? RARITY_ORDER.common + 1;
    return [...(stats?.stickers?.owned ?? [])].sort(
      (a, b) => rank(a) - rank(b) || String(a.name).localeCompare(String(b.name)),
    );
  }, [stats]);

  const totalVisits = stats?.total_visits ?? 0;
  const collected = stats?.fountains_visited ?? 0;
  const commentsCount = stats?.comments_count ?? 0;

  return (
    <div style={page}>
      <SiteHeader />

      <main style={isMobile ? contentMobile : content}>
        <h1 style={isMobile ? titleMobile : title}>
          {mounted && username ? `Hi ${username}!` : "Hi there!"} <WaterDrop height={isMobile ? 26 : 34} style={{ marginLeft: 4 }} />
        </h1>
        <p style={isMobile ? subtitleMobile : subtitle}>Hydrate and Level up!</p>

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
            <div style={isMobile ? statGridMobile : statGrid}>
              <Stat label="Total refills" value={totalVisits} mobile={isMobile} />
              <Stat label="Fountains collected" value={collected} mobile={isMobile} />
              <Stat label="Reviews written" value={commentsCount} mobile={isMobile} />
            </div>

            {/* Milestones */}
            <h2 style={isMobile ? sectionTitleMobile : sectionTitle}>Milestones</h2>
            <div className="badge-row" style={isMobile ? badgeRowMobile : badgeRow}>
              <style>{BADGE_CSS}</style>
              {BADGES.map((m) => {
                const earned = totalVisits >= m.need;
                return (
                  <div
                    key={m.id}
                    style={{ ...badge, opacity: earned ? 1 : 0.4 }}
                  >
                    <img
                      src={m.image}
                      alt={`${m.label} Petr`}
                      style={{ height: 150, width: "auto", objectFit: "contain" }}
                    />
                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                      {m.label}
                    </span>
                    <span style={{ fontSize: 12, color: "#6b7b8a" }}>
                      {earned ? "Earned" : `${m.need} refills`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Stickers unlocked by posting reviews */}
            <h2 style={isMobile ? sectionTitleMobile : sectionTitle}>
              Stickers
              {stats?.stickers?.total > 0 &&
                ` (${stats.stickers.owned.length}/${stats.stickers.total})`}
            </h2>
            {(stats?.stickers?.owned ?? []).length === 0 ? (
              <p style={muted}>
                Post a review at a fountain to unlock its Petr sticker.
              </p>
            ) : (
              <div style={stickerGrid}>
                <LegendaryStyle />
                {sortedStickers.map((s) => (
                  <div
                    key={s.collectible_id}
                    style={stickerCard}
                    className={isLegendary(s) ? "legendary-fx" : isEpic(s) ? "epic-fx" : isRare(s) ? "rare-fx" : undefined}
                  >
                    <img
                      src={stickerSrc(s.image_path)}
                      alt={s.name}
                      style={stickerImg}
                    />
                    <span style={{ fontWeight: 700, fontSize: 14, position: "relative", zIndex: 1 }}>{s.name}</span>
                    {s.rarity && (
                      <span style={{ fontSize: 12, color: isLegendary(s) ? "#f3e8ff" : isEpic(s) ? "#7a5200" : isRare(s) ? "#ffe4e6" : "#6b7b8a", textTransform: "capitalize", position: "relative", zIndex: 1 }}>
                        {s.rarity}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Fountains the user has reviewed */}
            <h2 style={isMobile ? sectionTitleMobile : sectionTitle}>
              Reviewed ({reviewed.length})
            </h2>

            {reviewed.length === 0 ? (
              <div style={isMobile ? emptyCardMobile : emptyCard}>
                <p style={{ margin: 0, fontSize: 16 }}>
                  You haven&apos;t reviewed any fountains yet.
                </p>
                <p style={{ margin: "6px 0 0", color: "#6b7b8a", fontSize: 14 }}>
                  Open a fountain and post a review to see it here.
                </p>
                <Link href="/homepage" style={cta}>
                  Find a fountain
                </Link>
              </div>
            ) : (
              <div style={isMobile ? visitGridMobile : visitGrid}>
                {reviewed.map((r) => (
                  <ReviewCard
                    key={r.review_id}
                    r={r}
                    mobile={isMobile}
                    onSaved={handleReviewSaved}
                    onDeleted={handleReviewDeleted}
                  />
                ))}
              </div>
            )}

            {/* Per-fountain breakdown */}
            <h2 style={isMobile ? sectionTitleMobile : sectionTitle}>Fountains</h2>

            {visits.length === 0 ? (
              <div style={isMobile ? emptyCardMobile : emptyCard}>
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
              <div style={isMobile ? visitGridMobile : visitGrid}>
                {visits.map((v) => (
                  <article key={v.fountain_id} style={isMobile ? visitCardMobile : visitCard}>
                    <div style={visitTop}>
                      <h3 style={isMobile ? visitNameMobile : visitName}>{v.name}</h3>
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

// One reviewed fountain, with Edit / Delete. Talks to PUT/DELETE /api/reviews/{id}, which
// update the same ratings + reviews tables the fountain pop-up reads from.
function ReviewCard({ r, mobile, onSaved, onDeleted }) {
  const [mode, setMode] = useState("view"); // view | edit | confirm
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function startEdit() {
    setStars(Math.round(Number(r.rating)) || 0);
    setText(r.body);
    setError("");
    setMode("edit");
  }

  async function save(e) {
    e.preventDefault();
    if (busy) return;
    if (stars < 1) return setError("Pick a star rating first.");
    if (!text.trim()) return setError("Review can't be blank.");
    setBusy(true);
    setError("");
    try {
      const updated = await updateReview(r.review_id, stars, text.trim());
      onSaved(updated);
      setMode("view");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await deleteReview(r.review_id);
      onDeleted(r.review_id); // this card disappears
    } catch (err) {
      setError(err.message);
      setMode("view");
      setBusy(false);
    }
  }

  const n = Math.round(Number(r.rating)) || 0;

  return (
    <article style={mobile ? visitCardMobile : visitCard}>
      <div style={visitTop}>
        <h3 style={mobile ? visitNameMobile : visitName}>{r.name}</h3>
        {mode !== "edit" && r.rating != null && (
          <span style={countPill} aria-label={`${n} out of 5 stars`}>
            {"★".repeat(n)}
            {"☆".repeat(5 - n)}
          </span>
        )}
      </div>

      {mode === "edit" ? (
        <form onSubmit={save} style={{ display: "grid", gap: 8 }}>
          <div role="radiogroup" aria-label="Star rating" style={{ display: "flex", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={stars === s}
                aria-label={`${s} star${s === 1 ? "" : "s"}`}
                onClick={() => setStars(s)}
                style={{ ...starBtn, color: s <= stars ? "#f6c445" : "#d7e2ea" }}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            rows={4}
            style={reviewTextarea}
          />
          <div style={actionRow}>
            <button type="submit" disabled={busy || !text.trim()} style={saveBtn}>
              {busy ? "Saving…" : "Save"}
            </button>
            <button type="button" disabled={busy} onClick={() => setMode("view")} style={ghostBtn}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p style={visitMeta}>Reviewed {formatDate(r.created_at)}</p>
          <p style={reviewBody}>{r.body}</p>
          {mode === "confirm" ? (
            <div style={{ display: "grid", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#6b7b8a" }}>
                Delete this review? Your star rating for this fountain is removed too.
              </span>
              <div style={actionRow}>
                <button type="button" disabled={busy} onClick={remove} style={dangerBtn}>
                  {busy ? "Deleting…" : "Yes, delete"}
                </button>
                <button type="button" disabled={busy} onClick={() => setMode("view")} style={ghostBtn}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={actionRow}>
              <button type="button" onClick={startEdit} style={linkBtn}>
                Edit
              </button>
              <button type="button" onClick={() => { setError(""); setMode("confirm"); }} style={{ ...linkBtn, color: "#c0392b" }}>
                Delete
              </button>
              {Number.isFinite(r.latitude) && Number.isFinite(r.longitude) && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  style={mapLink}
                >
                  Open in Google Maps ↗
                </a>
              )}
            </div>
          )}
        </>
      )}

      {error && (
        <p role="alert" style={{ margin: 0, fontSize: 13, color: "#c0392b" }}>
          {error}
        </p>
      )}
    </article>
  );
}

const actionRow = { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 14 };
const linkBtn = {
  background: "none",
  border: "none",
  padding: 0,
  fontSize: 13,
  fontWeight: 600,
  color: BLUE,
  cursor: "pointer",
  fontFamily: SANS,
};
const starBtn = { background: "none", border: "none", padding: 0, fontSize: 30, lineHeight: 1, cursor: "pointer" };
const reviewTextarea = {
  width: "100%",
  boxSizing: "border-box",
  resize: "vertical",
  border: "1px solid #d7e2ea",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  fontFamily: SANS,
  color: "#23395d",
  outline: "none",
};
const saveBtn = {
  border: "none",
  borderRadius: 10,
  background: "#ffc72c",
  color: BLUE,
  padding: "8px 18px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: SANS,
};
const ghostBtn = {
  border: "none",
  background: "none",
  color: "#6b7b8a",
  fontSize: 14,
  cursor: "pointer",
  fontFamily: SANS,
};
const dangerBtn = { ...saveBtn, background: "#c0392b", color: "#ffffff" };

const stickerGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
  gap: 14,
};
const stickerCard = {
  background: "#ffffff",
  borderRadius: 14,
  padding: "14px 10px",
  display: "grid",
  justifyItems: "center",
  gap: 4,
  textAlign: "center",
  boxShadow: "0 2px 8px rgba(28, 78, 158, 0.10)",
};
const stickerImg = { width: 110, height: 110, objectFit: "contain" };

function Stat({ label, value, mobile = false }) {
  return (
    <div style={mobile ? statCardMobile : statCard}>
      <span style={mobile ? statValueMobile : statValue}>{value}</span>
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

// Always 4 across (or 2x2 on narrow screens) so the cards never wrap into an
// uneven last row and the left/right margins stay equal as the window resizes.
const BADGE_CSS =
  ".badge-row{grid-template-columns:repeat(4,minmax(0,1fr))}" +
  "@media (max-width:760px){.badge-row{grid-template-columns:repeat(2,minmax(0,1fr))}}";

const badgeRow = {
  display: "grid",
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
  gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
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

const reviewBody = {
  margin: 0,
  fontSize: 14,
  color: "#23395d",
  lineHeight: 1.45,
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  overflowWrap: "anywhere",
};

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

// ---- Mobile layout ----------------------------------------------------------
const contentMobile = { ...content, padding: "18px 16px 48px" };

const titleMobile = { ...title, fontSize: 30, margin: "4px 0 4px" };

const subtitleMobile = { ...subtitle, fontSize: 15, margin: "0 0 20px" };

const statGridMobile = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 12,
};

const statCardMobile = { ...statCard, padding: "16px 18px" };

const statValueMobile = { ...statValue, fontSize: 32 };

const sectionTitleMobile = { ...sectionTitle, fontSize: 22, margin: "28px 0 12px" };

const badgeRowMobile = {
  display: "grid",
  gap: 12,
};

const visitGridMobile = { display: "grid", gridTemplateColumns: "1fr", gap: 12 };

const visitCardMobile = { ...visitCard, padding: "16px" };

const visitNameMobile = { ...visitName, fontSize: 18 };

const emptyCardMobile = { ...emptyCard, padding: "20px" };
