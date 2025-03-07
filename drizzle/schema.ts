import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  text,
  primaryKey,
} from "drizzle-orm/pg-core";

//ENUM for user roles
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

//User Table
export const UserTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  salt: text(),
  role: userRoleEnum().default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

//User relations
export const userRelations = relations(UserTable, ({ many }) => ({
  oAuthAccounts: many(UserOAuthAccountTable),
}));

export const oAuthProviders = ["google", "github"] as const;
// export type OAuthProvider = (typeof oAuthProviders)[number];
export const oAuthProviderEnum = pgEnum("oauth_provides", oAuthProviders);

export const UserOAuthAccountTable = pgTable(
  "user_oauth_accounts",
  {
    userId: uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    provider: oAuthProviderEnum().notNull(),
    providerAccountId: text().notNull().unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.providerAccountId, t.provider] })]
);

export const userOauthAccountRelationships = relations(
  UserOAuthAccountTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [UserOAuthAccountTable.userId],
      references: [UserTable.id],
    }),
  })
);
