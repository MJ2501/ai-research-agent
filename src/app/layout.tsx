import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { QueryProvider } from "@/lib/providers/query-client";
import { cn } from "../lib/utils/format";

export const metadata: Metadata = {
  title: "AI Research Agent",
  description: "Weekend project — AI Research Assistant UI",
  icons: { icon: "/favicon.ico" },
  openGraph: { images: ["/og-image.png"], title: "AI Research Agent" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
