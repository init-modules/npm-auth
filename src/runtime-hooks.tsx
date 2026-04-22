"use client";

import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useState } from "react";
import { resolveAuthRedirectTo } from "./auth-redirect";
import type { AuthFlowCompletionOptions } from "./domain";
import { getAuthActionErrorMessage } from "./errors";
import {
	buildGoogleCallbackUrl,
	createGoogleAuthRequestId,
	GoogleAuthError,
	getGoogleAuthErrorMessage,
	isGoogleAuthPopupMessage,
	resolveGoogleAuthRedirectTo,
} from "./google-auth-popup";
import type {
	AuthCredentialsActionsState,
	AuthGoogleActionsState,
	AuthNavigationAdapter,
	AuthRuntimeBaseState,
	AuthSessionActionsState,
} from "./types";

import type {
	AuthActionsUseCase,
	AuthCookieStore,
	CredentialsUseCase,
	GoogleAuthUseCase,
} from "./usecases";

export type AuthRuntimeHookFactoryOptions<
	State extends AuthRuntimeBaseState<User>,
	User = unknown,
	Role = string,
> = {
	authActionsUseCase: AuthActionsUseCase;
	credentialsUseCase: CredentialsUseCase;
	googleAuthUseCase: GoogleAuthUseCase;
	cookieStore: AuthCookieStore;
	useNavigation: () => AuthNavigationAdapter;
};

const openCenteredPopup = (url: string) => {
	const width = 520;
	const height = 720;
	const left = window.screenX + Math.max((window.outerWidth - width) / 2, 0);
	const top = window.screenY + Math.max((window.outerHeight - height) / 2, 0);

	return window.open(
		url,
		"google-auth-popup",
		[
			"popup=yes",
			"toolbar=no",
			"menubar=no",
			"width=520",
			"height=720",
			`left=${Math.round(left)}`,
			`top=${Math.round(top)}`,
		].join(","),
	);
};

const waitForGooglePopupResult = ({
	requestId,
	url,
}: {
	requestId: string;
	url: string;
}) =>
	new Promise<void>((resolve, reject) => {
		const popup = openCenteredPopup(url);

		if (!popup) {
			reject(new GoogleAuthError("popup_blocked"));
			return;
		}

		let isSettled = false;

		const cleanup = () => {
			window.removeEventListener("message", onMessage);
			window.clearInterval(closeWatcher);
		};

		const settleError = (code: string) => {
			if (isSettled) {
				return;
			}

			isSettled = true;
			cleanup();
			reject(new GoogleAuthError(code));
		};

		const onMessage = (event: MessageEvent<unknown>) => {
			if (event.origin !== window.location.origin) {
				return;
			}

			if (event.source !== popup) {
				return;
			}

			if (!isGoogleAuthPopupMessage(event.data)) {
				return;
			}

			if (event.data.requestId !== requestId) {
				return;
			}

			isSettled = true;
			cleanup();

			if (!popup.closed) {
				popup.close();
			}

			if (event.data.error) {
				reject(event.data.message ?? new GoogleAuthError(event.data.error));
				return;
			}

			resolve();
		};

		const closeWatcher = window.setInterval(() => {
			if (popup.closed) {
				settleError("popup_closed");
			}
		}, 500);

		window.addEventListener("message", onMessage);
		popup.focus();
	});

export const createAuthFlowCompletionHook = <Role,>({
	useNavigation,
}: {
	useNavigation: () => AuthNavigationAdapter;
}) => {
	return function useAuthFlowCompletion() {
		const router = useNavigation();

		return useCallback(
			async (options?: AuthFlowCompletionOptions<Role>) => {
				if (options?.onSuccess) {
					await options.onSuccess();
				}

				if (options?.refreshOnSuccess) {
					router.refresh();
				}

				const redirectTo = resolveAuthRedirectTo(options?.redirectTo, null);

				if (redirectTo) {
					router.push(redirectTo);
				}
			},
			[router],
		);
	};
};

