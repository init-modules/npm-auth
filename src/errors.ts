import axios from "axios";

type AuthActionErrorIntent = "login" | "register" | "password-reset";

const AUTH_ACTION_FALLBACK_MESSAGES: Record<AuthActionErrorIntent, string> = {
	login: "Не удалось войти. Проверьте данные и попробуйте ещё раз.",
	register:
		"Не удалось завершить регистрацию. Проверьте данные и попробуйте ещё раз.",
	"password-reset":
		"Не удалось выполнить сброс пароля. Проверьте данные и попробуйте ещё раз.",
};

const getFirstNestedMessage = (value: unknown): string | null => {
	if (!value) {
		return null;
	}

	if (typeof value === "string") {
		return value;
	}

	if (Array.isArray(value)) {
		for (const entry of value) {
			const message = getFirstNestedMessage(entry);

			if (message) {
				return message;
			}
		}

		return null;
	}

	if (typeof value === "object") {
		for (const nestedValue of Object.values(value)) {
			const message = getFirstNestedMessage(nestedValue);

			if (message) {
				return message;
			}
		}
	}

	return null;
};

const readApiErrorMessage = (value: unknown) => {
	if (!value || typeof value !== "object") {
		return null;
	}

	const payload = value as { errors?: unknown; message?: unknown };

	return typeof payload.message === "string"
		? payload.message
		: getFirstNestedMessage(payload.errors);
};

export const getAuthActionErrorMessage = (
	error: unknown,
	intent: AuthActionErrorIntent,
) => {
	if (axios.isAxiosError(error)) {
		const apiMessage = readApiErrorMessage(error.response?.data);

		if (apiMessage) {
			return apiMessage;
		}
	}

	const apiMessage = readApiErrorMessage(error);

	if (apiMessage) {
		return apiMessage;
	}

	if (error instanceof Error && error.message) {
		return error.message;
	}

	return AUTH_ACTION_FALLBACK_MESSAGES[intent];
};
