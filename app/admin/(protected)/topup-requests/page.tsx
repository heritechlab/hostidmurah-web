"use client";

import { useEffect, useState, useCallback } from "react";
import { ExternalLink, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface PaymentMethod {
  id: number;
  name: string;
}

interface TopupRequest {
  id: number;
  user_id: number;
  payment_method_id: number;
  amount: number;
  unique_code: number;
  total_transfer: number;
  status: string;
  transfer_proof?: string | null;
  admin_notes?: string | null;
  proof_image?: string | null;
  approved_by?: number | null;
  order_id?: number | null;
  created_at: string;
  updated_at: string;
  payment_method?: PaymentMethod | null;
}

const STATUS_TABS = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function statusBadgeVariant(status: string) {
  if (status === "approved") return "default" as const;
  if (status === "rejected") return "destructive" as const;
  return "outline" as const;
}

function statusLabel(status: string) {
  if (status === "approved") return "Disetujui";
  if (status === "rejected") return "Ditolak";
  if (status === "pending") return "Menunggu";
  return status;
}

export default function AdminTopupRequestsPage() {
  const [requests, setRequests] = useState<TopupRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<TopupRequest | null>(null);

  const load = useCallback(async (status: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.get<TopupRequest[]>("/admin/topup-requests", {
        params: status === "all" ? undefined : { status },
      });
      setRequests(data);
    } catch {
      toast.error("Gagal memuat daftar permintaan topup.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(statusFilter); }, [load, statusFilter]);

  const approve = async (req: TopupRequest) => {
    setProcessingId(req.id);
    try {
      await api.put(`/admin/topup-requests/${req.id}`, { status: "approved" });
      toast.success("Permintaan topup disetujui.");
      load(statusFilter);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Gagal menyetujui permintaan.";
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Topup Manual</h1>
        <p className="text-sm text-muted-foreground">Kelola permintaan topup saldo via transfer bank.</p>
      </div>

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as string)}>
        <TabsList>
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Kode Unik</TableHead>
              <TableHead>Total Transfer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bukti</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="w-40">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground text-sm">
                  Tidak ada permintaan topup ditemukan.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">#{r.id}</TableCell>
                <TableCell className="text-muted-foreground">{r.user_id}</TableCell>
                <TableCell>{r.payment_method?.name ?? "-"}</TableCell>
                <TableCell>{formatRupiah(r.amount)}</TableCell>
                <TableCell className="text-muted-foreground">{r.unique_code}</TableCell>
                <TableCell className="font-medium">{formatRupiah(r.total_transfer)}</TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(r.status)}>{statusLabel(r.status)}</Badge>
                </TableCell>
                <TableCell>
                  {r.transfer_proof ? (
                    <a
                      href={r.transfer_proof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                    >
                      Lihat Bukti <ExternalLink className="size-3.5" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(r.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </TableCell>
                <TableCell>
                  {r.status === "pending" ? (
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        className="gap-1"
                        disabled={processingId === r.id}
                        onClick={() => approve(r)}
                      >
                        <Check className="size-3.5" />
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        disabled={processingId === r.id}
                        onClick={() => setRejectTarget(r)}
                      >
                        <X className="size-3.5" />
                        Tolak
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <RejectDialogBody
            request={rejectTarget}
            onDone={() => { setRejectTarget(null); load(statusFilter); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RejectDialogBody({ request, onDone }: { request: TopupRequest | null; onDone: () => void }) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setReason("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.id]);

  if (!request) return null;

  const submit = async () => {
    if (!reason.trim()) {
      toast.error("Masukkan alasan penolakan.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.put(`/admin/topup-requests/${request.id}`, { status: "rejected", admin_notes: reason });
      toast.success("Permintaan topup ditolak.");
      onDone();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Gagal menolak permintaan.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Tolak Topup #{request.id}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Total transfer: {formatRupiah(request.total_transfer)}
        </p>
        <div className="space-y-1.5">
          <Label>Alasan Penolakan</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="cth. Bukti transfer tidak sesuai jumlah"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="destructive" onClick={submit} disabled={isSubmitting}>
          {isSubmitting ? "Memproses..." : "Tolak Permintaan"}
        </Button>
      </DialogFooter>
    </>
  );
}
