const DEFAULT_AUTH_REDIRECT_TO = "/dashboard";

export const resolveAuthRedirectTo = (
	redirectTo?: string | null,
	fallback: string | null = DEFAULT_AUTH_REDIRECT_TO,
) => {
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
