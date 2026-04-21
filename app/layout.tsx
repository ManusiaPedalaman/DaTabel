import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SmoothScrolling } from "@/components/SmoothScrolling";

const lexend = Lexend({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DaTabel - Convert Paper Tables to Excel",
  description: "AI-powered tool to convert paper tables into editable Excel files in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={lexend.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SmoothScrolling>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </SmoothScrolling>
        </ThemeProvider>
      </body>
    </html>
  );
}
