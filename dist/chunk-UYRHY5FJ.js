// src/domain.ts
import z from "zod";
var userRoleSchema = z.enum(["partner", "parent"]);
var userCompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  status: z.string().nullable().optional()
});
var userSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string(),
  role: z.string().optional().nullable(),
  permissions: z.array(z.string()).optional(),
  company: userCompanySchema.nullable().optional()
});

// src/schemas.ts
import z2 from "zod";
var meResponseSchema = userSchema;
var accountSummaryResponseSchema = z2.object({
  company: userSchema.shape.company ?? z2.null()
});
var logoutResponseSchema = z2.object({
  message: z2.string()
});
var logoutAllResponseSchema = z2.object({
  message: z2.string()
});
var completeRoleResponseSchema = z2.object({
  message: z2.string(),
  user: userSchema
});
var passwordResetResponseSchema = z2.object({
  message: z2.string()
});
var restorePasswordResponseSchema = z2.object({
  message: z2.string(),
  status: z2.string().optional()
});
var credentialsAuthResponseSchema = z2.object({
  user: userSchema,
  token: z2.string()
});
var loginResponseSchema = credentialsAuthResponseSchema;
var registerResponseSchema = credentialsAuthResponseSchema;

// src/services.ts
var createAuthActionsService = (api) => ({
  async me() {
    const response = await api.get("/auth/v1/me");
    const user = meResponseSchema.parse(response.data);
    try {
      const summaryResponse = await api.get("/app/v1/account/summary");
      const summary = accountSummaryResponseSchema.parse(summaryResponse.data);
      return {
        ...user,
        company: summary.company ?? null
      };
    } catch {
      return user;
    }
  },
  async completeRole(role) {
    const response = await api.post("/auth/v1/complete-role", { role });
    return completeRoleResponseSchema.parse(response.data);
  },
  async logout() {
    const response = await api.post("/auth/v1/logout");
    return logoutResponseSchema.parse(response.data);
  },
  async logoutAll() {
    const response = await api.post("/auth/v1/logout-all");
    return logoutAllResponseSchema.parse(response.data);
  }
});
var createCredentialsService = (api) => ({
  async login(data) {
    const response = await api.post("/auth/v1/login", data);
    return loginResponseSchema.parse(response.data);
  },
  async register(data) {
    const response = await api.post("/auth/v1/register", data);
    return registerResponseSchema.parse(response.data);
  },
  async requestPasswordReset(data) {
    const response = await api.post("/auth/v1/restore-send", data);
    return passwordResetResponseSchema.parse(response.data);
  },
  async restorePassword(data) {
    const response = await api.post("/auth/v1/restore-password", data);
    return restorePasswordResponseSchema.parse(response.data);
  }
});
var createGoogleAuthService = (getApiUrl) => ({
  getRedirectUrl(redirectUrl) {
    const url = new URL(getApiUrl("/auth/v1/google/redirect"));
    url.searchParams.set("redirect_url", redirectUrl);
    return url.toString();
  },
  getRedirectUrlWithRole(data) {
    const url = new URL(getApiUrl("/auth/v1/google/redirect"));
    url.searchParams.set("redirect_url", data.redirectUrl);
    if (data.role) {
      url.searchParams.set("role", data.role);
    }
    return url.toString();
  }
});

// src/usecases.ts
import z3 from "zod";
var credentialsLoginPayloadSchema = z3.object({
  email: z3.email(),
  password: z3.string(),
  role: userRoleSchema.optional()
});
var credentialsRegisterPayloadSchema = z3.object({
  name: z3.string(),
  email: z3.email(),
  password: z3.string(),
  password_confirmation: z3.string(),
  role: userRoleSchema.optional()
});
var credentialsPasswordResetPayloadSchema = z3.object({
  email: z3.email(),
  url: z3.url()
});
var credentialsRestorePasswordPayloadSchema = z3.object({
  email: z3.email(),
  token: z3.string().min(1),
  password: z3.string().min(8),
  password_confirmation: z3.string().min(8)
});
var googleAuthRedirectUrlPayloadSchema = z3.object({
  redirectUrl: z3.string(),
  role: userRoleSchema.optional()
});
var googleAuthTokenPayloadSchema = z3.string();
var deleteCookie = async (cookieStore, name) => {
  if (cookieStore.delete) {
    await cookieStore.delete(name);
    return;
  }
  if (cookieStore.remove) {
    await cookieStore.remove(name);
  }
};
var createAuthActionsUseCase = ({
  service,
  cookieStore
}) => ({
  async me() {
    try {
      return await service.me();
    } catch {
      return null;
    }
  },
  async logout() {
    try {
      const response = await service.logout();
      await deleteCookie(cookieStore, "token");
      return response;
    } catch (error) {
      console.warn(error);
      return null;
    }
  },
  async logoutAll() {
    const response = await service.logoutAll();
    await deleteCookie(cookieStore, "token");
    return response;
  },
  async completeRole(role) {
    return await service.completeRole(role);
  }
});
var createCredentialsUseCase = ({
  service,
  cookieStore
}) => ({
  async login(data) {
    const payload = credentialsLoginPayloadSchema.parse(data);
    const response = await service.login(payload);
    await cookieStore.set?.("token", response.token);
    return response;
  },
  async register(data) {
    const payload = credentialsRegisterPayloadSchema.parse(data);
    const response = await service.register(payload);
    await cookieStore.set?.("token", response.token);
    return response;
  },
  async requestPasswordReset(data) {
    const payload = credentialsPasswordResetPayloadSchema.parse(data);
    return await service.requestPasswordReset(payload);
  },
  async restorePassword(data) {
    const payload = credentialsRestorePasswordPayloadSchema.parse(data);
    return await service.restorePassword(payload);
  }
});
var createGoogleAuthUseCase = ({
  service,
  authActionsUseCase,
  cookieStore
}) => ({
  getRedirectUrl(redirectUrl) {
    const payload = googleAuthRedirectUrlPayloadSchema.parse(redirectUrl);
    return service.getRedirectUrlWithRole(payload);
  },
  async completeLogin(token) {
    const validatedToken = googleAuthTokenPayloadSchema.parse(token);
    await cookieStore.set?.("token", validatedToken);
    const user = await authActionsUseCase.me();
    if (!user) {
      await deleteCookie(cookieStore, "token");
      throw new Error("failed_to_load_user");
    }
    return {
      user,
      token: validatedToken
    };
  },
  async persistToken(token) {
    const validatedToken = googleAuthTokenPayloadSchema.parse(token);
    await cookieStore.set?.("token", validatedToken);
  }
});

export {
  userRoleSchema,
  userCompanySchema,
  userSchema,
  meResponseSchema,
  accountSummaryResponseSchema,
  logoutResponseSchema,
  logoutAllResponseSchema,
  completeRoleResponseSchema,
  passwordResetResponseSchema,
  restorePasswordResponseSchema,
  credentialsAuthResponseSchema,
  loginResponseSchema,
  registerResponseSchema,
  createAuthActionsService,
  createCredentialsService,
  createGoogleAuthService,
  credentialsLoginPayloadSchema,
  credentialsRegisterPayloadSchema,
  credentialsPasswordResetPayloadSchema,
  credentialsRestorePasswordPayloadSchema,
  googleAuthRedirectUrlPayloadSchema,
  googleAuthTokenPayloadSchema,
  createAuthActionsUseCase,
  createCredentialsUseCase,
  createGoogleAuthUseCase
};
