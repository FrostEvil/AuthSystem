import Link from "next/link";

export default function AccountLinks() {
  return (
    <div className="flex flex-col gap-4 border rounded p-8 w-80 items-center shadow-md">
      <Link
        href="/sign-in"
        className="text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all w-full text-center py-2 rounded-xl"
      >
        Sign In
      </Link>
      <Link
        href="/sign-up"
        className="text-lg font-semibold text-blue-600 hover:text-white border-2 border-blue-600 hover:bg-blue-600 transition-all w-full text-center py-2 rounded-xl"
      >
        Sign Up
      </Link>
    </div>
  );
}
