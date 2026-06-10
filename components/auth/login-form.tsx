import { SignIn } from "@clerk/nextjs"

/**
 * Reusable Clerk SignIn card — used on the dashboard login page.
 * The full catch-all route lives at /login/[[...sign-in]]/page.tsx
 */
export function AdminLoginForm() {
  return (
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
          formFieldErrorText: "text-destructive text-xs mt-1",
          alertText: "text-destructive text-sm",
          main: "px-6 py-4",
        },
        layout: {
          socialButtonsPlacement: "top",
        },
      }}
    />
  )
}
