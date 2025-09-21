"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils/format";

const links = [
  { href: "/", label: "Home" },
  { href: "/(dashboard)/new", label: "New" },
  { href: "/(dashboard)/research", label: "Research" },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex h-full w-full flex-col gap-1 p-3">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={onNavigate}
          className={cn(
            "rounded px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
            pathname === l.href && "bg-accent text-accent-foreground"
          )}
        >
          {l.label}
        </Link>
      ))}
      <div className="mt-auto text-xs text-muted-foreground px-3 pb-2">
        Weekend Project
      </div>
    </nav>
  );
}
