"use server";

import { createUser, getUserData, updateUserData } from "@/drizzle/userQueries";
import { signIn, signOut } from "@/lib/auth";
import {
  comparePasswords,
  generateSalt,
  hashPassword,
} from "@/lib/passwordHasher";
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

export async function handleSignInAuth(provider: string) {
  await signIn(provider, { redirectTo: "/" });
}

export async function handleSignInCredentials(
  prevState: any,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const isValidData = await checkFormData(email, password);

  if (isValidData !== true) return isValidData;

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    console.error(error);
  }
  redirect("/");
}

export async function handleSignOut() {
  await signOut();
}

export async function checkFormData(email: string, password: string) {
  let formErrors: FormErrors = {};

  const requiredFields = [
    { field: "email", fieldError: "emailError" },
    { field: "password", fieldError: "passwordError" },
  ];

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

  if (!isCorrectPassword) {
    addError(formErrors, "passwordError", "Incorrect password.");
    return formErrors;
  }
  return true;
}
