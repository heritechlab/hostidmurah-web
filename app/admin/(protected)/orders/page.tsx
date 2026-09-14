"use client";

import { useEffect, useState, useCallback } from "react";
import { MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface OrderPackage {
  id: number;
  name: string;
}

interface AdminOrder {
  id: number;
  user_id: number;
  package_id: number;
  status: string;
  started_at: string;
  expired_at: string;
  price_paid: number;
  notes?: string;
  ip_address?: string;
  vps_details?: string;
  created_at: string;
  package?: OrderPackage;
}

const STATUS_OPTIONS = [
  { value: "pending_payment", label: "Menunggu Pembayaran" },
  { value: "active", label: "Aktif" },
  { value: "suspended", label: "Ditangguhkan" },
  { value: "expired", label: "Kadaluarsa" },
  { value: "cancelled", label: "Dibatalkan" },
];

const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_payment: { label: "Menunggu Pembayaran", variant: "outline" },
  active: { label: "Aktif", variant: "default" },
  suspended: { label: "Ditangguhkan", variant: "secondary" },
  expired: { label: "Kadaluarsa", variant: "secondary" },
  cancelled: { label: "Dibatalkan", variant: "destructive" },
};

const TABS = [{ label: "Semua", value: null as string | null }, ...STATUS_OPTIONS];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [dialogMode, setDialogMode] = useState<"update" | "assign" | null>(null);

  const load = useCallback(async (status?: string | null) => {
    setIsLoading(true);
    try {
      const { data } = await api.get<AdminOrder[]>("/admin/orders", {
        params: status ? { status } : undefined,
      });
      setOrders(data);
    } catch {
      toast.error("Gagal memuat daftar pesanan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(activeStatus); }, [load, activeStatus]);

  const openDialog = (order: AdminOrder, mode: typeof dialogMode) => {
    setSelected(order);
    setDialogMode(mode);
  };

  const closeDialog = () => {
    setSelected(null);
    setDialogMode(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pesanan</h1>
          <p className="text-sm text-muted-foreground">Kelola pesanan VPS pelanggan.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => { setSelected(null); setDialogMode("assign"); }}>
          <Plus className="size-4" />
          Assign VPS Manual
        </Button>
      </div>

      <div className="flex gap-1 border-b border-border pb-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveStatus(tab.value)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
              activeStatus === tab.value
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Mulai</TableHead>
              <TableHead>Berakhir</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">
                  Tidak ada pesanan ditemukan.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && orders.map((o) => {
              const cfg = statusBadge[o.status] ?? { label: o.status, variant: "outline" as const };
              return (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">#{o.id}</TableCell>
                  <TableCell className="text-muted-foreground">{o.user_id}</TableCell>
                  <TableCell>{o.package?.name ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </TableCell>
                  <TableCell>{formatRupiah(o.price_paid)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(o.started_at)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(o.expired_at)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{o.ip_address ?? "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8" />}>
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDialog(o, "update")}>Update Status</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogMode === "update"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <UpdateStatusDialogBody order={selected} onDone={() => { closeDialog(); load(activeStatus); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === "assign"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <AssignDialogBody onDone={() => { closeDialog(); load(activeStatus); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UpdateStatusDialogBody({ order, onDone }: { order: AdminOrder | null; onDone: () => void }) {
  const [status, setStatus] = useState(order?.status ?? "");
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [ipAddress, setIpAddress] = useState(order?.ip_address ?? "");
  const [vpsDetails, setVpsDetails] = useState(order?.vps_details ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setStatus(order?.status ?? "");
    setNotes(order?.notes ?? "");
    setIpAddress(order?.ip_address ?? "");
    setVpsDetails(order?.vps_details ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id]);

  if (!order) return null;

  const submit = async () => {
    setIsSubmitting(true);
    try {
      await api.put(`/admin/orders/${order.id}`, {
        status,
        notes: notes || undefined,
        ip_address: ipAddress || undefined,
        vps_details: vpsDetails || undefined,
      });
      toast.success("Status pesanan berhasil diperbarui.");
      onDone();
    } catch {
      toast.error("Gagal memperbarui pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Update Status — Pesanan #{order.id}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as string)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>IP Address</Label>
          <Input value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} placeholder="cth. 103.100.20.5" />
        </div>
        <div className="space-y-1.5">
          <Label>Catatan</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan internal..." />
        </div>
        <div className="space-y-1.5">
          <Label>Detail VPS (JSON)</Label>
          <Textarea value={vpsDetails} onChange={(e) => setVpsDetails(e.target.value)} placeholder='{"root_password": "..."}' className="font-mono text-xs" />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
      </DialogFooter>
    </>
  );
}

function AssignDialogBody({ onDone }: { onDone: () => void }) {
  const [userId, setUserId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!userId || !packageId) {
      toast.error("Lengkapi user ID dan package ID.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/admin/orders/assign", {
        user_id: Number(userId),
        package_id: Number(packageId),
        custom_price: customPrice ? Number(customPrice) : undefined,
        notes: notes || undefined,
      });
      toast.success("VPS berhasil diassign ke user.");
      onDone();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Gagal assign VPS.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Assign VPS Manual</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>User ID</Label>
          <Input type="number" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="cth. 12" />
        </div>
        <div className="space-y-1.5">
          <Label>Package ID</Label>
          <Input type="number" value={packageId} onChange={(e) => setPackageId(e.target.value)} placeholder="cth. 3" />
        </div>
        <div className="space-y-1.5">
          <Label>Harga Kustom (opsional)</Label>
          <Input type="number" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} placeholder="Kosongkan untuk harga default paket" />
        </div>
        <div className="space-y-1.5">
          <Label>Catatan (opsional)</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="cth. Assign promo khusus" />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Assign VPS"}</Button>
      </DialogFooter>
    </>
  );
}
