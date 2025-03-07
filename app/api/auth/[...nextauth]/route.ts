import { Session } from "next-auth";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

type CustomToken = Record<string, any> & {
  id: string;
  email: string;
};

type CustomSession = Session & {
  user: {
    id: string;
    email: string;
  };
};

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const JWT_SECRET = process.env.JWT_SECRET!;
const SESSION_EXPIRATION = 10;

export const { handler, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 10,
    updateAge: 5,
  },
  jwt: {
    secret: JWT_SECRET,
    maxAge: SESSION_EXPIRATION,
  },
  //   cookies: {
  //     sessionToken: {
  //       name: "session-token",
  //       options: {
  //         httpOnly: true,
  //         secure: process.env.NODE_ENV === "production",
  //         sameSite: "lax",
  //         maxAge: 24 * 60 * 60,
  //       },
  //     },
  //   },
  callbacks: {
    // Callback to handle JWT token creation
    async jwt({ token, user }) {
      if (user) {
        // Type assertion here to ensure that user is typed as CustomToken
        const customToken: CustomToken = token as CustomToken;

        // Add custom user data to the token
        customToken.id = user.id || ""; // Fallback to empty string if undefined
        customToken.email = user.email || ""; // Fallback to empty string if undefined

        return customToken;
      }
      return token;
    },
    // Callback to modify the session
    async session({ session, token }) {
      // Type assertion here to ensure the session and token are properly typed
      const customSession: CustomSession = session as CustomSession;
      const customToken: CustomToken = token as CustomToken;

      if (customSession.user && customToken) {
        // Add fallback for id and email if they are undefined
        customSession.user.id = customToken.id || "";
        customSession.user.email = customToken.email || "";
      }
      return customSession;
    },
  },
});

export { handler as GET, handler as POST };
