import { AdminLoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Sign in — Autonity",
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="relative flex h-10 w-10 items-center justify-center">
            <svg
              className="h-full w-full animate-[spin_8s_linear_infinite] text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeOpacity="0.2"
              />
              <path strokeLinecap="round" d="M12 3a9 9 0 0 1 9 9" />
              <path strokeLinecap="round" d="M12 21a9 9 0 0 1-9-9" />
            </svg>
            <div className="absolute h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Autonity</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your dashboard
            </p>
          </div>
        </div>

        <AdminLoginForm />
      </div>
    </div>
  )
}
