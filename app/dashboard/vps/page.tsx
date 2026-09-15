"use client";

import { useEffect, useState } from "react";
import { Server, Plus, Power, RefreshCw, ExternalLink, Copy, Check, Eye, EyeOff, Loader2, AlertCircle, Globe, Trash2, Pencil, X } from "lucide-react";
import Link from "next/link";
import { buttonVariants, Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  dedicated_ip_status?: string;
  dedicated_ip_price?: number;
}

interface PortEntry {
  id: number;
  port_number: number;
  protocol: string;
  label: string;
  status: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

const portStatusConfig: Record<string, { label: string; color: string }> = {
  requested: { label: "Menunggu Admin", color: "text-orange-600 bg-orange-50 dark:bg-orange-950/30" },
  active: { label: "Aktif", color: "text-green-600 bg-green-50 dark:bg-green-950/30" },
  rejected: { label: "Ditolak", color: "text-red-600 bg-red-50 dark:bg-red-950/30" },
};

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

function DedicatedIpSection({ order, onChanged }: { order: VPSOrder; onChanged: () => void }) {
  const [price, setPrice] = useState<number | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const status = order.dedicated_ip_status ?? "none";

  useEffect(() => {
    if (status !== "none") return;
    api
      .get<{ price: number }>("/dedicated-ip-addon-price")
      .then((res) => setPrice(res.data.price))
      .catch(() => {});
  }, [status]);

  const requestAddon = async () => {
    const orderRef = order.order_number ?? String(order.id);
    setIsRequesting(true);
    try {
      await api.post(`/orders/${orderRef}/dedicated-ip`);
      toast.success("Permintaan add-on dikirim, menunggu diaktifkan admin.");
      onChanged();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Gagal mengirim permintaan add-on.";
      toast.error(msg);
    } finally {
      setIsRequesting(false);
    }
  };

  if (status === "active") return null;

  return (
    <div className="rounded-lg border border-border p-3 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">Add-on IP Dedicated Static</p>
            <p className="text-xs text-muted-foreground">
              Port custom hanya bisa diatur setelah add-on ini aktif.
              {price !== null && status === "none" && ` Biaya: ${formatRupiah(price)}/bulan.`}
            </p>
          </div>
        </div>
        {status === "none" && (
          <Button size="sm" variant="outline" disabled={isRequesting} onClick={requestAddon}>
            {isRequesting ? "Mengirim..." : "Request Add-on"}
          </Button>
        )}
        {status === "requested" && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-950/30">
            Menunggu aktivasi admin
          </span>
        )}
        {status === "rejected" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-600">Permintaan ditolak</span>
            <Button size="sm" variant="outline" disabled={isRequesting} onClick={requestAddon}>
              {isRequesting ? "Mengirim..." : "Request Lagi"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function PortsSection({ order }: { order: VPSOrder }) {
  const orderRef = order.order_number ?? String(order.id);
  const [ports, setPorts] = useState<PortEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [portNumber, setPortNumber] = useState("");
  const [protocol, setProtocol] = useState<"tcp" | "udp">("tcp");
  const [label, setLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => {
    setIsLoading(true);
    api
      .get<PortEntry[]>(`/orders/${orderRef}/ports`)
      .then((res) => setPorts(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [orderRef]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setPortNumber("");
    setProtocol("tcp");
    setLabel("");
  };

  const startEdit = (p: PortEntry) => {
    setEditingId(p.id);
    setPortNumber(String(p.port_number));
    setProtocol(p.protocol as "tcp" | "udp");
    setLabel(p.label);
    setShowForm(true);
  };

  const submit = async () => {
    const num = Number(portNumber);
    if (!num || num < 1 || num > 65535) {
      toast.error("Nomor port harus 1-65535.");
      return;
    }
    if (!label.trim()) {
      toast.error("Isi label/keterangan port.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/orders/${orderRef}/ports/${editingId}`, { port_number: num, protocol, label });
        toast.success("Port berhasil diperbarui.");
      } else {
        await api.post(`/orders/${orderRef}/ports`, { port_number: num, protocol, label });
        toast.success("Permintaan port dikirim.");
      }
      resetForm();
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Gagal menyimpan port.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await api.delete(`/orders/${orderRef}/ports/${id}`);
      toast.success("Port berhasil dihapus.");
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Gagal menghapus port.";
      toast.error(msg);
    }
  };

  return (
    <div className="rounded-lg border border-border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Port yang Dibuka</p>
        {!showForm && (
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowForm(true)}>
            <Plus className="size-3.5" />
            Tambah Port
          </Button>
        )}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}
      {!isLoading && ports.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">Belum ada port yang diminta.</p>
      )}

      {!isLoading && ports.length > 0 && (
        <div className="space-y-1.5">
          {ports.map((p) => {
            const cfg = portStatusConfig[p.status] ?? portStatusConfig.requested;
            return (
              <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-medium">{p.port_number}/{p.protocol.toUpperCase()}</span>
                  <span className="text-muted-foreground truncate">{p.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", cfg.color)}>
                    {cfg.label}
                  </span>
                  {p.status === "requested" && (
                    <>
                      <button onClick={() => startEdit(p)} className="text-muted-foreground hover:text-foreground p-1">
                        <Pencil className="size-3.5" />
                      </button>
                      <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-red-600 p-1">
                        <Trash2 className="size-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              placeholder="Nomor port"
              value={portNumber}
              onChange={(e) => setPortNumber(e.target.value)}
              className="col-span-1"
            />
            <div className="col-span-2 flex gap-1.5">
              <Button type="button" size="sm" variant={protocol === "tcp" ? "default" : "outline"} className="flex-1" onClick={() => setProtocol("tcp")}>
                TCP
              </Button>
              <Button type="button" size="sm" variant={protocol === "udp" ? "default" : "outline"} className="flex-1" onClick={() => setProtocol("udp")}>
                UDP
              </Button>
            </div>
          </div>
          <Input placeholder="Label, cth. Minecraft Server" value={label} onChange={(e) => setLabel(e.target.value)} />
          <div className="flex items-center gap-2">
            <Button size="sm" disabled={isSubmitting} onClick={submit}>
              {isSubmitting ? "Menyimpan..." : editingId ? "Simpan" : "Kirim Permintaan"}
            </Button>
            <Button size="sm" variant="ghost" className="gap-1" onClick={resetForm}>
              <X className="size-3.5" />
              Batal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function VpsCard({ order: initialOrder }: { order: VPSOrder }) {
  const [order, setOrder] = useState(initialOrder);
  const details = parseVpsDetails(order.vps_details);
  const daysLeft = Math.ceil((new Date(order.expired_at).getTime() - Date.now()) / 86400000);

  const refetch = () => {
    const orderRef = order.order_number ?? String(order.id);
    api.get<VPSOrder>(`/orders/${orderRef}`).then((res) => setOrder(res.data)).catch(() => {});
  };

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

      <DedicatedIpSection order={order} onChanged={refetch} />
      {order.dedicated_ip_status === "active" && <PortsSection order={order} />}

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
