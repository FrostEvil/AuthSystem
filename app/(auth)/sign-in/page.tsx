import { auth } from "@/app/api/auth/[...nextauth]/route";
import SignInForm from "@/components/SignInForm";
import Link from "next/link";

export default async function SignIn() {
  // const session = await auth();
  // console.log("session", session);
  return (
    <div className="flex flex-col w-full h-screen justify-center items-center bg-gradient-to-b from-blue-100 to-blue-50">
      <div className="bg-white shadow-lg rounded p-10 w-[400px] border border-blue-200">
        <h2 className="text-3xl font-bold text-gray-700 mb-6">
          Log Into Your Account
        </h2>
        <SignInForm />
      </div>
      <div className="mt-6 w-[400px]">
        <div className="bg-white shadow-lg rounded p-6 border border-blue-200">
          <p className="text-gray-600 text-sm">
            First time at LitStore?{" "}
            <Link
              href="/sign-up"
              className="text-blue-600 font-semibold hover:underline transition-colors duration-300"
            >
              Create an account!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
