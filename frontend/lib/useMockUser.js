"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearUser } from "./auth";

// Keeps multiple components (header, page) in sync about the mock session.
const AUTH_EVENT = "zothydrate:auth";

// The "logged in" demo identity. It maps to a seeded demo user so backend
// writes (visits, comments) have a valid user to attach to.
const DEMO_USERNAME = "anteater_anna";

function readUser() {
  const stored = getUser();
  if (stored) return { username: DEMO_USERNAME, ...stored };
  // Preview the logged-in design without real auth: /homepage?as=user
  if (
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("as") === "user"
  ) {
    return { username: DEMO_USERNAME, displayName: "Anna Anteater" };
  }
  return null;
}

export function useMockUser() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const sync = () => setUser(readUser());
    sync();
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const logout = useCallback(() => {
    clearUser();
    window.dispatchEvent(new Event(AUTH_EVENT));
    router.push("/");
  }, [router]);

  return { user, loggedIn: Boolean(user), logout };
}
