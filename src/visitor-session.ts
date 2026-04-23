import Cookies from "js-cookie";

export const VISITOR_SESSION_COOKIE = "visitor_session";
export const VISITOR_SESSION_HEADER = "X-Visitor-Session";
const VISITOR_SESSION_EXPIRY_DAYS = 3650;

const formatUuidV4 = (bytes: Uint8Array) => {
	bytes[6] = (bytes[6] & 0x0f) | 0x40;
	bytes[8] = (bytes[8] & 0x3f) | 0x80;

	const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));

	return [
		hex.slice(0, 4).join(""),
		hex.slice(4, 6).join(""),
		hex.slice(6, 8).join(""),
		hex.slice(8, 10).join(""),
		hex.slice(10, 16).join(""),
	].join("-");
};

function createVisitorSessionId() {
	if (
		typeof globalThis.crypto !== "undefined" &&
		typeof globalThis.crypto.randomUUID === "function"
	) {
		return globalThis.crypto.randomUUID();
	}

	const bytes = new Uint8Array(16);

	if (
		typeof globalThis.crypto !== "undefined" &&
		typeof globalThis.crypto.getRandomValues === "function"
	) {
		globalThis.crypto.getRandomValues(bytes);
	} else {
		for (let index = 0; index < bytes.length; index += 1) {
			bytes[index] = Math.floor(Math.random() * 256);
		}
	}

	return formatUuidV4(bytes);
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
