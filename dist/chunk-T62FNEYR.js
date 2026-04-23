import {
  accountSummaryResponseSchema,
  completeRoleResponseSchema,
  createAuthActionsService,
  createAuthActionsUseCase,
  createCredentialsService,
  createCredentialsUseCase,
  createGoogleAuthService,
  createGoogleAuthUseCase,
  logoutAllResponseSchema,
  logoutResponseSchema,
  meResponseSchema
} from "./chunk-UYRHY5FJ.js";

// src/auth-redirect.ts
var DEFAULT_AUTH_REDIRECT_TO = "/dashboard";
var resolveAuthRedirectTo = (redirectTo, fallback = DEFAULT_AUTH_REDIRECT_TO) => {
  if (typeof window === "undefined") {
    return redirectTo || fallback;
  }
  if (!redirectTo) {
    return fallback;
  }
  try {
    const url = new URL(redirectTo, window.location.origin);
    if (url.origin !== window.location.origin) {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}` || fallback;
  } catch {
    return fallback;
  }
};

// src/axios-client.ts
import axios from "axios";
import Cookies from "js-cookie";
var isServer = typeof window === "undefined";
var trimTrailingSlashes = (value) => value.replace(/\/+$/, "");
var trimLeadingSlashes = (value) => value.replace(/^\/+/, "");
var createAuthAxiosLocaleStore = () => {
  let currentRequestLocale = null;
  return {
    setRequestLocale(locale) {
      currentRequestLocale = typeof locale === "string" && locale.trim() !== "" ? locale.trim().toLowerCase() : null;
    },
    getRequestLocale() {
      return currentRequestLocale;
    }
  };
};
var readCookieValue = (cookieHeader, name) => {
  if (!cookieHeader) {
    return null;
  }
  for (const segment of cookieHeader.split(";")) {
    const [rawKey, ...rawValueParts] = segment.trim().split("=");
    if (rawKey === name) {
      const rawValue = rawValueParts.join("=");
      return rawValue ? decodeURIComponent(rawValue) : "";
    }
  }
  return null;
};
var resolveDefaultApiBaseUrl = () => {
  const internalApiBaseUrl = process.env.API_ENDPOINT?.trim();
  const publicApiBaseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT?.trim();
  if (isServer) {
    return internalApiBaseUrl || publicApiBaseUrl;
  }
  return publicApiBaseUrl || internalApiBaseUrl;
};
var createAuthAxiosClient = ({
  authCookieName = "token",
  visitorSessionCookieName = "visitor_session",
  visitorSessionHeaderName = "X-Visitor-Session",
  ensureVisitorSession: ensureVisitorSession2,
  resolveApiBaseUrl = resolveDefaultApiBaseUrl,
  timeout = 3e3,
  withCredentials = false
} = {}) => {
  const localeStore = createAuthAxiosLocaleStore();
  const getApiBaseUrl = resolveApiBaseUrl;
  const getApiUrl = (path) => {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      throw new Error("API endpoint is not configured");
    }
    return `${trimTrailingSlashes(baseUrl)}/${trimLeadingSlashes(path)}`;
  };
  const api = axios.create({
    baseURL: getApiBaseUrl(),
    timeout,
    withCredentials
  });
  api.interceptors.request.use(async (config) => {
    config.baseURL = getApiBaseUrl();
    let token = null;
    let visitorSession = null;
    let requestLocale = null;
    if (isServer) {
      const { headers } = await import("next/headers");
      const requestHeaders = await headers();
      const cookieHeader = requestHeaders.get("cookie");
      token = readCookieValue(cookieHeader, authCookieName);
      visitorSession = readCookieValue(cookieHeader, visitorSessionCookieName);
      for (const [name, value] of [
        ["x-forwarded-for", requestHeaders.get("x-forwarded-for")],
        ["x-real-ip", requestHeaders.get("x-real-ip")],
        ["cf-connecting-ip", requestHeaders.get("cf-connecting-ip")],
        ["forwarded", requestHeaders.get("forwarded")],
        ["accept-language", requestHeaders.get("accept-language")],
        ["x-locale", requestHeaders.get("x-locale")],
        ["user-agent", requestHeaders.get("user-agent")]
      ]) {
        if (value) {
          config.headers.set(name, value);
        }
      }
      requestLocale = requestHeaders.get("x-locale") ?? null;
    } else {
      token = Cookies.get(authCookieName) ?? null;
      visitorSession = ensureVisitorSession2?.() ?? Cookies.get(visitorSessionCookieName) ?? null;
      requestLocale = document.documentElement.lang || null;
    }
    requestLocale = localeStore.getRequestLocale() ?? requestLocale;
    if (requestLocale) {
      config.headers.set("x-locale", requestLocale);
      config.headers.set("accept-language", requestLocale);
    }
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers.delete("Authorization");
    }
    if (visitorSession) {
      config.headers.set(visitorSessionHeaderName, visitorSession);
    }
    return config;
  });
  return {
    api,
    getApiBaseUrl,
    getApiUrl,
    getRequestLocale: localeStore.getRequestLocale,
    setRequestLocale: localeStore.setRequestLocale
  };
};

// src/dialog.tsx
import { useCallback, useEffect, useState } from "react";
var AuthDialogFrame = ({
  open,
  onOpenChange,
  defaultMode = "login",
  title,
  description,
  redirectTo,
  fallbackRedirectTo,
  refreshOnSuccess,
  onSuccess,
  role,
  renderFrame,
  renderLogin,
  renderRegister
}) => {
  const [mode, setMode] = useState(defaultMode);
  useEffect(() => {
    if (open) {
      setMode(defaultMode);
    }
  }, [defaultMode, open]);
  const handleAuthSuccess = useCallback(async () => {
    onOpenChange(false);
    if (onSuccess) {
      await onSuccess();
    }
  }, [onOpenChange, onSuccess]);
  const commonProps = {
    redirectTo,
    fallbackRedirectTo,
    refreshOnSuccess,
    onSuccess: handleAuthSuccess,
    role
  };
  return renderFrame({
    open,
    onOpenChange,
    title,
    description,
    children: mode === "login" ? renderLogin({
      ...commonProps,
      onSwitch: () => setMode("register")
    }) : renderRegister({
      ...commonProps,
      onSwitch: () => setMode("login")
    })
  });
};

// src/errors.ts
import axios2 from "axios";
var AUTH_ACTION_FALLBACK_MESSAGES = {
  login: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0432\u043E\u0439\u0442\u0438. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437.",
  register: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044E. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437.",
  "password-reset": "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0432\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u0441\u0431\u0440\u043E\u0441 \u043F\u0430\u0440\u043E\u043B\u044F. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437."
};
var getFirstNestedMessage = (value) => {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const message = getFirstNestedMessage(entry);
      if (message) {
        return message;
      }
    }
    return null;
  }
  if (typeof value === "object") {
    for (const nestedValue of Object.values(value)) {
      const message = getFirstNestedMessage(nestedValue);
      if (message) {
        return message;
      }
    }
  }
  return null;
};
var readApiErrorMessage = (value) => {
  if (!value || typeof value !== "object") {
    return null;
  }
  const payload = value;
  return typeof payload.message === "string" ? payload.message : getFirstNestedMessage(payload.errors);
};
var getAuthActionErrorMessage = (error, intent) => {
  if (axios2.isAxiosError(error)) {
    const apiMessage2 = readApiErrorMessage(error.response?.data);
    if (apiMessage2) {
      return apiMessage2;
    }
  }
  const apiMessage = readApiErrorMessage(error);
  if (apiMessage) {
    return apiMessage;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return AUTH_ACTION_FALLBACK_MESSAGES[intent];
};

// src/google-auth-popup.ts
var GOOGLE_AUTH_POPUP_MESSAGE_TYPE = "auth.google.callback";
var DEFAULT_GOOGLE_REDIRECT_TO = "/dashboard";
var GoogleAuthError = class extends Error {
  code;
  constructor(code) {
    super(getGoogleAuthErrorMessage(code));
    this.name = "GoogleAuthError";
    this.code = code;
  }
};
var createGoogleAuthRequestId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
var resolveGoogleAuthRedirectTo = (redirectTo) => {
  return resolveAuthRedirectTo(redirectTo, DEFAULT_GOOGLE_REDIRECT_TO) || DEFAULT_GOOGLE_REDIRECT_TO;
};
var buildGoogleCallbackUrl = ({
  redirectTo,
  requestId
}) => {
  if (typeof window === "undefined") {
    throw new Error("Google callback URL can be built only in the browser");
  }
  const url = new URL("/auth/google/callback", window.location.origin);
  url.searchParams.set("requestId", requestId);
  url.searchParams.set("redirectTo", resolveGoogleAuthRedirectTo(redirectTo));
  return url.toString();
};
var createGoogleAuthPopupMessage = (message) => ({
  type: GOOGLE_AUTH_POPUP_MESSAGE_TYPE,
  ...message
});
var isGoogleAuthPopupMessage = (value) => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const message = value;
  return message.type === GOOGLE_AUTH_POPUP_MESSAGE_TYPE && typeof message.requestId === "string";
};
var getGoogleAuthErrorMessage = (error) => {
  const code = error instanceof GoogleAuthError ? error.code : typeof error === "string" ? error : error instanceof Error ? error.message : null;
  switch (code) {
    case "popup_blocked":
      return "\u0411\u0440\u0430\u0443\u0437\u0435\u0440 \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043B \u043E\u043A\u043D\u043E Google. \u0420\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435 pop-up \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437.";
    case "popup_closed":
      return "\u041E\u043A\u043D\u043E \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u0438 Google \u0431\u044B\u043B\u043E \u0437\u0430\u043A\u0440\u044B\u0442\u043E \u0434\u043E \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u044F \u0432\u0445\u043E\u0434\u0430.";
    case "invalid_popup_response":
      return "Google \u0432\u0435\u0440\u043D\u0443\u043B \u043D\u0435\u043F\u043E\u043B\u043D\u044B\u0439 \u043E\u0442\u0432\u0435\u0442. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437.";
    case "invalid_google_auth":
      return "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044E \u0447\u0435\u0440\u0435\u0437 Google.";
    case "invalid_google_user":
      return "Google \u043D\u0435 \u0432\u0435\u0440\u043D\u0443\u043B \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F.";
    case "google_email_not_verified":
      return "\u0412 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0435 Google \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D email.";
    case "failed_to_load_user":
      return "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043F\u0440\u043E\u0444\u0438\u043B\u044C \u043F\u043E\u0441\u043B\u0435 \u0432\u0445\u043E\u0434\u0430 \u0447\u0435\u0440\u0435\u0437 Google.";
    case "role_conflict":
      return "\u042D\u0442\u043E\u0442 \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u043D\u0435\u043B\u044C\u0437\u044F \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0432 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0438.";
    default:
      return typeof code === "string" && code.length > 0 ? code : "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0432\u043E\u0439\u0442\u0438 \u0447\u0435\u0440\u0435\u0437 Google.";
  }
};

// src/next-client.ts
import Cookies2 from "js-cookie";
var AUTH_COOKIE = "token";
var isServer2 = typeof window === "undefined";
var createNextAuthCookieStore = () => ({
  get: (name) => Cookies2.get(name),
  set: async (name, value) => {
    if (name === AUTH_COOKIE && value.trim() === "") {
      Cookies2.remove(name);
      return;
    }
    Cookies2.set(name, value, {
      path: "/",
      sameSite: "lax"
    });
  },
  delete: async (name) => {
    Cookies2.remove(name);
  },
  remove: (name) => {
    Cookies2.remove(name);
  }
});
var createNextAuthActionsService = (api) => isServer2 ? createAuthActionsService(api) : {
  async me() {
    const response = await api.get("/auth/v1/me");
    const user = meResponseSchema.parse(response.data);
    try {
      const summaryResponse = await api.get("/app/v1/account/summary");
      const summary = accountSummaryResponseSchema.parse(
        summaryResponse.data
      );
      return {
        ...user,
        company: summary.company ?? null
      };
    } catch {
      return user;
    }
  },
  async completeRole(role) {
    const response = await api.post("/auth/v1/complete-role", { role });
    return completeRoleResponseSchema.parse(response.data);
  },
  async logout() {
    const response = await api.post("/auth/v1/logout");
    Cookies2.remove(AUTH_COOKIE);
    return logoutResponseSchema.parse(response.data);
  },
  async logoutAll() {
    const response = await api.post("/auth/v1/logout-all");
    return logoutAllResponseSchema.parse(response.data);
  }
};
var createNextCredentialsService = (api) => createCredentialsService(api);
var createNextGoogleAuthService = (getApiUrl) => createGoogleAuthService(getApiUrl);
var createNextAuthUseCases = ({
  api,
  getApiUrl
}) => {
  const cookieStore = createNextAuthCookieStore();
  const authActionsUseCase = createAuthActionsUseCase({
    service: createNextAuthActionsService(api),
    cookieStore
  });
  const credentialsUseCase = createCredentialsUseCase({
    service: createNextCredentialsService(api),
    cookieStore
  });
  const googleAuthUseCase = createGoogleAuthUseCase({
    service: createNextGoogleAuthService(getApiUrl),
    authActionsUseCase,
    cookieStore
  });
  return {
    authActionsUseCase,
    credentialsUseCase,
    googleAuthUseCase,
    cookieStore
  };
};

// src/provider.tsx
import { createContext, useContext, useState as useState2 } from "react";
import { jsx } from "react/jsx-runtime";
var createAuthRuntime = () => {
  const AuthContext = createContext(null);
  const AuthProvider = ({
    children,
    initialState,
    hooks
  }) => {
    const [authState, setAuthState] = useState2(initialState);
    const credentialsActions = hooks.useCredentialsActions({ setAuthState });
    const sessionActions = hooks.useSessionActions({ setAuthState });
    const googleActions = hooks.useGoogleActions({ setAuthState });
    return /* @__PURE__ */ jsx(
      AuthContext.Provider,
      {
        value: {
          ...credentialsActions,
          ...sessionActions,
          ...googleActions,
          state: authState
        },
        children
      }
    );
  };
  const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
  };
  return {
    AuthProvider,
    useAuthContext
  };
};

// src/runtime-hooks.tsx
import { useCallback as useCallback2, useEffect as useEffect2, useState as useState3 } from "react";
var openCenteredPopup = (url) => {
  const width = 520;
  const height = 720;
  const left = window.screenX + Math.max((window.outerWidth - width) / 2, 0);
  const top = window.screenY + Math.max((window.outerHeight - height) / 2, 0);
  return window.open(
    url,
    "google-auth-popup",
    [
      "popup=yes",
      "toolbar=no",
      "menubar=no",
      "width=520",
      "height=720",
      `left=${Math.round(left)}`,
      `top=${Math.round(top)}`
    ].join(",")
  );
};
var waitForGooglePopupResult = ({
  requestId,
  url
}) => new Promise((resolve, reject) => {
  const popup = openCenteredPopup(url);
  if (!popup) {
    reject(new GoogleAuthError("popup_blocked"));
    return;
  }
  let isSettled = false;
  const cleanup = () => {
    window.removeEventListener("message", onMessage);
    window.clearInterval(closeWatcher);
  };
  const settleError = (code) => {
    if (isSettled) {
      return;
    }
    isSettled = true;
    cleanup();
    reject(new GoogleAuthError(code));
  };
  const onMessage = (event) => {
    if (event.origin !== window.location.origin) {
      return;
    }
    if (event.source !== popup) {
      return;
    }
    if (!isGoogleAuthPopupMessage(event.data)) {
      return;
    }
    if (event.data.requestId !== requestId) {
      return;
    }
    isSettled = true;
    cleanup();
    if (!popup.closed) {
      popup.close();
    }
    if (event.data.error) {
      reject(event.data.message ?? new GoogleAuthError(event.data.error));
      return;
    }
    resolve();
  };
  const closeWatcher = window.setInterval(() => {
    if (popup.closed) {
      settleError("popup_closed");
    }
  }, 500);
  window.addEventListener("message", onMessage);
  popup.focus();
});
var createAuthFlowCompletionHook = ({
  useNavigation
}) => {
  return function useAuthFlowCompletion() {
    const router = useNavigation();
    return useCallback2(
      async (options) => {
        if (options?.onSuccess) {
          await options.onSuccess();
        }
        if (options?.refreshOnSuccess) {
          router.refresh();
        }
        const redirectTo = resolveAuthRedirectTo(options?.redirectTo, null);
        if (redirectTo) {
          router.push(redirectTo);
        }
      },
      [router]
    );
  };
};
var createAuthRuntimeHooks = ({
  authActionsUseCase,
  credentialsUseCase,
  googleAuthUseCase,
  cookieStore,
  useNavigation
}) => {
  const useAuthFlowCompletion = createAuthFlowCompletionHook({
    useNavigation
  });
  const useSessionActions = ({
    setAuthState
  }) => {
    const [isLogoutRunning, setIsLogoutRunning] = useState3(false);
    const [logoutError, setLogoutError] = useState3(null);
    const router = useNavigation();
    useEffect2(() => {
      if (cookieStore.get?.("is-logging-out")) {
        setAuthState(null);
        void cookieStore.remove?.("is-logging-out");
        void cookieStore.delete?.("is-logging-out");
      }
    }, [router.pathname, setAuthState]);
    const logout = useCallback2(
      async (options) => {
        const { redirectTo = "/" } = options ?? {};
        try {
          setIsLogoutRunning(true);
          await authActionsUseCase.logout();
          if (redirectTo) {
            router.push(redirectTo);
            void cookieStore.set?.("is-logging-out", "true");
          } else {
            setIsLogoutRunning(false);
            setAuthState(null);
          }
        } catch (error) {
          setLogoutError(error);
          setIsLogoutRunning(false);
        }
      },
      [router, setAuthState]
    );
    const completeRole = useCallback2(
      async (role) => {
        const response = await authActionsUseCase.completeRole(role);
        setAuthState(
          (current) => current ? {
            ...current,
            user: response.user
          } : {
            token: null,
            user: response.user
          }
        );
      },
      [setAuthState]
    );
    const refreshSession = useCallback2(async () => {
      const user = await authActionsUseCase.me();
      setAuthState(
        user ? {
          user,
          token: null
        } : null
      );
    }, [setAuthState]);
    return {
      completeRole,
      refreshSession,
      logout,
      isLogoutRunning,
      logoutError
    };
  };
  const useCredentialsActions = ({
    setAuthState
  }) => {
    const [isRegisterRunning, setIsRegisterRunning] = useState3(false);
    const [registerError, setRegisterError] = useState3(null);
    const [isLoginRunning, setIsLoginRunning] = useState3(false);
    const [loginError, setLoginError] = useState3(null);
    const [isPasswordResetRunning, setIsPasswordResetRunning] = useState3(false);
    const [passwordResetError, setPasswordResetError] = useState3(
      null
    );
    const [isRestorePasswordRunning, setIsRestorePasswordRunning] = useState3(false);
    const [restorePasswordError, setRestorePasswordError] = useState3(null);
    const register = useCallback2(
      async (data) => {
        try {
          setIsRegisterRunning(true);
          setRegisterError(null);
          const response = await credentialsUseCase.register(data);
          const hydratedUser = await authActionsUseCase.me();
          const user = hydratedUser ?? response.user;
          setAuthState({ user, token: null });
          return { ...response, user };
        } catch (error) {
          setRegisterError(getAuthActionErrorMessage(error, "register"));
          throw error;
        } finally {
          setIsRegisterRunning(false);
        }
      },
      [setAuthState]
    );
    const login = useCallback2(
      async (data) => {
        try {
          setIsLoginRunning(true);
          setLoginError(null);
          const response = await credentialsUseCase.login(data);
          const hydratedUser = await authActionsUseCase.me();
          const user = hydratedUser ?? response.user;
          setAuthState({ user, token: null });
          return { ...response, user };
        } catch (error) {
          setLoginError(getAuthActionErrorMessage(error, "login"));
          throw error;
        } finally {
          setIsLoginRunning(false);
        }
      },
      [setAuthState]
    );
    const requestPasswordReset = useCallback2(
      async (data) => {
        try {
          setIsPasswordResetRunning(true);
          setPasswordResetError(null);
          return await credentialsUseCase.requestPasswordReset(data);
        } catch (error) {
          setPasswordResetError(
            getAuthActionErrorMessage(error, "password-reset")
          );
          throw error;
        } finally {
          setIsPasswordResetRunning(false);
        }
      },
      []
    );
    const restorePassword = useCallback2(
      async (data) => {
        try {
          setIsRestorePasswordRunning(true);
          setRestorePasswordError(null);
          return await credentialsUseCase.restorePassword(data);
        } catch (error) {
          setRestorePasswordError(getAuthActionErrorMessage(error, "password-reset"));
          throw error;
        } finally {
          setIsRestorePasswordRunning(false);
        }
      },
      []
    );
    return {
      login,
      register,
      requestPasswordReset,
      restorePassword,
      isRegisterRunning,
      registerError,
      isLoginRunning,
      loginError,
      isPasswordResetRunning,
      passwordResetError,
      isRestorePasswordRunning,
      restorePasswordError
    };
  };
  const useGoogleActions = ({
    setAuthState
  }) => {
    const [isGoogleLoginRunning, setIsGoogleLoginRunning] = useState3(false);
    const [googleLoginError, setGoogleLoginError] = useState3(
      null
    );
    const completeAuthFlow = useAuthFlowCompletion();
    const loginWithGoogle = useCallback2(
      async (options) => {
        const redirectTo = resolveAuthRedirectTo(options?.redirectTo, null);
        const fallbackRedirectTo = resolveGoogleAuthRedirectTo(
          options?.fallbackRedirectTo ?? options?.redirectTo
        );
        const requestId = createGoogleAuthRequestId();
        try {
          setGoogleLoginError(null);
          setIsGoogleLoginRunning(true);
          const callbackUrl = buildGoogleCallbackUrl({
            redirectTo: fallbackRedirectTo,
            requestId
          });
          const redirectUrl = googleAuthUseCase.getRedirectUrl({
            redirectUrl: callbackUrl,
            role: options?.role
          });
          await waitForGooglePopupResult({
            requestId,
            url: redirectUrl
          });
          const user = await authActionsUseCase.me();
          if (!user) {
            throw new GoogleAuthError("failed_to_load_user");
          }
          setAuthState({
            user,
            token: null
          });
          await completeAuthFlow({
            ...options,
            redirectTo
          });
        } catch (error) {
          setGoogleLoginError(getGoogleAuthErrorMessage(error));
        } finally {
          setIsGoogleLoginRunning(false);
        }
      },
      [completeAuthFlow, setAuthState]
    );
    return {
      loginWithGoogle,
      isGoogleLoginRunning,
      googleLoginError
    };
  };
  return {
    useCredentialsActions,
    useSessionActions,
    useGoogleActions,
    useAuthFlowCompletion
  };
};

// src/visitor-session.ts
import Cookies3 from "js-cookie";
var VISITOR_SESSION_COOKIE = "visitor_session";
var VISITOR_SESSION_HEADER = "X-Visitor-Session";
var VISITOR_SESSION_EXPIRY_DAYS = 3650;
var formatUuidV4 = (bytes) => {
  bytes[6] = bytes[6] & 15 | 64;
  bytes[8] = bytes[8] & 63 | 128;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join("")
  ].join("-");
};
function createVisitorSessionId() {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  return formatUuidV4(bytes);
}
function getVisitorSession() {
  return Cookies3.get(VISITOR_SESSION_COOKIE) ?? null;
}
function ensureVisitorSession() {
  const existing = getVisitorSession();
  if (existing) {
    return existing;
  }
  const value = createVisitorSessionId();
  Cookies3.set(VISITOR_SESSION_COOKIE, value, {
    expires: VISITOR_SESSION_EXPIRY_DAYS,
    sameSite: "lax"
  });
  return value;
}

export {
  resolveAuthRedirectTo,
  createAuthAxiosLocaleStore,
  createAuthAxiosClient,
  AuthDialogFrame,
  getAuthActionErrorMessage,
  GOOGLE_AUTH_POPUP_MESSAGE_TYPE,
  GoogleAuthError,
  createGoogleAuthRequestId,
  resolveGoogleAuthRedirectTo,
  buildGoogleCallbackUrl,
  createGoogleAuthPopupMessage,
  isGoogleAuthPopupMessage,
  getGoogleAuthErrorMessage,
  createNextAuthCookieStore,
  createNextAuthActionsService,
  createNextCredentialsService,
  createNextGoogleAuthService,
  createNextAuthUseCases,
  createAuthRuntime,
  createAuthFlowCompletionHook,
  createAuthRuntimeHooks,
  VISITOR_SESSION_COOKIE,
  VISITOR_SESSION_HEADER,
  getVisitorSession,
  ensureVisitorSession
};
