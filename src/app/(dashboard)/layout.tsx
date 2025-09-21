"use client";
import { AppHeader } from "../../components/layout/AppHeader";
import { AppSidebar } from "../../components/layout/AppSidebar";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import { Button } from "../../components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden md:flex w-64 shrink-0 border-r bg-card">
        <AppSidebar />
      </aside>
      <div className="flex-1 flex flex-col">
        <AppHeader>
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <AppSidebar onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </AppHeader>
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
