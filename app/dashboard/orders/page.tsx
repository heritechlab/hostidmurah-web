"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Clock, CheckCircle2, XCircle, Server, AlertCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface VPSPackage {
  id: number;
  name: string;
  cpu: string;
  ram: string;
  storage: string;
  server_type?: string;
}

interface VPSOrder {
  id: number;
  status: string;
  started_at: string;
  expired_at: string;
  price_paid: number;
  notes?: string;
  ip_address?: string;
  created_at: string;
  package?: VPSPackage;
  payment_info?: Record<string, string>;
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending:   { label: "Menunggu Pembayaran", icon: Clock,         color: "text-orange-600 bg-orange-50 dark:bg-orange-950/30" },
  paid:      { label: "Dibayar",             icon: CheckCircle2,  color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
  active:    { label: "Aktif",               icon: Server,        color: "text-green-600 bg-green-50 dark:bg-green-950/30" },
  expired:   { label: "Kadaluarsa",          icon: AlertCircle,   color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30" },
  cancelled: { label: "Dibatalkan",          icon: XCircle,       color: "text-red-600 bg-red-50 dark:bg-red-950/30" },
};

const TABS = ["Semua", "Menunggu", "Aktif", "Dibayar", "Dibatalkan"] as const;
type Tab = typeof TABS[number];

const tabToStatus: Record<Tab, string | null> = {
  "Semua":     null,
  "Menunggu":  "pending",
  "Aktif":     "active",
  "Dibayar":   "paid",
  "Dibatalkan":"cancelled",
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<VPSOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Semua");

  useEffect(() => {
    api.get<VPSOrder[]>("/orders")
      .then((res) => setOrders(res.data))
      .catch(() => setError("Gagal memuat data pesanan."))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    const status = tabToStatus[activeTab];
    return status === null || o.status === status;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pesanan</h1>
          <p className="text-sm text-muted-foreground">Riwayat semua pesanan Anda.</p>
        </div>
        <Link href="/order" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
          <Plus className="size-4" />
          Pesanan Baru
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border pb-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
              activeTab === tab
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertCircle className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
          <ShoppingCart className="size-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">
            {activeTab === "Semua" ? "Belum ada pesanan" : `Tidak ada pesanan "${activeTab}"`}
          </h3>
          {activeTab === "Semua" && (
            <>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                Buat pesanan VPS pertama Anda sekarang.
              </p>
              <Link href="/order" className={cn(buttonVariants(), "gap-1.5")}>
                <Plus className="size-4" />
                Mulai Order
              </Link>
            </>
          )}
        </div>
      )}

      {/* Order list */}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((order) => {
            const cfg = statusConfig[order.status] ?? statusConfig.pending;
            const Icon = cfg.icon;
            const orderRef = order.payment_info?.merchant_ref ?? order.payment_info?.reference ?? `#${order.id}`;
            const paymentUrl = order.payment_info?.payment_url ?? order.payment_info?.checkout_url;

            return (
              <div key={order.id} className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm font-mono">{orderRef}</span>
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", cfg.color)}>
                      <Icon className="size-3" />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {order.package?.name ?? "Paket tidak diketahui"}
                    {order.notes ? ` · ${order.notes}` : ""}
                    {order.ip_address ? ` · ${order.ip_address}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dibuat {formatDate(order.created_at)}
                    {order.expired_at ? ` · Berakhir ${formatDate(order.expired_at)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold text-sm">{formatRupiah(order.price_paid)}</span>
                  {order.status === "pending" && paymentUrl && (
                    <a href={paymentUrl} className={cn(buttonVariants({ size: "sm" }))}>
                      Bayar
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
