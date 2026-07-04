import { MessageSquareText } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
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
            Your Instagram DMs, handled like your best salesperson never sleeps.
          </p>
          <p className="mt-4 text-sm text-sidebar-muted">
            Connect an Instagram Business account, teach your AI how to sell, and let it
            reply to every customer conversation the moment it lands.
          </p>
        </div>

        <p className="text-xs text-sidebar-muted">© {new Date().getFullYear()} AI Sales Executive</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-paper px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-semibold text-ink">Sign in</h1>
            <p className="mt-1 text-sm text-muted">Welcome back. Enter your details to continue.</p>
          </div>

          <LoginForm />

          <div className="mt-6 rounded-md border border-line bg-surface px-4 py-3">
            <p className="text-xs font-medium text-ink/70">Demo credentials</p>
            <p className="mt-1 font-mono text-xs text-muted">admin@example.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
