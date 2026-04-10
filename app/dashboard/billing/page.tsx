"use client";

import { CreditCard, Download, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tagihan</h1>
        <p className="text-sm text-muted-foreground">
          Lihat dan bayar tagihan perpanjangan VPS Anda.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Tagihan Jatuh Tempo", value: "0", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
          { label: "Menunggu Pembayaran", value: "0", icon: Clock, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
          { label: "Lunas Bulan Ini", value: "0", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className={cn("inline-flex rounded-lg p-2 mb-3", s.bg)}>
              <s.icon className={cn("size-5", s.color)} />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Empty */}
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
        <CreditCard className="size-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="font-semibold text-lg">Tidak ada tagihan</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Tagihan perpanjangan VPS akan muncul di sini 7 hari sebelum jatuh tempo.
        </p>
        <Link href="/order" className={cn(buttonVariants({ variant: "outline" }))}>
          Order VPS
        </Link>
      </div>
    </div>
  );
}
