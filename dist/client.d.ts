import * as axios from 'axios';
import { ReactNode, Dispatch, SetStateAction } from 'react';
import { d as AuthFlowCompletionOptions, b as AuthApiClient, r as UserRole, f as AuthUrlResolver, C as CredentialsLoginPayload, h as CredentialsRegisterPayload, g as CredentialsPasswordResetPayload, i as CredentialsRestorePasswordPayload, l as GoogleAuthRedirectUrlPayload, n as GoogleAuthTokenPayload, L as LoginRequest, R as RegisterRequest, P as PasswordResetRequest, p as RestorePasswordRequest, G as GoogleAuthRedirectRequest, a as AuthActionsUseCase, k as CredentialsUseCase, o as GoogleAuthUseCase, c as AuthCookieStore } from './usecases-CYHVRyRu.js';
export { e as AuthState, U as User, q as UserCompany, H as userCompanySchema, I as userRoleSchema, J as userSchema } from './usecases-CYHVRyRu.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import 'zod';

declare const resolveAuthRedirectTo: (redirectTo?: string | null, fallback?: string | null) => string | null;

type AuthAxiosClientOptions = {
    authCookieName?: string;
    visitorSessionCookieName?: string;
    visitorSessionHeaderName?: string;
    ensureVisitorSession?: () => string | null;
    resolveApiBaseUrl?: () => string | undefined;
    timeout?: number;
    withCredentials?: boolean;
};
declare const createAuthAxiosLocaleStore: () => {
    setRequestLocale(locale?: string | null): void;
    getRequestLocale(): string | null;
};
declare const createAuthAxiosClient: ({ authCookieName, visitorSessionCookieName, visitorSessionHeaderName, ensureVisitorSession, resolveApiBaseUrl, timeout, withCredentials, }?: AuthAxiosClientOptions) => {
    api: axios.AxiosInstance;
    getApiBaseUrl: () => string | undefined;
    getApiUrl: (path: string) => string;
    getRequestLocale: () => string | null;
    setRequestLocale: (locale?: string | null) => void;
};

type AuthRuntimeBaseState<User = unknown> = {
    user: User | null;
    token: string | null;
};
type AuthCredentialsActionsState<State extends AuthRuntimeBaseState<User>, User = unknown> = {
    login: (...args: any[]) => Promise<unknown>;
    register: (...args: any[]) => Promise<unknown>;
    requestPasswordReset: (...args: any[]) => Promise<unknown>;
    restorePassword: (...args: any[]) => Promise<unknown>;
    isRegisterRunning: boolean;
    registerError: string | null;
    isLoginRunning: boolean;
    loginError: string | null;
    isPasswordResetRunning: boolean;
    passwordResetError: string | null;
    isRestorePasswordRunning: boolean;
    restorePasswordError: string | null;
};
type AuthSessionActionsState<State extends AuthRuntimeBaseState<User>, User = unknown, Role = string> = {
    logout: (options?: {
        redirectTo?: string | null;
    }) => Promise<void>;
    completeRole: (role: Role) => Promise<void>;
    refreshSession: () => Promise<void>;
    isLogoutRunning: boolean;
    logoutError: unknown;
};
type AuthGoogleActionsState<State extends AuthRuntimeBaseState<User>, User = unknown, Role = string> = {
    loginWithGoogle: (options?: AuthFlowCompletionOptions<Role>) => Promise<void>;
    isGoogleLoginRunning: boolean;
    googleLoginError: string | null;
};
type AuthRuntimeContextValue<State extends AuthRuntimeBaseState<User>, User = unknown, Role = string> = AuthCredentialsActionsState<State, User> & AuthSessionActionsState<State, User, Role> & AuthGoogleActionsState<State, User, Role> & {
    state: State | null;
};
type AuthRuntimeHookFactories<State extends AuthRuntimeBaseState<User>, User = unknown, Role = string> = {
    useCredentialsActions: (input: {
        setAuthState: Dispatch<SetStateAction<State | null>>;
    }) => AuthCredentialsActionsState<State, User>;
    useSessionActions: (input: {
        setAuthState: Dispatch<SetStateAction<State | null>>;
    }) => AuthSessionActionsState<State, User, Role>;
    useGoogleActions: (input: {
        setAuthState: Dispatch<SetStateAction<State | null>>;
    }) => AuthGoogleActionsState<State, User, Role>;
};
type AuthDialogBodyRenderProps<Role = string> = AuthFlowCompletionOptions<Role> & {
    onSwitch: () => void;
    onSuccess: () => Promise<void>;
};
type AuthDialogRenderer<Role = string> = (props: AuthDialogBodyRenderProps<Role>) => ReactNode;
interface AuthNavigationAdapter {
    pathname: string;
    push: (url: string) => void;
    refresh: () => void;
}

