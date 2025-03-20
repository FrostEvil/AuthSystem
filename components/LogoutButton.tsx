"use client";

import { handleSignOut } from "@/actions/auth-actions";

export default function LogoutButton() {
  return (
    <button
      onClick={() => handleSignOut()}
      className="w-full px-4 py-3 text-lg font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-red-500 focus:outline-none"
    >
      Sign Out
    </button>
  );
}
