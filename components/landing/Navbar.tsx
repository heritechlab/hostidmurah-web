"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Server, Menu, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
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

const hostingProducts = [
  {
    title: "Shared Hosting",
    href: "/hosting/shared",
    description: "Hosting murah dengan cPanel, SSL gratis, dan bandwidth unlimited.",
  },
  {
    title: "WordPress Hosting",
    href: "/hosting/wordpress",
    description: "Dioptimalkan untuk WordPress dengan cache LiteSpeed dan auto-update.",
  },
  {
    title: "Cloud Hosting",
    href: "/hosting/cloud",
    description: "Resource dedicated, auto-scaling, lebih bertenaga dari shared hosting.",
  },
];

const navLinks = [
  { title: "Fitur", href: "/features" },
  { title: "Blog", href: "/blog" },
  { title: "Kontak", href: "/contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuValue, setMenuValue] = useState<string | undefined>(undefined);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  // Close dropdowns whenever route changes (client-side navigation)
  useEffect(() => {
    setMenuValue(undefined);
    setUserMenuOpen(false);
  }, [pathname]);

  const closeMenu = () => setMenuValue(undefined);

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
          <NavigationMenu value={menuValue} onValueChange={setMenuValue}>
            <NavigationMenuList>
              <NavigationMenuItem value="server">
                <NavigationMenuTrigger className="text-sm font-medium">
                  Server
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4">
                    {serverProducts.map((product) => (
                      <li key={product.href}>
                        <NavigationMenuLink
                          render={<Link href={product.href} onClick={closeMenu} />}
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

              <NavigationMenuItem value="hosting">
                <NavigationMenuTrigger className="text-sm font-medium">
                  Hosting
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4">
                    {hostingProducts.map((product) => (
                      <li key={product.href}>
                        <NavigationMenuLink
                          render={<Link href={product.href} onClick={closeMenu} />}
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
            {!isLoading && (
              user ? (
                /* Logged in — user menu */
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "gap-2"
                    )}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate text-sm">{user.name.split(" ")[0]}</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", userMenuOpen && "rotate-180")} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-1 w-52 rounded-lg border border-border bg-background shadow-lg z-50 py-1 overflow-hidden">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Not logged in */
                <>
                  <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                    Masuk
                  </Link>
                  <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
                    Daftar Gratis
                  </Link>
                </>
              )
            )}
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
                  <p className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-1">Hosting</p>
                  {hostingProducts.map((product) => (
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
                  {user ? (
                    <>
                      <div className="flex items-center gap-2 px-2 py-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        className={cn(buttonVariants({ variant: "outline" }), "w-full gap-2")}
                        onClick={() => setMobileOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                      <button
                        onClick={() => { logout(); setMobileOpen(false); }}
                        className={cn(buttonVariants({ variant: "ghost" }), "w-full text-destructive")}
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Keluar
                      </button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
