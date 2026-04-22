import Cookies from "js-cookie";

export const VISITOR_SESSION_COOKIE = "visitor_session";
export const VISITOR_SESSION_HEADER = "X-Visitor-Session";
const VISITOR_SESSION_EXPIRY_DAYS = 3650;

function createVisitorSessionId() {
	if (
		typeof globalThis.crypto !== "undefined" &&
		typeof globalThis.crypto.randomUUID === "function"
	) {
		return globalThis.crypto.randomUUID();
	}

	return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getVisitorSession() {
	return Cookies.get(VISITOR_SESSION_COOKIE) ?? null;
}

export function ensureVisitorSession() {
	const existing = getVisitorSession();

	if (existing) {
		return existing;
	}

	const value = createVisitorSessionId();

	Cookies.set(VISITOR_SESSION_COOKIE, value, {
		expires: VISITOR_SESSION_EXPIRY_DAYS,
		sameSite: "lax",
	});

	return value;
}
