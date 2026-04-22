import { resolveAuthRedirectTo } from "./auth-redirect";

export const GOOGLE_AUTH_POPUP_MESSAGE_TYPE = "auth.google.callback";
const DEFAULT_GOOGLE_REDIRECT_TO = "/dashboard";

export interface GoogleAuthPopupMessage {
	type: typeof GOOGLE_AUTH_POPUP_MESSAGE_TYPE;
	requestId: string;
	token?: string;
	error?: string;
	message?: string;
}

export class GoogleAuthError extends Error {
	code: string;

	constructor(code: string) {
		super(getGoogleAuthErrorMessage(code));
		this.name = "GoogleAuthError";
		this.code = code;
	}
}

export const createGoogleAuthRequestId = () =>
	globalThis.crypto?.randomUUID?.() ??
	`${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const resolveGoogleAuthRedirectTo = (redirectTo?: string | null) => {
	return (
		resolveAuthRedirectTo(redirectTo, DEFAULT_GOOGLE_REDIRECT_TO) ||
		DEFAULT_GOOGLE_REDIRECT_TO
	);
};

export const buildGoogleCallbackUrl = ({
	redirectTo,
	requestId,
}: {
	redirectTo?: string | null;
	requestId: string;
}) => {
	if (typeof window === "undefined") {
		throw new Error("Google callback URL can be built only in the browser");
	}

	const url = new URL("/auth/google/callback", window.location.origin);
	url.searchParams.set("requestId", requestId);
	url.searchParams.set("redirectTo", resolveGoogleAuthRedirectTo(redirectTo));

	return url.toString();
};

export const createGoogleAuthPopupMessage = (
	message: Omit<GoogleAuthPopupMessage, "type">,
): GoogleAuthPopupMessage => ({
	type: GOOGLE_AUTH_POPUP_MESSAGE_TYPE,
	...message,
});

export const isGoogleAuthPopupMessage = (
	value: unknown,
): value is GoogleAuthPopupMessage => {
	if (!value || typeof value !== "object") {
		return false;
	}

	const message = value as Partial<GoogleAuthPopupMessage>;

	return (
		message.type === GOOGLE_AUTH_POPUP_MESSAGE_TYPE &&
		typeof message.requestId === "string"
	);
};

export const getGoogleAuthErrorMessage = (error: unknown) => {
	const code =
		error instanceof GoogleAuthError
			? error.code
			: typeof error === "string"
				? error
				: error instanceof Error
					? error.message
					: null;

	switch (code) {
		case "popup_blocked":
			return "Браузер заблокировал окно Google. Разрешите pop-up и попробуйте ещё раз.";
		case "popup_closed":
			return "Окно авторизации Google было закрыто до завершения входа.";
		case "invalid_popup_response":
			return "Google вернул неполный ответ. Попробуйте ещё раз.";
		case "invalid_google_auth":
			return "Не удалось подтвердить авторизацию через Google.";
		case "invalid_google_user":
			return "Google не вернул корректные данные пользователя.";
		case "google_email_not_verified":
			return "В аккаунте Google должен быть подтверждён email.";
		case "failed_to_load_user":
			return "Не удалось загрузить профиль после входа через Google.";
		case "role_conflict":
			return "Этот аккаунт нельзя использовать в выбранном сценарии.";
		default:
			return typeof code === "string" && code.length > 0
				? code
				: "Не удалось войти через Google.";
	}
};
