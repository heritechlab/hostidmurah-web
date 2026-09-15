"use client";

import { useEffect, useState } from "react";
import { Server, Plus, Power, RefreshCw, ExternalLink, Copy, Check, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface VPSPackage {
  id: number;
  name: string;
  cpu: string;
  ram: string;
  storage: string;
  bandwidth?: string;
  server_type?: string;
  os_type?: string;
}

interface VPSOrder {
  id: number;
  order_number?: string;
  status: string;
  started_at: string;
  expired_at: string;
  ip_address?: string;
  vps_details?: string;
  notes?: string;
  package?: VPSPackage;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function parseVpsDetails(raw?: string): Record<string, string> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, String(v)]));
    }
  } catch {
    // bukan JSON valid dari admin, tampilkan apa adanya sebagai catatan
  }
  return { Catatan: raw };
}

function CopyableField({ label, value, secret }: { label: string; value: string; secret?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(!secret);

  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-muted-foreground text-sm capitalize">{label.replace(/_/g, " ")}</span>
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-sm">{revealed ? value : "•".repeat(Math.min(value.length, 12))}</span>
        {secret && (
          <button onClick={() => setRevealed((r) => !r)} className="text-muted-foreground hover:text-foreground p-1">
            {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </button>
        )}
        <button onClick={copy} className="text-muted-foreground hover:text-foreground p-1">
          {copied ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}

function VpsCard({ order }: { order: VPSOrder }) {
  const details = parseVpsDetails(order.vps_details);
  const daysLeft = Math.ceil((new Date(order.expired_at).getTime() - Date.now()) / 86400000);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">{order.package?.name ?? "VPS"}</h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950/30">
              <Server className="size-3" />
              Aktif
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{order.order_number ?? `#${order.id}`}</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-muted-foreground">Berakhir {formatDate(order.expired_at)}</p>
          <p className={cn("text-xs", daysLeft <= 7 ? "text-red-600 font-medium" : "text-muted-foreground")}>
            {daysLeft > 0 ? `${daysLeft} hari lagi` : "Sudah kadaluarsa"}
          </p>
        </div>
      </div>

      {order.package && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded-md bg-muted">{order.package.cpu}</span>
          <span className="px-2 py-1 rounded-md bg-muted">{order.package.ram}</span>
          <span className="px-2 py-1 rounded-md bg-muted">{order.package.storage}</span>
          {order.package.bandwidth && <span className="px-2 py-1 rounded-md bg-muted">{order.package.bandwidth}</span>}
        </div>
      )}

      <div className="rounded-lg border border-border p-3">
        {order.ip_address ? (
          <CopyableField label="IP Address" value={order.ip_address} />
        ) : (
          <p className="text-sm text-muted-foreground italic">IP belum di-assign, hubungi support jika ini sudah lebih dari 15 menit sejak aktif.</p>
        )}
        {details && Object.entries(details).map(([k, v]) => (
          <CopyableField key={k} label={k} value={v} secret={/pass|token|secret|key/i.test(k)} />
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="size-4 shrink-0" />
        <p>Power on/off, reinstall OS, dan console akses via browser sedang disiapkan — untuk sekarang, hubungi support via tiket jika butuh bantuan kontrol server.</p>
      </div>
    </div>
  );
}

export default function VpsPage() {
  const [orders, setOrders] = useState<VPSOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<VPSOrder[]>("/orders")
      .then((res) => setOrders(res.data.filter((o) => o.status === "active")))
      .catch(() => toast.error("Gagal memuat data VPS."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">VPS Saya</h1>
          <p className="text-sm text-muted-foreground">Kelola semua VPS aktif Anda.</p>
        </div>
        <Link href="/order" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
          <Plus className="size-4" />
          Order VPS
        </Link>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-border bg-card p-16 text-center">
          <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
          <Server className="size-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">Belum ada VPS aktif</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">
            Setelah order VPS diproses dan pembayaran diverifikasi, server Anda akan muncul di sini beserta info IP dan akses.
          </p>
          <Link href="/order" className={cn(buttonVariants(), "gap-1.5")}>
            <Plus className="size-4" />
            Order VPS Pertama
          </Link>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((o) => (
            <VpsCard key={o.id} order={o} />
          ))}
        </div>
      )}

      {/* Legend info */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-3">Fitur yang akan datang</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: Power, label: "Power On/Off/Restart", desc: "Kontrol status server kapan saja" },
            { icon: RefreshCw, label: "Reinstall OS", desc: "Install ulang OS tanpa kehilangan IP" },
            { icon: ExternalLink, label: "Console Access", desc: "Akses via VNC langsung dari browser" },
          ].map((f) => (
            <div key={f.label} className="flex gap-3 p-3 rounded-lg bg-muted/50">
              <f.icon className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
