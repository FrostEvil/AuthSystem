import "server-only";

import { encrypt, decrypt } from "./jwt";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getUserData } from "@/drizzle/userQueries";

const SESSION_EXPIRATION = 10;
const COOKIE_SESSION_KEY = "session-id";

type UserSession = {
  email: string;
};

export async function setSession(email: UserSession) {
  const encryptedSessionData = await encrypt(email);

  (await cookies()).set(COOKIE_SESSION_KEY, encryptedSessionData, {
    httpOnly: true,
    secure: true,
    expires: Date.now() + SESSION_EXPIRATION * 1000,
  });
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get(COOKIE_SESSION_KEY)?.value;
  if (!session) return;

  const parsed = await decrypt(session);
  const response = NextResponse.next();

  response.cookies.set(COOKIE_SESSION_KEY, await encrypt(parsed), {
    httpOnly: true,
    secure: true,
    expires: Date.now() + SESSION_EXPIRATION * 1000,
  });
  return response;
}

export async function getSession() {
  const session = (await cookies()).get(COOKIE_SESSION_KEY)?.value;
  if (!session) return;
  return await decrypt(session);
}

export async function deleteSession() {
  (await cookies()).delete(COOKIE_SESSION_KEY);
}
