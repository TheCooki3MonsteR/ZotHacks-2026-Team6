// Real auth helpers: they talk to the FastAPI backend through the /backend proxy
// (see next.config.mjs). The login session lives in an httpOnly cookie that the
// backend sets, so the browser handles it automatically — we never store it ourselves.

// Tells header/pages that the login state changed (see useMockUser.js).
export const AUTH_EVENT = "zothydrate:auth";

// Backend errors look like {"detail": "text"} or, for validation, {"detail": [{"msg": "..."}]}.
export async function errorMessage(res, fallback) {
  try {
    const data = await res.json();
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail) && data.detail[0]?.msg) return data.detail[0].msg;
  } catch {
    // body wasn't JSON — use the fallback
  }
  return fallback;
}

async function post(path, body, fallback) {
  const res = await fetch(`/backend/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await errorMessage(res, fallback));
  return res.status === 204 ? null : res.json();
}

function announce() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_EVENT));
}

export async function register(username, password) {
  const user = await post("register", { username, password }, "Could not create account.");
  announce();
  return user;
}

export async function login(username, password) {
  const user = await post("login", { username, password }, "Invalid username or password.");
  announce();
  return user;
}

export async function logout() {
  await post("logout", null, "Could not log out.");
  announce();
}

// Returns {user_id, username} if the cookie is valid, otherwise null.
export async function getCurrentUser() {
  try {
    const res = await fetch("/backend/me", { credentials: "same-origin", cache: "no-store" });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}
