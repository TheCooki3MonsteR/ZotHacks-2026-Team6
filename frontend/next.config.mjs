// Where the FastAPI backend lives. Locally that's uvicorn on port 8000.
// On Vercel, set API_URL in the project's Environment Variables once the backend is hosted.
const API_URL = process.env.API_URL || "http://127.0.0.1:8000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Browser calls /backend/login  ->  Next forwards to FastAPI's /api/login.
      // The browser only ever talks to Next.js, so the session cookie is same-site and no CORS is needed.
      { source: "/backend/:path*", destination: `${API_URL}/api/:path*` },
    ];
  },
};

export default nextConfig;
