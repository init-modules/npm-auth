import { randomBytes, randomUUID } from "node:crypto";

export const GOOGLE_OAUTH_FLOW_COOKIE = "google_oauth_flow";
const GOOGLE_OAUTH_FLOW_TTL_SECONDS = 300;

export type GoogleOauthFlowState = {
	nonce: string;
	requestId: string;
	redirectTo: string;
};

export const createGoogleOauthFlowState = (
	redirectTo: string,
): GoogleOauthFlowState => ({
	nonce: randomBytes(32).toString("base64url"),
	requestId: randomUUID(),
	redirectTo,
});

export const readGoogleOauthFlowState = (
	cookies: { get: (name: string) => { value: string } | undefined },
): GoogleOauthFlowState | null => {
	const rawValue = cookies.get(GOOGLE_OAUTH_FLOW_COOKIE)?.value;

	if (!rawValue) {
		return null;
	}

	try {
		const parsed = JSON.parse(
			Buffer.from(rawValue, "base64url").toString("utf8"),
		);

		if (
			!parsed ||
			typeof parsed !== "object" ||
			typeof parsed.nonce !== "string" ||
			typeof parsed.requestId !== "string" ||
			typeof parsed.redirectTo !== "string"
		) {
			return null;
		}

		return {
			nonce: parsed.nonce,
			requestId: parsed.requestId,
			redirectTo: parsed.redirectTo,
		};
	} catch {
		return null;
	}
};

export const writeGoogleOauthFlowStateCookie = (
	cookies: {
		set: (
			name: string,
			value: string,
			options: {
				httpOnly: boolean;
				secure: boolean;
				sameSite: "none" | "strict" | "lax";
				path: string;
				maxAge: number;
			},
		) => void;
	},
	state: GoogleOauthFlowState,
) => {
	cookies.set(
		GOOGLE_OAUTH_FLOW_COOKIE,
		Buffer.from(JSON.stringify(state), "utf8").toString("base64url"),
		{
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			path: "/auth/google/callback",
			maxAge: GOOGLE_OAUTH_FLOW_TTL_SECONDS,
		},
	);
};

export const clearGoogleOauthFlowStateCookie = (cookies: {
	set: (
		name: string,
		value: string,
		options: {
			httpOnly: boolean;
			secure: boolean;
			sameSite: "none" | "strict" | "lax";
			path: string;
			maxAge: number;
		},
	) => void;
}) => {
	cookies.set(GOOGLE_OAUTH_FLOW_COOKIE, "", {
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		path: "/auth/google/callback",
		maxAge: 0,
	});
};
