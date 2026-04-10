"use client";

import { useState } from "react";
import { Wallet, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

const paymentMethods = [
  { id: "bca", label: "BCA Transfer", account: "1234567890", name: "PT HostIDMurah" },
  { id: "mandiri", label: "Mandiri Transfer", account: "1234567890", name: "PT HostIDMurah" },
];

export default function TopupPage() {
  const [amount, setAmount] = useState<number | "">("");
  const [selectedMethod, setSelectedMethod] = useState("bca");
  const method = paymentMethods.find((m) => m.id === selectedMethod)!;

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} disalin`);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold">Top Up Saldo</h1>
        <p className="text-sm text-muted-foreground">
          Tambah saldo untuk membayar tagihan dan order VPS.
        </p>
      </div>

      {/* Amount picker */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-semibold">1. Pilih Nominal</h2>
        <div className="grid grid-cols-3 gap-2">
          {AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(a)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                amount === a
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              Rp {a.toLocaleString("id-ID")}
            </button>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="custom-amount">Atau masukkan nominal lain</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              Rp
            </span>
            <Input
              id="custom-amount"
              type="number"
              placeholder="Minimal Rp 10.000"
              className="pl-10"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
            />
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-semibold">2. Pilih Metode Pembayaran</h2>
        <div className="grid grid-cols-2 gap-2">
          {paymentMethods.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMethod(m.id)}
              className={`rounded-lg border p-3 text-sm font-medium text-left transition-colors ${
                selectedMethod === m.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transfer instructions */}
      {amount && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-semibold">3. Instruksi Transfer</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">No. Rekening</p>
                <p className="font-mono font-semibold">{method.account}</p>
                <p className="text-xs text-muted-foreground">{method.name}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => copyText(method.account, "No. rekening")}
              >
                <Copy className="size-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-primary/5 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">Jumlah Transfer</p>
                <p className="font-mono font-bold text-primary text-lg">
                  Rp {(Number(amount) + 123).toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-muted-foreground">Sudah termasuk kode unik Rp 123</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => copyText(String(Number(amount) + 123), "Jumlah transfer")}
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <CheckCircle2 className="size-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Setelah transfer, saldo akan otomatis ditambahkan dalam 5–15 menit. Atau konfirmasi
              via{" "}
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890"}?text=Konfirmasi+topup+Rp+${Number(amount).toLocaleString("id-ID")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                WhatsApp
              </a>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