export const createAuthRuntimeHooks = <
	State extends AuthRuntimeBaseState<User>,
	User = unknown,
	Role = string,
>({
	authActionsUseCase,
	credentialsUseCase,
	googleAuthUseCase,
	cookieStore,
	useNavigation,
}: AuthRuntimeHookFactoryOptions<State, User, Role>) => {
	const useAuthFlowCompletion = createAuthFlowCompletionHook<Role>({
		useNavigation,
	});

	const useSessionActions = ({
		setAuthState,
	}: {
		setAuthState: Dispatch<SetStateAction<State | null>>;
	}): AuthSessionActionsState<State, User, Role> => {
		const [isLogoutRunning, setIsLogoutRunning] = useState(false);
		const [logoutError, setLogoutError] = useState<unknown>(null);
		const router = useNavigation();

		useEffect(() => {
			if (cookieStore.get?.("is-logging-out")) {
				setAuthState(null);
				void cookieStore.remove?.("is-logging-out");
				void cookieStore.delete?.("is-logging-out");
			}
		}, [router.pathname, setAuthState]);

		const logout = useCallback(
			async (options?: { redirectTo?: string | null }) => {
				const { redirectTo = "/" } = options ?? {};

				try {
					setIsLogoutRunning(true);
					await authActionsUseCase.logout();

					if (redirectTo) {
						router.push(redirectTo);
						void cookieStore.set?.("is-logging-out", "true");
					} else {
						setIsLogoutRunning(false);
						setAuthState(null);
					}
				} catch (error) {
					setLogoutError(error);
					setIsLogoutRunning(false);
				}
			},
			[router, setAuthState],
		);

		const completeRole = useCallback(
			async (role: Role) => {
				const response = await authActionsUseCase.completeRole(role as never);
				setAuthState((current) =>
					current
						? {
								...current,
								user: response.user as User,
							}
						: ({
								token: null,
								user: response.user as User,
							} as State),
				);
			},
			[setAuthState],
		);

		const refreshSession = useCallback(async () => {
			const user = await authActionsUseCase.me();

			setAuthState(
				user
					? ({
							user: user as User,
							token: null,
						} as State)
					: null,
			);
		}, [setAuthState]);

		return {
			completeRole,
			refreshSession,
			logout,
			isLogoutRunning,
			logoutError,
		};
	};

	const useCredentialsActions = ({
		setAuthState,
	}: {
		setAuthState: Dispatch<SetStateAction<State | null>>;
	}): AuthCredentialsActionsState<State, User> => {
		const [isRegisterRunning, setIsRegisterRunning] = useState(false);
		const [registerError, setRegisterError] = useState<string | null>(null);
		const [isLoginRunning, setIsLoginRunning] = useState(false);
		const [loginError, setLoginError] = useState<string | null>(null);
		const [isPasswordResetRunning, setIsPasswordResetRunning] = useState(false);
		const [passwordResetError, setPasswordResetError] = useState<string | null>(
			null,
		);
		const [isRestorePasswordRunning, setIsRestorePasswordRunning] =
			useState(false);
		const [restorePasswordError, setRestorePasswordError] = useState<
			string | null
		>(null);

		const register = useCallback(
			async (data: Parameters<typeof credentialsUseCase.register>[0]) => {
				try {
					setIsRegisterRunning(true);
					setRegisterError(null);
					const response = await credentialsUseCase.register(data);
					const hydratedUser = await authActionsUseCase.me();
					const user = hydratedUser ?? response.user;
					setAuthState({ user: user as User, token: null } as State);
					return { ...response, user };
				} catch (error) {
					setRegisterError(getAuthActionErrorMessage(error, "register"));
					throw error;
				} finally {
					setIsRegisterRunning(false);
				}
			},
			[setAuthState],
		);

		const login = useCallback(
			async (data: Parameters<typeof credentialsUseCase.login>[0]) => {
				try {
					setIsLoginRunning(true);
					setLoginError(null);
					const response = await credentialsUseCase.login(data);
					const hydratedUser = await authActionsUseCase.me();
					const user = hydratedUser ?? response.user;
					setAuthState({ user: user as User, token: null } as State);
					return { ...response, user };
				} catch (error) {
					setLoginError(getAuthActionErrorMessage(error, "login"));
					throw error;
				} finally {
					setIsLoginRunning(false);
				}
			},
			[setAuthState],
		);

		const requestPasswordReset = useCallback(
			async (
				data: Parameters<typeof credentialsUseCase.requestPasswordReset>[0],
			) => {
				try {
					setIsPasswordResetRunning(true);
					setPasswordResetError(null);
					return await credentialsUseCase.requestPasswordReset(data);
				} catch (error) {
					setPasswordResetError(
						getAuthActionErrorMessage(error, "password-reset"),
					);
					throw error;
				} finally {
					setIsPasswordResetRunning(false);
				}
			},
			[],
		);

		const restorePassword = useCallback(
			async (data: Parameters<typeof credentialsUseCase.restorePassword>[0]) => {
				try {
					setIsRestorePasswordRunning(true);
					setRestorePasswordError(null);
					return await credentialsUseCase.restorePassword(data);
				} catch (error) {
					setRestorePasswordError(getAuthActionErrorMessage(error, "password-reset"));
					throw error;
				} finally {
					setIsRestorePasswordRunning(false);
				}
			},
			[],
		);

		return {
			login,
			register,
			requestPasswordReset,
			restorePassword,
			isRegisterRunning,
			registerError,
			isLoginRunning,
			loginError,
			isPasswordResetRunning,
			passwordResetError,
			isRestorePasswordRunning,
			restorePasswordError,
		};
	};

	const useGoogleActions = ({
		setAuthState,
	}: {
		setAuthState: Dispatch<SetStateAction<State | null>>;
	}): AuthGoogleActionsState<State, User, Role> => {
		const [isGoogleLoginRunning, setIsGoogleLoginRunning] = useState(false);
		const [googleLoginError, setGoogleLoginError] = useState<string | null>(
			null,
		);
		const completeAuthFlow = useAuthFlowCompletion();

		const loginWithGoogle = useCallback(
			async (options?: AuthFlowCompletionOptions<Role>) => {
				const redirectTo = resolveAuthRedirectTo(options?.redirectTo, null);
				const fallbackRedirectTo = resolveGoogleAuthRedirectTo(
					options?.fallbackRedirectTo ?? options?.redirectTo,
				);
				const requestId = createGoogleAuthRequestId();

				try {
					setGoogleLoginError(null);
					setIsGoogleLoginRunning(true);

					const callbackUrl = buildGoogleCallbackUrl({
						redirectTo: fallbackRedirectTo,
						requestId,
					});
					const redirectUrl = googleAuthUseCase.getRedirectUrl({
						redirectUrl: callbackUrl,
						role: options?.role as never,
					});
					await waitForGooglePopupResult({
						requestId,
						url: redirectUrl,
					});
					const user = await authActionsUseCase.me();

					if (!user) {
						throw new GoogleAuthError("failed_to_load_user");
					}

					setAuthState({
						user: user as User,
						token: null,
					} as State);
					await completeAuthFlow({
						...options,
						redirectTo,
					});
				} catch (error) {
					setGoogleLoginError(getGoogleAuthErrorMessage(error));
				} finally {
					setIsGoogleLoginRunning(false);
				}
			},
			[completeAuthFlow, setAuthState],
		);

		return {
			loginWithGoogle,
			isGoogleLoginRunning,
			googleLoginError,
		};
	};

	return {
		useCredentialsActions,
		useSessionActions,
		useGoogleActions,
		useAuthFlowCompletion,
	};
};
