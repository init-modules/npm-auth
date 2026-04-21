import type {
	GoogleAuthRedirectRequest,
	LoginRequest,
	PasswordResetRequest,
	RegisterRequest,
	RestorePasswordRequest,
	UserRole,
} from "./domain";
import {
	accountSummaryResponseSchema,
	completeRoleResponseSchema,
	loginResponseSchema,
	logoutAllResponseSchema,
	logoutResponseSchema,
	meResponseSchema,
	passwordResetResponseSchema,
	registerResponseSchema,
	restorePasswordResponseSchema,
} from "./schemas";

export type AuthApiClient = {
	get: <Response = unknown>(url: string) => Promise<{ data: Response }>;
	post: <Response = unknown>(
		url: string,
		data?: unknown,
	) => Promise<{ data: Response }>;
};

export type AuthUrlResolver = (path: string) => string;

export const createAuthActionsService = (api: AuthApiClient) => ({
	async me() {
		const response = await api.get("/auth/v1/me");
		const user = meResponseSchema.parse(response.data);

		try {
			const summaryResponse = await api.get("/app/v1/account/summary");
			const summary = accountSummaryResponseSchema.parse(summaryResponse.data);

			return {
				...user,
				company: summary.company ?? null,
			};
		} catch {
			return user;
		}
	},

	async completeRole(role: UserRole) {
		const response = await api.post("/auth/v1/complete-role", { role });
		return completeRoleResponseSchema.parse(response.data);
	},

	async logout() {
		const response = await api.post("/auth/v1/logout");
		return logoutResponseSchema.parse(response.data);
	},

	async logoutAll() {
		const response = await api.post("/auth/v1/logout-all");
		return logoutAllResponseSchema.parse(response.data);
	},
});

export const createCredentialsService = (api: AuthApiClient) => ({
	async login(data: LoginRequest) {
		const response = await api.post("/auth/v1/login", data);
		return loginResponseSchema.parse(response.data);
	},

	async register(data: RegisterRequest) {
		const response = await api.post("/auth/v1/register", data);
		return registerResponseSchema.parse(response.data);
	},

	async requestPasswordReset(data: PasswordResetRequest) {
		const response = await api.post("/auth/v1/restore-send", data);
		return passwordResetResponseSchema.parse(response.data);
	},

	async restorePassword(data: RestorePasswordRequest) {
		const response = await api.post("/auth/v1/restore-password", data);
		return restorePasswordResponseSchema.parse(response.data);
	},
});

export const createGoogleAuthService = (getApiUrl: AuthUrlResolver) => ({
	getRedirectUrl(redirectUrl: GoogleAuthRedirectRequest["redirectUrl"]) {
		const url = new URL(getApiUrl("/auth/v1/google/redirect"));
		url.searchParams.set("redirect_url", redirectUrl);

		return url.toString();
	},

	getRedirectUrlWithRole(data: GoogleAuthRedirectRequest) {
		const url = new URL(getApiUrl("/auth/v1/google/redirect"));
		url.searchParams.set("redirect_url", data.redirectUrl);

		if (data.role) {
			url.searchParams.set("role", data.role);
		}

		return url.toString();
	},
});

export type AuthActionsService = ReturnType<typeof createAuthActionsService>;
export type CredentialsService = ReturnType<typeof createCredentialsService>;
export type GoogleAuthService = ReturnType<typeof createGoogleAuthService>;
