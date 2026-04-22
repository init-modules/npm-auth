type AuthProviderTokenResolver = () => Promise<string | null> | string | null;

export function createAuthProviderDataResolver<
	State extends { token: string | null },
>(handlers: {
	resolveSession: () => Promise<Omit<State, "token"> | null>;
	resolveToken: AuthProviderTokenResolver;
}): () => Promise<State | null>;

export function createAuthProviderDataResolver<
	Session extends object,
>(handlers: {
	resolveSession: () => Promise<Session | null>;
	resolveToken: AuthProviderTokenResolver;
}): () => Promise<(Session & { token: string | null }) | null>;

export function createAuthProviderDataResolver(handlers: {
	resolveSession: () => Promise<object | null>;
	resolveToken: AuthProviderTokenResolver;
}) {
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
			token,
		};
	};
}
