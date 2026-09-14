"use client";

import { useEffect, useState, useCallback } from "react";
import { MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface VPSPackage {
  id: number;
  name: string;
  description?: string;
  cpu: string;
  ram: string;
  storage: string;
  bandwidth: string;
  price_monthly: number;
  is_active: boolean;
  server_type?: string;
  os_type?: string;
  ip_type?: string;
  created_at: string;
}

const SERVER_TYPES = ["vps", "dedicated"];
const OS_TYPES = ["linux", "windows"];
const IP_TYPES = ["shared", "static"];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

const STATUS_FILTERS = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
  { value: "all", label: "Semua" },
] as const;

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<VPSPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<VPSPackage | null>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete" | null>(null);
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_FILTERS[number]["value"]>("active");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<VPSPackage[]>("/packages", {
        params: { active_only: false },
      });
      setPackages(data);
    } catch {
      toast.error("Gagal memuat daftar paket.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openDialog = (pkg: VPSPackage | null, mode: typeof dialogMode) => {
    setSelected(pkg);
    setDialogMode(mode);
  };

  const closeDialog = () => {
    setSelected(null);
    setDialogMode(null);
  };

  const filteredPackages = packages.filter((p) => {
    if (statusFilter === "active") return p.is_active;
    if (statusFilter === "inactive") return !p.is_active;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Paket VPS</h1>
          <p className="text-sm text-muted-foreground">Kelola paket VPS yang tersedia untuk pelanggan.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => openDialog(null, "create")}>
          <Plus className="size-4" />
          Tambah Paket
        </Button>
      </div>

      <div className="flex gap-1 border-b border-border pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={
              statusFilter === f.value
                ? "px-3 py-1.5 text-sm font-medium rounded-md bg-primary/10 text-primary"
                : "px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>RAM</TableHead>
              <TableHead>Storage</TableHead>
              <TableHead>Bandwidth</TableHead>
              <TableHead>Harga/Bulan</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Status</TableHead>
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
            {!isLoading && filteredPackages.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">
                  {packages.length === 0 ? "Belum ada paket VPS." : "Tidak ada paket dengan status ini."}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filteredPackages.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.cpu}</TableCell>
                <TableCell className="text-muted-foreground">{p.ram}</TableCell>
                <TableCell className="text-muted-foreground">{p.storage}</TableCell>
                <TableCell className="text-muted-foreground">{p.bandwidth}</TableCell>
                <TableCell>{formatRupiah(p.price_monthly)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {p.server_type ?? "vps"} · {p.os_type ?? "linux"} · {p.ip_type ?? "shared"}
                </TableCell>
                <TableCell>
                  <Badge variant={p.is_active ? "default" : "destructive"}>
                    {p.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8" />}>
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDialog(p, "edit")}>Edit Paket</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => openDialog(p, "delete")}>Hapus Paket</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogMode === "create"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <PackageFormDialogBody mode="create" pkg={null} onDone={() => { closeDialog(); load(); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === "edit"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <PackageFormDialogBody mode="edit" pkg={selected} onDone={() => { closeDialog(); load(); }} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={dialogMode === "delete"} onOpenChange={(open) => !open && closeDialog()}>
        <AlertDialogContent>
          <DeletePackageDialogBody pkg={selected} onDone={() => { closeDialog(); load(); }} onCancel={closeDialog} />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PackageFormDialogBody({
  mode,
  pkg,
  onDone,
}: {
  mode: "create" | "edit";
  pkg: VPSPackage | null;
  onDone: () => void;
}) {
  const [name, setName] = useState(pkg?.name ?? "");
  const [description, setDescription] = useState(pkg?.description ?? "");
  const [cpu, setCpu] = useState(pkg?.cpu ?? "");
  const [ram, setRam] = useState(pkg?.ram ?? "");
  const [storage, setStorage] = useState(pkg?.storage ?? "");
  const [bandwidth, setBandwidth] = useState(pkg?.bandwidth ?? "");
  const [priceMonthly, setPriceMonthly] = useState(pkg ? String(pkg.price_monthly) : "");
  const [serverType, setServerType] = useState(pkg?.server_type ?? "vps");
  const [osType, setOsType] = useState(pkg?.os_type ?? "linux");
  const [ipType, setIpType] = useState(pkg?.ip_type ?? "shared");
  const [isActive, setIsActive] = useState(pkg?.is_active ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(pkg?.name ?? "");
    setDescription(pkg?.description ?? "");
    setCpu(pkg?.cpu ?? "");
    setRam(pkg?.ram ?? "");
    setStorage(pkg?.storage ?? "");
    setBandwidth(pkg?.bandwidth ?? "");
    setPriceMonthly(pkg ? String(pkg.price_monthly) : "");
    setServerType(pkg?.server_type ?? "vps");
    setOsType(pkg?.os_type ?? "linux");
    setIpType(pkg?.ip_type ?? "shared");
    setIsActive(pkg?.is_active ?? true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkg?.id]);

  if (mode === "edit" && !pkg) return null;

  const submit = async () => {
    if (!name || !cpu || !ram || !storage || !bandwidth || !priceMonthly) {
      toast.error("Lengkapi semua field wajib.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        description: description || undefined,
        cpu,
        ram,
        storage,
        bandwidth,
        price_monthly: Number(priceMonthly),
        server_type: serverType,
        os_type: osType,
        ip_type: ipType,
      };
      if (mode === "create") {
        await api.post("/admin/packages", payload);
        toast.success("Paket berhasil dibuat.");
      } else {
        await api.put(`/admin/packages/${pkg!.id}`, { ...payload, is_active: isActive });
        toast.success("Paket berhasil diupdate.");
      }
      onDone();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Gagal menyimpan paket.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{mode === "create" ? "Tambah Paket Baru" : `Edit Paket — ${pkg?.name}`}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        <div className="space-y-1.5">
          <Label>Nama Paket</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="cth. VPS Starter" />
        </div>
        <div className="space-y-1.5">
          <Label>Deskripsi (opsional)</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi singkat paket..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>CPU</Label>
            <Input value={cpu} onChange={(e) => setCpu(e.target.value)} placeholder="cth. 2 vCPU" />
          </div>
          <div className="space-y-1.5">
            <Label>RAM</Label>
            <Input value={ram} onChange={(e) => setRam(e.target.value)} placeholder="cth. 4 GB" />
          </div>
          <div className="space-y-1.5">
            <Label>Storage</Label>
            <Input value={storage} onChange={(e) => setStorage(e.target.value)} placeholder="cth. 40 GB SSD" />
          </div>
          <div className="space-y-1.5">
            <Label>Bandwidth</Label>
            <Input value={bandwidth} onChange={(e) => setBandwidth(e.target.value)} placeholder="cth. Unlimited" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Harga per Bulan (Rp)</Label>
          <Input type="number" value={priceMonthly} onChange={(e) => setPriceMonthly(e.target.value)} placeholder="cth. 75000" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Tipe Server</Label>
            <Select value={serverType} onValueChange={(v) => setServerType(v as string)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVER_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tipe OS</Label>
            <Select value={osType} onValueChange={(v) => setOsType(v as string)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OS_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tipe IP</Label>
            <Select value={ipType} onValueChange={(v) => setIpType(v as string)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IP_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {mode === "edit" && (
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <Label>Paket Aktif</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        )}
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : mode === "create" ? "Buat Paket" : "Simpan Perubahan"}
        </Button>
      </DialogFooter>
    </>
  );
}

function DeletePackageDialogBody({
  pkg,
  onDone,
  onCancel,
}: {
  pkg: VPSPackage | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!pkg) return null;

  const submit = async () => {
    setIsSubmitting(true);
    try {
      await api.delete(`/admin/packages/${pkg.id}`);
      toast.success("Paket berhasil dihapus.");
      onDone();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Gagal menghapus paket.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Hapus Paket — {pkg.name}?</AlertDialogTitle>
        <AlertDialogDescription>
          Tindakan ini tidak dapat dibatalkan. Paket akan dihapus permanen dari sistem.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Batal</AlertDialogCancel>
        <AlertDialogAction onClick={submit} disabled={isSubmitting} variant="destructive">
          {isSubmitting ? "Menghapus..." : "Hapus"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}
