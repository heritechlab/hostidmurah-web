"use client";

import { useState } from "react";
import { Menu, Server } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { Sidebar } from "./Sidebar";

export function DashboardHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background/95 backdrop-blur px-4 gap-3">
      {/* Mobile: hamburger + logo */}
      <div className="flex items-center gap-3 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Menu" />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="pt-4">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-lg text-primary px-4 pb-4"
              >
                <Server className="size-4" />
                HostIDMurah
              </Link>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <Server className="size-4" />
          <span className="text-sm">HostIDMurah</span>
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/order"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 h-8 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          + Order Baru
        </Link>
      </div>
    </header>
  );
}
