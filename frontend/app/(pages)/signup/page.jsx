"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell, {
  Field,
  authCard,
  authInput,
  authButton,
  authLink,
  authError,
} from "../../../components/AuthShell";
import { register } from "../../../lib/auth";

export default function Signup() {
  const router = useRouter();
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
      // The backend logs you in as part of registering, so go straight to the app.
      await register(form.username, form.password);
      router.push("/homepage");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <AuthShell title="CREATE AN ACCOUNT">
      <form onSubmit={handleSubmit} style={authCard}>
        <Field label="Username:" hint="3-25 letters, numbers, or _">
          <input
            required
            maxLength={25}
            autoComplete="username"
            value={form.username}
            onChange={set("username")}
            style={authInput}
          />
        </Field>

        <Field label="Password:" hint="8-30 Characters">
          <input
            type="password"
            required
            minLength={8}
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
