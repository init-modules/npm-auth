export { A as AuthActionsService, a as AuthActionsUseCase, b as AuthApiClient, c as AuthCookieStore, d as AuthFlowCompletionOptions, e as AuthState, f as AuthUrlResolver, C as CredentialsLoginPayload, g as CredentialsPasswordResetPayload, h as CredentialsRegisterPayload, i as CredentialsRestorePasswordPayload, j as CredentialsService, k as CredentialsUseCase, G as GoogleAuthRedirectRequest, l as GoogleAuthRedirectUrlPayload, m as GoogleAuthService, n as GoogleAuthTokenPayload, o as GoogleAuthUseCase, L as LoginRequest, P as PasswordResetRequest, R as RegisterRequest, p as RestorePasswordRequest, U as User, q as UserCompany, r as UserRole, s as createAuthActionsService, t as createAuthActionsUseCase, u as createCredentialsService, v as createCredentialsUseCase, w as createGoogleAuthService, x as createGoogleAuthUseCase, y as credentialsLoginPayloadSchema, z as credentialsPasswordResetPayloadSchema, B as credentialsRegisterPayloadSchema, D as credentialsRestorePasswordPayloadSchema, E as googleAuthRedirectUrlPayloadSchema, F as googleAuthTokenPayloadSchema, H as userCompanySchema, I as userRoleSchema, J as userSchema } from './usecases-CYHVRyRu.js';
export { A as AccountSummaryResponse, C as CompleteRoleResponse, L as LoginResponse, a as LogoutAllResponse, b as LogoutResponse, M as MeResponse, P as PasswordResetResponse, R as RegisterResponse, c as RestorePasswordResponse, d as accountSummaryResponseSchema, e as completeRoleResponseSchema, f as credentialsAuthResponseSchema, l as loginResponseSchema, g as logoutAllResponseSchema, h as logoutResponseSchema, m as meResponseSchema, p as passwordResetResponseSchema, r as registerResponseSchema, i as restorePasswordResponseSchema } from './schemas-2jJ7T91Z.js';
import 'zod';

type AuthProviderTokenResolver = () => Promise<string | null> | string | null;
declare function createAuthProviderDataResolver<State extends {
    token: string | null;
}>(handlers: {
    resolveSession: () => Promise<Omit<State, "token"> | null>;
    resolveToken: AuthProviderTokenResolver;
}): () => Promise<State | null>;
declare function createAuthProviderDataResolver<Session extends object>(handlers: {
    resolveSession: () => Promise<Session | null>;
    resolveToken: AuthProviderTokenResolver;
}): () => Promise<(Session & {
    token: string | null;
}) | null>;

declare const GOOGLE_OAUTH_FLOW_COOKIE = "google_oauth_flow";
type GoogleOauthFlowState = {
    nonce: string;
    requestId: string;
    redirectTo: string;
};
declare const createGoogleOauthFlowState: (redirectTo: string) => GoogleOauthFlowState;
declare const readGoogleOauthFlowState: (cookies: {
    get: (name: string) => {
        value: string;
    } | undefined;
}) => GoogleOauthFlowState | null;
declare const writeGoogleOauthFlowStateCookie: (cookies: {
    set: (name: string, value: string, options: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: "none" | "strict" | "lax";
        path: string;
        maxAge: number;
    }) => void;
}, state: GoogleOauthFlowState) => void;
declare const clearGoogleOauthFlowStateCookie: (cookies: {
    set: (name: string, value: string, options: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: "none" | "strict" | "lax";
        path: string;
        maxAge: number;
    }) => void;
}) => void;

declare const getForwardedProtocol: (headers: {
    get: (name: string) => string | null;
}, fallbackProtocol: string) => string;
declare const getCanonicalRequestOrigin: (headers: {
    get: (name: string) => string | null;
}, fallback: {
    protocol: string;
    host: string;
}) => string;
declare const isSameOriginMutation: (request: {
    method: string;
    headers: {
        get: (name: string) => string | null;
    };
}, fallback: {
    protocol: string;
    host: string;
}) => boolean;

declare const resolveServerAuthRedirectTo: (redirectTo?: string | null, fallback?: string) => string;

export { GOOGLE_OAUTH_FLOW_COOKIE, type GoogleOauthFlowState, clearGoogleOauthFlowStateCookie, createAuthProviderDataResolver, createGoogleOauthFlowState, getCanonicalRequestOrigin, getForwardedProtocol, isSameOriginMutation, readGoogleOauthFlowState, resolveServerAuthRedirectTo, writeGoogleOauthFlowStateCookie };
