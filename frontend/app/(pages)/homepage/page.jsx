export default function Homepage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0b4a8f 0%, #1668c1 55%, #2b8bd9 100%)",
        color: "white",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 40px",
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 700 }}>💧 Zot Hydrate</span>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="/login" style={navLink}>Log In</a>
          <a href="/signup" style={navLink}>Sign Up</a>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          padding: "90px 24px 60px",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: 48, margin: 0, lineHeight: 1.15 }}>
          Find water stations across UCI campus
        </h1>
        <p style={{ fontSize: 18, marginTop: 16, opacity: 0.85 }}>
          Search, rate, and discover hydration stations near you — so you're
          never far from a refill.
        </p>
        <div style={{ marginTop: 32, display: "flex", gap: 16, justifyContent: "center" }}>
          <a href="/login" style={ctaPrimary}>Get Started</a>
          <a href="/map" style={ctaGhost}>View Map →</a>
        </div>
      </section>

      {/* Feature cards */}
      <section
        style={{
          display: "flex",
          gap: 20,
          justifyContent: "center",
          flexWrap: "wrap",
          padding: "20px 24px 80px",
        }}
      >
        {[
          { icon: "🗺️", title: "Interactive Map", desc: "See every station at a glance." },
          { icon: "⭐", title: "Ratings", desc: "Check water pressure and reviews." },
          { icon: "📍", title: "Nearby", desc: "Filter by buildings you're in." },
        ].map((f) => (
          <div key={f.title} style={card}>
            <div style={{ fontSize: 34 }}>{f.icon}</div>
            <h3 style={{ margin: "10px 0 6px" }}>{f.title}</h3>
            <p style={{ margin: 0, opacity: 0.8, fontSize: 14 }}>{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

const navLink = {
  color: "white",
  textDecoration: "none",
  fontWeight: 500,
  fontSize: 15,
};

const ctaPrimary = {
  background: "#ffc72c",
  color: "#0b4a8f",
  fontWeight: 700,
  padding: "12px 28px",
  borderRadius: 8,
  textDecoration: "none",
};

const ctaGhost = {
  color: "white",
  border: "1px solid rgba(255,255,255,0.5)",
  padding: "12px 28px",
  borderRadius: 8,
  textDecoration: "none",
};

const card = {
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 14,
  padding: "24px 20px",
  width: 220,
  textAlign: "center",
};
