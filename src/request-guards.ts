export const getForwardedProtocol = (headers: {
	get: (name: string) => string | null;
}, fallbackProtocol: string) => {
	const forwardedProtocol = headers.get("x-forwarded-proto");
	const protocol = forwardedProtocol?.split(",")[0]?.trim();

	return protocol ? protocol.replace(/:$/, "") : fallbackProtocol;
};

export const getCanonicalRequestOrigin = (headers: {
	get: (name: string) => string | null;
}, fallback: { protocol: string; host: string }) => {
	const protocol = getForwardedProtocol(headers, fallback.protocol);
	const host = headers.get("host") ?? fallback.host;

	return new URL(`${protocol.replace(/:$/, "")}://${host}`).origin;
};

const isSameOriginUrl = (value: string, requestOrigin: string) =>
	new URL(value).origin === requestOrigin;

export const isSameOriginMutation = (request: {
	method: string;
	headers: { get: (name: string) => string | null };
}, fallback: { protocol: string; host: string }) => {
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
