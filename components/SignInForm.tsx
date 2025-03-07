"use client";

import { signIn } from "@/actions/auth-actions";
import { signIn as signInOAuth, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { FormErrors } from "@/types/type";
import { ChangeEvent, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/router";

type ShowError = {
  emailError: boolean;
  passwordError: boolean;
  globalError: boolean;
};

type FormData = {
  email: string;
  password: string;
};

export default function SignUpForm() {
  // const { data: session, status } = useSession();
  // const router = useRouter();

  // if (session) {
  //   router.push("/");
  // }
  const [state, formAction] = useActionState(signIn, null);
  const [showError, setShowError] = useState<ShowError>({
    emailError: false,
    passwordError: false,
    globalError: false,
  });
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  useEffect(() => {
    setFormData({ email: "", password: "" });

    if (!state) return;

    let errors = {
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
        className="w-full bg-blue-600 text-white text-lg font-semibold py-3 rounded hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-md cursor-pointer"
      >
        Sign In
      </button>
      <div className="w-full overflow-hidden">
        <p className="relative text-center before:content-[''] before:w-1/2 before:h-[1px] before:absolute before:bg-gray-400 before:top-1/2 before:-translate-y-1/2 before:-right-5 after:content-[''] after:w-1/2 after:h-[1px] after:absolute after:bg-gray-400 after:top-1/2 after:-translate-y-1/2 after:-left-5">
          or
        </p>
      </div>
      <div className="grid gap-y-6">
        <button
          type="button"
          onClick={async () => signInOAuth("google")}
          className="w-full bg-white text-gray-800 text-lg py-2 hover:bg-gray-200 transition-all duration-300 ease-in-out cursor-pointer uppercase border-1 border-gray-400"
        >
          Continue with Google
        </button>
        <button
          type="button"
          className="w-full bg-white text-gray-800 text-lg py-3 hover:bg-gray-200 transition-all duration-300 ease-in-out cursor-pointer uppercase border-1 border-gray-400"
        >
          Continue with Discord
        </button>
      </div>
    </form>
  );
}

// <p className="relative text-center before:content-[''] before:w-1/2 before:h-[1px] before:bg-gray-600 before:absolute before:top-1/2 before:translate-y-1/2 before:-right-4 after:content-[''] after:w-1/2 after:h-[1px] after:bg-red-600 after:absolute">
//   or
// </p>;
