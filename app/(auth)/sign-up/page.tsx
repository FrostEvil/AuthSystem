import SignUpForm from "@/components/SignUpForm";
import Link from "next/link";

export default function SignUp() {
  return (
    <div className="flex flex-col w-full h-screen justify-center items-center bg-gradient-to-b from-blue-100 to-blue-50">
      <div className="bg-white shadow-lg rounded p-10 w-[400px] border border-blue-200">
        <h2 className="text-3xl font-bold text-gray-700 mb-6">
          Create Your Account
        </h2>
        <SignUpForm />
      </div>
      <div className="mt-6 w-[400px]">
        <div className="bg-white shadow-lg rounded p-6 border border-blue-200">
          <p className="text-gray-600 text-sm">
            Already a member of LitStore?{" "}
            <Link
              href="/sign-in"
              className="text-blue-600 font-semibold hover:underline transition-colors duration-300 whitespace-nowrap"
            >
              Log in to your account!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
