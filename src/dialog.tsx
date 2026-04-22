"use client";

import { type ReactNode, useCallback, useEffect, useState } from "react";
import type { AuthFlowCompletionOptions } from "./domain";
import type { AuthDialogRenderer } from "./types";

export type AuthDialogFrameProps<Role = string> =
	AuthFlowCompletionOptions<Role> & {
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

export const AuthDialogFrame = <Role,>({
	open,
	onOpenChange,
	defaultMode = "login",
	title,
	description,
	redirectTo,
	fallbackRedirectTo,
	refreshOnSuccess,
	onSuccess,
	role,
	renderFrame,
	renderLogin,
	renderRegister,
}: AuthDialogFrameProps<Role>) => {
	const [mode, setMode] = useState<"login" | "register">(defaultMode);

	useEffect(() => {
		if (open) {
			setMode(defaultMode);
		}
	}, [defaultMode, open]);

	const handleAuthSuccess = useCallback(async () => {
		onOpenChange(false);

		if (onSuccess) {
			await onSuccess();
		}
	}, [onOpenChange, onSuccess]);

	const commonProps = {
		redirectTo,
		fallbackRedirectTo,
		refreshOnSuccess,
		onSuccess: handleAuthSuccess,
		role,
	};

	return renderFrame({
		open,
		onOpenChange,
		title,
		description,
		children:
			mode === "login"
				? renderLogin({
						...commonProps,
						onSwitch: () => setMode("register"),
					})
				: renderRegister({
						...commonProps,
						onSwitch: () => setMode("login"),
					}),
	});
};
