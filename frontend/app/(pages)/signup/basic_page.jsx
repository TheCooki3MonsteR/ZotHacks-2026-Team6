"use client";

import { useState } from "react";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      if (!res.ok) {
        setError("Could not create account. That username may already be in use.");
        return;
      }

      // TODO: redirect to login or map after signup works
      alert("Account created!");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", fontFamily: "system-ui, sans-serif" }}>
      {/* Left branding panel */}
      <aside
        style={{
          flex: 1,
          background: "linear-gradient(160deg, #06325e 0%, #0b4a8f 60%, #1668c1 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 48px",
        }}
      >
        <span style={{ fontSize: 30, fontWeight: 700 }}>💧 Zot Hydrate</span>
        <h1 style={{ fontSize: 40, marginTop: 32, lineHeight: 1.2 }}>
          Stay hydrated,<br />Anteaters.
        </h1>
        <p style={{ opacity: 0.8, fontSize: 16, maxWidth: 380 }}>
          Create an account to save favorite stations, rate water pressure, and
          track your refills across campus.
        </p>
      </aside>

      {/* Right form panel */}
      <section
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "white",
        }}
      >
        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 380, display: "grid", gap: 16 }}>
          <h2 style={{ margin: 0, color: "#0b4a8f", fontSize: 26 }}>Create your account</h2>

          <label style={labelWrap}>
            Full name
            <input required value={form.name} onChange={set("name")} style={input} placeholder="Peter Anteater" />
          </label>

          <label style={labelWrap}>
            Email
            <input type="email" required value={form.email} onChange={set("email")} style={input} placeholder="anteater@uci.edu" />
          </label>

          <label style={labelWrap}>
            Password
            <input type="password" required value={form.password} onChange={set("password")} style={input} placeholder="At least 8 characters" />
          </label>

          <label style={labelWrap}>
            Confirm password
            <input type="password" required value={form.confirm} onChange={set("confirm")} style={input} placeholder="Repeat password" />
          </label>

          {error && <p style={{ color: "#c0392b", fontSize: 13 }}>{error}</p>}

          <button type="submit" style={primaryBtn}>Sign Up</button>

          <p style={{ fontSize: 14, color: "#6b7b8a", textAlign: "center" }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: "#1668c1", fontWeight: 600 }}>Log in</a>
          </p>
        </form>
      </section>
    </main>
  );
}

const labelWrap = {
  display: "grid",
  gap: 6,
  fontSize: 14,
  fontWeight: 600,
  color: "#33434f",
};

const input = {
  padding: "11px 14px",
  fontSize: 15,
  border: "1px solid #d7e2ea",
  borderRadius: 8,
  outline: "none",
};

const primaryBtn = {
  background: "#0b4a8f",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "12px 0",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
};
