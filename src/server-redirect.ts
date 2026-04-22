const SAME_ORIGIN_SENTINEL = "https://same-origin.local";

export const resolveServerAuthRedirectTo = (
	redirectTo?: string | null,
	fallback = "/",
) => {
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
