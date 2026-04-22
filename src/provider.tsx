"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import type {
	AuthRuntimeBaseState,
	AuthRuntimeContextValue,
	AuthRuntimeHookFactories,
} from "./types";

export const createAuthRuntime = <
	State extends AuthRuntimeBaseState<User>,
	User = unknown,
	Role = string,
>() => {
	const AuthContext = createContext<AuthRuntimeContextValue<
		State,
		User,
		Role
	> | null>(null);

	const AuthProvider = ({
		children,
		initialState,
		hooks,
	}: {
		children: ReactNode;
		initialState: State | null;
		hooks: AuthRuntimeHookFactories<State, User, Role>;
	}) => {
		const [authState, setAuthState] = useState<State | null>(initialState);
		const credentialsActions = hooks.useCredentialsActions({ setAuthState });
		const sessionActions = hooks.useSessionActions({ setAuthState });
		const googleActions = hooks.useGoogleActions({ setAuthState });

		return (
			<AuthContext.Provider
				value={{
					...credentialsActions,
					...sessionActions,
					...googleActions,
					state: authState,
				}}
			>
				{children}
			</AuthContext.Provider>
		);
	};

	const useAuthContext = () => {
		const context = useContext(AuthContext);

		if (!context) {
			throw new Error("useAuthContext must be used within an AuthProvider");
		}

		return context;
	};

	return {
		AuthProvider,
		useAuthContext,
	};
};
