import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfcf6] p-4">
      <SignIn routing="hash" signUpUrl="/sign-up" />
    </div>
  );
}
