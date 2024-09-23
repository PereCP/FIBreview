import * as jose from "jose";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

import { jwtPayload } from "./@types";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const requiredAuthentication = path === "/reviews/new";
  const loginPath = path === "/login" || path === "/sign-up";
  const develpmentEndpoints = /\/api\/services\/*/.exec(path) !== null;
  const isDevelopment = process.env.NODE_ENV === "development";
  const jwtToken = (await request.cookies.get("jwtToken")?.value) || "";

  if (develpmentEndpoints && !isDevelopment) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  // Redirect if token is not present and authentication is required
  if (requiredAuthentication && !jwtToken) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  } else if (requiredAuthentication && jwtToken) {
    let secretToken: Uint8Array;
    let payload: jwtPayload | undefined;
    let tokenVerified: boolean = true;

    try {
      secretToken = new TextEncoder().encode(
        process.env.TOKEN_SECRET as string,
      );
      payload = (await jose.jwtVerify(jwtToken, secretToken))
        .payload as jwtPayload;
    } catch (error: any) {
      if (error.toString().includes("JWTExpired")) {
        payload = (error as jose.JWTVerifyResult).payload as jwtPayload;
        delete payload.iat;
        delete payload.exp;
        tokenVerified = true;
        let response: NextResponse = NextResponse.redirect(
          new URL("/", request.nextUrl),
        );
        response.cookies.set(
          "jwtToken",
          await refreshToken(request, payload as jwtPayload),
        );
        return response;
      } else {
        if (requiredAuthentication && !loginPath) {
          return NextResponse.redirect(new URL("/login", request.nextUrl));
        }
      }
    }

    if (loginPath && jwtToken && tokenVerified) {
      return NextResponse.redirect(new URL("/", request.nextUrl));
    }
  }

  const slug = new RegExp(/\/courses\/(.*)\/reviews/g).exec(path);

  if (slug) {
    const originalSlug = slug[1].toString();
    const upperSlug = originalSlug.toUpperCase();

    if (originalSlug !== upperSlug) {
      return NextResponse.redirect(
        new URL("/courses/" + upperSlug + "/reviews", request.nextUrl),
      );
    }
  }
}

async function refreshToken(request: NextRequest, payload: jwtPayload) {
  // TODO: Refresh OAuth token

  // Return new JWT token
  const algo = "HS256";
  const secret = new TextEncoder().encode(process.env.TOKEN_SECRET as string);
  const jwtToken = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: algo })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);

  return jwtToken;
}

export const config = {
  matcher: [
    "/login",
    "/sign-up",
    "/api/services/:path*",
    "/reviews/new",
    "/api/reviews",
    "/courses/:slug/reviews",
  ],
};
