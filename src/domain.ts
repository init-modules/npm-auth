import z from "zod";

export const userRoleSchema = z.enum(["partner", "parent"]);

export const userCompanySchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	status: z.string().nullable().optional(),
});

export const userSchema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	email: z.string(),
	role: z.string().optional().nullable(),
	permissions: z.array(z.string()).optional(),
	company: userCompanySchema.nullable().optional(),
});

export type User = z.infer<typeof userSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type UserCompany = z.infer<typeof userCompanySchema>;

export type AuthState<UserValue = User> = {
	user: UserValue | null;
	token: string | null;
};

export interface LoginRequest<Role = UserRole> {
	email: string;
	password: string;
	role?: Role;
}

export interface RegisterRequest<Role = UserRole> {
	name: string;
	email: string;
	password: string;
	password_confirmation: string;
	role?: Role;
}

export interface PasswordResetRequest {
	email: string;
	url: string;
}

export interface RestorePasswordRequest {
	email: string;
	token: string;
	password: string;
	password_confirmation: string;
}

export interface GoogleAuthRedirectRequest<Role = UserRole> {
	redirectUrl: string;
	role?: Role;
}

export type AuthFlowCompletionOptions<Role = UserRole> = {
	redirectTo?: string | null;
	fallbackRedirectTo?: string | null;
	refreshOnSuccess?: boolean;
	onSuccess?: () => void | Promise<void>;
	role?: Role | null;
};
