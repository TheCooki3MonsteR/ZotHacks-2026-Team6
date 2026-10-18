"use client";

import Link from "next/link";
import { useMockUser } from "../lib/useMockUser";

export default function SiteHeader() {
  const { loggedIn, logout } = useMockUser();

  return (
    <header style={header}>
      <Link href="/" style={brand}>
        Zot Water
      </Link>
      {/* Inline styles can't do :hover, so the hover color lives in this tiny stylesheet. */}
      <style>{HOVER_CSS}</style>
      <nav style={navRight} className="site-nav">
        <Link href="/" style={navLink}>
          Home
        </Link>
        <Link href="/map" style={navLink}>
          Map
        </Link>
        {loggedIn && (
          <Link href="/collectables" style={navLink}>
            Collectables
          </Link>
        )}
        {loggedIn ? (
          <button type="button" onClick={logout} style={navButton}>
            Log out
          </button>
        ) : (
          // Logged-out visitors go to the login page (it links to signup).
          <Link href="/login" style={navLink}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}

const SERIF = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const BLUE = "#1c4e9e";
const NAV_BLUE = "#3e6fb8";
const SANS = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';

// Nav links fade to a lighter blue on hover/keyboard focus.
const HOVER_CSS = `
.site-nav a,
.site-nav button { transition: color 0.15s ease; }
.site-nav a:hover,
.site-nav button:hover,
.site-nav a:focus-visible,
.site-nav button:focus-visible { color: #8fb6e8 !important; }
`;

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 32px",
  background: "#ffffff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};

const brand = {
  fontFamily: SERIF,
  fontSize: 26,
  fontWeight: 700,
  letterSpacing: "-0.01em",
  color: BLUE,
  textDecoration: "none",
};

const navRight = { display: "flex", alignItems: "center", gap: 22 };

const navLink = {
  color: NAV_BLUE,
  textDecoration: "none",
  fontSize: 15,
  fontWeight: 500,
  fontFamily: SANS,
};

const navButton = {
  ...navLink,
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
};
