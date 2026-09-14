"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  balance: number;
  referral_code: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [dialogMode, setDialogMode] = useState<"balance" | "password" | "profile" | "create" | null>(null);

  const load = useCallback(async (searchTerm?: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.get<AdminUser[]>("/admin/users", {
        params: searchTerm ? { search: searchTerm } : undefined,
      });
      setUsers(data);
    } catch {
      toast.error("Gagal memuat daftar pengguna.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search);
  };

  const toggleActive = async (user: AdminUser) => {
    try {
      await api.put(`/admin/users/${user.id}`, { is_active: !user.is_active });
      toast.success(user.is_active ? "User dinonaktifkan." : "User diaktifkan.");
      load(search);
    } catch {
      toast.error("Gagal mengubah status user.");
    }
  };

  const openDialog = (user: AdminUser, mode: typeof dialogMode) => {
    setSelected(user);
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
          <h1 className="text-2xl font-bold">Pengguna</h1>
          <p className="text-sm text-muted-foreground">Kelola akun pengguna HostIDMurah.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => { setSelected(null); setDialogMode("create"); }}>
          <Plus className="size-4" />
          Tambah User
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau email..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline" size="sm">Cari</Button>
      </form>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                  Tidak ada pengguna ditemukan.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>{formatRupiah(u.balance)}</TableCell>
                <TableCell>
                  <Badge variant={u.is_active ? "default" : "destructive"}>
                    {u.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(u.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8" />}>
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDialog(u, "profile")}>Edit Profil</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDialog(u, "balance")}>Sesuaikan Saldo</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDialog(u, "password")}>Reset Password</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleActive(u)}>
                        {u.is_active ? "Nonaktifkan" : "Aktifkan"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogMode === "balance"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <BalanceDialogBody user={selected} onDone={() => { closeDialog(); load(search); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === "password"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <PasswordDialogBody user={selected} onDone={closeDialog} />
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === "profile"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <ProfileDialogBody user={selected} onDone={() => { closeDialog(); load(search); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === "create"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <CreateDialogBody onDone={() => { closeDialog(); load(search); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BalanceDialogBody({ user, onDone }: { user: AdminUser | null; onDone: () => void }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!user) return null;

  const submit = async () => {
    const value = Number(amount);
    if (!value) {
      toast.error("Masukkan jumlah penyesuaian.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.put(`/admin/users/${user.id}`, { balance_adjustment: value, balance_reason: reason || undefined });
      toast.success("Saldo berhasil disesuaikan.");
      onDone();
    } catch {
      toast.error("Gagal menyesuaikan saldo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Sesuaikan Saldo — {user.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Saldo saat ini: {formatRupiah(user.balance)}</p>
        <div className="space-y-1.5">
          <Label>Jumlah (gunakan minus untuk mengurangi)</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="cth. 50000 atau -20000" />
        </div>
        <div className="space-y-1.5">
          <Label>Alasan (opsional)</Label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="cth. Kompensasi gangguan" />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
      </DialogFooter>
    </>
  );
}

function PasswordDialogBody({ user, onDone }: { user: AdminUser | null; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!user) return null;

  const submit = async () => {
    if (password.length < 6) {
      toast.error("Password minimal 6 karakter.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/admin/users/${user.id}/reset-password`, { new_password: password });
      toast.success("Password berhasil direset.");
      onDone();
    } catch {
      toast.error("Gagal reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Reset Password — {user.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-1.5">
        <Label>Password Baru</Label>
        <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" />
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Reset Password"}</Button>
      </DialogFooter>
    </>
  );
}

function ProfileDialogBody({ user, onDone }: { user: AdminUser | null; onDone: () => void }) {
  const [name, setName] = useState(user?.name ?? "");
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setWhatsapp(user?.whatsapp ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) return null;

  const submit = async () => {
    setIsSubmitting(true);
    try {
      await api.put(`/admin/users/${user.id}/profile`, { name, whatsapp });
      toast.success("Profil berhasil diupdate.");
      onDone();
    } catch {
      toast.error("Gagal update profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Profil — {user.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Nama</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>WhatsApp</Label>
          <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
      </DialogFooter>
    </>
  );
}

function CreateDialogBody({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!name || !email || password.length < 6) {
      toast.error("Lengkapi nama, email, dan password (min. 6 karakter).");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/admin/users", { name, email, password, whatsapp });
      toast.success("User berhasil dibuat.");
      onDone();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Gagal membuat user.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Tambah User Baru</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Nama</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Password</Label>
          <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" />
        </div>
        <div className="space-y-1.5">
          <Label>WhatsApp (opsional)</Label>
          <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Buat User"}</Button>
      </DialogFooter>
    </>
  );
}
