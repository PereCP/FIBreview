import axios from "axios";
import Crypto from "crypto";
import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";

import { UserToken } from "src/@types";

interface UserTokenPayload extends jose.JWTPayload {
  data: string;
}

async function verifyAndUpdateToken(
  req: NextRequest,
  res: NextResponse,
): Promise<{ response: NextResponse; isAuthenticated: Boolean }> {
  const tokenPayload = (await req.cookies.get("jwtToken")?.value) || "";

  if (!tokenPayload) {
    return { response: res, isAuthenticated: false };
  }

  try {
    const { userToken, refreshed } = await getUserToken(tokenPayload);

    if (refreshed) {
      res.cookies.set("jwtToken", await createToken(userToken));
    }
  } catch (error: any) {
    return { response: res, isAuthenticated: false };
  }

  return { response: res, isAuthenticated: true };
}

async function getUserToken(
  tokenPayload: string,
): Promise<{ userToken: UserToken; refreshed: Boolean }> {
  const secretToken: Uint8Array = new TextEncoder().encode(
    process.env.TOKEN_SECRET as string,
  );

  try {
    const encryptedUserToken = (await jose.jwtVerify(tokenPayload, secretToken))
      .payload as UserTokenPayload;
    const userToken = decryptToken(encryptedUserToken.data) as UserToken;
    return { userToken: userToken, refreshed: false };
  } catch (error: any) {
    if (error instanceof jose.errors.JWTExpired) {
      // Refresh token
      const userToken = decryptToken(
        ((error as any as jose.JWTVerifyResult).payload as UserTokenPayload)
          .data,
      ) as UserToken;
      const newToken = await refreshToken(userToken);
      return { userToken: newToken, refreshed: true };
    } else {
      throw new Error("Invalid token");
    }
  }
}

async function createToken(userToken: UserToken): Promise<string> {
  const newToken = encryptToken(userToken);

  const algo = "HS256";
  const secret = new TextEncoder().encode(process.env.TOKEN_SECRET as string);
  const jwtToken = await new jose.SignJWT({
    data: newToken,
  } as UserTokenPayload)
    .setProtectedHeader({ alg: algo })
    .setIssuedAt()
    .setExpirationTime("9h")
    .sign(secret);

  return jwtToken;
}

function encryptToken(data: UserToken): string {
  const KEY = process.env.ENCRYPTION_KEY;
  const IV = process.env.ENCRYPTION_IV;

  if (!KEY) throw new Error("Encryption key not found!");
  if (!IV) throw new Error("Encryption key not found!");

  const cipher = Crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(KEY, "hex"),
    Buffer.from(IV, "hex"),
  );
  const encrypted = cipher.update(JSON.stringify(data), "utf8", "base64");
  return encrypted + cipher.final("base64");
}

function decryptToken(encryptedUserToken: string): UserToken {
  const KEY = process.env.ENCRYPTION_KEY;
  const IV = process.env.ENCRYPTION_IV;

  if (!KEY) throw new Error("Encryption key not found!");
  if (!IV) throw new Error("Encryption key not found!");

  const decipher = Crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(KEY, "hex"),
    Buffer.from(IV, "hex"),
  );
  const decrypted = decipher.update(encryptedUserToken, "base64", "utf8");
  return JSON.parse(decrypted + decipher.final("utf8")) as UserToken;
}

async function refreshToken(payload: UserToken): Promise<UserToken> {
  const refreshToken = payload.refreshToken;
  const tokenURL = process.env.FIB_TOKEN_URL;
  const clientID = process.env.FIB_CLIENT_ID;
  const clientSecret = process.env.FIB_CLIENT_SECRET;

  if (!tokenURL || !clientID || !clientSecret) {
    throw new Error("Token URL, Client ID, or Client Secret not found!");
  }

  const response = await axios.post(
    tokenURL,
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientID,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    },
  );

  return {
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token,
    username: payload.username,
  };
}

export { verifyAndUpdateToken, getUserToken, createToken };
