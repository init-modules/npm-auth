import z from 'zod';

declare const userRoleSchema: z.ZodEnum<{
    partner: "partner";
    parent: "parent";
}>;
declare const userCompanySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
declare const userSchema: z.ZodObject<{
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
type User = z.infer<typeof userSchema>;
type UserRole = z.infer<typeof userRoleSchema>;
type UserCompany = z.infer<typeof userCompanySchema>;
type AuthState<UserValue = User> = {
    user: UserValue | null;
    token: string | null;
};
interface LoginRequest<Role = UserRole> {
    email: string;
    password: string;
    role?: Role;
}
interface RegisterRequest<Role = UserRole> {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role?: Role;
}
interface PasswordResetRequest {
    email: string;
    url: string;
}
interface RestorePasswordRequest {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
}
interface GoogleAuthRedirectRequest<Role = UserRole> {
    redirectUrl: string;
    role?: Role;
}
type AuthFlowCompletionOptions<Role = UserRole> = {
    redirectTo?: string | null;
    fallbackRedirectTo?: string | null;
    refreshOnSuccess?: boolean;
    onSuccess?: () => void | Promise<void>;
    role?: Role | null;
};

type AuthApiClient = {
    get: <Response = unknown>(url: string) => Promise<{
        data: Response;
    }>;
    post: <Response = unknown>(url: string, data?: unknown) => Promise<{
        data: Response;
    }>;
};
type AuthUrlResolver = (path: string) => string;
declare const createAuthActionsService: (api: AuthApiClient) => {
    me(): Promise<{
        email: string;
        id?: string | undefined;
        name?: string | undefined;
        role?: string | null | undefined;
        permissions?: string[] | undefined;
        company?: {
            id: string;
            name: string;
            slug: string;
            status?: string | null | undefined;
        } | null | undefined;
    }>;
    completeRole(role: UserRole): Promise<{
        message: string;
        user: {
            email: string;
            id?: string | undefined;
            name?: string | undefined;
            role?: string | null | undefined;
            permissions?: string[] | undefined;
            company?: {
                id: string;
                name: string;
                slug: string;
                status?: string | null | undefined;
            } | null | undefined;
        };
    }>;
    logout(): Promise<{
        message: string;
    }>;
    logoutAll(): Promise<{
        message: string;
    }>;
};
declare const createCredentialsService: (api: AuthApiClient) => {
    login(data: LoginRequest): Promise<{
        user: {
            email: string;
            id?: string | undefined;
            name?: string | undefined;
            role?: string | null | undefined;
            permissions?: string[] | undefined;
            company?: {
                id: string;
                name: string;
                slug: string;
                status?: string | null | undefined;
            } | null | undefined;
        };
        token: string;
    }>;
    register(data: RegisterRequest): Promise<{
        user: {
            email: string;
            id?: string | undefined;
            name?: string | undefined;
            role?: string | null | undefined;
            permissions?: string[] | undefined;
            company?: {
                id: string;
                name: string;
                slug: string;
                status?: string | null | undefined;
            } | null | undefined;
        };
        token: string;
    }>;
    requestPasswordReset(data: PasswordResetRequest): Promise<{
        message: string;
    }>;
    restorePassword(data: RestorePasswordRequest): Promise<{
        message: string;
        status?: string | undefined;
    }>;
};
declare const createGoogleAuthService: (getApiUrl: AuthUrlResolver) => {
    getRedirectUrl(redirectUrl: GoogleAuthRedirectRequest["redirectUrl"]): string;
    getRedirectUrlWithRole(data: GoogleAuthRedirectRequest): string;
};
type AuthActionsService = ReturnType<typeof createAuthActionsService>;
type CredentialsService = ReturnType<typeof createCredentialsService>;
type GoogleAuthService = ReturnType<typeof createGoogleAuthService>;

type AuthCookieStore = {
    get?: (name: string) => string | undefined | null;
    set?: (name: string, value: string) => void | Promise<void>;
    delete?: (name: string) => void | Promise<void>;
    remove?: (name: string) => void | Promise<void>;
};
declare const credentialsLoginPayloadSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<{
        partner: "partner";
        parent: "parent";
    }>>;
}, z.core.$strip>;
declare const credentialsRegisterPayloadSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEmail;
    password: z.ZodString;
    password_confirmation: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<{
        partner: "partner";
        parent: "parent";
    }>>;
}, z.core.$strip>;
declare const credentialsPasswordResetPayloadSchema: z.ZodObject<{
    email: z.ZodEmail;
    url: z.ZodURL;
}, z.core.$strip>;
declare const credentialsRestorePasswordPayloadSchema: z.ZodObject<{
    email: z.ZodEmail;
    token: z.ZodString;
    password: z.ZodString;
    password_confirmation: z.ZodString;
}, z.core.$strip>;
declare const googleAuthRedirectUrlPayloadSchema: z.ZodObject<{
    redirectUrl: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<{
        partner: "partner";
        parent: "parent";
    }>>;
}, z.core.$strip>;
declare const googleAuthTokenPayloadSchema: z.ZodString;
type CredentialsLoginPayload = z.infer<typeof credentialsLoginPayloadSchema>;
type CredentialsRegisterPayload = z.infer<typeof credentialsRegisterPayloadSchema>;
type CredentialsPasswordResetPayload = z.infer<typeof credentialsPasswordResetPayloadSchema>;
type CredentialsRestorePasswordPayload = z.infer<typeof credentialsRestorePasswordPayloadSchema>;
type GoogleAuthRedirectUrlPayload = z.infer<typeof googleAuthRedirectUrlPayloadSchema>;
type GoogleAuthTokenPayload = z.infer<typeof googleAuthTokenPayloadSchema>;
declare const createAuthActionsUseCase: ({ service, cookieStore, }: {
    service: AuthActionsService;
    cookieStore: AuthCookieStore;
}) => {
    me(): Promise<{
        email: string;
        id?: string | undefined;
        name?: string | undefined;
        role?: string | null | undefined;
        permissions?: string[] | undefined;
        company?: {
            id: string;
            name: string;
            slug: string;
            status?: string | null | undefined;
        } | null | undefined;
    } | null>;
    logout(): Promise<{
        message: string;
    } | null>;
    logoutAll(): Promise<{
        message: string;
    }>;
    completeRole(role: UserRole): Promise<{
        message: string;
        user: {
            email: string;
            id?: string | undefined;
            name?: string | undefined;
            role?: string | null | undefined;
            permissions?: string[] | undefined;
            company?: {
                id: string;
                name: string;
                slug: string;
                status?: string | null | undefined;
            } | null | undefined;
        };
    }>;
};
declare const createCredentialsUseCase: ({ service, cookieStore, }: {
    service: CredentialsService;
    cookieStore: AuthCookieStore;
}) => {
    login(data: CredentialsLoginPayload): Promise<{
        user: {
            email: string;
            id?: string | undefined;
            name?: string | undefined;
            role?: string | null | undefined;
            permissions?: string[] | undefined;
            company?: {
                id: string;
                name: string;
                slug: string;
                status?: string | null | undefined;
            } | null | undefined;
        };
        token: string;
    }>;
    register(data: CredentialsRegisterPayload): Promise<{
        user: {
            email: string;
            id?: string | undefined;
            name?: string | undefined;
            role?: string | null | undefined;
            permissions?: string[] | undefined;
            company?: {
                id: string;
                name: string;
                slug: string;
                status?: string | null | undefined;
            } | null | undefined;
        };
        token: string;
    }>;
    requestPasswordReset(data: CredentialsPasswordResetPayload): Promise<{
        message: string;
    }>;
    restorePassword(data: CredentialsRestorePasswordPayload): Promise<{
        message: string;
        status?: string | undefined;
    }>;
};
declare const createGoogleAuthUseCase: ({ service, authActionsUseCase, cookieStore, }: {
    service: GoogleAuthService;
    authActionsUseCase: ReturnType<typeof createAuthActionsUseCase>;
    cookieStore: AuthCookieStore;
}) => {
    getRedirectUrl(redirectUrl: GoogleAuthRedirectUrlPayload): string;
    completeLogin(token: GoogleAuthTokenPayload): Promise<{
        user: {
            email: string;
            id?: string | undefined;
            name?: string | undefined;
            role?: string | null | undefined;
            permissions?: string[] | undefined;
            company?: {
                id: string;
                name: string;
                slug: string;
                status?: string | null | undefined;
            } | null | undefined;
        };
        token: string;
    }>;
    persistToken(token: GoogleAuthTokenPayload): Promise<void>;
};
type AuthActionsUseCase = ReturnType<typeof createAuthActionsUseCase>;
type CredentialsUseCase = ReturnType<typeof createCredentialsUseCase>;
type GoogleAuthUseCase = ReturnType<typeof createGoogleAuthUseCase>;

