import { eq } from "drizzle-orm";
import { db } from "./db";
import { UserTable } from "./schema";

export async function createUser(
  name: string,
  email: string,
  password: string,
  salt: string
) {
  const newUser = {
    name,
    email,
    password,
    salt,
  };

  const result = await db.insert(UserTable).values(newUser).returning({
    name: UserTable.name,
  });

  return result[0].name;
}

export async function isUserExist(email: string) {
  const existingUser = await db.query.UserTable.findFirst({
    where: eq(UserTable.email, email),
  });

  return existingUser ? true : false;
}

export async function existingUser(email: string) {
  const user = await db.query.UserTable.findFirst({
    columns: { password: true, salt: true },
    where: eq(UserTable.email, email),
  });
  return user;
}
