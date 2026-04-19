import axios from "axios";

type AuthActionErrorIntent = "login" | "register";

const AUTH_ACTION_FALLBACK_MESSAGES: Record<AuthActionErrorIntent, string> = {
	login: "Не удалось войти. Проверьте данные и попробуйте ещё раз.",
	register:
		"Не удалось завершить регистрацию. Проверьте данные и попробуйте ещё раз.",
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

export const getAuthActionErrorMessage = (
	error: unknown,
	intent: AuthActionErrorIntent,
) => {
	if (axios.isAxiosError(error)) {
		const apiMessage =
			typeof error.response?.data?.message === "string"
				? error.response.data.message
				: getFirstNestedMessage(error.response?.data?.errors);

		if (apiMessage) {
			return apiMessage;
		}
	}

	if (error instanceof Error && error.message) {
		return error.message;
	}

	return AUTH_ACTION_FALLBACK_MESSAGES[intent];
};
