"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Transaction {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  description?: string;
  reference_id?: string;
  status: string;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  topup: "Top Up",
  payment: "Pembayaran",
  referral_bonus: "Bonus Referral",
  refund: "Refund",
};

const TYPE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  topup: "default",
  payment: "secondary",
  referral_bonus: "outline",
  refund: "outline",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  success: "Berhasil",
  failed: "Gagal",
};

const STATUS_VARIANTS: Record<string, "default" | "outline" | "destructive"> = {
  pending: "outline",
  success: "default",
  failed: "destructive",
};

const CREDIT_TYPES = new Set(["topup", "referral_bonus", "refund"]);

const LIMIT = 50;

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async (type: string, status: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.get<Transaction[]>("/admin/transactions", {
        params: {
          type: type === "all" ? undefined : type,
          status: status === "all" ? undefined : status,
          limit: LIMIT,
          offset: 0,
        },
      });
      setTransactions(data);
      setHasMore(data.length === LIMIT);
    } catch {
      toast.error("Gagal memuat data transaksi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(typeFilter, statusFilter); }, [load, typeFilter, statusFilter]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      const { data } = await api.get<Transaction[]>("/admin/transactions", {
        params: {
          type: typeFilter === "all" ? undefined : typeFilter,
          status: statusFilter === "all" ? undefined : statusFilter,
          limit: LIMIT,
          offset: transactions.length,
        },
      });
      setTransactions((prev) => [...prev, ...data]);
      setHasMore(data.length === LIMIT);
    } catch {
      toast.error("Gagal memuat data tambahan.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transaksi</h1>
        <p className="text-sm text-muted-foreground">Log seluruh transaksi pengguna HostIDMurah.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as string)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="topup">Top Up</SelectItem>
            <SelectItem value="payment">Pembayaran</SelectItem>
            <SelectItem value="referral_bonus">Bonus Referral</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as string)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="success">Berhasil</SelectItem>
            <SelectItem value="failed">Gagal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Waktu</TableHead>
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
            {!isLoading && transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                  Tidak ada transaksi ditemukan.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && transactions.map((t) => {
              const isCredit = CREDIT_TYPES.has(t.type);
              return (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">#{t.id}</TableCell>
                  <TableCell className="text-muted-foreground">{t.user_id}</TableCell>
                  <TableCell>
                    <Badge variant={TYPE_VARIANTS[t.type] ?? "outline"}>
                      {TYPE_LABELS[t.type] ?? t.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={isCredit ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                    {isCredit ? "+ " : "- "}{formatRupiah(t.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {t.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[t.status] ?? "outline"}>
                      {STATUS_LABELS[t.status] ?? t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateTime(t.created_at)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {!isLoading && hasMore && transactions.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={loadMore} disabled={isLoadingMore}>
            {isLoadingMore ? "Memuat..." : "Muat Lebih Banyak"}
          </Button>
        </div>
      )}
    </div>
  );
}
