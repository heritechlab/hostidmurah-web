"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Server,
  ShoppingCart,
  CreditCard,
  Wallet,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statCards = [
  { label: "VPS Aktif", value: "0", icon: Server, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { label: "Pesanan", value: "0", icon: ShoppingCart, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
  { label: "Tagihan Tertunda", value: "0", icon: CreditCard, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
  { label: "Saldo", value: "Rp 0", icon: Wallet, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
];

const recentActivity = [
  { icon: CheckCircle2, color: "text-green-600", label: "Akun berhasil dibuat", time: "Baru saja" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Halo, {user?.name?.split(" ")[0] ?? "User"} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Selamat datang di dashboard HostIDMurah.
          </p>
        </div>
        <Link href="/order" className={cn(buttonVariants({ size: "sm" }), "shrink-0 gap-1.5")}>
          <Plus className="size-4" />
          Order VPS
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <div className={cn("inline-flex rounded-lg p-2 mb-3", stat.bg)}>
              <stat.icon className={cn("size-5", stat.color)} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: "/order", label: "Order VPS Baru", icon: Plus },
              { href: "/dashboard/topup", label: "Top Up Saldo", icon: Wallet },
              { href: "/dashboard/tickets", label: "Buka Tiket", icon: AlertCircle },
              { href: "/dashboard/billing", label: "Lihat Tagihan", icon: CreditCard },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm font-medium hover:bg-muted transition-colors"
              >
                <action.icon className="size-4 text-primary" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Aktivitas Terbaru</h2>
            <Link href="/dashboard/transactions" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              Lihat semua <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <item.icon className={cn("size-4 shrink-0", item.color)} />
                <span className="flex-1 text-muted-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty state for VPS */}
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
        <Server className="size-10 text-muted-foreground/50 mx-auto mb-3" />
        <h3 className="font-semibold">Belum ada VPS aktif</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Order VPS pertama Anda dan mulai dalam hitungan menit.
        </p>
        <Link href="/order" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
          <Plus className="size-4" />
          Order VPS Sekarang
        </Link>
      </div>
    </div>
  );
}
