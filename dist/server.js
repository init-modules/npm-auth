import {
  accountSummaryResponseSchema,
  completeRoleResponseSchema,
  createAuthActionsService,
  createAuthActionsUseCase,
  createCredentialsService,
  createCredentialsUseCase,
  createGoogleAuthService,
  createGoogleAuthUseCase,
  credentialsAuthResponseSchema,
  credentialsLoginPayloadSchema,
  credentialsPasswordResetPayloadSchema,
  credentialsRegisterPayloadSchema,
  credentialsRestorePasswordPayloadSchema,
  googleAuthRedirectUrlPayloadSchema,
  googleAuthTokenPayloadSchema,
  loginResponseSchema,
  logoutAllResponseSchema,
  logoutResponseSchema,
  meResponseSchema,
  passwordResetResponseSchema,
  registerResponseSchema,
  restorePasswordResponseSchema,
  userCompanySchema,
  userRoleSchema,
  userSchema
} from "./chunk-UYRHY5FJ.js";
import {
  GOOGLE_OAUTH_FLOW_COOKIE,
  clearGoogleOauthFlowStateCookie,
  createGoogleOauthFlowState,
  readGoogleOauthFlowState,
  resolveServerAuthRedirectTo,
  writeGoogleOauthFlowStateCookie
} from "./chunk-UVJJ3SNR.js";

// src/auth-provider-data.ts
function createAuthProviderDataResolver(handlers) {
  return async () => {
    const token = await handlers.resolveToken();
    if (!token) {
      return null;
    }
    const session = await handlers.resolveSession();
    if (!session) {
      return null;
    }
    return {
      ...session,
      token
    };
  };
}

// src/request-guards.ts
var getForwardedProtocol = (headers, fallbackProtocol) => {
  const forwardedProtocol = headers.get("x-forwarded-proto");
  const protocol = forwardedProtocol?.split(",")[0]?.trim();
  return protocol ? protocol.replace(/:$/, "") : fallbackProtocol;
};
var getCanonicalRequestOrigin = (headers, fallback) => {
  const protocol = getForwardedProtocol(headers, fallback.protocol);
  const host = headers.get("host") ?? fallback.host;
  return new URL(`${protocol.replace(/:$/, "")}://${host}`).origin;
};
var isSameOriginUrl = (value, requestOrigin) => new URL(value).origin === requestOrigin;
var isSameOriginMutation = (request, fallback) => {
  if (request.method === "GET" || request.method === "HEAD") {
    return true;
  }
  const origin = request.headers.get("origin");
  const requestOrigin = getCanonicalRequestOrigin(request.headers, fallback);
  try {
    if (origin) {
      return isSameOriginUrl(origin, requestOrigin);
    }
    const referer = request.headers.get("referer");
    if (referer) {
      return isSameOriginUrl(referer, requestOrigin);
    }
    const fetchSite = request.headers.get("sec-fetch-site");
    if (fetchSite) {
      return fetchSite === "same-origin";
    }
    return false;
  } catch {
    return false;
  }
};
export {
  GOOGLE_OAUTH_FLOW_COOKIE,
  accountSummaryResponseSchema,
  clearGoogleOauthFlowStateCookie,
  completeRoleResponseSchema,
  createAuthActionsService,
  createAuthActionsUseCase,
  createAuthProviderDataResolver,
  createCredentialsService,
  createCredentialsUseCase,
  createGoogleAuthService,
  createGoogleAuthUseCase,
  createGoogleOauthFlowState,
  credentialsAuthResponseSchema,
  credentialsLoginPayloadSchema,
  credentialsPasswordResetPayloadSchema,
  credentialsRegisterPayloadSchema,
  credentialsRestorePasswordPayloadSchema,
  getCanonicalRequestOrigin,
  getForwardedProtocol,
  googleAuthRedirectUrlPayloadSchema,
  googleAuthTokenPayloadSchema,
  isSameOriginMutation,
  loginResponseSchema,
  logoutAllResponseSchema,
  logoutResponseSchema,
  meResponseSchema,
  passwordResetResponseSchema,
  readGoogleOauthFlowState,
  registerResponseSchema,
  resolveServerAuthRedirectTo,
  restorePasswordResponseSchema,
  userCompanySchema,
  userRoleSchema,
  userSchema,
  writeGoogleOauthFlowStateCookie
};
