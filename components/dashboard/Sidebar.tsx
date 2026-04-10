"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  ShoppingCart,
  CreditCard,
  Wallet,
  ArrowLeftRight,
  Gift,
  User,
  Ticket,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { buttonVariants } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/vps", label: "VPS Saya", icon: Server },
  { href: "/dashboard/orders", label: "Pesanan", icon: ShoppingCart },
  { href: "/dashboard/billing", label: "Tagihan", icon: CreditCard },
  { href: "/dashboard/topup", label: "Top Up", icon: Wallet },
  { href: "/dashboard/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/dashboard/referral", label: "Referral", icon: Gift },
  { href: "/dashboard/profile", label: "Profil", icon: User },
  { href: "/dashboard/tickets", label: "Tiket Support", icon: Ticket },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full flex-col gap-1">
      {/* User info */}
      <div className="px-3 py-4 mb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name ?? "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        {user?.balance !== undefined && (
          <div className="mt-3 rounded-lg bg-primary/5 px-3 py-2">
            <p className="text-xs text-muted-foreground">Saldo</p>
            <p className="text-sm font-semibold text-primary">
              Rp {user.balance.toLocaleString("id-ID")}
            </p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
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
              {isActive && <ChevronRight className="ml-auto size-3" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
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