type AuthDialogFrameProps<Role = string> = AuthFlowCompletionOptions<Role> & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultMode?: "login" | "register";
    title?: string;
    description?: string;
    renderFrame: (input: {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        title?: string;
        description?: string;
        children: ReactNode;
    }) => ReactNode;
    renderLogin: AuthDialogRenderer<Role>;
    renderRegister: AuthDialogRenderer<Role>;
};
declare const AuthDialogFrame: <Role>({ open, onOpenChange, defaultMode, title, description, redirectTo, fallbackRedirectTo, refreshOnSuccess, onSuccess, role, renderFrame, renderLogin, renderRegister, }: AuthDialogFrameProps<Role>) => ReactNode;

type AuthActionErrorIntent = "login" | "register" | "password-reset";
declare const getAuthActionErrorMessage: (error: unknown, intent: AuthActionErrorIntent) => string;

declare const GOOGLE_AUTH_POPUP_MESSAGE_TYPE = "auth.google.callback";
interface GoogleAuthPopupMessage {
    type: typeof GOOGLE_AUTH_POPUP_MESSAGE_TYPE;
    requestId: string;
    token?: string;
    error?: string;
    message?: string;
}
declare class GoogleAuthError extends Error {
    code: string;
    constructor(code: string);
}
declare const createGoogleAuthRequestId: () => string;
declare const resolveGoogleAuthRedirectTo: (redirectTo?: string | null) => string;
declare const buildGoogleCallbackUrl: ({ redirectTo, requestId, }: {
    redirectTo?: string | null;
    requestId: string;
}) => string;
declare const createGoogleAuthPopupMessage: (message: Omit<GoogleAuthPopupMessage, "type">) => GoogleAuthPopupMessage;
declare const isGoogleAuthPopupMessage: (value: unknown) => value is GoogleAuthPopupMessage;
declare const getGoogleAuthErrorMessage: (error: unknown) => string;

