"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useClerk, useUser } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, LogOut, Settings } from "lucide-react"

// ── User avatar + dropdown (shown when signed in) ────────────────────────────
function UserButton() {
  const { user } = useUser()
  const { signOut } = useClerk()

  const name = user?.fullName ?? user?.firstName ?? "User"
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ""
  const initials = (
    user?.firstName?.[0] ??
    user?.emailAddresses?.[0]?.emailAddress?.[0] ??
    "U"
  ).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full ring-2 ring-primary/20 transition-all hover:ring-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={user?.imageUrl} alt={name} />
            <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        {/* User info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-2.5 py-1">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user?.imageUrl} alt={name} />
              <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/user-dashboard/dashboard"
            className="flex cursor-pointer items-center gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/user-dashboard/settings"
            className="flex cursor-pointer items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut({ redirectUrl: "/" })}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isSignedIn, isLoaded } = useUser()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#integrations", label: "Integrations" },
    { href: "#pricing", label: "Pricing" },
    { href: "#changelog", label: "Changelog" },
    { href: "#blog", label: "Blog" },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Main nav bar */}
      <div className="container-page pt-4">
        <nav
          className={cn(
            "mx-auto flex h-(--navbar-height) max-w-(--max-width-page) items-center justify-between rounded-full border px-4 transition-all duration-300 md:px-6",
            scrolled
              ? "border-border/80 bg-background/85 shadow-xl backdrop-blur-xl"
              : "border-border/40 bg-background/60 backdrop-blur-md"
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <div className="relative flex h-7 w-7 items-center justify-center">
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
              <div className="absolute h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground select-none">
              Autonity
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions — desktop */}
          <div className="hidden items-center gap-3 md:flex">
            <AnimatedThemeToggler className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted" />
            {/* Only render auth UI once Clerk has loaded to avoid flash */}
            {isLoaded &&
              (isSignedIn ? (
                <UserButton />
              ) : (
                <Link
                  href="/login"
                  className="btn-base btn-primary rounded-full px-5 py-2 text-sm shadow-lg hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-card-hover md:hidden"
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "container-page overflow-hidden transition-all duration-300 md:hidden",
          isOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mt-2 rounded-3xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-xl">
          <div className="stack-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center justify-between border-t border-border pt-4">
              <AnimatedThemeToggler className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted" />
              {isLoaded &&
                (isSignedIn ? (
                  /* Mobile: show dashboard link + sign out */
                  <div className="flex items-center gap-2">
                    <Link
                      href="/user-dashboard/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="btn-base btn-outline rounded-full px-4 py-2 text-sm"
                    >
                      Dashboard
                    </Link>
                    <UserButton />
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="btn-base btn-primary rounded-full px-5 py-2 text-sm"
                  >
                    Get Started
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
