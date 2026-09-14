"use client";

import { useCallback, useEffect, useState } from "react";
import { MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  account_number: string;
  account_name: string;
  logo?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export default function AdminPaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<PaymentMethod[]>("/admin/payment-methods");
      setMethods(data);
    } catch {
      toast.error("Gagal memuat metode pembayaran.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openDialog = (mode: "create" | "edit", pm: PaymentMethod | null = null) => {
    setSelected(pm);
    setDialogMode(mode);
  };

  const closeDialog = () => {
    setSelected(null);
    setDialogMode(null);
  };

  const toggleActive = async (pm: PaymentMethod) => {
    try {
      await api.put(`/admin/payment-methods/${pm.id}`, { is_active: !pm.is_active });
      toast.success(pm.is_active ? "Metode dinonaktifkan." : "Metode diaktifkan.");
      load();
    } catch {
      toast.error("Gagal mengubah status metode pembayaran.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/payment-methods/${deleteTarget.id}`);
      toast.success("Metode pembayaran berhasil dihapus.");
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Gagal menghapus metode pembayaran.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Metode Pembayaran</h1>
          <p className="text-sm text-muted-foreground">Kelola rekening bank dan e-wallet untuk top up.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => openDialog("create")}>
          <Plus className="size-4" />
          Tambah Metode
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>No. Rekening</TableHead>
              <TableHead>Atas Nama</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && methods.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                  Belum ada metode pembayaran.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && methods.map((pm) => (
              <TableRow key={pm.id}>
                <TableCell className="font-medium">{pm.name}</TableCell>
                <TableCell>
                  <Badge variant={pm.type === "bank" ? "default" : "secondary"}>
                    {pm.type === "bank" ? "Bank" : "E-Wallet"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{pm.account_number}</TableCell>
                <TableCell className="text-muted-foreground">{pm.account_name}</TableCell>
                <TableCell className="text-muted-foreground">{pm.sort_order}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={pm.is_active} onCheckedChange={() => toggleActive(pm)} />
                    <span className="text-xs text-muted-foreground">
                      {pm.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8" />}>
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDialog("edit", pm)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(pm)}>
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogMode === "create" || dialogMode === "edit"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <PaymentMethodDialogBody
            mode={dialogMode}
            method={selected}
            onDone={() => { closeDialog(); load(); }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Metode Pembayaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Metode &quot;{deleteTarget?.name}&quot; akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PaymentMethodDialogBody({
  mode,
  method,
  onDone,
}: {
  mode: "create" | "edit" | null;
  method: PaymentMethod | null;
  onDone: () => void;
}) {
  const [name, setName] = useState(method?.name ?? "");
  const [type, setType] = useState(method?.type ?? "bank");
  const [accountNumber, setAccountNumber] = useState(method?.account_number ?? "");
  const [accountName, setAccountName] = useState(method?.account_name ?? "");
  const [sortOrder, setSortOrder] = useState(String(method?.sort_order ?? 0));
  const [isActive, setIsActive] = useState(method?.is_active ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(method?.name ?? "");
    setType(method?.type ?? "bank");
    setAccountNumber(method?.account_number ?? "");
    setAccountName(method?.account_name ?? "");
    setSortOrder(String(method?.sort_order ?? 0));
    setIsActive(method?.is_active ?? true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method?.id, mode]);

  const submit = async () => {
    if (!name || !accountNumber || !accountName) {
      toast.error("Lengkapi nama, nomor rekening, dan atas nama.");
      return;
    }
    setIsSubmitting(true);
    const payload = {
      name,
      type,
      account_number: accountNumber,
      account_name: accountName,
      sort_order: Number(sortOrder) || 0,
      is_active: isActive,
    };
    try {
      if (mode === "edit" && method) {
        await api.put(`/admin/payment-methods/${method.id}`, payload);
        toast.success("Metode pembayaran berhasil diupdate.");
      } else {
        await api.post("/admin/payment-methods", payload);
        toast.success("Metode pembayaran berhasil ditambahkan.");
      }
      onDone();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? "Gagal menyimpan metode pembayaran.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{mode === "edit" ? `Edit Metode — ${method?.name}` : "Tambah Metode Pembayaran"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Nama</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="cth. BCA" />
        </div>
        <div className="space-y-1.5">
          <Label>Tipe</Label>
          <Select value={type} onValueChange={(v) => setType(v as string)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih tipe">
                {(v: string) => (v === "bank" ? "Bank" : v === "ewallet" ? "E-Wallet" : "Pilih tipe")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank">Bank</SelectItem>
              <SelectItem value="ewallet">E-Wallet</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Nomor Rekening</Label>
          <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="cth. 1234567890" />
        </div>
        <div className="space-y-1.5">
          <Label>Atas Nama</Label>
          <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="cth. PT HostIDMurah" />
        </div>
        <div className="space-y-1.5">
          <Label>Urutan Tampil</Label>
          <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Aktif</Label>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : mode === "edit" ? "Simpan Perubahan" : "Tambah Metode"}
        </Button>
      </DialogFooter>
    </>
  );
}
