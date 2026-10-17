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

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
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
          username: form.username,
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
    <AuthShell title="CREATE AN ACCOUNT">
      <form onSubmit={handleSubmit} style={authCard}>
        <Field label="Username:" hint="Max 25 Characters">
          <input
            required
            maxLength={25}
            autoComplete="username"
            value={form.username}
            onChange={set("username")}
            style={authInput}
          />
        </Field>

        <Field label="Password:" hint="Max 30 Characters">
          <input
            type="password"
            required
            maxLength={30}
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
            style={authInput}
          />
        </Field>

        <Field label="Confirm Password:">
          <input
            type="password"
            required
            maxLength={30}
            autoComplete="new-password"
            value={form.confirm}
            onChange={set("confirm")}
            style={authInput}
          />
        </Field>

        {error && (
          <p role="alert" style={authError}>{error}</p>
        )}

        <button type="submit" style={authButton}>Sign Up</button>

        <a href="/login" style={authLink}>Click Here to Log in</a>
      </form>
    </AuthShell>
  );
}
