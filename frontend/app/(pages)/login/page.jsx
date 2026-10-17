"use client";

import { useState } from "react";
import AuthShell, {
  Field,
  authCard,
  authInput,
  authButton,
  authLink,
  authError,
} from "../../../components/AuthShell";

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
    <AuthShell title="WELCOME BACK">
      <form onSubmit={handleSubmit} style={authCard}>
        <Field label="Email:">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={authInput}
          />
        </Field>

        <Field label="Password:">
          <input
            type="password"
            required
            maxLength={30}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={authInput}
          />
        </Field>

        {error && (
          <p role="alert" style={authError}>{error}</p>
        )}

        <button type="submit" style={authButton}>Log In</button>

        <a href="/signup" style={authLink}>Click Here to Sign Up</a>
      </form>
    </AuthShell>
  );
}
