import { NextRequest, NextResponse } from "next/server";

import InvalidToken from "src/lib/exceptions/InvalidToken";

import { getUserToken, verifyAndUpdateToken } from "./lib/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const requiredAuthentication = path === "/reviews/new";
  const loginPath = path === "/login" || path === "/sign-up";
  const developmentEndpoints = /\/api\/services\/*/.exec(path) !== null;
  const adminEndpoints = /\/admin\/*/.exec(path) !== null;
  const isDevelopment = process.env.NODE_ENV === "development";

  if (developmentEndpoints && !isDevelopment) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  const { response, isAuthenticated } = await verifyAndUpdateToken(
    request,
    NextResponse.redirect(new URL("/", request.nextUrl)),
  );

  if (loginPath && isAuthenticated) {
    return response;
  } else if (requiredAuthentication && !isAuthenticated) {
    const { pathname, search } = request.nextUrl;
    response.cookies.set(
      "redirectAfterLogin",
      JSON.stringify({ pathname, search }),
    );
    return response;
  } else if (adminEndpoints) {
    if (isAuthenticated) {
      const tokenPayload = (await request.cookies.get("jwtToken")?.value) || "";
      let userToken;
      try {
        userToken = (await getUserToken(tokenPayload)).userToken;
      } catch (error: any) {
        userToken = null;
        if (error instanceof InvalidToken) {
          response.cookies.delete("jwtToken");
        }
      }

      if (userToken && userToken.isAdmin) {
        // Do nothing, continue to the admin page
        return;
      }
    }
    return NextResponse.redirect(new URL("/", request.nextUrl));
  } else {
    const slug = new RegExp(/\/courses\/(.*)\/reviews/g).exec(path);

    if (slug) {
      const originalSlug = slug[1].toString();
      const upperSlug = originalSlug.toUpperCase();

      if (originalSlug !== upperSlug) {
        return NextResponse.redirect(
          new URL(`/courses/${upperSlug}/reviews`, request.nextUrl),
        );
      }
    }
  }
}

export const config = {
  matcher: [
    "/login",
    "/sign-up",
    "/api/services/:path*",
    "/reviews/new",
    "/admin/:path*",
    "/api/reviews",
    "/courses/:slug/reviews",
  ],
};