declare const createNextAuthCookieStore: () => {
    get: (name: string) => string | undefined;
    set: (name: string, value: string) => Promise<void>;
    delete: (name: string) => Promise<void>;
    remove: (name: string) => void;
};
declare const createNextAuthActionsService: (api: AuthApiClient) => {
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
declare const createNextCredentialsService: (api: AuthApiClient) => {
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
declare const createNextGoogleAuthService: (getApiUrl: AuthUrlResolver) => {
    getRedirectUrl(redirectUrl: GoogleAuthRedirectRequest["redirectUrl"]): string;
    getRedirectUrlWithRole(data: GoogleAuthRedirectRequest): string;
};
declare const createNextAuthUseCases: ({ api, getApiUrl, }: {
    api: AuthApiClient;
    getApiUrl: AuthUrlResolver;
}) => {
    authActionsUseCase: {
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
    credentialsUseCase: {
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
    googleAuthUseCase: {
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
    cookieStore: {
        get: (name: string) => string | undefined;
        set: (name: string, value: string) => Promise<void>;
        delete: (name: string) => Promise<void>;
        remove: (name: string) => void;
    };
};

declare const createAuthRuntime: <State extends AuthRuntimeBaseState<User>, User = unknown, Role = string>() => {
    AuthProvider: ({ children, initialState, hooks, }: {
        children: ReactNode;
        initialState: State | null;
        hooks: AuthRuntimeHookFactories<State, User, Role>;
    }) => react_jsx_runtime.JSX.Element;
    useAuthContext: () => AuthRuntimeContextValue<State, User, Role>;
};

type AuthRuntimeHookFactoryOptions<State extends AuthRuntimeBaseState<User>, User = unknown, Role = string> = {
    authActionsUseCase: AuthActionsUseCase;
    credentialsUseCase: CredentialsUseCase;
    googleAuthUseCase: GoogleAuthUseCase;
    cookieStore: AuthCookieStore;
    useNavigation: () => AuthNavigationAdapter;
};
declare const createAuthFlowCompletionHook: <Role>({ useNavigation, }: {
    useNavigation: () => AuthNavigationAdapter;
}) => () => (options?: AuthFlowCompletionOptions<Role>) => Promise<void>;
declare const createAuthRuntimeHooks: <State extends AuthRuntimeBaseState<User>, User = unknown, Role = string>({ authActionsUseCase, credentialsUseCase, googleAuthUseCase, cookieStore, useNavigation, }: AuthRuntimeHookFactoryOptions<State, User, Role>) => {
    useCredentialsActions: ({ setAuthState, }: {
        setAuthState: Dispatch<SetStateAction<State | null>>;
    }) => AuthCredentialsActionsState<State, User>;
    useSessionActions: ({ setAuthState, }: {
        setAuthState: Dispatch<SetStateAction<State | null>>;
    }) => AuthSessionActionsState<State, User, Role>;
    useGoogleActions: ({ setAuthState, }: {
        setAuthState: Dispatch<SetStateAction<State | null>>;
    }) => AuthGoogleActionsState<State, User, Role>;
    useAuthFlowCompletion: () => (options?: AuthFlowCompletionOptions<Role> | undefined) => Promise<void>;
};

declare const VISITOR_SESSION_COOKIE = "visitor_session";
declare const VISITOR_SESSION_HEADER = "X-Visitor-Session";
declare function getVisitorSession(): string | null;
declare function ensureVisitorSession(): string;

export { type AuthAxiosClientOptions, type AuthCredentialsActionsState, type AuthDialogBodyRenderProps, AuthDialogFrame, type AuthDialogFrameProps, type AuthDialogRenderer, AuthFlowCompletionOptions, type AuthGoogleActionsState, type AuthNavigationAdapter, type AuthRuntimeBaseState, type AuthRuntimeContextValue, type AuthRuntimeHookFactories, type AuthRuntimeHookFactoryOptions, type AuthSessionActionsState, GOOGLE_AUTH_POPUP_MESSAGE_TYPE, GoogleAuthError, type GoogleAuthPopupMessage, GoogleAuthRedirectRequest, LoginRequest, PasswordResetRequest, RegisterRequest, RestorePasswordRequest, UserRole, VISITOR_SESSION_COOKIE, VISITOR_SESSION_HEADER, buildGoogleCallbackUrl, createAuthAxiosClient, createAuthAxiosLocaleStore, createAuthFlowCompletionHook, createAuthRuntime, createAuthRuntimeHooks, createGoogleAuthPopupMessage, createGoogleAuthRequestId, createNextAuthActionsService, createNextAuthCookieStore, createNextAuthUseCases, createNextCredentialsService, createNextGoogleAuthService, ensureVisitorSession, getAuthActionErrorMessage, getGoogleAuthErrorMessage, getVisitorSession, isGoogleAuthPopupMessage, resolveAuthRedirectTo, resolveGoogleAuthRedirectTo };
