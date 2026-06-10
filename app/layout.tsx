import { Roboto } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn("font-sans antialiased", roboto.variable)}
          suppressHydrationWarning
        >
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
