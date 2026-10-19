import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfcf6] p-4">
      <SignUp routing="hash" signInUrl="/sign-in" />
    </div>
  );
}
