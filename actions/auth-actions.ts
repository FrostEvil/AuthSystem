"use server";

import { OAuthProvider } from "@/drizzle/schema";
import { createUser, existingUser, isUserExist } from "@/drizzle/userQueries";
import {
  comparePasswords,
  generateSalt,
  hashPassword,
} from "@/lib/passwordHasher";
import { setSession } from "@/lib/sessions";
import { FormErrors } from "@/types/type";
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
  const existingUser = await isUserExist(email);
  if (existingUser) {
    addError(
      formErrors,
      "emailError",
      "Account with this email already exists."
    );
    return formErrors;
  }

  try {
    // Create salt nad hashed password
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

  const user = await existingUser(email);

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

export async function oAuthSignIn(provider: OAuthProvider) {
  //TODO: Get oauth url;
}
