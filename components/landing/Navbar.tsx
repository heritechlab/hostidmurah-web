"use client";

import Link from "next/link";
import { useState } from "react";
import { Server, Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

const serverProducts = [
  {
    title: "Cloud VPS Linux",
    href: "/vps",
    description: "VPS Linux performa tinggi dengan SSD NVMe dan kontrol penuh.",
  },
  {
    title: "Cloud VPS Windows",
    href: "/vps/windows",
    description: "VPS Windows Server siap pakai untuk kebutuhan bisnis Anda.",
  },
  {
    title: "Dedicated Server",
    href: "/dedicated",
    description: "Server fisik eksklusif untuk performa dan keamanan maksimal.",
  },
];

const navLinks = [
  { title: "Fitur", href: "/features" },
  { title: "Harga", href: "/pricing" },
  { title: "Kontak", href: "/contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Server className="h-5 w-5" />
          HostIDMurah
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-medium">
                  Server
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4">
                    {serverProducts.map((product) => (
                      <li key={product.href}>
                        <NavigationMenuLink
                          render={<Link href={product.href} />}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
                            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          )}
                        >
                          <div className="text-sm font-medium leading-none">{product.title}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {product.description}
                          </p>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    render={<Link href={link.href} />}
                    className={navigationMenuTriggerStyle()}
                  >
                    {link.title}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Masuk
            </Link>
            <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
              Daftar Gratis
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu" />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-6 pt-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-bold text-xl text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  <Server className="h-5 w-5" />
                  HostIDMurah
                </Link>

                <nav className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-1">Server</p>
                  {serverProducts.map((product) => (
                    <Link
                      key={product.href}
                      href={product.href}
                      className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      {product.title}
                    </Link>
                  ))}
                  <div className="my-2 h-px bg-border" />
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.title}
                    </Link>
                  ))}
                </nav>

                <div className="flex flex-col gap-2 mt-auto">
                  <Link
                    href="/login"
                    className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                    onClick={() => setMobileOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className={cn(buttonVariants(), "w-full")}
                    onClick={() => setMobileOpen(false)}
                  >
                    Daftar Gratis
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
