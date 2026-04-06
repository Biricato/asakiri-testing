import { Geist_Mono, Varela_Round } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toast } from "@heroui/react"
import { cn } from "@/lib/cn"

const varelaRound = Varela_Round({ subsets: ["latin"], weight: "400", variable: "--font-varela-round" })

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
      className={cn("antialiased", fontMono.variable, "font-sans", varelaRound.variable)}
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
