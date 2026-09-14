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
  cpu?: string;
  ram?: string;
  storage?: string;
  bandwidth?: string;
  server_type?: string;
  os_type?: string;
  ip_type?: string;
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
  payment_info?: Record<string, unknown>;
}

interface OrderUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  balance: number;
  is_active: boolean;
  created_at: string;
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

interface UserLite {
  id: number;
  name: string;
  email: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [usersById, setUsersById] = useState<Record<number, UserLite>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [dialogMode, setDialogMode] = useState<"update" | "assign" | "detail" | null>(null);

  useEffect(() => {
    api
      .get<UserLite[]>("/admin/users/all")
      .then((res) => {
        const map: Record<number, UserLite> = {};
        res.data.forEach((u) => { map[u.id] = u; });
        setUsersById(map);
      })
      .catch(() => {});
  }, []);

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
              <TableHead>Nama</TableHead>
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
                <TableRow
                  key={o.id}
                  className="cursor-pointer"
                  onClick={() => openDialog(o, "detail")}
                >
                  <TableCell className="font-medium">#{o.id}</TableCell>
                  <TableCell>
                    <p className="font-medium">{usersById[o.user_id]?.name ?? `User #${o.user_id}`}</p>
                    {usersById[o.user_id]?.email && (
                      <p className="text-xs text-muted-foreground">{usersById[o.user_id].email}</p>
                    )}
                  </TableCell>
                  <TableCell>{o.package?.name ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </TableCell>
                  <TableCell>{formatRupiah(o.price_paid)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(o.started_at)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(o.expired_at)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{o.ip_address ?? "-"}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8" />}>
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDialog(o, "detail")}>Lihat Detail</DropdownMenuItem>
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

      <Dialog open={dialogMode === "detail"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-lg">
          <OrderDetailDialogBody
            order={selected}
            onUpdateStatus={() => setDialogMode("update")}
          />
        </DialogContent>
      </Dialog>

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

function OrderDetailDialogBody({
  order,
  onUpdateStatus,
}: {
  order: AdminOrder | null;
  onUpdateStatus: () => void;
}) {
  const [user, setUser] = useState<OrderUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  useEffect(() => {
    if (!order) return;
    setUser(null);
    setIsLoadingUser(true);
    api
      .get<OrderUser>(`/admin/users/${order.user_id}`)
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoadingUser(false));
  }, [order?.user_id]);

  if (!order) return null;
  const cfg = statusBadge[order.status] ?? { label: order.status, variant: "outline" as const };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Pesanan #{order.id}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-sm">
        <div className="flex items-center justify-between">
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
          <span className="font-bold text-primary">{formatRupiah(order.price_paid)}</span>
        </div>

        <div className="rounded-lg border border-border p-3 space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Akun Pemesan</p>
          {isLoadingUser && <p className="text-muted-foreground">Memuat...</p>}
          {!isLoadingUser && !user && (
            <p className="text-muted-foreground">User ID {order.user_id} (tidak ditemukan)</p>
          )}
          {!isLoadingUser && user && (
            <>
              <div className="flex justify-between"><span className="text-muted-foreground">Nama</span><span className="font-medium">{user.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{user.email}</span></div>
              {user.whatsapp && (
                <div className="flex justify-between"><span className="text-muted-foreground">WhatsApp</span><span className="font-medium">{user.whatsapp}</span></div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Saldo</span><span className="font-medium">{formatRupiah(user.balance)}</span></div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status Akun</span>
                <Badge variant={user.is_active ? "default" : "destructive"} className="text-[10px]">
                  {user.is_active ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
            </>
          )}
        </div>

        <div className="rounded-lg border border-border p-3 space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Paket</p>
          <div className="flex justify-between"><span className="text-muted-foreground">Nama</span><span className="font-medium">{order.package?.name ?? "-"}</span></div>
          {order.package?.cpu && (
            <div className="flex justify-between"><span className="text-muted-foreground">Spesifikasi</span><span className="font-medium text-right">{order.package.cpu} · {order.package.ram} · {order.package.storage}</span></div>
          )}
          {order.package?.bandwidth && (
            <div className="flex justify-between"><span className="text-muted-foreground">Bandwidth</span><span className="font-medium">{order.package.bandwidth}</span></div>
          )}
          {order.package?.os_type && (
            <div className="flex justify-between"><span className="text-muted-foreground">Tipe</span><span className="font-medium">{order.package.server_type} · {order.package.os_type} · {order.package.ip_type}</span></div>
          )}
        </div>

        <div className="rounded-lg border border-border p-3 space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Jadwal & Server</p>
          <div className="flex justify-between"><span className="text-muted-foreground">Mulai</span><span className="font-medium">{formatDate(order.started_at)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Berakhir</span><span className="font-medium">{formatDate(order.expired_at)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">IP Address</span><span className="font-medium">{order.ip_address ?? "-"}</span></div>
        </div>

        {order.notes && (
          <div className="rounded-lg border border-border p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Catatan</p>
            <p className="whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}

        {order.vps_details && (
          <div className="rounded-lg border border-border p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Detail VPS</p>
            <p className="whitespace-pre-wrap font-mono text-xs">{order.vps_details}</p>
          </div>
        )}

        {order.payment_info && Object.keys(order.payment_info).length > 0 && (
          <div className="rounded-lg border border-border p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Info Pembayaran</p>
            {Object.entries(order.payment_info).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <DialogFooter>
        <Button onClick={onUpdateStatus}>Update Status</Button>
      </DialogFooter>
    </>
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
              <SelectValue placeholder="Pilih status">
                {(v: string) => STATUS_OPTIONS.find((opt) => opt.value === v)?.label ?? "Pilih status"}
              </SelectValue>
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
