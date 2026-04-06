import { Geist_Mono, Nunito } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toast } from "@heroui/react"
import { cn } from "@/lib/cn"

const nunito = Nunito({ subsets: ["latin"], variable: "--font-sans" })

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
      className={cn("antialiased", fontMono.variable, "font-sans", nunito.variable)}
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
