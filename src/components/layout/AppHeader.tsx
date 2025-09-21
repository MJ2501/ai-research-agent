"use client";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function AppHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <img src="/logo.svg" alt="logo" className="h-6 w-6" />
          <span className="hidden sm:inline">AI Research Agent</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {children}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
