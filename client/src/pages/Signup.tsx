import { SignupForm } from "@/components/signup/SignupForm";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm md:max-w-xl">
        <SignupForm />
      </div>
    </div>
  );
}
