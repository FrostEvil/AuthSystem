import NextAuth, { DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import GitHubProvider from "next-auth/providers/github";
import { db } from "@/drizzle/db";
import { UserOAuthAccountTable, UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { ProviderType, UserRole } from "@/types/type";

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

export const {
  handlers,
  signIn: signInAuth,
  signOut: signOutAuth,
  auth,
} = NextAuth({
  secret: process.env.NEXTAUTH_SECRET!,
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
  ],
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

//OLDER VERSION:
// export const {
//   handlers,
//   signIn: signInAuth,
//   signOut: signOutAuth,
//   auth,
// } = NextAuth({
//   providers: [
//     GoogleProvider({
//       clientId: GOOGLE_CLIENT_ID,
//       clientSecret: GOOGLE_CLIENT_SECRET,
//     }),
//     DiscordProvider({
//       clientId: DISCORD_CLIENT_ID,
//       clientSecret: DISCORD_CLIENT_SECRET,
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, account, profile }) {
//       if (profile && account) {
//         //Step 1: Check if user already exists in the database
//         const existingUser = await db
//           .select()
//           .from(UserTable)
//           .where(eq(UserTable.email, profile.email!));

//         if (existingUser.length === 0) {
//           if (!profile.name || !profile.email) {
//             throw new Error("User profile must have both name and email");
//           }
//           const createUser = {
//             name: profile.name,
//             email: profile.email,
//             role: "user" as UserRole,
//             createdAt: new Date(),
//             updatedAt: new Date(),
//           };
//           // Step 2: Create a new user if they don't exist
//           const [newUser] = await db
//             .insert(UserTable)
//             .values(createUser)
//             .returning();

//           // Step 3: Store user ID & role in the JWT
//           token.id = newUser.id;
//           token.role = newUser.role;
//           token.email = newUser.email;
//         } else {
//           token.id = existingUser[0].id;
//           token.role = existingUser[0].role;
//           token.email = existingUser[0].email;
//         }

//         // Step 4: Check if OAuth account already exists
//         const existingOAuthAccount = await db
//           .select()
//           .from(UserOAuthAccountTable)
//           .where(
//             eq(
//               UserOAuthAccountTable.providerAccountId,
//               account.providerAccountId
//             )
//           );
//         if (existingOAuthAccount.length === 0) {
//           // Step 5: Store OAuth account info
//           await db.insert(UserOAuthAccountTable).values({
//             userId: token.id as string,
//             provider: account.provider as ProviderType,
//             providerAccountId: account.providerAccountId,
//           });
//         }
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       // Step 6: Pass user data to session for frontend access
//       session.user.id = token.id as string;
//       session.user.role = token.role as UserRole;
//       session.user.email = token.email as string;
//       return session;
//     },
//   },
// });
