import Cookies from "js-cookie";
import {
	accountSummaryResponseSchema,
	completeRoleResponseSchema,
	logoutAllResponseSchema,
	logoutResponseSchema,
	meResponseSchema,
} from "./schemas";
import {
	createAuthActionsService,
	createCredentialsService,
	createGoogleAuthService,
	type AuthApiClient,
	type AuthUrlResolver,
} from "./services";
import {
	createAuthActionsUseCase,
	createCredentialsUseCase,
	createGoogleAuthUseCase,
} from "./usecases";

const AUTH_COOKIE = "token";
const isServer = typeof window === "undefined";

export const createNextAuthCookieStore = () => ({
	get: (name: string) => Cookies.get(name),
	set: async (name: string, value: string) => {
		if (name === AUTH_COOKIE && value.trim() === "") {
			Cookies.remove(name);
			return;
		}

		Cookies.set(name, value, {
			path: "/",
			sameSite: "lax",
		});
	},
	delete: async (name: string) => {
		Cookies.remove(name);
	},
	remove: (name: string) => {
		Cookies.remove(name);
	},
});

export const createNextAuthActionsService = (api: AuthApiClient) =>
	isServer
		? createAuthActionsService(api)
		: {
				async me() {
					const response = await api.get("/auth/v1/me");
					const user = meResponseSchema.parse(response.data);

					try {
						const summaryResponse = await api.get("/app/v1/account/summary");
						const summary = accountSummaryResponseSchema.parse(
							summaryResponse.data,
						);

						return {
							...user,
							company: summary.company ?? null,
						};
					} catch {
						return user;
					}
				},
				async completeRole(role: unknown) {
					const response = await api.post("/auth/v1/complete-role", { role });
					return completeRoleResponseSchema.parse(response.data);
				},
				async logout() {
					const response = await api.post("/auth/v1/logout");
					Cookies.remove(AUTH_COOKIE);
					return logoutResponseSchema.parse(response.data);
				},
				async logoutAll() {
					const response = await api.post("/auth/v1/logout-all");

					return logoutAllResponseSchema.parse(response.data);
				},
			};

export const createNextCredentialsService = (api: AuthApiClient) =>
	createCredentialsService(api);

export const createNextGoogleAuthService = (getApiUrl: AuthUrlResolver) =>
	createGoogleAuthService(getApiUrl);

export const createNextAuthUseCases = ({
	api,
	getApiUrl,
}: {
	api: AuthApiClient;
	getApiUrl: AuthUrlResolver;
}) => {
	const cookieStore = createNextAuthCookieStore();
	const authActionsUseCase = createAuthActionsUseCase({
		service: createNextAuthActionsService(api),
		cookieStore,
	});
	const credentialsUseCase = createCredentialsUseCase({
		service: createNextCredentialsService(api),
		cookieStore,
	});
	const googleAuthUseCase = createGoogleAuthUseCase({
		service: createNextGoogleAuthService(getApiUrl),
		authActionsUseCase,
		cookieStore,
	});

	return {
		authActionsUseCase,
		credentialsUseCase,
		googleAuthUseCase,
		cookieStore,
	};
};
