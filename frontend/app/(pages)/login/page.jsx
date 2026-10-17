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
import { login } from "../../../lib/auth";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await login(username, password);
      router.push("/homepage");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <AuthShell title="WELCOME BACK">
      <form onSubmit={handleSubmit} style={authCard}>
        <Field label="Username:">
          <input
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
