import z from 'zod';

declare const meResponseSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    role: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    company: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        slug: z.ZodString;
        status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
declare const accountSummaryResponseSchema: z.ZodObject<{
    company: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        slug: z.ZodString;
        status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
declare const logoutResponseSchema: z.ZodObject<{
    message: z.ZodString;
}, z.core.$strip>;
declare const logoutAllResponseSchema: z.ZodObject<{
    message: z.ZodString;
}, z.core.$strip>;
declare const completeRoleResponseSchema: z.ZodObject<{
    message: z.ZodString;
    user: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
        role: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        permissions: z.ZodOptional<z.ZodArray<z.ZodString>>;
        company: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            slug: z.ZodString;
            status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const passwordResetResponseSchema: z.ZodObject<{
    message: z.ZodString;
}, z.core.$strip>;
declare const restorePasswordResponseSchema: z.ZodObject<{
    message: z.ZodString;
    status: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const credentialsAuthResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
        role: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        permissions: z.ZodOptional<z.ZodArray<z.ZodString>>;
        company: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            slug: z.ZodString;
            status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    token: z.ZodString;
}, z.core.$strip>;
declare const loginResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
        role: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        permissions: z.ZodOptional<z.ZodArray<z.ZodString>>;
        company: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            slug: z.ZodString;
            status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    token: z.ZodString;
}, z.core.$strip>;
declare const registerResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
        role: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        permissions: z.ZodOptional<z.ZodArray<z.ZodString>>;
        company: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            slug: z.ZodString;
            status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    token: z.ZodString;
}, z.core.$strip>;
type MeResponse = z.infer<typeof meResponseSchema>;
type AccountSummaryResponse = z.infer<typeof accountSummaryResponseSchema>;
type LogoutResponse = z.infer<typeof logoutResponseSchema>;
type LogoutAllResponse = z.infer<typeof logoutAllResponseSchema>;
type CompleteRoleResponse = z.infer<typeof completeRoleResponseSchema>;
type PasswordResetResponse = z.infer<typeof passwordResetResponseSchema>;
type RestorePasswordResponse = z.infer<typeof restorePasswordResponseSchema>;
type LoginResponse = z.infer<typeof loginResponseSchema>;
type RegisterResponse = z.infer<typeof registerResponseSchema>;

export { type AccountSummaryResponse as A, type CompleteRoleResponse as C, type LoginResponse as L, type MeResponse as M, type PasswordResetResponse as P, type RegisterResponse as R, type LogoutAllResponse as a, type LogoutResponse as b, type RestorePasswordResponse as c, accountSummaryResponseSchema as d, completeRoleResponseSchema as e, credentialsAuthResponseSchema as f, logoutAllResponseSchema as g, logoutResponseSchema as h, restorePasswordResponseSchema as i, loginResponseSchema as l, meResponseSchema as m, passwordResetResponseSchema as p, registerResponseSchema as r };
