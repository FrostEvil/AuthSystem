"use client";

import { signUp } from "@/actions/auth-actions";
import { cn } from "@/lib/utils";
import { FormErrors } from "@/types/type";
import { ChangeEvent, useActionState, useEffect, useState } from "react";

type ShowError = {
  nameError: boolean;
  emailError: boolean;
  passwordError: boolean;
  globalError: boolean;
};

type FormData = {
  name: string;
  email: string;
  password: string;
};

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUp, null);

  const [showError, setShowError] = useState<ShowError>({
    nameError: false,
    emailError: false,
    passwordError: false,
    globalError: false,
  });
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    setFormData({ name: "", email: "", password: "" });

    if (!state) return;

    let errors = {
      nameError: false,
      emailError: false,
      passwordError: false,
      globalError: false,
    };

    for (const key of Object.keys(state) as Array<keyof FormErrors>) {
      if (state[key]) {
        errors = { ...errors, [key]: true };
      }
    }
    setShowError(errors);
  }, [state]);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value) {
      setShowError((prevError) => ({
        ...prevError,
        [`${name}Error`]: false,
      }));
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <form action={formAction} className="space-y-6 mt-4 w-full">
      {/* Name Field */}
      <div className="space-y-2">
        {showError.globalError && (
          <p className="text-sm text-red-700">{state?.globalError}</p>
        )}
        <label
          htmlFor="name"
          className={cn(
            "text-sm font-semibold ",
            showError.globalError || showError.nameError
              ? "text-red-700"
              : "text-gray-700"
          )}
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChangeValue}
          className={cn(
            "px-4 py-3 w-full border  rounded shadow-sm transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 outline-none",
            showError.globalError || showError.nameError
              ? "border-red-700"
              : "border-gray-300"
          )}
        />
        {state?.nameError && showError.nameError && (
          <p className="text-sm text-red-700">{state?.nameError[0]}</p>
        )}
      </div>
      {/* Email Field */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className={cn(
            "text-sm font-semibold ",
            showError.globalError || showError.emailError
              ? "text-red-700"
              : "text-gray-700"
          )}
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChangeValue}
          className={cn(
            "px-4 py-3 w-full border  rounded shadow-sm transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 outline-none",
            showError.globalError || showError.emailError
              ? "border-red-700"
              : "border-gray-300"
          )}
        />
        {state?.emailError && showError.emailError && (
          <p className="text-sm text-red-700">{state?.emailError[0]}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className={cn(
            "text-sm font-semibold ",
            showError.globalError || showError.passwordError
              ? "text-red-700"
              : "text-gray-700"
          )}
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChangeValue}
          className={cn(
            "px-4 py-3 w-full border  rounded shadow-sm transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 outline-none",
            showError.globalError || showError.passwordError
              ? "border-red-700"
              : "border-gray-300"
          )}
        />
        {state?.passwordError && showError.passwordError && (
          <p className="text-sm text-red-700">{state?.passwordError[0]}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white text-lg font-semibold py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-md cursor-pointer"
      >
        Sign Up
      </button>
    </form>
  );
}
