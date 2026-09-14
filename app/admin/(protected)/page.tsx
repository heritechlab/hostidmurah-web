"use client";

import { useEffect, useState } from "react";
import { Users, Wallet, Server, Clock } from "lucide-react";
import { api } from "@/lib/api";

interface AdminDashboardStats {
  total_users: number;
  total_revenue: number;
  active_orders: number;
  pending_payments: number;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

const cards = [
  { key: "total_users" as const, label: "Total Pengguna", icon: Users, format: (v: number) => v.toLocaleString("id-ID") },
  { key: "total_revenue" as const, label: "Total Pendapatan", icon: Wallet, format: formatRupiah },
  { key: "active_orders" as const, label: "Pesanan Aktif", icon: Server, format: (v: number) => v.toLocaleString("id-ID") },
  { key: "pending_payments" as const, label: "Menunggu Pembayaran", icon: Clock, format: (v: number) => v.toLocaleString("id-ID") },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<AdminDashboardStats>("/admin/dashboard")
      .then((res) => setStats(res.data))
      .catch(() => setError("Gagal memuat statistik dashboard."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-muted-foreground">Ringkasan statistik HostIDMurah.</p>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse h-24" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.key} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <c.icon className="size-4" />
                <span className="text-xs font-medium">{c.label}</span>
              </div>
              <p className="text-2xl font-bold">{c.format(stats[c.key])}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
