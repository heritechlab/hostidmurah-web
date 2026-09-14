"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

interface TicketReply {
  id: number;
  ticket_id: number;
  sender_id: number;
  sender_role: string;
  message: string;
  created_at: string;
  sender_name?: string | null;
}

interface TicketDetail {
  id: number;
  user_id: number;
  topup_request_id?: number | null;
  order_id?: number | null;
  subject: string;
  message: string;
  status: string;
  priority: string;
  admin_reply?: string | null;
  replied_by?: number | null;
  replied_at?: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string | null;
  replies: TicketReply[];
}

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

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const ticketId = params.id;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<TicketDetail>(`/admin/tickets/${ticketId}`);
      setTicket(data);
    } catch {
      toast.error("Gagal memuat detail tiket.");
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => { load(); }, [load]);

  const sendReply = async () => {
    if (!reply.trim()) {
      toast.error("Masukkan pesan balasan.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/admin/tickets/${ticketId}/reply`, { message: reply });
      toast.success("Balasan berhasil dikirim.");
      setReply("");
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Gagal mengirim balasan.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeTicket = async () => {
    setIsClosing(true);
    try {
      await api.put(`/admin/tickets/${ticketId}/status`, { status: "closed" });
      toast.success("Tiket berhasil ditutup.");
      load();
    } catch {
      toast.error("Gagal menutup tiket.");
    } finally {
      setIsClosing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
        Tiket tidak ditemukan.
      </div>
    );
  }

  const isClosed = ticket.status === "closed";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/tickets")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{ticket.subject}</h1>
          <p className="text-sm text-muted-foreground">
            Tiket #{ticket.id} • {ticket.user_name ?? `User #${ticket.user_id}`}
          </p>
        </div>
        <Badge variant={priorityBadgeVariant(ticket.priority)}>{priorityLabel(ticket.priority)}</Badge>
        <Badge variant={statusBadgeVariant(ticket.status)}>{statusLabel(ticket.status)}</Badge>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Pesan awal • {formatDateTime(ticket.created_at)}</p>
            <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
          </div>
          {!isClosed && (
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={closeTicket} disabled={isClosing}>
              <Lock className="size-3.5" />
              {isClosing ? "Menutup..." : "Tutup Tiket"}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {ticket.replies.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Belum ada balasan.</p>
        )}
        {ticket.replies.map((r) => {
          const isAdmin = r.sender_role === "admin";
          return (
            <div key={r.id} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-3.5 py-2.5",
                  isAdmin ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <p className="text-xs opacity-70 mb-1">
                  {isAdmin ? (r.sender_name ?? "Admin") : (ticket.user_name ?? "Pengguna")} • {formatDateTime(r.created_at)}
                </p>
                <p className="text-sm whitespace-pre-wrap">{r.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {isClosed ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            Tiket ini sudah ditutup. Balasan tidak dapat dikirim.
          </p>
        ) : (
          <>
            <Textarea
              placeholder="Tulis balasan..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="min-h-24"
            />
            <div className="flex justify-end">
              <Button onClick={sendReply} disabled={isSubmitting} className="gap-1.5">
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                {isSubmitting ? "Mengirim..." : "Kirim Balasan"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
