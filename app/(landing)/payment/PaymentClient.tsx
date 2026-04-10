"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Copy, CheckCircle, Clock, AlertCircle, ChevronRight, RefreshCw, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Data ────────────────────────────────────────────────────────────────────

const paymentMethods = [
  {
    id: "bca",
    name: "BCA",
    type: "transfer",
    logo: "🏦",
    accountNumber: "1234567890",
    accountName: "PT HOSTIDMURAH INDONESIA",
  },
  {
    id: "mandiri",
    name: "Mandiri",
    type: "transfer",
    logo: "🏦",
    accountNumber: "1400012345678",
    accountName: "PT HOSTIDMURAH INDONESIA",
  },
  {
    id: "bni",
    name: "BNI",
    type: "transfer",
    logo: "🏦",
    accountNumber: "0812345678",
    accountName: "PT HOSTIDMURAH INDONESIA",
  },
  {
    id: "bri",
    name: "BRI",
    type: "transfer",
    logo: "🏦",
    accountNumber: "001501234567890",
    accountName: "PT HOSTIDMURAH INDONESIA",
  },
  {
    id: "qris",
    name: "QRIS",
    type: "qris",
    logo: "📱",
    accountNumber: "HOSTIDMURAH",
    accountName: "Scan QR Code",
  },
  {
    id: "gopay",
    name: "GoPay",
    type: "ewallet",
    logo: "💚",
    accountNumber: "08123456789",
    accountName: "HostIDMurah",
  },
  {
    id: "ovo",
    name: "OVO",
    type: "ewallet",
    logo: "💜",
    accountNumber: "08123456789",
    accountName: "HostIDMurah",
  },
  {
    id: "dana",
    name: "Dana",
    type: "ewallet",
    logo: "💙",
    accountNumber: "08123456789",
    accountName: "HostIDMurah",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRupiah(n: number) {
  return n.toLocaleString("id-ID");
}

function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

function useCountdown(durationMs: number) {
  const [remaining, setRemaining] = useState(durationMs);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours   = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const expired = remaining === 0;

  return { hours, minutes, seconds, expired };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PaymentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const plan     = searchParams.get("plan")     ?? "VPS Linux M";
  const duration = searchParams.get("duration") ?? "1 Bulan";
  const os       = searchParams.get("os")       ?? "Ubuntu 22.04 LTS";
  const hostname = searchParams.get("hostname") ?? "—";
  const name     = searchParams.get("name")     ?? "—";
  const email    = searchParams.get("email")    ?? "—";
  const phone    = searchParams.get("phone")    ?? "—";
  const total    = parseInt(searchParams.get("total") ?? "0");
  const months   = parseInt(searchParams.get("months") ?? "1");

  const [orderId]   = useState(generateOrderId);
  const [selected, setSelected]   = useState(paymentMethods[0]);
  const [copied, setCopied]       = useState(false);
  const [confirming, setConfirming] = useState(false);

  const { hours, minutes, seconds, expired } = useCountdown(24 * 60 * 60 * 1000);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  function handleConfirmPayment() {
    setConfirming(true);
    // Simulate checking
    setTimeout(() => {
      setConfirming(false);
      toast.info("Pembayaran Anda sedang kami verifikasi. Notifikasi akan dikirim via WhatsApp dan email.", {
        duration: 6000,
      });
    }, 2000);
  }

  const uniqueTotal = total + 123; // unique transfer code trick

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span className="hover:text-foreground cursor-pointer" onClick={() => router.back()}>Order</span>
            <ChevronRight className="h-3 w-3" />
            <span>Pembayaran</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold">Selesaikan Pembayaran</h1>
              <p className="mt-1 text-muted-foreground">
                Nomor Order: <span className="font-mono font-semibold text-foreground">{orderId}</span>
              </p>
            </div>
            {!expired ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
                <Clock className="h-4 w-4 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Batas waktu pembayaran</p>
                  <p className="font-mono font-bold text-lg leading-none mt-0.5">
                    {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">Waktu pembayaran habis</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left: Payment methods */}
          <div className="lg:col-span-3 space-y-4">

            {/* Method selector */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pilih Metode Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelected(method)}
                      className={cn(
                        "rounded-lg border p-2.5 text-center transition-all",
                        selected.id === method.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-xl block">{method.logo}</span>
                      <span className="text-xs font-medium mt-1 block">{method.name}</span>
                    </button>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Instructions based on method type */}
                {selected.type === "transfer" && (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-muted/40 p-4 space-y-3">
                      <p className="text-sm font-semibold">Transfer Bank {selected.name}</p>

                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Nomor Rekening</p>
                        <div className="flex items-center justify-between gap-3 rounded-md bg-background border border-border px-3 py-2.5">
                          <span className="font-mono font-bold text-lg tracking-widest">{selected.accountNumber}</span>
                          <button
                            onClick={() => copyToClipboard(selected.accountNumber)}
                            className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                          >
                            {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {copied ? "Disalin" : "Salin"}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">a.n. {selected.accountName}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Jumlah Transfer</p>
                        <div className="flex items-center justify-between gap-3 rounded-md bg-background border border-border px-3 py-2.5">
                          <div>
                            <span className="font-mono font-bold text-lg">Rp {formatRupiah(uniqueTotal)}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Termasuk kode unik <span className="font-semibold text-primary">+123</span>
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(String(uniqueTotal))}
                            className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                          >
                            <Copy className="h-3.5 w-3.5" /> Salin
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3 text-xs text-amber-800 dark:text-amber-400">
                      <p className="font-semibold mb-1">Penting:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Transfer tepat sesuai nominal di atas (kode unik membantu verifikasi otomatis)</li>
                        <li>Gunakan berita: <span className="font-mono font-semibold">{orderId}</span></li>
                        <li>Server aktif dalam 5 menit setelah pembayaran terverifikasi</li>
                        <li>Konfirmasi via WhatsApp: <span className="font-semibold">+62 812-XXXX-XXXX</span></li>
                      </ul>
                    </div>

                    <div className="rounded-lg bg-muted/30 p-3 space-y-1.5 text-xs text-muted-foreground">
                      <p className="font-semibold text-foreground text-sm">Cara Transfer {selected.name}:</p>
                      {[
                        `Login ke m-Banking atau ATM ${selected.name}`,
                        "Pilih Transfer ke rekening " + selected.name,
                        `Masukkan nomor rekening: ${selected.accountNumber}`,
                        `Masukkan nominal: Rp ${formatRupiah(uniqueTotal)}`,
                        `Isi berita/keterangan: ${orderId}`,
                        "Konfirmasi dan simpan bukti transfer",
                      ].map((step, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="shrink-0 font-bold text-primary">{i + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selected.type === "ewallet" && (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-muted/40 p-4 space-y-3">
                      <p className="text-sm font-semibold">Transfer {selected.name}</p>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Nomor {selected.name}</p>
                        <div className="flex items-center justify-between gap-3 rounded-md bg-background border border-border px-3 py-2.5">
                          <span className="font-mono font-bold text-lg">{selected.accountNumber}</span>
                          <button
                            onClick={() => copyToClipboard(selected.accountNumber)}
                            className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                          >
                            {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {copied ? "Disalin" : "Salin"}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">a.n. {selected.accountName}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Jumlah Transfer</p>
                        <div className="flex items-center justify-between gap-3 rounded-md bg-background border border-border px-3 py-2.5">
                          <span className="font-mono font-bold text-lg">Rp {formatRupiah(uniqueTotal)}</span>
                          <button onClick={() => copyToClipboard(String(uniqueTotal))} className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0">
                            <Copy className="h-3.5 w-3.5" /> Salin
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3 text-xs text-amber-800 dark:text-amber-400">
                      Setelah transfer, klik tombol &quot;Saya Sudah Bayar&quot; di bawah atau konfirmasi via WhatsApp.
                    </div>
                  </div>
                )}

                {selected.type === "qris" && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center rounded-lg bg-muted/40 p-6 space-y-4">
                      <div className="h-48 w-48 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-background">
                        <div className="text-center text-muted-foreground">
                          <p className="text-4xl mb-2">📱</p>
                          <p className="text-xs">QR Code akan muncul</p>
                          <p className="text-xs">di sini (demo)</p>
                        </div>
                      </div>
                      <p className="text-sm text-center text-muted-foreground">
                        Scan dengan aplikasi GoPay, OVO, Dana, LinkAja, atau m-Banking apapun yang mendukung QRIS.
                      </p>
                      <div className="rounded-md bg-background border border-border px-4 py-2 text-center">
                        <p className="text-xs text-muted-foreground">Total bayar</p>
                        <p className="font-mono font-bold text-xl text-primary">Rp {formatRupiah(uniqueTotal)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm payment button */}
                <button
                  onClick={handleConfirmPayment}
                  disabled={confirming || expired}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full mt-4",
                    (confirming || expired) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {confirming ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Memeriksa Pembayaran...</>
                  ) : (
                    <><CheckCircle className="mr-2 h-4 w-4" /> Saya Sudah Bayar</>
                  )}
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Right: Order & customer summary */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" /> Detail Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  {[
                    ["No. Order", orderId],
                    ["Paket", plan],
                    ["Durasi", duration],
                    ["OS", os],
                    ["Hostname", hostname],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">{k}</span>
                      <span className="font-medium text-right text-xs">{v}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Data Pemesan</p>
                  {[
                    ["Nama", name],
                    ["Email", email],
                    ["WhatsApp", phone],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">{k}</span>
                      <span className="font-medium text-right text-xs">{v}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Total Bayar</span>
                    <span className="text-primary">Rp {formatRupiah(uniqueTotal)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rp {formatRupiah(total)} + kode unik Rp 123
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status card */}
            <Card className="bg-muted/30">
              <CardContent className="pt-4 space-y-3">
                <p className="text-sm font-semibold">Status Pembayaran</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">Menunggu Pembayaran</span>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    Order diterima
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30" />
                    Menunggu pembayaran
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30" />
                    Verifikasi pembayaran
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30" />
                    Server aktif &amp; info dikirim
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4 text-sm">
                <p className="font-semibold mb-1">Butuh Bantuan?</p>
                <p className="text-muted-foreground text-xs mb-3">
                  Tim support siap membantu konfirmasi pembayaran Anda.
                </p>
                <a
                  href={`https://wa.me/62812XXXXXXXX?text=Halo, saya sudah bayar order ${orderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
                >
                  💬 Konfirmasi via WhatsApp
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
