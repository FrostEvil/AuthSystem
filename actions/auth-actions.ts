"use server";

import { createUser, getUserData, updateUserData } from "@/drizzle/userQueries";
import { auth, signInAuth, signOutAuth } from "@/lib/auth";
import {
  comparePasswords,
  generateSalt,
  hashPassword,
} from "@/lib/passwordHasher";
import { deleteSession, getSession, setSession } from "@/lib/sessions";
import { FormErrors, UserRole } from "@/types/type";
import { addError } from "@/utils/addError";
import { signInFormSchema, signUpFormSchema } from "@/utils/formSchemas";
import { redirect } from "next/navigation";

export async function signUp(prevState: any, formData: FormData) {
  const formErrors: FormErrors = {};

  const requiredFields = [
    { field: "name", fieldError: "nameError" },
    { field: "email", fieldError: "emailError" },
    { field: "password", fieldError: "passwordError" },
  ];

  // Retrieve data from the sign-up form
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!name || !email || !password) {
    if (!name) addError(formErrors, "nameError", "Enter name.");
    if (!email) addError(formErrors, "emailError", "Enter email.");
    if (!password) addError(formErrors, "passwordError", "Enter password.");

    return formErrors;
  }

  // Validate data with zod schema
  const validationResult = signUpFormSchema.safeParse({
    name,
    email,
    password,
  });

  // Check for validation errors from zod schema
  if (!validationResult.success) {
    const errorMessages = validationResult.error.flatten().fieldErrors;

    for (const { field, fieldError } of requiredFields) {
      const value = errorMessages[field as keyof typeof errorMessages];
      if (value) addError(formErrors, fieldError as keyof FormErrors, value[0]);
    }
    return formErrors;
  }

  // Check if the user already exists
  const existingUser = await getUserData(email);

  if (existingUser && existingUser.password) {
    addError(
      formErrors,
      "emailError",
      "Account with this email already exists."
    );
    return formErrors;
  }

  if (existingUser && !existingUser.password) {
    try {
      const salt = generateSalt();
      const hashedPassword = await hashPassword(password, salt);

      await updateUserData(name, hashedPassword, salt, existingUser.email);
    } catch (error) {
      console.error(error);
      addError(formErrors, "globalError", "Unable to create account.");
      return formErrors;
    }
    redirect("/");
  }

  try {
    // Create salt and hashed password
    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);
    //Create user
    const user = await createUser(name, email, hashedPassword, salt);
    if (!user) {
      addError(formErrors, "globalError", "Unable to create account.");
      return formErrors;
    }
  } catch (error) {
    console.error(error);
    addError(formErrors, "globalError", "Unable to create account.");
    return formErrors;
  }
  redirect("/");
}

export async function signIn(prevState: any, formData: FormData) {
  const formErrors: FormErrors = {};

  const requiredFields = [
    { field: "email", fieldError: "emailError" },
    { field: "password", fieldError: "passwordError" },
  ];

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  if (!email || !password) {
    if (!email) addError(formErrors, "emailError", "Enter email.");
    if (!password) addError(formErrors, "passwordError", "Enter password.");

    return formErrors;
  }

  // Validate data with zod schema
  const validationResult = signInFormSchema.safeParse({
    email,
    password,
  });

  // Check for validation errors from zod schema
  if (!validationResult.success) {
    const errorMessages = validationResult.error.flatten().fieldErrors;

    for (const { field, fieldError } of requiredFields) {
      const value = errorMessages[field as keyof typeof errorMessages];
      if (value) addError(formErrors, fieldError as keyof FormErrors, value[0]);
    }
    return formErrors;
  }

  const user = await getUserData(email);

  if (!user || !user.password || !user.salt) {
    addError(formErrors, "emailError", "User with this email does not exist.");
    return formErrors;
  }

  const isCorrectPassword = await comparePasswords({
    hashedPassword: user?.password,
    password,
    salt: user?.salt,
  });

  if (!isCorrectPassword)
    addError(formErrors, "passwordError", "Incorrect password.");

  setSession({ email });
  redirect("/");
}

export async function handleSignInAuth() {
  await signInAuth("google", { redirectTo: "/" });
}
export async function handleSignInAuthDiscord() {
  await signInAuth("discord", { redirectTo: "/" });
}
export async function handleSignInAuthGithub() {
  await signInAuth("github", { redirectTo: "/" });
}

export async function handleSignOut() {
  await deleteSession();
  await signOutAuth();
}

type LoggedUser = {
  id: string;
  role: UserRole;
  email: string;
  name: string;
};

export async function getUserSessionData(): Promise<LoggedUser | null> {
  let loggedUser: LoggedUser | null = null;
  const session = await auth();
  const cookieSession = await getSession();
  const cookieUser = await getUserData(cookieSession?.email as string);

  if (session?.user && cookieUser) return null;

  if (session?.user) {
    loggedUser = {
      id: session.user.id,
      role: session.user.role,
      email: session.user.email,
      name: session.user.name,
    };
    return loggedUser;
  }

  if (cookieUser) {
    loggedUser = {
      id: cookieUser.id,
      role: cookieUser.role,
      email: cookieUser.email,
      name: cookieUser.name,
    };
    return loggedUser;
  }

  return null;
}
