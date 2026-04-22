import axios from "axios";
import Cookies from "js-cookie";

const isServer = typeof window === "undefined";
const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");
const trimLeadingSlashes = (value: string) => value.replace(/^\/+/, "");

export type AuthAxiosClientOptions = {
	authCookieName?: string;
	visitorSessionCookieName?: string;
	visitorSessionHeaderName?: string;
	ensureVisitorSession?: () => string | null;
	resolveApiBaseUrl?: () => string | undefined;
	timeout?: number;
};

export const createAuthAxiosLocaleStore = () => {
	let currentRequestLocale: null | string = null;

	return {
		setRequestLocale(locale?: string | null) {
			currentRequestLocale =
				typeof locale === "string" && locale.trim() !== ""
					? locale.trim().toLowerCase()
					: null;
		},
		getRequestLocale() {
			return currentRequestLocale;
		},
	};
};

const readCookieValue = (cookieHeader: null | string, name: string) => {
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

const resolveDefaultApiBaseUrl = () => {
	const internalApiBaseUrl = process.env.API_ENDPOINT?.trim();
	const publicApiBaseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT?.trim();

	if (isServer) {
		return internalApiBaseUrl || publicApiBaseUrl;
	}

	return publicApiBaseUrl || internalApiBaseUrl;
};

export const createAuthAxiosClient = ({
	authCookieName = "token",
	visitorSessionCookieName = "visitor_session",
	visitorSessionHeaderName = "X-Visitor-Session",
	ensureVisitorSession,
	resolveApiBaseUrl = resolveDefaultApiBaseUrl,
	timeout = 3000,
}: AuthAxiosClientOptions = {}) => {
	const localeStore = createAuthAxiosLocaleStore();
	const getApiBaseUrl = resolveApiBaseUrl;
	const getApiUrl = (path: string) => {
		const baseUrl = getApiBaseUrl();

		if (!baseUrl) {
			throw new Error("API endpoint is not configured");
		}

		return `${trimTrailingSlashes(baseUrl)}/${trimLeadingSlashes(path)}`;
	};
	const api = axios.create({
		baseURL: getApiBaseUrl(),
		timeout,
		withCredentials: true,
	});

	api.interceptors.request.use(async (config) => {
		config.baseURL = getApiBaseUrl();

		let token: null | string = null;
		let visitorSession: null | string = null;
		let requestLocale: null | string = null;

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
				["user-agent", requestHeaders.get("user-agent")],
			] as const) {
				if (value) {
					config.headers.set(name, value);
				}
			}
			requestLocale = requestHeaders.get("x-locale") ?? null;
		} else {
			token = Cookies.get(authCookieName) ?? null;
			visitorSession =
				ensureVisitorSession?.() ?? Cookies.get(visitorSessionCookieName) ?? null;
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
		setRequestLocale: localeStore.setRequestLocale,
	};
};
