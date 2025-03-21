import AccountNavgation from "@/components/AccountNavigation";
import LoginInfo from "@/components/LoginInfo";

export default function HomePage() {
  return (
    <div className="flex flex-col mt-16 items-center justify-center">
      <h1 className="text-4xl ">Auth Form</h1>
      <AccountNavgation />
      <LoginInfo />
    </div>
  );
}
