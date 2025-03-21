import NextAuth, { DefaultSession, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import GitHubProvider from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/drizzle/db";
import { UserOAuthAccountTable, UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { ProviderType, UserRole } from "@/types/type";
import { getUserData } from "@/drizzle/userQueries";
import { authConfig } from "@/auth.config";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;

declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
      id: string;
      email: string;
      name: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
    DiscordProvider({
      clientId: DISCORD_CLIENT_ID,
      clientSecret: DISCORD_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) return null;

        const user = await getUserData(credentials.email as string);
        return user ? (user as User) : null;
      },
    }),
  ],
  pages: { signIn: "/sign-in" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (profile && account) {
        try {
          const existingUser = await db.transaction(async (tx) => {
            let user = await tx
              .select()
              .from(UserTable)
              .where(eq(UserTable.email, profile.email!));

            if (user.length === 0) {
              if (!profile.name || !profile.email) {
                throw new Error("User profile must have both name and email");
              }

              const [newUser] = await tx
                .insert(UserTable)
                .values({
                  name: profile.name,
                  email: profile.email,
                  role: "user",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })
                .returning();

              user = [newUser];
            }

            await tx
              .insert(UserOAuthAccountTable)
              .values({
                userId: user[0].id,
                provider: account.provider as ProviderType,
                providerAccountId: account.providerAccountId,
              })
              .onConflictDoNothing();

            return user[0];
          });
          token.id = existingUser.id;
          token.role = existingUser.role;
          token.email = existingUser.email;
          token.name = existingUser.name;
        } catch (error) {
          throw new Error("Authentication failed");
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      return session;
    },
  },
});