export { type AuthActionsService as A, credentialsRegisterPayloadSchema as B, type CredentialsLoginPayload as C, credentialsRestorePasswordPayloadSchema as D, googleAuthRedirectUrlPayloadSchema as E, googleAuthTokenPayloadSchema as F, type GoogleAuthRedirectRequest as G, userCompanySchema as H, userRoleSchema as I, userSchema as J, type LoginRequest as L, type PasswordResetRequest as P, type RegisterRequest as R, type User as U, type AuthActionsUseCase as a, type AuthApiClient as b, type AuthCookieStore as c, type AuthFlowCompletionOptions as d, type AuthState as e, type AuthUrlResolver as f, type CredentialsPasswordResetPayload as g, type CredentialsRegisterPayload as h, type CredentialsRestorePasswordPayload as i, type CredentialsService as j, type CredentialsUseCase as k, type GoogleAuthRedirectUrlPayload as l, type GoogleAuthService as m, type GoogleAuthTokenPayload as n, type GoogleAuthUseCase as o, type RestorePasswordRequest as p, type UserCompany as q, type UserRole as r, createAuthActionsService as s, createAuthActionsUseCase as t, createCredentialsService as u, createCredentialsUseCase as v, createGoogleAuthService as w, createGoogleAuthUseCase as x, credentialsLoginPayloadSchema as y, credentialsPasswordResetPayloadSchema as z };
