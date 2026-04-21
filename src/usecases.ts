import z from "zod";
import { type UserRole, userRoleSchema } from "./domain";
import type {
	AuthActionsService,
	CredentialsService,
	GoogleAuthService,
} from "./services";

export type AuthCookieStore = {
	get?: (name: string) => string | undefined | null;
	set?: (name: string, value: string) => void | Promise<void>;
	delete?: (name: string) => void | Promise<void>;
	remove?: (name: string) => void | Promise<void>;
};

export const credentialsLoginPayloadSchema = z.object({
	email: z.email(),
	password: z.string(),
	role: userRoleSchema.optional(),
});

export const credentialsRegisterPayloadSchema = z.object({
	name: z.string(),
	email: z.email(),
	password: z.string(),
	password_confirmation: z.string(),
	role: userRoleSchema.optional(),
});

export const credentialsPasswordResetPayloadSchema = z.object({
	email: z.email(),
	url: z.url(),
});

export const credentialsRestorePasswordPayloadSchema = z.object({
	email: z.email(),
	token: z.string().min(1),
	password: z.string().min(8),
	password_confirmation: z.string().min(8),
});

export const googleAuthRedirectUrlPayloadSchema = z.object({
	redirectUrl: z.string(),
	role: userRoleSchema.optional(),
});

export const googleAuthTokenPayloadSchema = z.string();

export type CredentialsLoginPayload = z.infer<
	typeof credentialsLoginPayloadSchema
>;
export type CredentialsRegisterPayload = z.infer<
	typeof credentialsRegisterPayloadSchema
>;
export type CredentialsPasswordResetPayload = z.infer<
	typeof credentialsPasswordResetPayloadSchema
>;
export type CredentialsRestorePasswordPayload = z.infer<
	typeof credentialsRestorePasswordPayloadSchema
>;
export type GoogleAuthRedirectUrlPayload = z.infer<
	typeof googleAuthRedirectUrlPayloadSchema
>;
export type GoogleAuthTokenPayload = z.infer<
	typeof googleAuthTokenPayloadSchema
>;

const deleteCookie = async (cookieStore: AuthCookieStore, name: string) => {
	if (cookieStore.delete) {
		await cookieStore.delete(name);
		return;
	}

	if (cookieStore.remove) {
		await cookieStore.remove(name);
	}
};

export const createAuthActionsUseCase = ({
	service,
	cookieStore,
}: {
	service: AuthActionsService;
	cookieStore: AuthCookieStore;
}) => ({
	async me() {
		try {
			return await service.me();
		} catch {
			return null;
		}
	},

	async logout() {
		try {
			const response = await service.logout();
			await deleteCookie(cookieStore, "token");
			return response;
		} catch (error) {
			console.warn(error);
			return null;
		}
	},

	async logoutAll() {
		const response = await service.logoutAll();
		await deleteCookie(cookieStore, "token");
		return response;
	},

	async completeRole(role: UserRole) {
		return await service.completeRole(role);
	},
});

export const createCredentialsUseCase = ({
	service,
	cookieStore,
}: {
	service: CredentialsService;
	cookieStore: AuthCookieStore;
}) => ({
	async login(data: CredentialsLoginPayload) {
		const payload = credentialsLoginPayloadSchema.parse(data);
		const response = await service.login(payload);
		await cookieStore.set?.("token", response.token);
		return response;
	},

	async register(data: CredentialsRegisterPayload) {
		const payload = credentialsRegisterPayloadSchema.parse(data);
		const response = await service.register(payload);
		await cookieStore.set?.("token", response.token);
		return response;
	},

	async requestPasswordReset(data: CredentialsPasswordResetPayload) {
		const payload = credentialsPasswordResetPayloadSchema.parse(data);
		return await service.requestPasswordReset(payload);
	},

	async restorePassword(data: CredentialsRestorePasswordPayload) {
		const payload = credentialsRestorePasswordPayloadSchema.parse(data);
		return await service.restorePassword(payload);
	},
});

export const createGoogleAuthUseCase = ({
	service,
	authActionsUseCase,
	cookieStore,
}: {
	service: GoogleAuthService;
	authActionsUseCase: ReturnType<typeof createAuthActionsUseCase>;
	cookieStore: AuthCookieStore;
}) => ({
	getRedirectUrl(redirectUrl: GoogleAuthRedirectUrlPayload) {
		const payload = googleAuthRedirectUrlPayloadSchema.parse(redirectUrl);
		return service.getRedirectUrlWithRole(payload);
	},

	async completeLogin(token: GoogleAuthTokenPayload) {
		const validatedToken = googleAuthTokenPayloadSchema.parse(token);
		await cookieStore.set?.("token", validatedToken);

		const user = await authActionsUseCase.me();

		if (!user) {
			await deleteCookie(cookieStore, "token");
			throw new Error("failed_to_load_user");
		}

		return {
			user,
			token: validatedToken,
		};
	},

	async persistToken(token: GoogleAuthTokenPayload) {
		const validatedToken = googleAuthTokenPayloadSchema.parse(token);
		await cookieStore.set?.("token", validatedToken);
	},
});

export type AuthActionsUseCase = ReturnType<typeof createAuthActionsUseCase>;
export type CredentialsUseCase = ReturnType<typeof createCredentialsUseCase>;
export type GoogleAuthUseCase = ReturnType<typeof createGoogleAuthUseCase>;
