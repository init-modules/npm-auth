import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { AuthFlowCompletionOptions } from "./domain";

export type AuthRuntimeBaseState<User = unknown> = {
	user: User | null;
	token: string | null;
};

export type AuthCredentialsActionsState<
	State extends AuthRuntimeBaseState<User>,
	User = unknown,
> = {
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

export type AuthSessionActionsState<
	State extends AuthRuntimeBaseState<User>,
	User = unknown,
	Role = string,
> = {
	logout: (options?: { redirectTo?: string | null }) => Promise<void>;
	completeRole: (role: Role) => Promise<void>;
	refreshSession: () => Promise<void>;
	isLogoutRunning: boolean;
	logoutError: unknown;
};

export type AuthGoogleActionsState<
	State extends AuthRuntimeBaseState<User>,
	User = unknown,
	Role = string,
> = {
	loginWithGoogle: (options?: AuthFlowCompletionOptions<Role>) => Promise<void>;
	isGoogleLoginRunning: boolean;
	googleLoginError: string | null;
};

export type AuthRuntimeContextValue<
	State extends AuthRuntimeBaseState<User>,
	User = unknown,
	Role = string,
> = AuthCredentialsActionsState<State, User> &
	AuthSessionActionsState<State, User, Role> &
	AuthGoogleActionsState<State, User, Role> & {
		state: State | null;
	};

export type AuthRuntimeHookFactories<
	State extends AuthRuntimeBaseState<User>,
	User = unknown,
	Role = string,
> = {
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

export type AuthDialogBodyRenderProps<Role = string> =
	AuthFlowCompletionOptions<Role> & {
		onSwitch: () => void;
		onSuccess: () => Promise<void>;
	};

export type AuthDialogRenderer<Role = string> = (
	props: AuthDialogBodyRenderProps<Role>,
) => ReactNode;

export interface AuthNavigationAdapter {
	pathname: string;
	push: (url: string) => void;
	refresh: () => void;
}
