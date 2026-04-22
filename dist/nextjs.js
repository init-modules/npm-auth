import {
  clearGoogleOauthFlowStateCookie,
  readGoogleOauthFlowState,
  resolveServerAuthRedirectTo
} from "./chunk-UVJJ3SNR.js";

// src/next-routes.ts
import { NextResponse } from "next/server";
var AUTH_COOKIE_MAX_AGE = 60 * 60 * 24;
var readForwardedProto = (request) => request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
var isKnownLocalDevelopmentRequest = (request) => {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  const host = request.headers.get("host") ?? request.nextUrl.host;
  const hostname = host.split(":")[0]?.toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "next";
};
var shouldUseSecureAuthCookie = (request) => {
  if (isKnownLocalDevelopmentRequest(request)) {
    return request.nextUrl.protocol === "https:" || readForwardedProto(request) === "https";
  }
  return true;
};
var resolveAuthCookieOptions = (request) => ({
  httpOnly: true,
  secure: shouldUseSecureAuthCookie(request),
  sameSite: "lax",
  path: "/",
  maxAge: AUTH_COOKIE_MAX_AGE
});
var escapeScriptString = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
var renderPopupResponse = ({
  requestId,
  error,
  message,
  redirectTo
}) => {
  const payload = {
    type: "auth.google.callback",
    requestId,
    ...error ? { error } : {},
    ...message ? { message } : {}
  };
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>Google sign-in</title></head><body><script>
const payload = ${escapeScriptString(JSON.stringify(payload))};
if (window.opener) {
  window.opener.postMessage(JSON.parse(payload), window.location.origin);
  window.close();
} else {
  window.location.replace(${escapeScriptString(redirectTo)});
}
</script></body></html>`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store"
      }
    }
  );
};
var createGoogleAuthCallbackRouteHandler = ({
  api,
  authCookieName = "token",
  authCookieHttpOnly = false
}) => {
  const resolveCallbackRedirectUrl = (request) => {
    const redirectUrl = new URL(request.url);
    redirectUrl.searchParams.delete("code");
    redirectUrl.searchParams.delete("error");
    redirectUrl.searchParams.delete("message");
    return redirectUrl.toString();
  };
  const validateToken = async (token) => {
    const response = await api.get("/auth/v1/me", {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`
      },
      validateStatus: () => true
    });
    return response.status >= 200 && response.status < 300;
  };
  const exchangeCallbackCode = async (code, redirectUrl) => {
    const response = await api.post(
      "/auth/v1/google/callback-code",
      { code, redirect_url: redirectUrl },
      {
        headers: {
          accept: "application/json"
        },
        validateStatus: () => true
      }
    );
    const payload = response.data;
    if (response.status < 200 || response.status >= 300 || typeof payload?.token !== "string") {
      return null;
    }
    return payload.token.trim() || null;
  };
  return async (request) => {
    const code = request.nextUrl.searchParams.get("code")?.trim() ?? "";
    const requestId = request.nextUrl.searchParams.get("requestId") ?? "";
    const oauthState = request.nextUrl.searchParams.get("oauthState") ?? "";
    const flowState = readGoogleOauthFlowState(request.cookies);
    const redirectTo = resolveServerAuthRedirectTo(
      flowState?.redirectTo ?? request.nextUrl.searchParams.get("redirectTo"),
      "/"
    );
    const upstreamError = request.nextUrl.searchParams.get("error");
    const upstreamMessage = request.nextUrl.searchParams.get("message");
    const response = renderPopupResponse({
      requestId,
      redirectTo,
      error: upstreamError ?? void 0,
      message: upstreamMessage ?? void 0
    });
    if (!requestId) {
      return renderPopupResponse({
        requestId: "",
        redirectTo,
        error: "invalid_popup_response"
      });
    }
    if ((oauthState || flowState) && (!oauthState || !flowState || flowState.requestId !== requestId || flowState.nonce !== oauthState)) {
      return renderPopupResponse({
        requestId,
        redirectTo,
        error: "invalid_popup_response"
      });
    }
    if (upstreamError) {
      clearGoogleOauthFlowStateCookie(response.cookies);
      return response;
    }
    const token = code ? await exchangeCallbackCode(code, resolveCallbackRedirectUrl(request)) : null;
    if (!token || !await validateToken(token)) {
      const invalidResponse = renderPopupResponse({
        requestId,
        redirectTo,
        error: "invalid_google_auth"
      });
      clearGoogleOauthFlowStateCookie(invalidResponse.cookies);
      return invalidResponse;
    }
    clearGoogleOauthFlowStateCookie(response.cookies);
    response.cookies.set(authCookieName, token, {
      ...resolveAuthCookieOptions(request),
      httpOnly: authCookieHttpOnly
    });
    return response;
  };
};
export {
  createGoogleAuthCallbackRouteHandler
};
