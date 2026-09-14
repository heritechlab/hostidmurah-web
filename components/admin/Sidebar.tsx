"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  ArrowLeftRight,
  Settings,
  Wallet,
  Banknote,
  Ticket,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { buttonVariants } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/users", label: "Pengguna", icon: Users },
  { href: "/orders", label: "Pesanan VPS", icon: ShoppingCart },
  { href: "/packages", label: "Paket VPS", icon: Package },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/topup-requests", label: "Topup Manual", icon: Wallet },
  { href: "/payment-methods", label: "Metode Bayar", icon: Banknote },
  { href: "/tickets", label: "Tiket Support", icon: Ticket },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full flex-col gap-1">
      <div className="px-3 py-4 mb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name ?? "Admin"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mb-0.5",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-3 border-t border-border">
        <button
          onClick={() => { onNavigate?.(); logout(); }}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "w-full justify-start gap-3 text-sm font-medium text-muted-foreground hover:text-destructive h-9 px-3"
          )}
        >
          <LogOut className="size-4 shrink-0" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
