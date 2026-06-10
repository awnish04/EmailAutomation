import { SignIn } from "@clerk/nextjs"
import Link from "next/link"

export const metadata = {
  title: "Sign in — Autonity",
  description: "Sign in to your Autonity account",
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[160px]" />
        <div className="absolute right-0 bottom-0 h-[300px] w-[300px] rounded-full bg-chart-2/8 blur-[100px]" />
      </div>

      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <svg
              className="h-full w-full animate-[spin_8s_linear_infinite] text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeOpacity="0.15"
              />
              <path strokeLinecap="round" d="M12 3a9 9 0 0 1 9 9" />
              <path strokeLinecap="round" d="M12 21a9 9 0 0 1-9-9" />
            </svg>
            <div className="absolute h-3 w-3 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Autonity
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to access your dashboard
            </p>
          </div>
        </div>

        {/* Clerk handles the full auth flow — email, OAuth, MFA, etc. */}
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full rounded-2xl border border-border bg-card shadow-2xl shadow-black/5 p-0 overflow-hidden",
              cardBox: "shadow-none",
              header: "px-6 pt-6 pb-0",
              headerTitle: "text-base font-semibold text-foreground",
              headerSubtitle: "text-sm text-muted-foreground",
              socialButtonsBlockButton:
                "w-full rounded-xl border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors h-10",
              socialButtonsBlockButtonText: "text-sm font-medium",
              dividerRow: "my-4",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground text-xs px-2",
              formFieldLabel: "text-sm font-medium text-foreground mb-1",
              formFieldInput:
                "h-10 rounded-xl border border-input bg-background px-3 text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors",
              formButtonPrimary:
                "h-10 w-full rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20",
              footerAction: "px-6 pb-6",
              footerActionLink:
                "text-primary text-sm hover:text-primary/80 transition-colors",
              identityPreviewText: "text-foreground text-sm",
              identityPreviewEditButton:
                "text-primary text-sm hover:text-primary/80",
              formFieldErrorText: "text-destructive text-xs mt-1",
              alertText: "text-destructive text-sm",
              formResendCodeLink: "text-primary text-sm",
              main: "px-6 py-4",
            },
            layout: {
              socialButtonsPlacement: "top",
            },
          }}
        />

        {/* Back to site */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            ← Back to autonity.io
          </Link>
        </p>
      </div>
    </div>
  )
}
