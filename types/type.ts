import { oAuthProviderEnum, userRoleEnum } from "@/drizzle/schema";

export type FormErrors = {
  nameError?: string[];
  emailError?: string[];
  passwordError?: string[];
  globalError?: string[];
};

export type UserRole = (typeof userRoleEnum.enumValues)[number];

export type ProviderType = (typeof oAuthProviderEnum.enumValues)[number];
