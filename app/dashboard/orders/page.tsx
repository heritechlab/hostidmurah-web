"use client";

import { ShoppingCart, Plus, Clock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: "Menunggu", icon: Clock, color: "text-orange-600 bg-orange-50 dark:bg-orange-950/30" },
  paid: { label: "Dibayar", icon: CheckCircle2, color: "text-green-600 bg-green-50 dark:bg-green-950/30" },
  cancelled: { label: "Dibatalkan", icon: XCircle, color: "text-red-600 bg-red-50 dark:bg-red-950/30" },
};

export default function OrdersPage() {
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
      <div className="flex gap-2 border-b border-border pb-1">
        {["Semua", "Menunggu", "Dibayar", "Dibatalkan"].map((tab) => (
          <button
            key={tab}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              tab === "Semua"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty */}
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
        <ShoppingCart className="size-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="font-semibold text-lg">Belum ada pesanan</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Buat pesanan VPS pertama Anda sekarang.
        </p>
        <Link href="/order" className={cn(buttonVariants(), "gap-1.5")}>
          <Plus className="size-4" />
          Mulai Order
        </Link>
      </div>
    </div>
  );
}
