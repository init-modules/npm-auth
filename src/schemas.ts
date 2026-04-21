import z from "zod";
import { userSchema } from "./domain";

export const meResponseSchema = userSchema;

export const accountSummaryResponseSchema = z.object({
	company: userSchema.shape.company ?? z.null(),
});

export const logoutResponseSchema = z.object({
	message: z.string(),
});

export const logoutAllResponseSchema = z.object({
	message: z.string(),
});

export const completeRoleResponseSchema = z.object({
	message: z.string(),
	user: userSchema,
});

export const passwordResetResponseSchema = z.object({
	message: z.string(),
});

export const restorePasswordResponseSchema = z.object({
	message: z.string(),
	status: z.string().optional(),
});

export const credentialsAuthResponseSchema = z.object({
	user: userSchema,
	token: z.string(),
});

export const loginResponseSchema = credentialsAuthResponseSchema;
export const registerResponseSchema = credentialsAuthResponseSchema;

export type MeResponse = z.infer<typeof meResponseSchema>;
export type AccountSummaryResponse = z.infer<
	typeof accountSummaryResponseSchema
>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
export type LogoutAllResponse = z.infer<typeof logoutAllResponseSchema>;
export type CompleteRoleResponse = z.infer<typeof completeRoleResponseSchema>;
export type PasswordResetResponse = z.infer<typeof passwordResetResponseSchema>;
export type RestorePasswordResponse = z.infer<
	typeof restorePasswordResponseSchema
>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
