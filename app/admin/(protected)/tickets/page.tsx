"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface AdminTicket {
  id: number;
  user_id: number;
  subject: string;
  status: string;
  priority: string;
  user_name?: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_TABS = [
  { value: "all", label: "Semua" },
  { value: "open", label: "Terbuka" },
  { value: "waiting_admin", label: "Menunggu Admin" },
  { value: "waiting_user", label: "Menunggu User" },
  { value: "closed", label: "Ditutup" },
];

function statusBadgeVariant(status: string) {
  if (status === "waiting_admin") return "destructive" as const;
  if (status === "open") return "default" as const;
  if (status === "closed") return "outline" as const;
  return "secondary" as const;
}

function statusLabel(status: string) {
  switch (status) {
    case "open": return "Terbuka";
    case "waiting_admin": return "Menunggu Admin";
    case "waiting_user": return "Menunggu User";
    case "closed": return "Ditutup";
    default: return status;
  }
}

function priorityBadgeVariant(priority: string) {
  if (priority === "high") return "destructive" as const;
  if (priority === "normal") return "secondary" as const;
  return "outline" as const;
}

function priorityLabel(priority: string) {
  switch (priority) {
    case "high": return "Tinggi";
    case "normal": return "Normal";
    case "low": return "Rendah";
    default: return priority;
  }
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async (status: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.get<AdminTicket[]>("/admin/tickets", {
        params: status === "all" ? undefined : { status },
      });
      setTickets(data);
    } catch {
      toast.error("Gagal memuat daftar tiket.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(statusFilter); }, [load, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tiket Support</h1>
        <p className="text-sm text-muted-foreground">Kelola tiket bantuan dari pengguna.</p>
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
              <TableHead>Subjek</TableHead>
              <TableHead>Pengguna</TableHead>
              <TableHead>Prioritas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead>Diperbarui</TableHead>
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
            {!isLoading && tickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                  Tidak ada tiket ditemukan.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && tickets.map((t) => (
              <TableRow key={t.id} className="cursor-pointer">
                <TableCell className="font-medium p-0">
                  <Link href={`/tickets/${t.id}`} className="block px-2 py-2">#{t.id}</Link>
                </TableCell>
                <TableCell className="p-0">
                  <Link href={`/tickets/${t.id}`} className="block px-2 py-2 max-w-64 truncate">{t.subject}</Link>
                </TableCell>
                <TableCell className="p-0">
                  <Link href={`/tickets/${t.id}`} className="block px-2 py-2 text-muted-foreground">{t.user_name ?? `User #${t.user_id}`}</Link>
                </TableCell>
                <TableCell className="p-0">
                  <Link href={`/tickets/${t.id}`} className="block px-2 py-2">
                    <Badge variant={priorityBadgeVariant(t.priority)}>{priorityLabel(t.priority)}</Badge>
                  </Link>
                </TableCell>
                <TableCell className="p-0">
                  <Link href={`/tickets/${t.id}`} className="block px-2 py-2">
                    <Badge variant={statusBadgeVariant(t.status)}>{statusLabel(t.status)}</Badge>
                  </Link>
                </TableCell>
                <TableCell className="p-0">
                  <Link href={`/tickets/${t.id}`} className="block px-2 py-2 text-muted-foreground text-sm">
                    {new Date(t.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </Link>
                </TableCell>
                <TableCell className="p-0">
                  <Link href={`/tickets/${t.id}`} className="block px-2 py-2 text-muted-foreground text-sm">
                    {new Date(t.updated_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
