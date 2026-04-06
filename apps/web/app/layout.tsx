import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toast } from "@heroui/react"
import { cn } from "@/lib/cn"

export const metadata: Metadata = {
  title: {
    default: "Asakiri — Language Learning Platform",
    template: "%s | Asakiri",
  },
  description:
    "Master languages through interactive courses built by expert teachers. Learn at your own pace with spaced repetition, exercises, and progress tracking.",
  metadataBase: new URL(process.env.BETTER_AUTH_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "Asakiri",
    title: "Asakiri — Language Learning Platform",
    description:
      "Master languages through interactive courses built by expert teachers.",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <ThemeProvider>
          {children}
          <Toast.Provider />
        </ThemeProvider>
      </body>
    </html>
  )
}
