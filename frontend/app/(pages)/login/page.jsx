"use client";

import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      // TODO: redirect to map / dashboard after login works
      alert("Login successful!");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f6fa",
        fontFamily: "system-ui, sans-serif",
        padding: 24,
      }}
    >
      <section style={loginCard}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 42 }}>💧</div>
          <h1 style={{ margin: "8px 0 4px", color: "#0b4a8f", fontSize: 26 }}>
            Welcome back
          </h1>
          <p style={{ margin: 0, color: "#6b7b8a", fontSize: 14 }}>
            Log in to find your nearest water station
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <label style={labelWrap}>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={input}
              placeholder="anteater@uci.edu"
            />
          </label>

          <label style={labelWrap}>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={input}
              placeholder="••••••••"
            />
          </label>

          {error && <p style={{ color: "#c0392b", fontSize: 13 }}>{error}</p>}

          <button type="submit" style={primaryBtn}>
            Log In
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 14, marginTop: 24, color: "#6b7b8a" }}>
          New here?{" "}
          <a href="/signup" style={{ color: "#1668c1", fontWeight: 600 }}>
            Create an account
          </a>
        </p>
      </section>
    </main>
  );
}

const loginCard = {
  width: "100%",
  maxWidth: 400,
  background: "white",
  borderRadius: 16,
  padding: "40px 36px",
  boxShadow: "0 8px 30px rgba(11, 74, 143, 0.12)",
};

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
  background: "#1668c1",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "12px 0",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  marginTop: 8,
};
