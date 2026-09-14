"use client";

import { useState } from "react";
import { Menu, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { AdminSidebar } from "./Sidebar";

export function AdminHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background/95 backdrop-blur px-4 gap-3">
      <div className="flex items-center gap-3 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Menu" />}>
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="pt-4">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary px-4 pb-4">
                <ShieldAlert className="size-4" />
                Admin
              </Link>
              <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <ShieldAlert className="size-4" />
          <span className="text-sm">Admin HostIDMurah</span>
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
