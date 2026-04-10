"use client";

import { ArrowLeftRight, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transaksi</h1>
        <p className="text-sm text-muted-foreground">
          Riwayat semua transaksi saldo masuk dan keluar.
        </p>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { label: "Total Masuk", value: "Rp 0", icon: ArrowUpCircle, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
          { label: "Total Keluar", value: "Rp 0", icon: ArrowDownCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
            <div className={`inline-flex rounded-xl p-3 ${s.bg}`}>
              <s.icon className={`size-6 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["Semua", "Top Up", "Pembayaran", "Refund"].map((tab) => (
          <button
            key={tab}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === "Semua"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty */}
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
        <ArrowLeftRight className="size-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="font-semibold text-lg">Belum ada transaksi</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Riwayat top up dan pembayaran akan tampil di sini.
        </p>
      </div>
    </div>
  );
}
