// src/google-oauth-flow.ts
import { randomBytes, randomUUID } from "crypto";
var GOOGLE_OAUTH_FLOW_COOKIE = "google_oauth_flow";
var GOOGLE_OAUTH_FLOW_TTL_SECONDS = 300;
var createGoogleOauthFlowState = (redirectTo) => ({
  nonce: randomBytes(32).toString("base64url"),
  requestId: randomUUID(),
  redirectTo
});
var readGoogleOauthFlowState = (cookies) => {
  const rawValue = cookies.get(GOOGLE_OAUTH_FLOW_COOKIE)?.value;
  if (!rawValue) {
    return null;
  }
  try {
    const parsed = JSON.parse(
      Buffer.from(rawValue, "base64url").toString("utf8")
    );
    if (!parsed || typeof parsed !== "object" || typeof parsed.nonce !== "string" || typeof parsed.requestId !== "string" || typeof parsed.redirectTo !== "string") {
      return null;
    }
    return {
      nonce: parsed.nonce,
      requestId: parsed.requestId,
      redirectTo: parsed.redirectTo
    };
  } catch {
    return null;
  }
};
var writeGoogleOauthFlowStateCookie = (cookies, state) => {
  cookies.set(
    GOOGLE_OAUTH_FLOW_COOKIE,
    Buffer.from(JSON.stringify(state), "utf8").toString("base64url"),
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/auth/google/callback",
      maxAge: GOOGLE_OAUTH_FLOW_TTL_SECONDS
    }
  );
};
var clearGoogleOauthFlowStateCookie = (cookies) => {
  cookies.set(GOOGLE_OAUTH_FLOW_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/auth/google/callback",
    maxAge: 0
  });
};

// src/server-redirect.ts
var SAME_ORIGIN_SENTINEL = "https://same-origin.local";
var resolveServerAuthRedirectTo = (redirectTo, fallback = "/") => {
  if (!redirectTo) {
    return fallback;
  }
  try {
    const normalizedRedirectTo = redirectTo.trim();
    const decodedRedirectTo = decodeURIComponent(normalizedRedirectTo);
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(decodedRedirectTo)) {
      return fallback;
    }
    const url = new URL(normalizedRedirectTo, SAME_ORIGIN_SENTINEL);
    if (url.origin !== SAME_ORIGIN_SENTINEL) {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}` || fallback;
  } catch {
    return fallback;
  }
};

export {
  GOOGLE_OAUTH_FLOW_COOKIE,
  createGoogleOauthFlowState,
  readGoogleOauthFlowState,
  writeGoogleOauthFlowStateCookie,
  clearGoogleOauthFlowStateCookie,
  resolveServerAuthRedirectTo
};
