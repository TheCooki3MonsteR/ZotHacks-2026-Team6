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
      <nav style={navRight}>
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

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "22px 44px",
  background: "#ffffff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
};

const brand = {
  fontFamily: SERIF,
  fontSize: 36,
  fontWeight: 700,
  color: BLUE,
  textDecoration: "none",
};

const navRight = { display: "flex", alignItems: "center", gap: 44 };

const navLink = {
  color: NAV_BLUE,
  textDecoration: "none",
  fontSize: 20,
  fontFamily: SANS,
};

const navButton = {
  ...navLink,
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
};
