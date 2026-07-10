import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { SignupForm } from "@/features/auth/components/signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-[42%] flex-col justify-between bg-sidebar px-12 py-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <MessageSquareText className="h-4 w-4" />
          </span>
          <p className="font-display text-sm font-semibold">AI Sales Executive</p>
        </div>

        <div className="max-w-sm">
          <p className="font-display text-3xl font-semibold leading-tight">
            One account per business. Your Instagram, your conversations, your AI.
          </p>
          <p className="mt-4 text-sm text-sidebar-muted">
            Every business gets its own isolated workspace — connect one Instagram
            account and manage its conversations without touching anyone else&apos;s.
          </p>
        </div>

        <p className="text-xs text-sidebar-muted">© {new Date().getFullYear()} AI Sales Executive</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-paper px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
            <p className="mt-1 text-sm text-muted">Set up your business workspace.</p>
          </div>

          <SignupForm />

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
