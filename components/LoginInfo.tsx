import { auth } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export async function LoginInfo() {
  const session = await auth();

  return (
    <div>
      {session?.user.email && (
        <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 border border-gray-300 rounded-lg shadow-md w-full max-w-sm mx-auto">
          <p className="text-xl font-semibold text-gray-800">
            Welcome, <span className="text-blue-600">{session.user.name}</span>
          </p>
          <LogoutButton />
        </div>
      )}
    </div>
  );
}

export default LoginInfo;
