import { NextRequest, NextResponse } from 'next/server';

type NextAuthRouteOptions = {
    authCookieName?: string;
    authCookieHttpOnly?: boolean;
};
type NextAuthRouteApiClient = {
    get<Response = unknown>(url: string, config?: {
        headers?: Record<string, string>;
        validateStatus?: () => boolean;
    }): Promise<{
        data: Response;
        status: number;
    }>;
    post<Response = unknown>(url: string, data?: unknown, config?: {
        headers?: Record<string, string>;
        validateStatus?: () => boolean;
    }): Promise<{
        data: Response;
        status: number;
    }>;
};
declare const createGoogleAuthCallbackRouteHandler: ({ api, authCookieName, authCookieHttpOnly, }: Pick<NextAuthRouteOptions, "authCookieName" | "authCookieHttpOnly"> & {
    api: NextAuthRouteApiClient;
}) => (request: NextRequest) => Promise<NextResponse<unknown>>;

export { type NextAuthRouteApiClient, type NextAuthRouteOptions, createGoogleAuthCallbackRouteHandler };
