"use client";

import Link from "next/link";
import { useMockUser } from "../lib/useMockUser";
import { useIsMobile } from "../lib/useIsMobile";
import WaterDrop from "./WaterDrop";

export default function SiteHeader() {
  const { loggedIn, logout } = useMockUser();
  const isMobile = useIsMobile();

  const linkStyle = isMobile ? navLinkMobile : navLink;
  const buttonStyle = isMobile ? navButtonMobile : navButton;

  return (
    <header style={isMobile ? headerMobile : header}>
      <Link href="/" style={isMobile ? brandMobile : brand}>
        Zot Water{" "}
        <WaterDrop
          height={isMobile ? 20 : 26}
          alt=""
          style={{ marginLeft: 4 }}
        />
      </Link>
      {/* Inline styles can't do :hover, so the hover color lives in this tiny stylesheet. */}
      <style>{HOVER_CSS}</style>
      <nav style={isMobile ? navRightMobile : navRight} className="site-nav">
        <Link href="/" style={linkStyle}>
          Home
        </Link>
        <Link href="/map" style={linkStyle}>
          Map
        </Link>
        {loggedIn && (
          <Link href="/profile" style={linkStyle}>
            Profile
          </Link>
        )}
        {loggedIn ? (
          <button type="button" onClick={logout} style={buttonStyle}>
            Log out
          </button>
        ) : (
          // Logged-out visitors go to the login page (it links to signup).
          <Link href="/login" style={linkStyle}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}

const SERIF = 'Epilogue, -apple-system, Roboto, Helvetica, sans-serif';
const BLUE = "#4D80AA";
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

// ---- Mobile layout ----------------------------------------------------------
const headerMobile = {
  ...header,
  padding: "14px 16px",
  flexWrap: "wrap",
  gap: 10,
  rowGap: 8,
};

const brandMobile = { ...brand, fontSize: 26 };

const navRightMobile = {
  ...navRight,
  gap: 18,
  flexWrap: "wrap",
};

const navLinkMobile = {
  ...navLink,
  fontSize: 15,
  padding: "4px 2px",
};

const navButtonMobile = {
  ...navButton,
  fontSize: 15,
  padding: "4px 2px",
};
