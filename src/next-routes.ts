import { type NextRequest, NextResponse } from "next/server";
import {
	clearGoogleOauthFlowStateCookie,
	readGoogleOauthFlowState,
} from "./google-oauth-flow";
import { resolveServerAuthRedirectTo } from "./server-redirect";

const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24;

const readForwardedProto = (request: NextRequest) =>
	request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();

const isKnownLocalDevelopmentRequest = (request: NextRequest) => {
	if (process.env.NODE_ENV === "production") {
		return false;
	}

	const host = request.headers.get("host") ?? request.nextUrl.host;
	const hostname = host.split(":")[0]?.toLowerCase();

	return (
		hostname === "localhost" || hostname === "127.0.0.1" || hostname === "next"
	);
};

const shouldUseSecureAuthCookie = (request: NextRequest) => {
	if (isKnownLocalDevelopmentRequest(request)) {
		return (
			request.nextUrl.protocol === "https:" ||
			readForwardedProto(request) === "https"
		);
	}

	return true;
};

const resolveAuthCookieOptions = (request: NextRequest) => ({
	httpOnly: true,
	secure: shouldUseSecureAuthCookie(request),
	sameSite: "lax" as const,
	path: "/",
	maxAge: AUTH_COOKIE_MAX_AGE,
});

const escapeScriptString = (value: string) =>
	JSON.stringify(value).replace(/</g, "\\u003c");

const renderPopupResponse = ({
	requestId,
	error,
	message,
	redirectTo,
}: {
	requestId: string;
	error?: string;
	message?: string;
	redirectTo: string;
}) => {
	const payload = {
		type: "auth.google.callback",
		requestId,
		...(error ? { error } : {}),
		...(message ? { message } : {}),
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
				"cache-control": "no-store",
			},
		},
	);
};

export type NextAuthRouteOptions = {
	authCookieName?: string;
	authCookieHttpOnly?: boolean;
};

export type NextAuthRouteApiClient = {
	get<Response = unknown>(
		url: string,
		config?: {
			headers?: Record<string, string>;
			validateStatus?: () => boolean;
		},
	): Promise<{ data: Response; status: number }>;
	post<Response = unknown>(
		url: string,
		data?: unknown,
		config?: {
			headers?: Record<string, string>;
			validateStatus?: () => boolean;
		},
	): Promise<{ data: Response; status: number }>;
};

export const createGoogleAuthCallbackRouteHandler = ({
	api,
	authCookieName = "token",
	authCookieHttpOnly = false,
}: Pick<NextAuthRouteOptions, "authCookieName" | "authCookieHttpOnly"> & {
	api: NextAuthRouteApiClient;
}) => {
	const resolveCallbackRedirectUrl = (request: NextRequest) => {
		const redirectUrl = new URL(request.url);

		redirectUrl.searchParams.delete("code");
		redirectUrl.searchParams.delete("error");
		redirectUrl.searchParams.delete("message");

		return redirectUrl.toString();
	};
	const validateToken = async (token: string) => {
		const response = await api.get("/auth/v1/me", {
			headers: {
				accept: "application/json",
				authorization: `Bearer ${token}`,
			},
			validateStatus: () => true,
		});

		return response.status >= 200 && response.status < 300;
	};
	const exchangeCallbackCode = async (code: string, redirectUrl: string) => {
		const response = await api.post<{ token?: unknown }>(
			"/auth/v1/google/callback-code",
			{ code, redirect_url: redirectUrl },
			{
				headers: {
					accept: "application/json",
				},
				validateStatus: () => true,
			},
		);
		const payload = response.data;

		if (
			response.status < 200 ||
			response.status >= 300 ||
			typeof payload?.token !== "string"
		) {
			return null;
		}

		return payload.token.trim() || null;
	};

	return async (request: NextRequest) => {
		const code = request.nextUrl.searchParams.get("code")?.trim() ?? "";
		const requestId = request.nextUrl.searchParams.get("requestId") ?? "";
		const oauthState = request.nextUrl.searchParams.get("oauthState") ?? "";
		const flowState = readGoogleOauthFlowState(request.cookies);
		const redirectTo = resolveServerAuthRedirectTo(
			flowState?.redirectTo ?? request.nextUrl.searchParams.get("redirectTo"),
			"/",
		);
		const upstreamError = request.nextUrl.searchParams.get("error");
		const upstreamMessage = request.nextUrl.searchParams.get("message");
		const response = renderPopupResponse({
			requestId,
			redirectTo,
			error: upstreamError ?? undefined,
			message: upstreamMessage ?? undefined,
		});

		if (!requestId) {
			return renderPopupResponse({
				requestId: "",
				redirectTo,
				error: "invalid_popup_response",
			});
		}

		if (
			(oauthState || flowState) &&
			(!oauthState ||
				!flowState ||
				flowState.requestId !== requestId ||
				flowState.nonce !== oauthState)
		) {
			return renderPopupResponse({
				requestId,
				redirectTo,
				error: "invalid_popup_response",
			});
		}

		if (upstreamError) {
			clearGoogleOauthFlowStateCookie(response.cookies);

			return response;
		}

		const token = code
			? await exchangeCallbackCode(code, resolveCallbackRedirectUrl(request))
			: null;

		if (!token || !(await validateToken(token))) {
			const invalidResponse = renderPopupResponse({
				requestId,
				redirectTo,
				error: "invalid_google_auth",
			});
			clearGoogleOauthFlowStateCookie(invalidResponse.cookies);

			return invalidResponse;
		}

		clearGoogleOauthFlowStateCookie(response.cookies);
		response.cookies.set(authCookieName, token, {
			...resolveAuthCookieOptions(request),
			httpOnly: authCookieHttpOnly,
		});

		return response;
	};
};
